import { createClient, type User } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, apikey, content-type, x-client-info",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function respond(status: number, body: Record<string, unknown>) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json; charset=utf-8" },
  });
}

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : String(error);
}

Deno.serve(async (request: Request) => {
  if (request.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }
  if (request.method !== "POST") {
    return respond(405, { message: "Only POST is supported." });
  }

  const authorization = request.headers.get("Authorization");
  if (!authorization?.startsWith("Bearer ")) {
    return respond(401, { message: "Sign in as the goHealth administrator." });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const publishableKey = Deno.env.get("SUPABASE_ANON_KEY");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!supabaseUrl || !publishableKey || !serviceRoleKey) {
    console.error("Required Supabase function environment variables are missing.");
    return respond(500, { message: "Account management is not configured." });
  }

  const callerClient = createClient(supabaseUrl, publishableKey, {
    global: { headers: { Authorization: authorization } },
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const accessToken = authorization.slice("Bearer ".length);
  const { data: callerData, error: callerError } = await callerClient.auth.getUser(accessToken);
  if (callerError || callerData.user?.app_metadata?.role !== "admin") {
    return respond(403, { message: "Only the goHealth administrator can manage accounts." });
  }

  const adminClient = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const siteUrl = Deno.env.get("GOHEALTH_SITE_URL");
  if (!siteUrl) {
    console.error("GOHEALTH_SITE_URL is not configured.");
    return respond(500, { message: "Account invitation links are not configured." });
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return respond(400, { message: "Request body must be valid JSON." });
  }
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return respond(400, { message: "Request body has an invalid format." });
  }

  async function getAllUsers() {
    const users: User[] = [];
    const perPage = 1000;
    for (let page = 1; ; page += 1) {
      const { data, error } = await adminClient.auth.admin.listUsers({ page, perPage });
      if (error) throw error;
      users.push(...data.users);
      if (data.users.length < perPage) return users;
    }
  }

  function isProtectedOwner(user: User) {
    return user.app_metadata?.gohealth_owner === true ||
      user.email?.toLowerCase() === "gabrielwen979@gmail.com";
  }

  async function getMutableTarget(userId: unknown) {
    if (
      typeof userId !== "string" ||
      !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(userId)
    ) {
      return null;
    }
    const { data, error } = await adminClient.auth.admin.getUserById(userId);
    if (
      error ||
      !data.user ||
      isProtectedOwner(data.user) ||
      data.user.id === callerData.user.id
    ) {
      return null;
    }
    return data.user;
  }

  if (body.action === "list") {
    let users: User[];
    try {
      users = await getAllUsers();
    } catch (error) {
      console.error("Could not list goHealth accounts:", getErrorMessage(error));
      return respond(500, { message: "Could not load the account list." });
    }
    const { data: profiles, error: profilesError } = await adminClient
      .from("gohealth_profiles")
      .select("user_id, display_name");
    if (profilesError) {
      console.error("Could not load profile display names:", profilesError.message);
      return respond(500, { message: "Could not load account display names." });
    }
    const displayNames = new Map(profiles.map((profile) => [profile.user_id, profile.display_name]));
    return respond(200, {
      users: users.map((user) => ({
        id: user.id,
        email: user.email,
        displayName: displayNames.get(user.id) || user.user_metadata?.display_name || user.email?.split("@")[0] || "",
        role: user.app_metadata?.role === "admin" ? "admin" : "user",
        owner: isProtectedOwner(user),
        emailConfirmed: Boolean(user.email_confirmed_at),
        lastSignInAt: user.last_sign_in_at,
        disabled: Boolean(user.banned_until && Date.parse(user.banned_until) > Date.now()),
      })),
    });
  }

  if (body.action === "invite") {
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const displayName = typeof body.displayName === "string" ? body.displayName.trim() : "";
    if (
      email.length > 254 ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
      !displayName ||
      displayName.length > 60
    ) {
      return respond(400, { message: "Enter a valid email address and a nickname of up to 60 characters." });
    }
    const { error } = await adminClient.auth.admin.inviteUserByEmail(email, {
      data: { display_name: displayName },
      redirectTo: siteUrl,
    });
    if (error) {
      console.error("Could not invite goHealth user:", error.message);
      return respond(400, { message: "Could not send the invitation. Check whether this email is already registered." });
    }
    return respond(200, { ok: true });
  }

  if (body.action === "reset-password") {
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) {
      return respond(400, { message: "The account email is invalid." });
    }
    let users: User[];
    try {
      users = await getAllUsers();
    } catch (error) {
      console.error("Could not find account for password reset:", getErrorMessage(error));
      return respond(500, { message: "Could not start the password reset." });
    }
    const target = users.find((user) =>
      user.email?.toLowerCase() === email && !isProtectedOwner(user),
    );
    if (!target) return respond(404, { message: "No user account was found for that email." });
    const { error } = await callerClient.auth.resetPasswordForEmail(email, {
      redirectTo: siteUrl,
    });
    if (error) {
      console.error("Could not send password reset email:", error.message);
      return respond(500, { message: "Could not send the password reset email." });
    }
    return respond(200, { ok: true });
  }

  if (body.action === "set-disabled") {
    if (typeof body.disabled !== "boolean") {
      return respond(400, { message: "The account status is invalid." });
    }
    const disabled = body.disabled;
    const target = await getMutableTarget(body.userId);
    if (!target) return respond(404, { message: "The user account could not be changed." });
    const { error } = await adminClient.auth.admin.updateUserById(target.id, {
      ban_duration: disabled ? "876000h" : "none",
    });
    if (error) {
      console.error("Could not change account status:", error.message);
      return respond(500, { message: "Could not change the account status." });
    }
    return respond(200, { ok: true });
  }

  if (body.action === "set-role") {
    if (body.role !== "admin" && body.role !== "user") {
      return respond(400, { message: "The account role is invalid." });
    }
    const target = await getMutableTarget(body.userId);
    if (!target) return respond(404, { message: "The user account role could not be changed." });
    const { error } = await adminClient.auth.admin.updateUserById(target.id, {
      app_metadata: { ...target.app_metadata, role: body.role },
    });
    if (error) {
      console.error("Could not change account role:", error.message);
      return respond(500, { message: "Could not change the account role." });
    }
    return respond(200, { ok: true });
  }

  if (body.action === "delete-user") {
    const target = await getMutableTarget(body.userId);
    if (!target) return respond(404, { message: "The user account could not be deleted." });
    const { error } = await adminClient.auth.admin.deleteUser(target.id);
    if (error) {
      console.error("Could not delete account:", error.message);
      return respond(500, { message: "Could not permanently delete the account and its health data." });
    }
    return respond(200, { ok: true });
  }

  return respond(400, { message: "Unsupported account management action." });
});
