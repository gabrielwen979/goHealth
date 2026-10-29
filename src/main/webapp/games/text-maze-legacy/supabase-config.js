// Static hosting cannot read server environment variables. Replace these
// placeholders with your Supabase project's project URL and publishable key.
// Never put a service_role or secret API key in browser code.
window.textMazeSupabaseConfig = Object.freeze({
  url: window.goHealthSupabaseConfig?.url || "https://YOUR_PROJECT_ID.supabase.co",
  publishableKey: window.goHealthSupabaseConfig?.publishableKey
    || "YOUR_SUPABASE_PUBLISHABLE_OR_ANON_KEY",
});
