# goHealth

goHealth is a static meal-planning and wellness website. GitHub Pages serves the files in `src/main/webapp`; the page does not require a Node.js server or API.

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

The server listens on port `8787` by default. The page itself is static; profile data is stored in the browser's `localStorage`, separately for each of the four profiles (`SSU`, `RABBIT`, `MONKEY`, or `SNAKE`). Data does not sync between devices and is removed if that browser's site data is cleared. The profile selector is not authentication: anyone using the same browser can switch profiles and view their records. Do not enter sensitive information on a shared device.

## Monthly menu

The calendar assigns different lunch and dinner recipes throughout each month. Lunar day 1 and day 15 are determined with the Chinese calendar in the `Asia/Taipei` time zone and receive separate egg-and-dairy vegetarian, low-carbohydrate meals. Nutrition values are estimates, not a guarantee that every meal meets an individual ketogenic target.

Weekends and Taiwan public holidays are highlighted in the menu calendar. The bundled public-holiday dates currently cover 2026 and 2027 and are based on the [Government Open Data Platform's Government Agency Office Calendar](https://data.gov.tw/dataset/14718), normalized by [TaiwanCalendar](https://github.com/ruyut/TaiwanCalendar).

The home tab includes a seven-day weather forecast, sunrise and sunset times for selectable northern Taiwan cities, provided by [Open-Meteo](https://open-meteo.com/). It requires an internet connection and does not require an API key.

The same forecast filters a curated set of northern Taiwan trails by selected city and suggests a relatively suitable day based on precipitation, weather conditions, and heat. It shows up to three matching trails at a time and, within the current browser tab session, avoids routes shown in the previous three recommendation batches for that city; it may show fewer than three when the remaining candidate list is small. Wet or foggy forecasts prioritize low-difficulty routes. Trail names, route type, distance, elevation, duration, and difficulty link back to [Hiking Biji](https://hiking.biji.co/index.php?q=trail). City forecasts are not mountain-top forecasts; verify trail closures and official weather alerts before departure.

When Taipei City is selected, all eight official [Taipei Grand Trail](https://taipeigrandtrail.gov.taipei/) sections are listed with route summaries, official reference distances and durations, and links to the city's segment details. The first seven hiking sections total about 92 km; section 8 is a roughly 38 km riverside cycling route, for about 130 km overall. When New Taipei City is selected, the page also presents a Jiufen–Ruifang–Jinguashi hiking itinerary linking the nearby [Hiking Biji](https://hiking.biji.co/index.php?q=trail) routes. The itinerary is a list of separate trails connected by local roads or transit, not a single continuous walking path; plan multiple days as needed.

When Taipei City is selected, the weather and trail section also shows MRT and bus access notes for Xiangshan, Qingtian Gang, and Qixing Mountain. It displays a Taipei-date-based seven-day checklist for checking each day's outbound first service and return last service, with official Taipei Metro station and Greater Taipei Bus route timetable links. Exact service times depend on station, direction, route, stop, and weekday or holiday; the checklist is a reminder only and does not send background notifications.

## Data and privacy

Height, weight and waist records, dietary preferences, saved recommendations, and shopping checklists are stored locally in the current browser. They are not sent to GitHub Pages or shared with other devices. Browser storage is not encrypted or password protected; use a private device and avoid recording information you do not want other people using that browser to see.
