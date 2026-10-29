// 《肉墊的夢境編織》Supabase 設定（公開金鑰，可放前端）
// ⚠️ 絕對不要在此放 service_role 金鑰；資料安全由 supabase.sql 的 RLS 保障。
// 預設沿用 goHealth 首頁的 ../../supabase-config.js（window.goHealthSupabaseConfig）。
// 若要使用獨立 Supabase 專案，請把下方 url / anonKey 改成自己的值。
(function () {
  "use strict";

  const PLACEHOLDER_URL = "https://YOUR-PROJECT-REF.supabase.co";
  const PLACEHOLDER_KEY = "YOUR-SUPABASE-ANON-KEY";

  // 在這裡覆寫以使用獨立專案（保持佔位字串代表「沿用 goHealth 預設」）
  const OWN_URL = PLACEHOLDER_URL;
  const OWN_ANON_KEY = PLACEHOLDER_KEY;

  const fallback = window.goHealthSupabaseConfig || {};
  const useOwn = OWN_URL !== PLACEHOLDER_URL && OWN_ANON_KEY !== PLACEHOLDER_KEY;

  window.catDreamWeaverSupabaseConfig = Object.freeze({
    url: useOwn ? OWN_URL : (fallback.url || PLACEHOLDER_URL),
    // 同時相容新版 publishableKey 與舊版 anonKey 命名
    anonKey: useOwn ? OWN_ANON_KEY : (fallback.publishableKey || fallback.anonKey || PLACEHOLDER_KEY),
  });
})();
