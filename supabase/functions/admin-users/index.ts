import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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

  if (body.action === "list") {
    const { data, error } = await adminClient.auth.admin.listUsers({ page: 1, perPage: 500 });
    if (error) {
      console.error("Could not list goHealth accounts:", error.message);
      return respond(500, { message: "Could not load the account list." });
    }
    return respond(200, {
      users: data.users
        .filter((user) => user.app_metadata?.role !== "admin")
        .map((user) => ({
          id: user.id,
          email: user.email,
          displayName: user.user_metadata?.display_name || user.email?.split("@")[0] || "",
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
    const { data: userData, error: userError } = await adminClient.auth.admin.listUsers({
      page: 1,
      perPage: 500,
    });
    if (userError) {
      console.error("Could not find account for password reset:", userError.message);
      return respond(500, { message: "Could not start the password reset." });
    }
    const target = userData.users.find(
      (user) => user.email?.toLowerCase() === email && user.app_metadata?.role !== "admin",
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
    const userId = typeof body.userId === "string" ? body.userId : "";
    if (typeof body.disabled !== "boolean") {
      return respond(400, { message: "The account status is invalid." });
    }
    const disabled = body.disabled;
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(userId)) {
      return respond(400, { message: "The account ID is invalid." });
    }
    const { data: targetData, error: targetError } = await adminClient.auth.admin.getUserById(userId);
    if (
      targetError ||
      !targetData.user ||
      targetData.user.app_metadata?.role === "admin" ||
      targetData.user.id === callerData.user.id
    ) {
      return respond(404, { message: "The user account could not be changed." });
    }
    const { error } = await adminClient.auth.admin.updateUserById(userId, {
      ban_duration: disabled ? "876000h" : "none",
    });
    if (error) {
      console.error("Could not change account status:", error.message);
      return respond(500, { message: "Could not change the account status." });
    }
    return respond(200, { ok: true });
  }

  return respond(400, { message: "Unsupported account management action." });
});
