# 文字迷宮：元素消除大冒險

Standalone HTML5 game and installable PWA. It can run independently under `/games/text-maze/` and can also be opened in a mobile or desktop WebView.

## Run locally

Serve `src/main/webapp` over HTTP rather than opening the file directly. For example:

```sh
python3 -m http.server 8080 --directory src/main/webapp
```

Open `http://localhost:8080/games/text-maze/`. PWA service workers require HTTPS or localhost.

## Configure Supabase

1. Run [`supabase.sql`](./supabase.sql) in the same Supabase project used by goHealth, or in your chosen project.
2. In Supabase Authentication, enable anonymous sign-ins if you want to use the anonymous button. Email/password accounts use Supabase Auth as usual.
3. By default, the game reuses the parent goHealth app's public Supabase URL and publishable key. For another project, replace the placeholders in [`supabase-config.js`](./supabase-config.js). These browser values are public; never use a `service_role` or secret key here.
4. For email sign-up, configure the project's email confirmation and allowed redirect URLs.

The static PWA cannot read server environment variables. `supabase-config.js` is the runtime configuration injection point. RLS restricts each save to the matching authenticated `auth.uid()`, including anonymous Auth users. No health/profile data from the parent goHealth app is read or changed.

If Supabase is not configured or is temporarily unavailable, the game remains playable and uses per-account local storage on the current device. Cloud saves are upserted by `user_id` after movement, matches, chest completion and winning.

## PWA and WebView notes

- The manifest and service worker cache the game shell for repeat/offline play after the first visit.
- Installability and service-worker support depend on the host WebView/browser. In an embedded WebView without service-worker or install-prompt support, the game still works as a responsive web page.
- Anonymous sessions and cloud sync require a network connection. Local progress stays available offline.

## Save shape

`game_state` includes `current_level`, `player_pos`, and `high_score`, plus `score`, `chest_cleared`, and `completed` for restoring the current game.
