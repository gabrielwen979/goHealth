(() => {
  const locations = {
    taipei: { name: "台北市", latitude: 25.033, longitude: 121.5654 },
    newTaipei: { name: "新北市", latitude: 25.011, longitude: 121.463 },
    keelung: { name: "基隆市", latitude: 25.1276, longitude: 121.7392 },
    taoyuan: { name: "桃園市", latitude: 24.9937, longitude: 121.3009 },
    hsinchu: { name: "新竹市", latitude: 24.8138, longitude: 120.9675 },
    yilan: { name: "宜蘭縣", latitude: 24.7021, longitude: 121.7378 },
  };
  const descriptions = new Map([
    [0, ["晴朗", "☀️"]],
    [1, ["大致晴朗", "🌤️"]],
    [2, ["多雲時晴", "⛅"]],
    [3, ["陰天", "☁️"]],
    [45, ["有霧", "🌫️"]],
    [48, ["霧氣", "🌫️"]],
    [51, ["毛毛雨", "🌦️"]],
    [53, ["細雨", "🌦️"]],
    [55, ["細雨", "🌧️"]],
    [56, ["凍毛毛雨", "🌧️"]],
    [57, ["凍毛毛雨", "🌧️"]],
    [61, ["小雨", "🌧️"]],
    [63, ["中雨", "🌧️"]],
    [65, ["大雨", "🌧️"]],
    [66, ["凍雨", "🌧️"]],
    [67, ["凍雨", "🌧️"]],
    [71, ["小雪", "🌨️"]],
    [73, ["中雪", "🌨️"]],
    [75, ["大雪", "❄️"]],
    [77, ["霰", "🌨️"]],
    [80, ["短暫陣雨", "🌦️"]],
    [81, ["陣雨", "🌧️"]],
    [82, ["強陣雨", "⛈️"]],
    [85, ["陣雪", "🌨️"]],
    [86, ["強陣雪", "❄️"]],
    [95, ["雷雨", "⛈️"]],
    [96, ["雷雨伴隨冰雹", "⛈️"]],
    [99, ["雷雨伴隨冰雹", "⛈️"]],
  ]);
  const locationSelect = document.querySelector("#weatherLocation");
  const weatherDays = document.querySelector("#weatherDays");
  const weatherUpdated = document.querySelector("#weatherUpdated");
  const hikingBestDay = document.querySelector("#hikingBestDay");
  const hikingWeatherAdvice = document.querySelector("#hikingWeatherAdvice");
  const hikingTrailList = document.querySelector("#hikingTrailList");
  const shuffleHikingTrails = document.querySelector("#shuffleHikingTrails");
  const taipeiGrandTrail = document.querySelector("#taipeiGrandTrail");
  const jiufenTrailRoute = document.querySelector("#jiufenTrailRoute");
  const taipeiTransit = document.querySelector("#taipeiTransit");
  const transitReminderDays = document.querySelector("#transitReminderDays");
  let currentTrailCandidates = [];
  let displayedTrailIds = [];
  let currentTrailCity = "";
  const trailHistoryStorageKey = "gohealth-trail-recommendation-history-v1";
  let activeController;

  function loadRecentTrailBatches() {
    try {
      const storedHistory = sessionStorage.getItem(trailHistoryStorageKey);
      if (!storedHistory) return new Map();
      const parsedHistory = JSON.parse(storedHistory);
      if (!parsedHistory || typeof parsedHistory !== "object" || Array.isArray(parsedHistory)) {
        throw new Error("儲存格式不是地區索引的紀錄。");
      }
      return new Map(Object.entries(parsedHistory)
        .filter(([city]) => locations[city])
        .map(([city, batches]) => [
          city,
          Array.isArray(batches)
            ? batches.slice(-3).filter(Array.isArray).map((batch) => batch.filter(Number.isInteger))
            : [],
        ]));
    } catch (error) {
      console.error("Unable to restore recent hiking trail recommendations:", error);
      return new Map();
    }
  }

  const recentTrailBatchesByCity = loadRecentTrailBatches();

  function saveRecentTrailBatches() {
    try {
      sessionStorage.setItem(
        trailHistoryStorageKey,
        JSON.stringify(Object.fromEntries(recentTrailBatchesByCity)),
      );
    } catch (error) {
      console.error("Unable to save recent hiking trail recommendations:", error);
    }
  }

  function formatDate(dateString) {
    return new Intl.DateTimeFormat("zh-TW", {
      month: "numeric",
      day: "numeric",
      weekday: "short",
      timeZone: "Asia/Taipei",
    }).format(new Date(`${dateString}T12:00:00+08:00`));
  }

  function renderForecast(daily) {
    if (
      !Array.isArray(daily?.time) ||
      !Array.isArray(daily?.weather_code) ||
      !Array.isArray(daily?.temperature_2m_max) ||
      !Array.isArray(daily?.temperature_2m_min) ||
      !Array.isArray(daily?.precipitation_probability_max) ||
      !Array.isArray(daily?.sunrise) ||
      !Array.isArray(daily?.sunset) ||
      daily.time.length !== 7 ||
      daily.time.some((_, index) =>
        [
          daily.weather_code[index],
          daily.temperature_2m_max[index],
          daily.temperature_2m_min[index],
          daily.precipitation_probability_max[index],
        ].some((value) => typeof value !== "number" || !Number.isFinite(value)),
      ) ||
      [...daily.sunrise, ...daily.sunset].some((value) =>
        typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(value),
      )
    ) {
      throw new Error("天氣服務回傳的預報資料格式不完整。");
    }

    weatherDays.innerHTML = daily.time.map((date, index) => {
      const [description, icon] = descriptions.get(daily.weather_code[index]) || ["天氣變化", "🌤️"];
      const dayLabel = index === 0 ? "今天" : formatDate(date);
      return `<article class="weather-day">
        <p class="weather-date">${dayLabel}</p>
        <span class="weather-icon" aria-hidden="true">${icon}</span>
        <p class="weather-condition">${description}</p>
        <p class="weather-temperature"><strong>${Math.round(daily.temperature_2m_max[index])}°</strong><span>${Math.round(daily.temperature_2m_min[index])}°</span></p>
        <p class="weather-rain">降雨機率 <strong>${Math.round(daily.precipitation_probability_max[index])}%</strong></p>
        <div class="weather-sun-times" aria-label="日出日落時間">
          <p><span aria-hidden="true">☀</span><span>日出</span><time datetime="${daily.sunrise[index]}">${daily.sunrise[index].slice(11, 16)}</time></p>
          <p><span aria-hidden="true">☾</span><span>日落</span><time datetime="${daily.sunset[index]}">${daily.sunset[index].slice(11, 16)}</time></p>
        </div>
      </article>`;
    }).join("");
    renderHikingRecommendations(daily, locations[locationSelect.value]);
  }

  function getHikingDayScore(daily, index) {
    const code = daily.weather_code[index];
    const precipitation = daily.precipitation_probability_max[index];
    const maximum = daily.temperature_2m_max[index];
    let score = precipitation;
    if (code >= 95) score += 500;
    else if (code >= 80) score += 20;
    else if (code >= 51) score += 10;
    else if (code >= 45) score += 5;
    if (maximum >= 33) score += 10;
    else if (maximum >= 30) score += 5;
    return score;
  }

  function shuffleTrails(trails) {
    const shuffled = [...trails];
    for (let index = shuffled.length - 1; index > 0; index -= 1) {
      const swapIndex = Math.floor(Math.random() * (index + 1));
      [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
    }
    return shuffled;
  }

  function renderHikingTrailCards(isNewBatch = true) {
    const recentBatches = recentTrailBatchesByCity.get(currentTrailCity) || [];
    const recentlyShownIds = new Set(recentBatches.flat());
    const availableTrails = currentTrailCandidates.filter((trail) => !recentlyShownIds.has(trail.id));
    if (isNewBatch) {
      displayedTrailIds = shuffleTrails(availableTrails).slice(0, 3).map((trail) => trail.id);
      if (displayedTrailIds.length > 0) {
        recentBatches.push(displayedTrailIds);
        if (recentBatches.length > 3) recentBatches.shift();
        recentTrailBatchesByCity.set(currentTrailCity, recentBatches);
        saveRecentTrailBatches();
      }
    } else {
      displayedTrailIds = displayedTrailIds.filter((id) =>
        currentTrailCandidates.some((trail) => trail.id === id),
      );
    }
    const updatedRecentIds = new Set(recentBatches.flat());
    const hasMoreTrails = currentTrailCandidates.some((trail) => !updatedRecentIds.has(trail.id));
    shuffleHikingTrails.hidden = currentTrailCandidates.length <= 1 || !hasMoreTrails;
    shuffleHikingTrails.textContent = "換一批步道";
    const suggestedTrails = currentTrailCandidates.filter((trail) => displayedTrailIds.includes(trail.id));
    if (suggestedTrails.length === 0) {
      hikingTrailList.innerHTML = '<p class="hiking-empty">這個地區的候選路線都已出現在最近三批推薦中，為避免重複，本次不再顯示。切換地區可探索其他步道。</p>';
      return;
    }
    hikingTrailList.innerHTML = suggestedTrails.map((trail) => `<article class="hiking-trail-card">
      <div class="hiking-trail-topline">
        <span class="hiking-difficulty">${trail.difficulty}難度</span>
        <span>${trail.location}</span>
      </div>
      <h4>${trail.name}</h4>
      <p class="hiking-trail-type">${trail.routeType}</p>
      <dl class="hiking-trail-stats">
        <div><dt>里程</dt><dd>${trail.length}</dd></div>
        <div><dt>海拔</dt><dd>${trail.elevation}</dd></div>
        <div><dt>參考時間</dt><dd>${trail.duration}</dd></div>
      </dl>
      <p class="hiking-trail-weather-tip">${trail.weatherTip}</p>
      <a href="${trail.url}" target="_blank" rel="noreferrer">健行筆記路線詳情 <span aria-hidden="true">↗</span></a>
    </article>`).join("");
  }

  function renderHikingRecommendations(daily, location) {
    const forecastDays = daily.time.map((date, index) => ({
      date,
      index,
      score: getHikingDayScore(daily, index),
    }));
    const bestDay = forecastDays.reduce((best, day) => day.score < best.score ? day : best);
    const bestCode = daily.weather_code[bestDay.index];
    const bestRain = daily.precipitation_probability_max[bestDay.index];
    const bestMaximum = daily.temperature_2m_max[bestDay.index];
    const hasThunderstorm = bestCode >= 95;
    const hasRain = bestCode >= 51 && bestCode <= 82;
    const isWet = bestRain >= 60 || hasThunderstorm || hasRain;
    const isFoggy = bestCode === 45 || bestCode === 48;
    const isHot = bestMaximum >= 30;
    const bestDate = new Intl.DateTimeFormat("zh-TW", {
      month: "numeric",
      day: "numeric",
      weekday: "short",
      timeZone: "Asia/Taipei",
    }).format(new Date(`${bestDay.date}T12:00:00+08:00`));
    hikingBestDay.textContent = isWet || isFoggy || hasThunderstorm
      ? `未來一週相對較佳：${bestDate}（仍需留意天候）`
      : `較適合安排：${bestDate}`;

    if (hasThunderstorm || bestRain >= 80) {
      hikingWeatherAdvice.textContent = `目前預報顯示 ${bestDate} 仍有雷雨或高降雨風險（${Math.round(bestRain)}%），建議延期登山；以下路線可作天候轉好後的規劃參考。`;
      hikingWeatherAdvice.className = "hiking-weather-advice is-risky";
    } else if (isWet) {
      hikingWeatherAdvice.textContent = `${bestDate} 預報降雨機率 ${Math.round(bestRain)}%，路面可能濕滑。優先考慮短程、低難度路線；瀑布、溪谷、泥徑與稜線行程建議改期。`;
      hikingWeatherAdvice.className = "hiking-weather-advice is-caution";
    } else if (isFoggy) {
      hikingWeatherAdvice.textContent = `${bestDate} 預報有霧，能見度可能偏低。請避開稜線和需要辨識岔路的路線，並確認現場狀況。`;
      hikingWeatherAdvice.className = "hiking-weather-advice is-caution";
    } else if (isHot) {
      hikingWeatherAdvice.textContent = `${bestDate} 預測高溫約 ${Math.round(bestMaximum)}°C，建議清晨出發、選擇有遮蔭的短程步道並充分補水。`;
      hikingWeatherAdvice.className = "hiking-weather-advice is-caution";
    } else {
      hikingWeatherAdvice.textContent = `${bestDate} 預報降雨機率 ${Math.round(bestRain)}%，目前是未來一週相對適合的時段；出發前仍請查看步道區域即時天氣。`;
      hikingWeatherAdvice.className = "hiking-weather-advice";
    }

    const trails = window.goHealthNorthernTrails.filter((trail) =>
      (Array.isArray(trail.county) ? trail.county : [trail.county]).includes(locationSelect.value),
    );
    const cityChanged = currentTrailCity !== locationSelect.value;
    currentTrailCity = locationSelect.value;
    if (trails.length === 0) {
      hikingTrailList.innerHTML = '<p class="hiking-empty">目前沒有這個縣市的精選路線資料，請從上方選擇北台灣其他縣市。</p>';
      currentTrailCandidates = [];
      displayedTrailIds = [];
      shuffleHikingTrails.hidden = true;
      return;
    }
    currentTrailCandidates = (isWet || isFoggy || hasThunderstorm)
      ? trails.filter((trail) => trail.difficulty === "低")
      : trails;
    displayedTrailIds = [];
    if (currentTrailCandidates.length === 0) {
      hikingTrailList.innerHTML = '<p class="hiking-empty">目前天候條件下沒有符合低難度的精選路線，建議等待天氣改善後再安排。</p>';
      shuffleHikingTrails.hidden = true;
      return;
    }
    const displayedTrailsStillMatch = displayedTrailIds.length > 0 &&
      displayedTrailIds.every((id) => currentTrailCandidates.some((trail) => trail.id === id));
    renderHikingTrailCards(cityChanged || !displayedTrailsStillMatch);
  }

  function getTaipeiDateString() {
    const parts = new Intl.DateTimeFormat("en-CA", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      timeZone: "Asia/Taipei",
    }).formatToParts(new Date());
    const dateParts = Object.fromEntries(parts.map(({ type, value }) => [type, value]));
    return `${dateParts.year}-${dateParts.month}-${dateParts.day}`;
  }

  function renderTransitReminders() {
    if (!transitReminderDays) return;
    const today = getTaipeiDateString();
    transitReminderDays.innerHTML = Array.from({ length: 7 }, (_, offset) => {
      const date = new Date(`${today}T00:00:00Z`);
      date.setUTCDate(date.getUTCDate() + offset);
      const dateString = date.toISOString().slice(0, 10);
      const dateInTaipei = new Date(`${dateString}T12:00:00+08:00`);
      const weekday = dateInTaipei.getUTCDay();
      const holidayName = window.goHealthTaiwanHolidays?.[Number(dateString.slice(0, 4))]?.[dateString];
      const isHoliday = Boolean(holidayName) || weekday === 0 || weekday === 6;
      const dateLabel = new Intl.DateTimeFormat("zh-TW", {
        month: "numeric",
        day: "numeric",
        weekday: "short",
        timeZone: "Asia/Taipei",
      }).format(dateInTaipei);
      const dayName = offset === 0 ? `今天・${dateLabel}` : dateLabel;
      const dayClass = isHoliday ? "假日班表" : "平日班表";
      const holidayLabel = holidayName ? `・${holidayName}` : "";
      return `<article class="transit-reminder-day${offset === 0 ? " is-today" : ""}" role="listitem"${offset === 0 ? ' aria-current="date"' : ""}>
        <div class="transit-reminder-date"><strong>${dayName}</strong><span>${dayClass}${holidayLabel}</span></div>
        <div class="transit-reminder-checks">
          <p><strong>去程首班</strong><span>確認捷運站點／方向與接駁公車首班</span></p>
          <p><strong>回程末班</strong><span>確認下山方向末班，預留候車與步行時間</span></p>
        </div>
      </article>`;
    }).join("");
  }

  async function loadForecast() {
    const location = locations[locationSelect.value];
    taipeiTransit.hidden = locationSelect.value !== "taipei";
    taipeiGrandTrail.hidden = locationSelect.value !== "taipei";
    jiufenTrailRoute.hidden = locationSelect.value !== "newTaipei";
    if (!location) {
      weatherUpdated.textContent = "找不到所選縣市的天氣資訊。";
      return;
    }
    activeController?.abort();
    activeController = new AbortController();
    const controller = activeController;
    weatherDays.innerHTML = '<p class="weather-message">正在載入一週天氣…</p>';
    weatherUpdated.textContent = `預報地點：${location.name}`;

    const parameters = new URLSearchParams({
      latitude: String(location.latitude),
      longitude: String(location.longitude),
      daily: "weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,sunrise,sunset",
      timezone: "Asia/Taipei",
      forecast_days: "7",
    });

    try {
      const response = await fetch(`https://api.open-meteo.com/v1/forecast?${parameters}`, {
        signal: controller.signal,
        headers: { Accept: "application/json" },
      });
      if (!response.ok) {
        throw new Error(`天氣服務回應錯誤（${response.status}）。`);
      }
      const result = await response.json();
      if (controller.signal.aborted) return;
      renderForecast(result.daily);
      weatherUpdated.textContent = `預報地點：${location.name}・更新時間 ${new Intl.DateTimeFormat("zh-TW", {
        hour: "2-digit",
        minute: "2-digit",
        timeZone: "Asia/Taipei",
      }).format(new Date())}`;
    } catch (error) {
      if (controller.signal.aborted) return;
      weatherDays.innerHTML = '<p class="weather-message weather-error">目前無法取得天氣資料，請檢查網路後重試。</p><button class="weather-retry" type="button">重新載入</button>';
      weatherUpdated.textContent = `預報地點：${location.name}`;
      weatherDays.querySelector(".weather-retry").addEventListener("click", loadForecast);
      console.error("Unable to load the North Taiwan weather forecast:", error);
    }
  }

  renderTransitReminders();
  shuffleHikingTrails.addEventListener("click", renderHikingTrailCards);
  locationSelect.addEventListener("change", loadForecast);
  loadForecast();
})();
