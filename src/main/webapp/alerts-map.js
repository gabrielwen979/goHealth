const alertList = document.querySelector("#alertList");
const apiKeyForm = document.querySelector("#apiKeyForm");
const apiKeyInput = document.querySelector("#apiKeyInput");
const alertSearch = document.querySelector("#alertSearch");
const categoryTabs = document.querySelector("#categoryTabs");
const regionGrid = document.querySelector("#regionGrid");
const timeRangeTabs = document.querySelector("#timeRangeTabs");
const typeFilter = document.querySelector("#typeFilter");
const limitSelect = document.querySelector("#limitSelect");
const refreshButton = document.querySelector("#refreshButton");
const NCDR_IMAGE_ROOT = "https://alerts.ncdr.nat.gov.tw/web/StaticFile/Images/";
const eventCategories = [
  { id: "all", label: "全部事件" },
  { id: "earthquake", label: "地震" },
  { id: "fire", label: "火災" },
  { id: "power", label: "停電／電力" },
  { id: "taipowerWork", label: "台電施工" },
  { id: "roadWork", label: "道路施工" },
  { id: "water", label: "停水／供水" },
  { id: "weather", label: "強降雨／颱風" },
  { id: "landslide", label: "土石流／崩塌" },
  { id: "other", label: "其他重大事件" },
];
const taiwanRegions = [
  { id: "基隆市", label: "基隆市" },
  { id: "臺北市", label: "臺北市", aliases: ["台北市"] },
  { id: "新北市", label: "新北市" },
  { id: "桃園市", label: "桃園市" },
  { id: "新竹市", label: "新竹市" },
  { id: "新竹縣", label: "新竹縣" },
  { id: "苗栗縣", label: "苗栗縣" },
  { id: "臺中市", label: "臺中市", aliases: ["台中市"] },
  { id: "彰化縣", label: "彰化縣" },
  { id: "南投縣", label: "南投縣" },
  { id: "雲林縣", label: "雲林縣" },
  { id: "嘉義縣", label: "嘉義縣" },
  { id: "嘉義市", label: "嘉義市" },
  { id: "臺南市", label: "臺南市", aliases: ["台南市"] },
  { id: "高雄市", label: "高雄市" },
  { id: "屏東縣", label: "屏東縣" },
  { id: "宜蘭縣", label: "宜蘭縣" },
  { id: "花蓮縣", label: "花蓮縣" },
  { id: "臺東縣", label: "臺東縣", aliases: ["台東縣"] },
  { id: "澎湖縣", label: "澎湖縣" },
  { id: "金門縣", label: "金門縣" },
  { id: "連江縣", label: "連江縣" },
];
const excludedAlertCodes = new Set(["Dangerfield"]);
const timeRanges = [
  { id: "all", label: "不限", duration: null },
  { id: "24h", label: "24 小時", duration: 24 * 60 * 60 * 1000 },
  { id: "3d", label: "3 天", duration: 3 * 24 * 60 * 60 * 1000 },
  { id: "7d", label: "1 週", duration: 7 * 24 * 60 * 60 * 1000 },
];
const map = L.map("alertMap", {
  scrollWheelZoom: true,
  minZoom: 6,
  maxBounds: L.latLngBounds([19.5, 116.5], [28, 126.5]),
  maxBoundsViscosity: 1,
}).setView([23.7, 121], 7);
const mapLayers = L.layerGroup().addTo(map);
const featureByAlert = new Map();
const countyCenters = [
  ["基隆市", 25.128, 121.742],
  ["臺北市", 25.038, 121.564],
  ["台北市", 25.038, 121.564],
  ["新北市", 25.012, 121.465],
  ["桃園市", 24.993, 121.301],
  ["新竹市", 24.804, 120.971],
  ["新竹縣", 24.838, 121.018],
  ["苗栗縣", 24.56, 120.82],
  ["臺中市", 24.147, 120.674],
  ["台中市", 24.147, 120.674],
  ["彰化縣", 24.075, 120.545],
  ["南投縣", 23.96, 120.971],
  ["雲林縣", 23.709, 120.431],
  ["嘉義市", 23.48, 120.449],
  ["嘉義縣", 23.458, 120.291],
  ["臺南市", 22.999, 120.227],
  ["台南市", 22.999, 120.227],
  ["高雄市", 22.627, 120.301],
  ["屏東縣", 22.676, 120.494],
  ["宜蘭縣", 24.757, 121.754],
  ["花蓮縣", 23.991, 121.601],
  ["臺東縣", 22.758, 121.144],
  ["台東縣", 22.758, 121.144],
  ["澎湖縣", 23.571, 119.579],
  ["金門縣", 24.449, 118.376],
  ["連江縣", 26.16, 119.95],
];
let alerts = [];
let activeApiKey = "";
let activeCategory = "all";
let activeRegion = "all";
let activeTimeRange = "all";
let expandedSatelliteMarkers = [];
let satelliteCloseTimer = null;

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  maxZoom: 18,
  attribution:
    '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
}).addTo(map);

function escapeHtml(value) {
  return String(value ?? "").replace(
    /[&<>"']/g,
    (character) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
      })[character],
  );
}

function setStatus(message, state = "ready") {
  const status = document.querySelector("#connectionStatus");
  status.className = `topbar-meta ${state}`;
  status.innerHTML = `<span class="status-dot"></span>${escapeHtml(message)}`;
}

function getAlertTitle(alert) {
  return (
    alert.info?.headline ||
    alert.info?.parameter?.find((item) => item.valueName === "alert_title")
      ?.value ||
    alert.summary?.description ||
    "示警訊息"
  );
}

function getSeverity(alert) {
  const value = alert.info?.severity || "Unknown";
  const labels = {
    Extreme: "極嚴重",
    Severe: "嚴重",
    Moderate: "中等",
    Minor: "輕微",
    Unknown: "未提供",
  };
  return { value, label: labels[value] || value };
}

function getAlertAreas(alert) {
  return (alert.info?.area || []).map((area) => area.areaDesc).filter(Boolean);
}

function getAlertRegions(alert) {
  const text = [
    ...getAlertAreas(alert),
    alert.summary?.description,
    alert.info?.description,
  ]
    .filter(Boolean)
    .join(" ");
  return taiwanRegions
    .filter(({ label, aliases = [] }) =>
      [label, ...aliases].some((name) => text.includes(name)),
    )
    .map(({ id }) => id);
}

function formatDate(value) {
  if (!value) return "時間未提供";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("zh-TW", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).format(date);
}

function isPublishedToday(alert, now = new Date()) {
  const sent = new Date(alert.sent || alert.info?.sent || "");
  if (Number.isNaN(sent.getTime())) return false;
  const dateInTaiwan = (date) =>
    new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Taipei",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(date);
  return dateInTaiwan(sent) === dateInTaiwan(now);
}

function getEventKind(alert) {
  const text = [
    getAlertTitle(alert),
    alert.summary?.capCode,
    alert.info?.event,
    alert.info?.category,
    alert.info?.description,
    alert.summary?.description,
  ]
    .filter(Boolean)
    .join(" ")
    .toLocaleLowerCase();

  if (/火災|火警|消防安全|fire|wildfire/.test(text)) return "fire";
  if (/地震|震度|earthquake|seismic/.test(text)) return "earthquake";
  if (/停電|斷電|復電|電力|供電|power outage|blackout/.test(text))
    return "power";
  if (/停水|缺水|供水|水庫|放流|water supply/.test(text)) return "water";
  if (/豪雨|大雨|降雨|淹水|水災|rain|flood/.test(text)) return "rain";
  if (/颱風|強風|陸上警報|typhoon|wind/.test(text)) return "wind";
  if (/土石流|崩塌|坍方|邊坡|landslide/.test(text)) return "landslide";
  return "warning";
}

function getEventCategory(alert) {
  const content = [
    getAlertTitle(alert),
    alert.summary?.capCode,
    alert.info?.event,
    alert.info?.description,
    alert.summary?.description,
    ...(alert.info?.parameter || []).flatMap((item) => [
      item.valueName,
      item.value,
    ]),
  ]
    .filter(Boolean)
    .join(" ")
    .toLocaleLowerCase();
  const sender = `${alert.sender || ""} ${alert.info?.senderName || ""}`;
  const isConstruction =
    /施工|工程|改接|檢修|維修|遷移|新設|架設|汰換|搶修/.test(content);

  if (
    /台電|台灣電力|台灣電力公司|taipower|taiwan power/i.test(
      `${sender} ${content}`,
    ) &&
    isConstruction
  ) {
    return "taipowerWork";
  }
  if (
    /道路|公路|路段|路面|橋梁|隧道/.test(content) &&
    /施工|封閉|管制|搶修|整修|鋪設|改道|工程/.test(content)
  ) {
    return "roadWork";
  }
  if (/地震|震度|earthquake|seismic/.test(content)) return "earthquake";
  if (/火災|火警|起火|火勢|fire|wildfire/.test(content)) return "fire";
  if (/停電|斷電|復電|電力|供電|饋線|配電|power outage|blackout/.test(content))
    return "power";
  if (/停水|缺水|供水|水庫|放流|water supply/.test(content)) return "water";
  if (
    /豪雨|大雨|降雨|淹水|水災|颱風|強風|陸上警報|rain|flood|typhoon|wind/.test(
      content,
    )
  )
    return "weather";
  if (/土石流|崩塌|坍方|邊坡|landslide/.test(content)) return "landslide";
  return "other";
}

function renderCategoryTabs() {
  const counts = new Map(eventCategories.map(({ id }) => [id, 0]));
  alerts.forEach((alert) => {
    const category = getEventCategory(alert);
    counts.set(category, (counts.get(category) || 0) + 1);
  });
  counts.set("all", alerts.length);
  categoryTabs.innerHTML = eventCategories
    .map(({ id, label }) => {
      const count = counts.get(id) || 0;
      return `<button class="category-tab ${id === activeCategory ? "active" : ""}" data-category="${id}" role="tab" aria-selected="${id === activeCategory}"><span>${label}</span><small>${count}</small></button>`;
    })
    .join("");
  categoryTabs.querySelectorAll(".category-tab").forEach((button) => {
    button.addEventListener("click", () => {
      activeCategory = button.dataset.category;
      typeFilter.value = "";
      renderCategoryTabs();
      document.querySelector("#categorySummary").textContent =
        eventCategories.find(({ id }) => id === activeCategory)?.label ||
        "全部事件";
      filterAlerts();
    });
  });
  document.querySelector("#categorySummary").textContent =
    eventCategories.find(({ id }) => id === activeCategory)?.label ||
    "全部事件";
}

function renderRegionFilters() {
  const counts = new Map(taiwanRegions.map(({ id }) => [id, 0]));
  alerts.forEach((alert) => {
    getAlertRegions(alert).forEach((region) => {
      counts.set(region, (counts.get(region) || 0) + 1);
    });
  });
  const regions = [{ id: "all", label: "全臺", count: alerts.length }].concat(
    taiwanRegions.map(({ id, label }) => ({
      id,
      label,
      count: counts.get(id) || 0,
    })),
  );
  regionGrid.innerHTML = regions
    .map(
      ({ id, label, count }) =>
        `<button class="region-button ${id === activeRegion ? "active" : ""}" data-region="${id}" type="button" aria-pressed="${id === activeRegion}"><span>${label}</span><small>${count}</small></button>`,
    )
    .join("");
  regionGrid.querySelectorAll(".region-button").forEach((button) => {
    button.addEventListener("click", () => {
      activeRegion = button.dataset.region;
      renderRegionFilters();
      document.querySelector("#regionSummary").textContent =
        regions.find(({ id }) => id === activeRegion)?.label || "全臺";
      filterAlerts();
    });
  });
  document.querySelector("#regionSummary").textContent =
    regions.find(({ id }) => id === activeRegion)?.label || "全臺";
}

function getAlertValidity(alert) {
  const effective = Date.parse(
    alert.summary?.effective ||
      alert.info?.effective ||
      alert.info?.onset ||
      "",
  );
  const expires = Date.parse(
    alert.summary?.expires || alert.info?.expires || "",
  );
  return {
    effective: Number.isFinite(effective) ? effective : null,
    expires: Number.isFinite(expires) ? expires : null,
  };
}

function matchesTimeRange(alert, rangeId, now = Date.now()) {
  if (rangeId === "all") return true;
  const range = timeRanges.find(({ id }) => id === rangeId);
  if (!range || range.duration === null) return true;

  const { effective, expires } = getAlertValidity(alert);
  if (effective === null && expires === null) return false;
  const windowEnd = now + range.duration;
  const startsInWindow =
    effective !== null && effective >= now && effective <= windowEnd;
  const expiresInWindow =
    expires !== null && expires >= now && expires <= windowEnd;
  return startsInWindow || expiresInWindow;
}

function renderTimeRangeTabs() {
  const now = Date.now();
  timeRangeTabs.innerHTML = timeRanges
    .map(({ id, label }) => {
      const count = alerts.filter((alert) =>
        matchesTimeRange(alert, id, now),
      ).length;
      return `<button class="time-range-tab ${id === activeTimeRange ? "active" : ""}" data-time-range="${id}" type="button" aria-pressed="${id === activeTimeRange}"><span>${label}</span><small>${count}</small></button>`;
    })
    .join("");
  timeRangeTabs.querySelectorAll(".time-range-tab").forEach((button) => {
    button.addEventListener("click", () => {
      activeTimeRange = button.dataset.timeRange;
      renderTimeRangeTabs();
      document.querySelector("#timeRangeSummary").textContent =
        timeRanges.find(({ id }) => id === activeTimeRange)?.label || "不限";
      filterAlerts();
    });
  });
  document.querySelector("#timeRangeSummary").textContent =
    timeRanges.find(({ id }) => id === activeTimeRange)?.label || "不限";
}

function getAlertVisual(alert) {
  const text = [
    getAlertTitle(alert),
    alert.info?.event,
    alert.info?.description,
    alert.info?.instruction,
    alert.summary?.description,
  ]
    .filter(Boolean)
    .join(" ");
  const recovered =
    alert.msgType === "Cancel" ||
    alert.info?.responseType === "AllClear" ||
    /解除|恢復|復原|復電|復水|供電恢復|恢復供電|恢復正常|搶修完成|restored|resolved|all clear|cancelled/i.test(
      text,
    );
  if (recovered) {
    return { color: "#278a55", state: "recovered", label: "解除／復原" };
  }

  const severity = alert.info?.severity;
  if (severity === "Extreme") {
    return { color: "#d93337", state: "extreme", label: "極嚴重" };
  }
  if (severity === "Severe") {
    return { color: "#ec762f", state: "severe", label: "嚴重" };
  }
  return {
    color: "#e5b936",
    state: "moderate",
    label: getSeverity(alert).label,
  };
}

function getOfficialIconUrl(alert) {
  const capCode = alert.summary?.capCode || "";
  const fileName = /^[A-Za-z0-9_-]+$/.test(capCode)
    ? `calamityIcon150Black_${capCode}.png`
    : "calamityIcon_sample.png";
  return `${NCDR_IMAGE_ROOT}${fileName}`;
}

function createAlertIcon(
  alert,
  showNew = isPublishedToday(alert),
  compact = false,
  groupMarker = false,
) {
  const visual = getAlertVisual(alert);
  const label = `${getAlertTitle(alert)}，${visual.label}${showNew ? "，今日發布" : ""}`;
  const fallback = `${NCDR_IMAGE_ROOT}calamityIcon_sample.png`;
  return L.divIcon({
    className: `alert-map-icon${compact ? " alert-map-icon-satellite" : ""}${groupMarker ? " alert-map-icon-group" : ""}`,
    html: `<span class="alert-icon-shell${compact ? " alert-icon-shell-compact" : ""}" style="--alert-color:${visual.color}" role="img" aria-label="${escapeHtml(label)}"><img class="alert-event-image" src="${escapeHtml(getOfficialIconUrl(alert))}" alt="" aria-hidden="true" onerror="this.onerror=null;this.src='${fallback}'">${showNew ? '<span class="alert-new-badge" title="今日發布"><b aria-hidden="true">!</b><span>NEW</span></span>' : ""}</span>`,
    iconSize: compact ? [40, 38] : [58, 48],
    iconAnchor: compact ? [19, 19] : [24, 24],
    popupAnchor: compact ? [0, -19] : [0, -24],
    tooltipAnchor: compact ? [0, -19] : [0, -24],
    title: label,
  });
}

function clearSatelliteCloseTimer() {
  if (satelliteCloseTimer !== null) {
    window.clearTimeout(satelliteCloseTimer);
    satelliteCloseTimer = null;
  }
}

function collapseSatelliteMarkers() {
  clearSatelliteCloseTimer();
  expandedSatelliteMarkers.forEach((marker) => mapLayers.removeLayer(marker));
  expandedSatelliteMarkers = [];
}

function scheduleSatelliteCollapse() {
  clearSatelliteCloseTimer();
  satelliteCloseTimer = window.setTimeout(collapseSatelliteMarkers, 220);
}

function expandSatelliteMarkers(group, primaryAlert) {
  clearSatelliteCloseTimer();
  const extras = group.alerts.filter((alert) => alert !== primaryAlert);
  const currentGroupId = `${group.name}:${group.kind}:${group.state}`;
  if (
    expandedSatelliteMarkers.length &&
    expandedSatelliteMarkers[0].groupId === currentGroupId
  ) {
    return;
  }
  collapseSatelliteMarkers();
  if (!extras.length) return;

  const center = map.latLngToContainerPoint(group.center);
  extras.forEach((alert, index) => {
    const point = center.add(L.point(64, 25 + index * 38));
    const satellitePosition = map.containerPointToLatLng(point);
    const satellite = L.marker(satellitePosition, {
      icon: createAlertIcon(alert, isPublishedToday(alert), true),
      title: `${getAlertTitle(alert)}，${getAlertVisual(alert).label}`,
      zIndexOffset: 1200 + index,
      keyboard: true,
    })
      .bindPopup(popupMarkup(alert, getAlertAreas(alert).join("、")))
      .addTo(mapLayers);
    satellite.groupId = currentGroupId;
    satellite.on("mouseover", clearSatelliteCloseTimer);
    satellite.on("mouseout", scheduleSatelliteCollapse);
    expandedSatelliteMarkers.push(satellite);
  });
}

function popupMarkup(alert, areaLabel = "") {
  const areas =
    areaLabel || getAlertAreas(alert).join("、") || "影響區域未提供";
  const visual = getAlertVisual(alert);
  return `<div class="map-popup"><strong>${escapeHtml(getAlertTitle(alert))}</strong><span>${escapeHtml(areas)}</span><p>${escapeHtml(alert.info?.description || alert.summary?.description || "")}</p><small>${escapeHtml(alert.info?.senderName || alert.sender || "發布單位未提供")} · ${escapeHtml(visual.label)}</small></div>`;
}

function parsePolygon(value) {
  if (!value) return [];
  const pairs = Array.isArray(value)
    ? value
    : String(value).trim().split(/\s+/);
  return pairs
    .map((pair) => {
      const [latitude, longitude] = (
        Array.isArray(pair) ? pair : String(pair).split(",")
      ).map(Number);
      return Number.isFinite(latitude) && Number.isFinite(longitude)
        ? [latitude, longitude]
        : null;
    })
    .filter(Boolean);
}

function parseCircle(value) {
  const parts = String(value || "")
    .trim()
    .split(/\s+/);
  if (parts.length < 2) return null;
  const [latitude, longitude] = parts[0].split(",").map(Number);
  const radius = Number(parts[1]);
  return [latitude, longitude, radius].every(Number.isFinite)
    ? { center: [latitude, longitude], radius }
    : null;
}

function findCountyCenter(areaDescription) {
  const match = countyCenters.find(([name]) => areaDescription.includes(name));
  return match ? { name: match[0], center: [match[1], match[2]] } : null;
}

function getMapFeatures(alert) {
  const exact = [];
  const approximate = [];
  const seen = new Set();
  for (const area of alert.info?.area || []) {
    const polygon = parsePolygon(area.polygon);
    if (polygon.length >= 3) {
      exact.push({
        type: "polygon",
        coordinates: polygon,
        label: area.areaDesc || "示警範圍",
      });
      continue;
    }
    const circle = parseCircle(area.circle);
    if (circle) {
      exact.push({
        type: "circle",
        ...circle,
        label: area.areaDesc || "示警範圍",
      });
      continue;
    }
    const county = findCountyCenter(area.areaDesc || "");
    if (county && !seen.has(county.name)) {
      approximate.push({ ...county, label: area.areaDesc });
      seen.add(county.name);
    }
  }
  if (!exact.length && !approximate.length) {
    const county = findCountyCenter(alert.summary?.description || "");
    if (county) approximate.push({ ...county, label: county.name });
  }
  return { exact, approximate };
}

function renderMap(items) {
  mapLayers.clearLayers();
  featureByAlert.clear();
  expandedSatelliteMarkers = [];
  clearSatelliteCloseTimer();
  const countyGroups = new Map();
  const bounds = [];

  items.forEach((alert) => {
    const features = getMapFeatures(alert);
    features.exact.forEach((feature) => {
      const visual = getAlertVisual(alert);
      const color = visual.color;
      const layer =
        feature.type === "polygon"
          ? L.polygon(feature.coordinates, {
              color,
              fillColor: color,
              fillOpacity: 0.2,
              weight: 2,
            })
          : L.circle(feature.center, {
              radius: feature.radius,
              color,
              fillColor: color,
              fillOpacity: 0.18,
              weight: 2,
            });
      layer.bindPopup(popupMarkup(alert, feature.label)).addTo(mapLayers);
      bounds.push(layer.getBounds());
      const point =
        feature.type === "polygon"
          ? layer.getBounds().getCenter()
          : feature.center;
      const marker = L.marker(point, {
        icon: createAlertIcon(alert),
        title: `${getAlertTitle(alert)}，${visual.label}${isPublishedToday(alert) ? "，今日發布" : ""}`,
      })
        .bindPopup(popupMarkup(alert, feature.label))
        .addTo(mapLayers);
      if (!featureByAlert.has(alert.summary.capid)) {
        featureByAlert.set(alert.summary.capid, {
          bounds: layer.getBounds(),
          marker,
        });
      }
    });
    features.approximate.forEach((feature) => {
      const kind = getEventKind(alert);
      const visual = getAlertVisual(alert);
      const groupState = visual.state === "recovered" ? "recovered" : "active";
      const key = `${feature.name}:${feature.center.join(",")}:${kind}:${groupState}`;
      if (!countyGroups.has(key))
        countyGroups.set(key, {
          ...feature,
          kind,
          visual,
          state: groupState,
          alerts: [],
        });
      countyGroups.get(key).alerts.push(alert);
    });
  });

  countyGroups.forEach((group) => {
    const count = group.alerts.length;
    const highestSeverity = group.alerts.reduce((highest, alert) => {
      const order = { Extreme: 3, Severe: 2, Moderate: 1, Minor: 0 };
      return (order[alert.info?.severity] ?? 0) >
        (order[highest.info?.severity] ?? 0)
        ? alert
        : highest;
    }, group.alerts[0]);
    const visual = getAlertVisual(highestSeverity);
    const rows = group.alerts
      .slice(0, 8)
      .map((alert) => `<li>${escapeHtml(getAlertTitle(alert))}</li>`)
      .join("");
    const more = count > 8 ? `<li>另有 ${count - 8} 則示警</li>` : "";
    const eventNames = {
      fire: "火災",
      earthquake: "地震",
      power: "停電／電力",
      water: "停水／水利",
      rain: "雨量／淹水",
      wind: "風災",
      landslide: "土石流／崩塌",
      warning: "其他示警",
    };
    const eventName = eventNames[group.kind] || eventNames.warning;
    const offsetByKind = {
      fire: [-0.018, -0.025],
      earthquake: [0.018, 0.025],
      power: [0.018, -0.025],
      water: [-0.018, 0.025],
      rain: [0, -0.035],
      wind: [0, 0.035],
      landslide: [-0.03, 0],
      warning: [0.03, 0],
    };
    const [offsetLat, offsetLng] = offsetByKind[group.kind] || [0, 0];
    const markerPoint = [
      group.center[0] + offsetLat,
      group.center[1] + offsetLng,
    ];
    const hasNewMessage = group.alerts.some((alert) => isPublishedToday(alert));
    const marker = L.marker(markerPoint, {
      icon: createAlertIcon(highestSeverity, hasNewMessage, false, true),
      title: `${group.name} ${eventName} ${count} 則，${visual.label}${hasNewMessage ? "，含今日發布" : ""}`,
      zIndexOffset: visual.state === "recovered" ? -100 : 100,
    })
      .bindPopup(
        `<div class="map-popup"><strong>${escapeHtml(group.name)} · ${escapeHtml(eventName)} · ${count} 則</strong><ul>${rows}${more}</ul><small>依影響行政區近似定位 · ${escapeHtml(visual.label)}</small></div>`,
      )
      .addTo(mapLayers);
    marker.on("mouseover", () =>
      expandSatelliteMarkers(group, highestSeverity),
    );
    marker.on("mouseout", scheduleSatelliteCollapse);
    marker.on("click", () => expandSatelliteMarkers(group, highestSeverity));
    const [latitude, longitude] = markerPoint;
    bounds.push(
      L.latLngBounds(
        [latitude - 0.06, longitude - 0.06],
        [latitude + 0.06, longitude + 0.06],
      ),
    );
    group.alerts.forEach((alert) => {
      if (!featureByAlert.has(alert.summary.capid))
        featureByAlert.set(alert.summary.capid, {
          bounds: marker.getLatLng().toBounds(12000),
          marker,
        });
    });
  });

  if (bounds.length) {
    const combined = bounds.reduce((current, next) => current.extend(next));
    map.fitBounds(combined.pad(0.12), { maxZoom: 9 });
  } else {
    map.setView([23.7, 121], 7);
  }
  document.querySelector("#areaCount").textContent = String(bounds.length);
}

function renderAlertList(items) {
  document.querySelector("#resultCount").textContent = `${items.length} 筆`;
  alertList.replaceChildren();
  if (!items.length) {
    alertList.innerHTML =
      '<div class="empty-state"><strong>沒有符合的示警</strong><p>試試其他搜尋字詞或示警類型。</p></div>';
    return;
  }
  const fragment = document.createDocumentFragment();
  items.forEach((alert) => {
    const row = document.createElement("article");
    const severity = getSeverity(alert);
    row.className = `alert-row severity-${severity.value.toLowerCase()}`;
    const button = document.createElement("button");
    button.className = "alert-row-button";
    button.type = "button";
    const heading = document.createElement("div");
    heading.className = "alert-row-heading";
    const type = document.createElement("span");
    type.className = "alert-type";
    type.textContent = getAlertTitle(alert);
    if (isPublishedToday(alert)) {
      const newBadge = document.createElement("span");
      newBadge.className = "alert-new-badge alert-new-badge-inline";
      newBadge.title = "今日發布";
      newBadge.innerHTML = '<b aria-hidden="true">!</b><span>NEW</span>';
      type.append(" ", newBadge);
    }
    const level = document.createElement("span");
    level.className = "severity-label";
    level.textContent = severity.label;
    heading.append(type, level);
    const description = document.createElement("p");
    description.className = "alert-description";
    description.textContent =
      alert.info?.description || alert.summary?.description || "沒有描述";
    const areas = document.createElement("p");
    areas.className = "alert-area";
    areas.textContent =
      getAlertAreas(alert).slice(0, 3).join("、") || "影響區域未提供";
    const meta = document.createElement("div");
    meta.className = "alert-meta";
    const sender = document.createElement("span");
    sender.textContent =
      alert.info?.senderName || alert.sender || "發布單位未提供";
    const date = document.createElement("time");
    date.textContent = formatDate(
      alert.summary?.effective || alert.info?.effective,
    );
    meta.append(sender, date);
    button.append(heading, description, areas, meta);
    button.addEventListener("click", () => focusAlert(alert));
    row.append(button);
    fragment.append(row);
  });
  alertList.append(fragment);
}

function focusAlert(alert) {
  const feature = featureByAlert.get(alert.summary.capid);
  if (!feature) {
    document.querySelector("#mapNote").textContent =
      "此示警未提供可定位的 CAP 座標或可辨識的縣市資訊。";
    return;
  }
  map.fitBounds(feature.bounds.pad(0.7), { maxZoom: 11 });
  feature.marker.openPopup();
}

function filterAlerts() {
  const query = alertSearch.value.trim().toLocaleLowerCase();
  const type = typeFilter.value;
  const filtered = alerts.filter((alert) => {
    const fields = [
      getAlertTitle(alert),
      alert.info?.description,
      alert.info?.senderName,
      alert.sender,
      ...getAlertAreas(alert),
    ];
    const matchesText =
      !query ||
      fields.some((field) =>
        String(field || "")
          .toLocaleLowerCase()
          .includes(query),
      );
    const matchesCategory =
      activeCategory === "all" || getEventCategory(alert) === activeCategory;
    const matchesRegion =
      activeRegion === "all" || getAlertRegions(alert).includes(activeRegion);
    const matchesTime = matchesTimeRange(alert, activeTimeRange);
    return (
      matchesText &&
      matchesCategory &&
      matchesRegion &&
      matchesTime &&
      (!type || getAlertTitle(alert) === type)
    );
  });
  renderAlertList(filtered);
  renderMap(filtered);
  document.querySelector("#alertCount").textContent = String(filtered.length);
  document.querySelector("#severeCount").textContent = String(
    filtered.filter((alert) =>
      ["Extreme", "Severe"].includes(alert.info?.severity),
    ).length,
  );
}

async function requestApi(resource, parameters) {
  const body = new URLSearchParams({ resource, ...parameters });
  const response = await fetch("api-proxy.jsp", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
    },
    body,
    cache: "no-store",
  });
  let payload;
  try {
    payload = await response.json();
  } catch {
    throw new Error(`NCDR API 回應格式錯誤 (${response.status})`);
  }
  if (!response.ok || payload.success === false) {
    throw new Error(
      payload.message ||
        payload.messsage ||
        `NCDR API 請求失敗 (${response.status})`,
    );
  }
  return payload.result ?? payload;
}

async function fetchDetails(summaries, apiKey) {
  const detailedAlerts = [];
  const batchSize = 5;
  for (let start = 0; start < summaries.length; start += batchSize) {
    const batch = summaries.slice(start, start + batchSize);
    const details = await Promise.all(
      batch.map(async (summary) => {
        try {
          const detail = await requestApi("dump/datastore", {
            apikey: apiKey,
            capid: summary.capid,
            format: "json",
          });
          const info = Array.isArray(detail.info)
            ? detail.info[0]
            : detail.info;
          return { summary, ...detail, info: info || {} };
        } catch {
          return { summary, info: {} };
        }
      }),
    );
    detailedAlerts.push(...details);
    setStatus(
      `讀取示警內容 ${detailedAlerts.length} / ${summaries.length}`,
      "loading",
    );
  }
  return detailedAlerts;
}

async function loadAlerts() {
  const apiKey = apiKeyInput.value.trim();
  if (!apiKey) {
    setStatus("請輸入有效的 NCDR API Key。", "error");
    apiKeyInput.focus();
    return;
  }
  activeApiKey = apiKey;
  refreshButton.disabled = true;
  typeFilter.disabled = true;
  setStatus("正在查詢 NCDR 示警清單…", "loading");
  alertList.innerHTML =
    '<div class="empty-state"><strong>正在載入資料</strong><p>正在讀取最新示警與影響範圍。</p></div>';
  try {
    const apiSummaries = await requestApi("datastore", {
      apikey: activeApiKey,
      format: "json",
      limit: limitSelect.value,
    });
    if (!Array.isArray(apiSummaries))
      throw new Error("NCDR API 未回傳示警清單。");
    const summaries = apiSummaries.filter(
      (summary) => !excludedAlertCodes.has(summary.capCode),
    );
    alerts = await fetchDetails(summaries, activeApiKey);
    renderCategoryTabs();
    renderRegionFilters();
    renderTimeRangeTabs();
    const failedDetails = alerts.filter((alert) => !alert.identifier).length;
    const types = [...new Set(alerts.map(getAlertTitle))].sort((a, b) =>
      a.localeCompare(b, "zh-TW"),
    );
    typeFilter.innerHTML = '<option value="">全部類型</option>';
    types.forEach((type) => {
      const option = document.createElement("option");
      option.value = type;
      option.textContent = type;
      typeFilter.append(option);
    });
    typeFilter.disabled = false;
    refreshButton.disabled = false;
    filterAlerts();
    document.querySelector("#updatedAt").textContent =
      `更新於 ${new Intl.DateTimeFormat("zh-TW", {
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        hourCycle: "h23",
      }).format(new Date())}`;
    setStatus(
      failedDetails
        ? `已載入，${failedDetails} 筆內容無法讀取`
        : "NCDR API 已連線",
      failedDetails ? "warning" : "connected",
    );
  } catch (error) {
    alerts = [];
    renderCategoryTabs();
    renderRegionFilters();
    renderTimeRangeTabs();
    alertList.innerHTML = `<div class="empty-state"><strong>無法載入示警</strong><p>${escapeHtml(error.message || "請檢查 API Key 或稍後重試。")}</p></div>`;
    renderMap([]);
    document.querySelector("#alertCount").textContent = "0";
    document.querySelector("#severeCount").textContent = "0";
    document.querySelector("#updatedAt").textContent = "資料載入失敗";
    refreshButton.disabled = false;
    setStatus(error.message || "讀取 NCDR API 失敗", "error");
  }
}

apiKeyForm.addEventListener("submit", (event) => {
  event.preventDefault();
  loadAlerts();
});
refreshButton.addEventListener("click", loadAlerts);
alertSearch.addEventListener("input", filterAlerts);
typeFilter.addEventListener("change", filterAlerts);
limitSelect.addEventListener("change", () => {
  if (activeApiKey) loadAlerts();
});
renderCategoryTabs();
renderRegionFilters();
renderTimeRangeTabs();
window.addEventListener("resize", () => map.invalidateSize());
