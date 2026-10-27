const http = require("node:http");
const fs = require("node:fs/promises");
const path = require("node:path");
const crypto = require("node:crypto");

const webRoot = path.join(__dirname, "src", "main", "webapp");
const port = Number(process.env.PORT || 8787);
const host = process.env.HOST || "0.0.0.0";
const dataDirectory = path.resolve(process.env.GOHEALTH_DATA_DIR || path.join(__dirname, "data"));
const dataPath = path.join(dataDirectory, "gohealth-users.json");
const apiRoot = "https://alerts.ncdr.nat.gov.tw/api";
const profileNames = ["SSU", "RABBIT", "MONKEY", "SNAKE"];
const allowedResources = new Set([
  "group",
  "dataset",
  "datastore",
  "dump/datastore",
]);
const contentTypes = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".jpeg": "image/jpeg",
  ".jpg": "image/jpeg",
  ".js": "text/javascript; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
};
let store;
let storeWriteQueue = Promise.resolve();

function sendJson(response, status, value) {
  response.writeHead(status, {
    "Cache-Control": "no-store",
    "Content-Type": "application/json; charset=utf-8",
  });
  response.end(JSON.stringify(value));
}

function createEmptyProfile() {
  return {
    heightCm: null,
    weightRecords: {},
    preferences: { dietType: "keto", avoidFoods: "" },
    recommendedMeals: [],
    checkedItems: {},
  };
}

function createInitialStore() {
  return {
    version: 2,
    users: Object.fromEntries(profileNames.map((name) => [
      name.toLowerCase(),
      { displayName: name, profile: createEmptyProfile() },
    ])),
  };
}

async function persistStore() {
  const temporaryPath = `${dataPath}.${process.pid}.${crypto.randomBytes(6).toString("hex")}.tmp`;
  await fs.mkdir(dataDirectory, { recursive: true, mode: 0o700 });
  try {
    await fs.writeFile(temporaryPath, JSON.stringify(store, null, 2), { mode: 0o600 });
    await fs.rename(temporaryPath, dataPath);
    await fs.chmod(dataPath, 0o600);
  } catch (error) {
    try {
      await fs.rm(temporaryPath, { force: true });
    } catch (cleanupError) {
      process.stderr.write(`Could not remove incomplete account data file: ${cleanupError.message}\n`);
    }
    throw error;
  }
}

async function initializeStore() {
  await fs.mkdir(dataDirectory, { recursive: true, mode: 0o700 });
  await fs.chmod(dataDirectory, 0o700);
  try {
    const content = await fs.readFile(dataPath, "utf8");
    const savedStore = JSON.parse(content);
    if (savedStore?.version === 1 && savedStore.users) {
      const hasPasswordProtectedData = profileNames.some((name) => {
        const user = savedStore.users[name.toLowerCase()];
        return user?.passwordHash || user?.encryptedProfile;
      });
      if (hasPasswordProtectedData) {
        throw new Error("Existing password-protected profiles cannot be migrated without the users' passwords. Restore the previous server version to export them before switching to profile selection.");
      }
      store = createInitialStore();
      await persistStore();
    } else if (
      savedStore?.version === 2 &&
      savedStore.users &&
      profileNames.every((name) => {
        const user = savedStore.users[name.toLowerCase()];
        return user?.displayName === name && user.profile;
      })
    ) {
      store = savedStore;
    } else {
      throw new TypeError("The saved goHealth account file has an invalid format.");
    }
    await fs.chmod(dataPath, 0o600);
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
    store = createInitialStore();
    await persistStore();
  }
  await fs.rm(path.join(dataDirectory, "gohealth-setup-key.txt"), { force: true });
}

async function updateStore(mutator) {
  let result;
  const operation = storeWriteQueue.then(async () => {
    result = await mutator();
    await persistStore();
  });
  storeWriteQueue = operation.catch(() => {});
  await operation;
  return result;
}

function parseRequestBody(request, maxBytes = 1024 * 1024) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let size = 0;
    let tooLarge = false;
    request.on("data", (chunk) => {
      if (tooLarge) return;
      size += chunk.length;
      if (size > maxBytes) {
        tooLarge = true;
        chunks.length = 0;
        reject(Object.assign(new Error("Request body too large"), { status: 413 }));
        request.resume();
        return;
      }
      chunks.push(chunk);
    });
    request.on("end", () => {
      if (tooLarge) return;
      try {
        resolve(JSON.parse(Buffer.concat(chunks).toString("utf8")));
      } catch {
        reject(Object.assign(new Error("Request body must be valid JSON"), { status: 400 }));
      }
    });
    request.on("error", reject);
  });
}

function parseProfile(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw Object.assign(new Error("Profile data must be an object"), { status: 400 });
  }
  const heightCm = value.heightCm;
  if (heightCm !== null && (!Number.isFinite(heightCm) || heightCm < 100 || heightCm > 250)) {
    throw Object.assign(new Error("Height must be between 100 and 250 cm"), { status: 400 });
  }
  const weightRecords = value.weightRecords;
  if (!weightRecords || typeof weightRecords !== "object" || Array.isArray(weightRecords)) {
    throw Object.assign(new Error("Weight records have an invalid format"), { status: 400 });
  }
  const recordEntries = Object.entries(weightRecords);
  if (recordEntries.length > 5000) {
    throw Object.assign(new Error("Too many weight records"), { status: 400 });
  }
  const cleanWeightRecords = {};
  for (const [date, record] of recordEntries) {
    if (
      !/^\d{4}-\d{2}-\d{2}$/.test(date) ||
      Number.isNaN(Date.parse(`${date}T00:00:00Z`)) ||
      new Date(`${date}T00:00:00Z`).toISOString().slice(0, 10) !== date
    ) {
      throw Object.assign(new Error("A weight record has an invalid date"), { status: 400 });
    }
    if (!record || typeof record !== "object" || Array.isArray(record)) {
      throw Object.assign(new Error("A weight record has an invalid format"), { status: 400 });
    }
    const cleanRecord = {};
    if (record.weight !== undefined) {
      if (!Number.isFinite(record.weight) || record.weight < 20 || record.weight > 350) {
        throw Object.assign(new Error("Weight must be between 20 and 350 kg"), { status: 400 });
      }
      cleanRecord.weight = record.weight;
    }
    if (record.waist !== undefined) {
      if (!Number.isFinite(record.waist) || record.waist < 30 || record.waist > 200) {
        throw Object.assign(new Error("Waist must be between 30 and 200 cm"), { status: 400 });
      }
      cleanRecord.waist = record.waist;
    }
    if (!Object.keys(cleanRecord).length) {
      throw Object.assign(new Error("A weight record must contain weight or waist"), { status: 400 });
    }
    cleanWeightRecords[date] = cleanRecord;
  }

  const preferences = value.preferences;
  const dietTypes = new Set(["keto", "vegetarian", "pescatarian"]);
  if (
    !preferences ||
    typeof preferences !== "object" ||
    !dietTypes.has(preferences.dietType) ||
    typeof preferences.avoidFoods !== "string" ||
    preferences.avoidFoods.length > 300
  ) {
    throw Object.assign(new Error("Diet preferences have an invalid format"), { status: 400 });
  }
  if (
    !Array.isArray(value.recommendedMeals) ||
    value.recommendedMeals.length > 73 ||
    value.recommendedMeals.some((id) => typeof id !== "string" || !/^recipe-(?:[1-9]|[1-6]\d|7[0-3])$/.test(id))
  ) {
    throw Object.assign(new Error("Recommended meals have an invalid format"), { status: 400 });
  }
  if (!value.checkedItems || typeof value.checkedItems !== "object" || Array.isArray(value.checkedItems)) {
    throw Object.assign(new Error("Shopping checklist has an invalid format"), { status: 400 });
  }
  const checkedItems = {};
  for (const [shoppingKey, items] of Object.entries(value.checkedItems)) {
    const weekMatch = /^(\d{4}-\d{2})-week-([1-5])$/.exec(shoppingKey);
    if (!weekMatch || !Array.isArray(items) || items.length > 100) {
      throw Object.assign(new Error("Shopping checklist has an invalid format"), { status: 400 });
    }
    const week = weekMatch[2];
    if (items.some((id) => typeof id !== "string" || !new RegExp(`^week-${week}-item-\\d{1,2}$`).test(id))) {
      throw Object.assign(new Error("Shopping checklist item has an invalid ID"), { status: 400 });
    }
    checkedItems[shoppingKey] = [...new Set(items)];
  }

  return {
    heightCm,
    weightRecords: cleanWeightRecords,
    preferences: {
      dietType: preferences.dietType,
      avoidFoods: preferences.avoidFoods.trim(),
    },
    recommendedMeals: [...new Set(value.recommendedMeals)],
    checkedItems,
  };
}

async function handleProfileApi(request, response, pathname) {
  if (request.method === "GET" && pathname === "/api/profiles") {
    sendJson(response, 200, {
      profiles: profileNames.map((name) => {
        const user = store.users[name.toLowerCase()];
        return { id: name.toLowerCase(), displayName: user.displayName };
      }),
    });
    return;
  }

  const profileMatch = /^\/api\/profile\/([a-z]+)$/.exec(pathname);
  if (!profileMatch || !["GET", "PUT"].includes(request.method)) {
    sendJson(response, 404, { message: "API endpoint not found" });
    return;
  }
  const userId = profileMatch[1];
  if (!profileNames.some((name) => name.toLowerCase() === userId)) {
    sendJson(response, 404, { message: "Unknown goHealth profile." });
    return;
  }
  const user = store.users[userId];
  if (request.method === "GET") {
    sendJson(response, 200, {
      user: { id: userId, displayName: user.displayName },
      profile: user.profile,
    });
    return;
  }
  let body;
  try {
    body = await parseRequestBody(request);
  } catch (error) {
    sendJson(response, error.status || 400, { message: error.message });
    return;
  }
  let profile;
  try {
    profile = parseProfile(body.profile);
  } catch (error) {
    sendJson(response, error.status || 400, { message: error.message });
    return;
  }
  try {
    await updateStore(() => {
      user.profile = profile;
    });
    sendJson(response, 200, { ok: true });
  } catch {
    sendJson(response, 500, { message: "Could not save profile data to the server file." });
  }
}

async function readForm(request) {
  const chunks = [];
  let size = 0;
  for await (const chunk of request) {
    size += chunk.length;
    if (size > 16384) throw new Error("Request body too large");
    chunks.push(chunk);
  }
  return new URLSearchParams(Buffer.concat(chunks).toString("utf8"));
}

async function proxyApi(request, response) {
  let parameters;
  try {
    parameters = await readForm(request);
  } catch {
    sendJson(response, 413, { message: "Request body too large" });
    return;
  }

  const resource = parameters.get("resource");
  const apiKey = parameters.get("apikey");
  const format = parameters.get("format");
  if (!allowedResources.has(resource)) {
    sendJson(response, 400, { message: "Unsupported API resource" });
    return;
  }
  if (!apiKey || apiKey.length > 256 || format !== "json") {
    sendJson(response, 400, {
      message: "A valid API key and JSON format are required",
    });
    return;
  }
  if (resource === "dump/datastore" && !parameters.get("capid")) {
    sendJson(response, 400, { message: "capid is required" });
    return;
  }

  const parameterNames =
    resource === "datastore"
      ? [
          "apikey",
          "format",
          "capcode",
          "govcode",
          "countycode",
          "effectivetime",
          "expirestime",
          "limit",
          "offset",
        ]
      : resource === "dump/datastore"
        ? ["apikey", "capid", "format"]
        : ["apikey", "format", "limit", "offset"];
  const query = new URLSearchParams();
  parameterNames.forEach((name) => {
    const value = parameters.get(name);
    if (value) query.set(name, value);
  });

  try {
    const upstream = await fetch(`${apiRoot}/${resource}?${query}`, {
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(20000),
    });
    const body = await upstream.text();
    response.writeHead(upstream.status, {
      "Cache-Control": "no-store",
      "Content-Type": "application/json; charset=utf-8",
    });
    response.end(body || "{}");
  } catch {
    sendJson(response, 502, { message: "Could not reach the NCDR alerts API" });
  }
}

async function serveStatic(request, response, pathname) {
  if (request.method !== "GET" && request.method !== "HEAD") {
    sendJson(response, 405, { message: "Method not allowed" });
    return;
  }
  const relativePath = pathname === "/" ? "index.html" : pathname.slice(1);
  const filePath = path.resolve(webRoot, relativePath);
  if (!filePath.startsWith(`${webRoot}${path.sep}`)) {
    sendJson(response, 403, { message: "Forbidden" });
    return;
  }
  if (path.basename(filePath) === "api-proxy.jsp") {
    sendJson(response, 405, { message: "Use POST for the NCDR API proxy" });
    return;
  }

  try {
    const content = await fs.readFile(filePath);
    response.writeHead(200, {
      "Cache-Control": "no-store",
      "Content-Type":
        contentTypes[path.extname(filePath)] || "application/octet-stream",
    });
    response.end(request.method === "HEAD" ? undefined : content);
  } catch {
    sendJson(response, 404, { message: "Not found" });
  }
}

const server = http.createServer(async (request, response) => {
  let pathname;
  try {
    pathname = decodeURIComponent(
      new URL(request.url, "http://localhost").pathname,
    );
  } catch {
    sendJson(response, 400, { message: "Invalid URL" });
    return;
  }

  if (pathname.startsWith("/api/")) {
    try {
      await handleProfileApi(request, response, pathname);
    } catch (error) {
      process.stderr.write(`goHealth API error: ${error.message}\n`);
      sendJson(response, 500, { message: "The goHealth profile service encountered an error." });
    }
    return;
  }

  if (pathname === "/api-proxy.jsp" && request.method === "POST") {
    await proxyApi(request, response);
    return;
  }
  await serveStatic(request, response, pathname);
});

initializeStore()
  .then(() => {
    server.listen(port, host, () => {
      process.stdout.write(`goHealth: http://localhost:${port}/\n`);
      if (host === "0.0.0.0" || host === "::") {
        process.stdout.write("For other devices on the same trusted network, use this computer's LAN address.\n");
      }
    });
  })
  .catch((error) => {
    process.stderr.write(`Could not initialize goHealth data storage: ${error.message}\n`);
    process.exitCode = 1;
  });

server.on("error", (error) => {
  process.stderr.write(`Could not start local server: ${error.message}\n`);
  process.exitCode = 1;
});
