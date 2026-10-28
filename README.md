# goHealth

goHealth is a static meal-planning and wellness website. GitHub Pages serves the files in `src/main/webapp`; Supabase provides sign-in, cloud profile storage, and administrator-only account management.

## Publish on GitHub Pages

1. Create a **public** GitHub repository and push this project to its `main` branch.
2. In the repository, open **Settings → Pages** and set the build and deployment source to **GitHub Actions**.
3. Each push to `main` runs `.github/workflows/pages.yml`. When the workflow completes, GitHub Pages displays the published website URL in **Settings → Pages**.

The workflow publishes only `src/main/webapp`. The Node.js server, local data files, and development settings are not included in the website.

## Run locally

Use Node.js 18 or newer:

```sh
node server.js
```

The server listens on port `8787` by default and serves the same static frontend. Sign-in requires a configured Supabase project.

## Configure Supabase authentication

The browser uses the project's public URL and publishable key from `src/main/webapp/supabase-config.js`. A publishable key is intended for browser use; never place a Supabase secret or service-role key in that file or in GitHub.

1. In Supabase, open **SQL Editor**, run `supabase/migrations/20261028000000_gohealth_profiles.sql`, and confirm the `gohealth_profiles` table is created. Row Level Security restricts each account to its own profile.
2. In **Authentication → URL Configuration**, set the Site URL to the deployed GitHub Pages URL and add that exact URL to Redirect URLs. Use the URL shown in GitHub repository **Settings → Pages**.
3. In **Authentication → Users**, invite the administrator's email and complete the email verification. Then run this statement in SQL Editor, replacing `admin@example.com` with the administrator's email:

   ```sql
   update auth.users
   set raw_app_meta_data = coalesce(raw_app_meta_data, '{}'::jsonb)
     || '{"role":"admin"}'::jsonb
   where email = lower('admin@example.com');
   ```

   Confirm the statement updates exactly one row. Then set the profile display name (replace the example email with the same administrator email):

   ```sql
   update public.gohealth_profiles as profile
   set display_name = 'SSU'
   from auth.users as auth_user
   where profile.user_id = auth_user.id
     and auth_user.email = lower('admin@example.com');
   ```

   Sign out and sign back in after changing the role so the new role is included in the access token.
4. Deploy `supabase/functions/admin-users/index.ts` as an Edge Function named `admin-users`. Configure the function secret `GOHEALTH_SITE_URL` with the exact deployed GitHub Pages URL. Supabase's built-in `SUPABASE_URL`, `SUPABASE_ANON_KEY`, and `SUPABASE_SERVICE_ROLE_KEY` environment values are used by the function; the service-role key stays server-side.
5. In **Authentication → Settings**, disable public sign-ups. The admin function sends invitations; invited users set their password from the email link. Configure custom SMTP before relying on invitation and reset emails for regular use.
6. Push the site changes to `main` and wait for the **Deploy to GitHub Pages** workflow to finish. Then sign in as the administrator and use **權限管理** on the home page to invite users, reset passwords, or disable accounts.

The admin function authorizes account actions using the administrator role stored in Supabase Auth app metadata. It does not expose other users' health profiles. Profile data is protected separately with database row-level security.

Existing browser-only records are not automatically copied to Supabase. Keep the existing browser data until each person's cloud profile has been checked; the old profile selector is not a secure way to transfer records.

## Monthly menu

The calendar assigns different lunch and dinner recipes throughout each month. Lunar day 1 and day 15 are determined with the Chinese calendar in the `Asia/Taipei` time zone and receive separate egg-and-dairy vegetarian, low-carbohydrate meals. Nutrition values are estimates, not a guarantee that every meal meets an individual ketogenic target.

Weekends and Taiwan public holidays are highlighted in the menu calendar. The bundled public-holiday dates currently cover 2026 and 2027 and are based on the [Government Open Data Platform's Government Agency Office Calendar](https://data.gov.tw/dataset/14718), normalized by [TaiwanCalendar](https://github.com/ruyut/TaiwanCalendar).

The home tab includes a seven-day weather forecast, sunrise and sunset times for selectable northern Taiwan cities, provided by [Open-Meteo](https://open-meteo.com/). It requires an internet connection and does not require an API key.

The same forecast filters a curated set of northern Taiwan trails by selected city and suggests a relatively suitable day based on precipitation, weather conditions, and heat. It shows up to three matching trails at a time and, within the current browser tab session, avoids routes shown in the previous three recommendation batches for that city; it may show fewer than three when the remaining candidate list is small. Wet or foggy forecasts prioritize low-difficulty routes. Trail names, route type, distance, elevation, duration, and difficulty link back to [Hiking Biji](https://hiking.biji.co/index.php?q=trail). City forecasts are not mountain-top forecasts; verify trail closures and official weather alerts before departure.

When Taipei City is selected, all eight official [Taipei Grand Trail](https://taipeigrandtrail.gov.taipei/) sections are listed with route summaries, official reference distances and durations, and links to the city's segment details. The first seven hiking sections total about 92 km; section 8 is a roughly 38 km riverside cycling route, for about 130 km overall. When New Taipei City is selected, the page also presents a Jiufen–Ruifang–Jinguashi hiking itinerary linking the nearby [Hiking Biji](https://hiking.biji.co/index.php?q=trail) routes. The itinerary is a list of separate trails connected by local roads or transit, not a single continuous walking path; plan multiple days as needed.

When Taipei City is selected, the weather and trail section also shows MRT and bus access notes for Xiangshan, Qingtian Gang, and Qixing Mountain. It displays a Taipei-date-based seven-day checklist for checking each day's outbound first service and return last service, with official Taipei Metro station and Greater Taipei Bus route timetable links. Exact service times depend on station, direction, route, stop, and weekday or holiday; the checklist is a reminder only and does not send background notifications.

## Data and privacy

Height, weight and waist records, dietary preferences, saved recommendations, and shopping checklists are stored in the goHealth Supabase database and synchronized across devices after sign-in. Each user can access only their own profile; the administrator can manage account access but cannot read other users' health records. GitHub Pages serves the frontend and does not store profile data.
