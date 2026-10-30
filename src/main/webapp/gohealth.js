const menu = [
  [
    [
      {
        name: "香煎鮭魚酪梨沙拉",
        kcal: 590,
        protein: 34,
        fat: 45,
        carbs: 12,
        fiber: 7,
        ingredients: ["鮭魚排 130 g", "酪梨 1/2 顆（約 70 g）", "綜合生菜 80 g", "小黃瓜 60 g", "橄欖油 1 茶匙", "檸檬汁 1 湯匙"],
        steps: ["鮭魚擦乾，以少量鹽、胡椒調味；平底鍋加橄欖油，中火將兩面煎熟。", "生菜、小黃瓜與酪梨切好，淋檸檬汁拌勻，搭配鮭魚食用。"],
      },
      {
        name: "檸香雞腿花椰菜米",
        kcal: 620,
        protein: 39,
        fat: 46,
        carbs: 15,
        fiber: 6,
        ingredients: ["去骨雞腿排 150 g", "花椰菜米 180 g", "櫛瓜 100 g", "橄欖油 1 茶匙", "檸檬 1/2 顆", "蒜末 1 瓣"],
        steps: ["雞腿排以檸檬汁、蒜末和胡椒稍微醃漬；皮面朝下煎至金黃，再翻面煎熟。", "同鍋炒香花椰菜米與櫛瓜，搭配雞腿排上桌。"],
      },
    ],
    [
      {
        name: "菠菜蘑菇起司歐姆蛋",
        kcal: 540,
        protein: 31,
        fat: 41,
        carbs: 11,
        fiber: 4,
        ingredients: ["雞蛋 3 顆", "菠菜 60 g", "蘑菇 80 g", "切達起司 20 g", "無糖希臘優格 60 g", "橄欖油 1 茶匙"],
        steps: ["蘑菇切片，以橄欖油炒軟後加入菠菜。", "蛋液倒入鍋中，以小火煎至半凝固，放入起司和蔬菜對折煎熟；搭配無糖優格。"],
      },
      {
        name: "香草豬里肌與烤時蔬",
        kcal: 650,
        protein: 42,
        fat: 47,
        carbs: 16,
        fiber: 7,
        ingredients: ["豬里肌 150 g", "花椰菜 120 g", "甜椒 60 g", "橄欖油 2 茶匙", "乾燥迷迭香 1/2 茶匙"],
        steps: ["烤箱預熱至 200°C；花椰菜、甜椒拌一半橄欖油和香草，烤約 18 分鐘。", "豬里肌以剩餘油煎熟，靜置 3 分鐘後切片，與蔬菜一同食用。"],
      },
    ],
  ],
  [
    [
      {
        name: "酪梨雞蛋鮪魚生菜船",
        kcal: 560,
        protein: 37,
        fat: 39,
        carbs: 13,
        fiber: 8,
        ingredients: ["水煮鮪魚（水瀝乾）100 g", "雞蛋 1 顆", "酪梨 1/2 顆", "蘿蔓生菜 5 片", "無糖希臘優格 1 湯匙", "檸檬汁少許"],
        steps: ["雞蛋煮熟切碎；鮪魚、酪梨與優格拌合，以胡椒和檸檬汁調味。", "將餡料放入洗淨的蘿蔓葉中，做成生菜船。"],
      },
      {
        name: "味噌豆腐蝦仁菇菇鍋",
        kcal: 610,
        protein: 39,
        fat: 40,
        carbs: 17,
        fiber: 6,
        ingredients: ["蝦仁 120 g", "板豆腐 120 g", "鴻喜菇 100 g", "青江菜 100 g", "無糖味噌 1 湯匙", "芝麻油 1 茶匙"],
        steps: ["水煮滾後加入菇類、豆腐和青江菜，煮至蔬菜熟軟。", "味噌先以少量湯汁調開，與蝦仁一同加入煮熟；起鍋前滴入芝麻油。"],
      },
    ],
    [
      {
        name: "香煎鯖魚與芝麻菠菜",
        kcal: 630,
        protein: 36,
        fat: 48,
        carbs: 13,
        fiber: 6,
        ingredients: ["鯖魚排 140 g", "菠菜 120 g", "白芝麻 1 茶匙", "小番茄 60 g", "橄欖油 1 茶匙"],
        steps: ["鯖魚擦乾後以中火煎熟，魚皮煎至酥脆。", "菠菜汆燙瀝乾，拌芝麻和少量橄欖油，配小番茄食用。"],
      },
      {
        name: "香草雞肉櫛瓜番茄燉煮",
        kcal: 620,
        protein: 41,
        fat: 43,
        carbs: 16,
        fiber: 7,
        ingredients: ["去骨雞腿肉 150 g", "櫛瓜 120 g", "無加糖番茄丁 100 g", "洋蔥 25 g", "橄欖油 1 茶匙", "乾燥奧勒岡少許"],
        steps: ["雞腿肉擦乾切塊，煎至表面上色後加入洋蔥與奧勒岡拌炒。", "加入番茄丁和少量水，小火燉至雞肉中心熟透，再放入櫛瓜煮熟。"],
      },
    ],
  ],
  [
    [
      {
        name: "雞肉青醬花椰菜碗",
        kcal: 590,
        protein: 41,
        fat: 40,
        carbs: 14,
        fiber: 6,
        ingredients: ["雞胸肉 140 g", "花椰菜米 180 g", "無加糖青醬 1 湯匙", "小番茄 60 g", "帕瑪森起司 10 g"],
        steps: ["雞胸肉撒胡椒煎熟，靜置後切片。", "花椰菜米炒熟，拌入青醬，放上雞肉、小番茄與帕瑪森起司。"],
      },
      {
        name: "蒜香奶油蛤蜊櫛瓜麵",
        kcal: 600,
        protein: 35,
        fat: 43,
        carbs: 16,
        fiber: 5,
        ingredients: ["蛤蜊肉 120 g", "櫛瓜 1 根（約 200 g）", "無鹽奶油 10 g", "蒜末 1 瓣", "鮮奶油 30 ml", "巴西里少許"],
        steps: ["櫛瓜刨成麵條狀，蛤蜊肉洗淨瀝乾。", "奶油炒香蒜末，加入蛤蜊與鮮奶油煮熟，放入櫛瓜拌炒約 2 分鐘，撒上巴西里。"],
      },
    ],
    [
      {
        name: "豆腐酪梨芝麻拌菜",
        kcal: 530,
        protein: 29,
        fat: 39,
        carbs: 17,
        fiber: 9,
        ingredients: ["板豆腐 180 g", "酪梨 1/2 顆", "小黃瓜 80 g", "芝麻醬 1 湯匙", "無糖豆漿 1 湯匙", "海苔絲少許"],
        steps: ["板豆腐瀝乾切塊、酪梨與小黃瓜切丁。", "芝麻醬加無糖豆漿調成醬汁，與食材輕拌，撒上海苔絲。"],
      },
      {
        name: "迷迭香烤雞腿與蘆筍",
        kcal: 660,
        protein: 40,
        fat: 49,
        carbs: 13,
        fiber: 5,
        ingredients: ["去骨雞腿排 160 g", "蘆筍 120 g", "蘑菇 80 g", "橄欖油 2 茶匙", "迷迭香少許"],
        steps: ["烤箱預熱至 200°C，雞腿排拌迷迭香及一半橄欖油。", "雞腿與蘆筍、蘑菇同烤約 20 分鐘，確認雞肉中心熟透。"],
      },
    ],
  ],
  [
    [
      {
        name: "蝦仁酪梨花椰菜米碗",
        kcal: 560,
        protein: 37,
        fat: 39,
        carbs: 15,
        fiber: 7,
        ingredients: ["蝦仁 130 g", "花椰菜米 180 g", "酪梨 1/3 顆", "青蔥 1 根", "橄欖油 1 茶匙", "萊姆汁少許"],
        steps: ["蝦仁以胡椒調味後煎熟；花椰菜米炒軟。", "盛入碗中，放上酪梨丁與青蔥，擠上萊姆汁。"],
      },
      {
        name: "香煎雞腿羽衣甘藍沙拉",
        kcal: 640,
        protein: 41,
        fat: 46,
        carbs: 13,
        fiber: 6,
        ingredients: ["去骨雞腿肉 150 g", "羽衣甘藍 70 g", "小番茄 60 g", "橄欖油 1 茶匙", "檸檬汁 1 湯匙"],
        steps: ["雞腿肉擦乾後皮面朝下煎至金黃，翻面煎熟並確認中心熟透。", "羽衣甘藍揉拌少許檸檬汁和橄欖油，加入小番茄與雞腿肉。"],
      },
    ],
    [
      {
        name: "起司番茄菠菜烘蛋",
        kcal: 550,
        protein: 32,
        fat: 41,
        carbs: 12,
        fiber: 4,
        ingredients: ["雞蛋 3 顆", "菠菜 60 g", "小番茄 60 g", "莫札瑞拉起司 25 g", "橄欖油 1 茶匙"],
        steps: ["烤箱預熱至 180°C；菠菜和對切番茄以橄欖油略炒。", "倒入蛋液，放上起司，以小火煎至邊緣凝固，再入烤箱烤熟。"],
      },
      {
        name: "薑香豬肉高麗菜炒菇",
        kcal: 650,
        protein: 38,
        fat: 48,
        carbs: 16,
        fiber: 6,
        ingredients: ["豬梅花肉 130 g", "高麗菜 120 g", "香菇 80 g", "薑末 1 茶匙", "苦茶油 1 茶匙"],
        steps: ["豬肉切薄片；高麗菜和香菇切好備用。", "以苦茶油炒香薑末，加入豬肉炒熟，再放入蔬菜快炒至熟。"],
      },
    ],
  ],
  [
    [
      {
        name: "雞蛋鮪魚酪梨菠菜碗",
        kcal: 570,
        protein: 38,
        fat: 40,
        carbs: 13,
        fiber: 7,
        ingredients: ["水煮鮪魚（水瀝乾）100 g", "雞蛋 2 顆", "酪梨 1/3 顆", "菠菜 60 g", "橄欖油 1 茶匙"],
        steps: ["雞蛋煮熟切半；菠菜汆燙瀝乾。", "將鮪魚、菠菜、酪梨放入碗中，淋少量橄欖油與檸檬汁調味。"],
      },
      {
        name: "檸檬蒔蘿烤鮭魚花椰菜",
        kcal: 660,
        protein: 39,
        fat: 49,
        carbs: 14,
        fiber: 6,
        ingredients: ["鮭魚排 140 g", "花椰菜 150 g", "無糖希臘優格 1 湯匙", "檸檬 1/2 顆", "蒔蘿少許"],
        steps: ["烤箱預熱至 190°C，鮭魚以檸檬、蒔蘿和胡椒調味，烤約 12–15 分鐘至熟。", "花椰菜蒸熟，搭配以檸檬汁調味的無糖優格。"],
      },
    ],
    [
      {
        name: "香煎豆腐芝麻小松菜",
        kcal: 520,
        protein: 31,
        fat: 37,
        carbs: 16,
        fiber: 7,
        ingredients: ["板豆腐 180 g", "小松菜 120 g", "白芝麻 1 茶匙", "芝麻油 1 茶匙", "蒜末 1 瓣"],
        steps: ["豆腐壓去多餘水分，切片煎至兩面金黃。", "蒜末炒香後加入小松菜快炒，搭配豆腐並撒上芝麻。"],
      },
      {
        name: "香料雞肉彩椒盤",
        kcal: 650,
        protein: 42,
        fat: 46,
        carbs: 16,
        fiber: 6,
        ingredients: ["雞腿肉 150 g", "紅黃甜椒 100 g", "洋蔥 20 g", "橄欖油 2 茶匙", "孜然粉與紅椒粉各少許"],
        steps: ["雞腿肉切塊，以孜然、紅椒粉與胡椒拌勻。", "橄欖油煎熟雞肉，加入甜椒和洋蔥炒至蔬菜稍軟。"],
      },
    ],
  ],
  [
    [
      {
        name: "蘑菇雞肉生菜酪梨盤",
        kcal: 580,
        protein: 39,
        fat: 41,
        carbs: 14,
        fiber: 7,
        ingredients: ["雞胸肉 130 g", "蘑菇 80 g", "酪梨 1/3 顆", "蘿蔓生菜 80 g", "橄欖油 1 茶匙"],
        steps: ["雞胸肉煎熟後切片；蘑菇以少量油炒軟。", "將雞肉、蘑菇、酪梨放在生菜上，淋檸檬汁與橄欖油。"],
      },
      {
        name: "香煎鱸魚與奶油菠菜",
        kcal: 610,
        protein: 40,
        fat: 43,
        carbs: 13,
        fiber: 5,
        ingredients: ["鱸魚排 150 g", "菠菜 100 g", "無鹽奶油 8 g", "蒜末 1 瓣", "檸檬汁少許"],
        steps: ["鱸魚擦乾煎熟，魚肉中心應完全熟透。", "以少量奶油炒香蒜末，加入菠菜炒軟，擠上檸檬汁搭配魚肉。"],
      },
    ],
    [
      {
        name: "花椰菜起司蛋沙拉",
        kcal: 540,
        protein: 30,
        fat: 41,
        carbs: 15,
        fiber: 7,
        ingredients: ["雞蛋 2 顆", "花椰菜 150 g", "切達起司 20 g", "無糖希臘優格 1 湯匙", "生菜 40 g"],
        steps: ["雞蛋煮熟切塊；花椰菜蒸熟放涼。", "以無糖優格、胡椒調味，拌入花椰菜、雞蛋與起司，搭配生菜。"],
      },
      {
        name: "豬肉香菇青江菜鍋",
        kcal: 650,
        protein: 39,
        fat: 47,
        carbs: 16,
        fiber: 6,
        ingredients: ["豬梅花肉 130 g", "青江菜 120 g", "香菇 80 g", "板豆腐 80 g", "無糖味噌 1 湯匙"],
        steps: ["清水煮滾後加入香菇、豆腐和青江菜。", "加入豬肉片煮熟；味噌以少量湯汁調開後拌入，避免大滾久煮。"],
      },
    ],
  ],
  [
    [
      {
        name: "香草蛋沙拉酪梨生菜碗",
        kcal: 550,
        protein: 28,
        fat: 43,
        carbs: 13,
        fiber: 7,
        ingredients: ["雞蛋 3 顆", "酪梨 1/3 顆", "蘿蔓生菜 80 g", "無糖希臘優格 1 湯匙", "巴西里少許"],
        steps: ["雞蛋煮熟切碎，加入酪梨與無糖優格拌合。", "以胡椒、巴西里調味，盛在洗淨瀝乾的生菜葉上。"],
      },
      {
        name: "蒜香蝦仁花椰菜米",
        kcal: 570,
        protein: 38,
        fat: 39,
        carbs: 15,
        fiber: 6,
        ingredients: ["蝦仁 150 g", "花椰菜米 180 g", "青蔥 1 根", "蒜末 1 瓣", "苦茶油 1 茶匙"],
        steps: ["蝦仁瀝乾，熱鍋以苦茶油炒香蒜末，加入蝦仁快炒至不透明熟透後盛起。", "放入花椰菜米炒軟，再加入蝦仁，以青蔥和胡椒調味。"],
      },
    ],
    [
      {
        name: "鮭魚小黃瓜優格沙拉",
        kcal: 570,
        protein: 36,
        fat: 41,
        carbs: 13,
        fiber: 6,
        ingredients: ["鮭魚排 130 g", "小黃瓜 100 g", "綜合生菜 60 g", "無糖希臘優格 2 湯匙", "檸檬汁 1 茶匙", "橄欖油 1 茶匙"],
        steps: ["鮭魚以胡椒調味後煎熟，放涼至溫熱。", "優格與檸檬汁拌勻作為醬汁，搭配小黃瓜、生菜和鮭魚。"],
      },
      {
        name: "香菇雞肉高麗菜包",
        kcal: 640,
        protein: 42,
        fat: 46,
        carbs: 16,
        fiber: 7,
        ingredients: ["雞腿絞肉 150 g", "高麗菜葉 4 片", "香菇 60 g", "蒜末 1 瓣", "芝麻油 1 茶匙", "白胡椒少許"],
        steps: ["高麗菜葉汆燙至柔軟；絞肉與切碎香菇、蒜末拌勻。", "餡料包入菜葉後蒸約 12–15 分鐘至全熟，淋少量芝麻油。"],
      },
    ],
  ],
];

const dayPicker = document.querySelector("#dayPicker");
const dayOverview = document.querySelector("#dayOverview");
const mealGrid = document.querySelector("#mealGrid");
const shoppingList = document.querySelector("#shoppingList");
const shoppingWeekTitle = document.querySelector("#shoppingWeekTitle");
const shoppingProgress = document.querySelector("#shoppingProgress");
const menuMonthLabel = document.querySelector("#menuMonthLabel");
const previousMenuMonthButton = document.querySelector("#previousMenuMonth");
const todayMenuMonthButton = document.querySelector("#todayMenuMonth");
const nextMenuMonthButton = document.querySelector("#nextMenuMonth");
const textSmallerButton = document.querySelector("#textSmaller");
const textLargerButton = document.querySelector("#textLarger");
const textScaleValue = document.querySelector("#textScaleValue");
const themeToggleButtons = [...document.querySelectorAll(".theme-toggle")];
const weightCalendar = document.querySelector("#weightCalendar");
const calendarMonthLabel = document.querySelector("#calendarMonthLabel");
const selectedWeightDate = document.querySelector("#selectedWeightDate");
const weightForm = document.querySelector("#weightForm");
const weightInput = document.querySelector("#weightInput");
const waistInput = document.querySelector("#waistInput");
const heightInput = document.querySelector("#heightInput");
const weightFormMessage = document.querySelector("#weightFormMessage");
const latestWeight = document.querySelector("#latestWeight");
const weightChange = document.querySelector("#weightChange");
const latestWaist = document.querySelector("#latestWaist");
const bmiValue = document.querySelector("#bmiValue");
const bmiCategory = document.querySelector("#bmiCategory");
const saveHeightButton = document.querySelector("#saveHeight");
const trendCount = document.querySelector("#trendCount");
const weightTrendChart = document.querySelector("#weightTrendChart");
const deleteWeightButton = document.querySelector("#deleteWeight");
const profileName = document.querySelector("#profileName");
const preferencesForm = document.querySelector("#preferencesForm");
const dietTypeInput = document.querySelector("#dietType");
const avoidFoodsInput = document.querySelector("#avoidFoods");
const suggestedMeals = document.querySelector("#suggestedMeals");
const savedMeals = document.querySelector("#savedMeals");
const profileMessage = document.querySelector("#profileMessage");
const authGate = document.querySelector("#authGate");
const loginForm = document.querySelector("#loginForm");
const newPasswordForm = document.querySelector("#newPasswordForm");
const authMessage = document.querySelector("#authMessage");
const userIdentity = document.querySelector("#userIdentity");
const adminHomeButton = document.querySelector("#adminHomeButton");
const adminDialog = document.querySelector("#adminDialog");
const adminMessage = document.querySelector("#adminMessage");
const adminUserListMessage = document.querySelector("#adminUserListMessage");
const adminUsersTable = document.querySelector("#adminUsersTable");
const adminUsersFallbackSearch = document.querySelector("#adminUsersFallbackSearch");
const adminUsersFallbackSearchInput = document.querySelector("#adminUsersFallbackSearchInput");
const refreshAdminUsersButton = document.querySelector("#refreshAdminUsers");
const supabaseConfig = window.goHealthSupabaseConfig;
const supabaseClient = window.supabase && supabaseConfig
  ? window.supabase.createClient(supabaseConfig.url, supabaseConfig.publishableKey)
  : null;
let selectedMenuDate = new Date();
let displayedMenuMonth = new Date(
  selectedMenuDate.getFullYear(),
  selectedMenuDate.getMonth(),
  1,
);
let monthlyMeals = [];
let activeShoppingWeek = 1;
let textScale = 1;
const textScaleStorageKey = "gohealth-text-scale-v1";
const themeStorageKey = "gohealth-theme-v1";
let checkedItems = {};
let storageAvailable = true;
let weightRecords = {};
let heightCm = null;
let currentUser = null;
let theme = document.documentElement.dataset.theme === "light" ? "light" : "dark";
let profilePreferences = { dietType: "keto", avoidFoods: "" };
let recommendedMealIds = [];
let profileSaveQueue = Promise.resolve();
let awaitingPasswordSetup = /[#&]type=(invite|recovery|signup)\b/.test(window.location.hash);
let adminUsersDataTable = null;
let fallbackAdminUsers = [];
let selectedWeightDay = formatDateKey(new Date());
let displayedCalendarMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);

const allMeals = [
  ...menu.flat().flat(),
  ...window.goHealthMonthlyRecipes,
  ...window.goHealthLunarVegetarianRecipes,
];
const lunarVegetarianMeals = allMeals.filter((meal) => meal.lunarVegetarian);
const regularMeals = allMeals.filter((meal) => !meal.lunarVegetarian);
const mealIds = new Map(allMeals.map((meal, index) => [meal, `recipe-${index + 1}`]));

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (character) => {
    const entities = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    };
    return entities[character];
  });
}

function formatDateKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

const lunarDayFormatter = new Intl.DateTimeFormat("zh-TW-u-ca-chinese", {
  day: "numeric",
  timeZone: "Asia/Taipei",
});

function getLunarDay(date) {
  const taipeiNoon = new Date(Date.UTC(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
    4,
  ));
  return Number(
    lunarDayFormatter.formatToParts(taipeiNoon)
      .find((part) => part.type === "day")?.value,
  );
}

function isLunarVegetarianDay(date) {
  const lunarDay = getLunarDay(date);
  return lunarDay === 1 || lunarDay === 15;
}

function createProfileSnapshot() {
  return {
    heightCm,
    weightRecords,
    preferences: profilePreferences,
    recommendedMeals: recommendedMealIds,
    checkedItems,
  };
}

async function saveProfileData() {
  if (!currentUser || !supabaseClient) return false;
  const userId = currentUser.id;
  const snapshot = createProfileSnapshot();
  const operation = profileSaveQueue.then(async () => {
    const { error } = await supabaseClient
      .from("gohealth_profiles")
      .update({ profile: snapshot, updated_at: new Date().toISOString() })
      .eq("user_id", userId)
      .select("user_id")
      .single();
    if (error) throw error;
  });
  profileSaveQueue = operation.catch(() => {});
  try {
    await operation;
    storageAvailable = true;
    profileMessage.textContent = "個人資料已安全同步至雲端。";
    return true;
  } catch (error) {
    storageAvailable = false;
    profileMessage.textContent = `儲存失敗：${error.message}`;
    console.error("Could not save goHealth profile data.", error);
    return false;
  }
}

function getMenuEntries() {
  return allMeals.map((meal) => ({
    id: mealIds.get(meal),
    day: null,
    meal,
  }));
}

function getMenuEntry(id) {
  const meal = allMeals.find((entry) => mealIds.get(entry) === id);
  return meal ? { id, day: null, meal } : null;
}

function isMealRecommended(entry) {
  const ingredients = entry.meal.ingredients.join(" ");
  const avoided = profilePreferences.avoidFoods
    .split(/[,，、]/)
    .map((food) => food.trim())
    .filter(Boolean);
  if (avoided.some((food) => ingredients.includes(food))) return false;
  if (profilePreferences.dietType === "vegetarian" &&
      /雞腿|雞胸|雞肉|雞絞肉|豬|牛|羊|鮭|鯖|鮪|魚|蝦|蛤|海鮮/.test(ingredients)) {
    return false;
  }
  if (profilePreferences.dietType === "pescatarian" &&
      /雞腿|雞胸|雞肉|雞絞肉|豬|牛|羊/.test(ingredients)) {
    return false;
  }
  return true;
}

function formatMenuDay(day) {
  return day ? `${displayedMenuMonth.getMonth() + 1} 月 ${day} 日` : "整月推薦";
}

function renderRecommendationLists() {
  const entries = getMenuEntries();
  const saved = recommendedMealIds
    .map(getMenuEntry)
    .filter(Boolean);
  const suggestions = entries
    .filter((entry) => isMealRecommended(entry) && !recommendedMealIds.includes(entry.id))
    .slice(0, 6);
  suggestedMeals.innerHTML = suggestions.length
    ? suggestions.map(({ id, day, meal }) => `<div class="recommendation-item">
        <span><small>${formatMenuDay(day)}</small><strong>${escapeHtml(meal.name)}</strong></span>
        <button type="button" data-recommendation-id="${id}" aria-label="收藏${escapeHtml(meal.name)}">加入</button>
      </div>`).join("")
    : '<p class="recommendation-empty">目前沒有符合條件的菜色，請調整飲食偏好或排除食材。</p>';
  savedMeals.innerHTML = saved.length
    ? saved.map(({ id, day, meal }) => `<div class="recommendation-item">
        <span><small>${formatMenuDay(day)}</small><strong>${escapeHtml(meal.name)}</strong></span>
        <button type="button" data-recommendation-id="${id}" aria-label="移除${escapeHtml(meal.name)}">移除</button>
      </div>`).join("")
    : '<p class="recommendation-empty">尚未收藏。從左側推薦或月菜單加入喜歡的料理。</p>';
}

async function toggleRecommendedMeal(button) {
  const id = button.dataset.recommendationId;
  recommendedMealIds = recommendedMealIds.includes(id)
    ? recommendedMealIds.filter((savedId) => savedId !== id)
    : [...recommendedMealIds, id];
  renderRecommendationLists();
  renderMeals();
  await saveProfileData();
}

async function activateProfile(user) {
  await profileSaveQueue;
  const { data, error } = await supabaseClient
    .from("gohealth_profiles")
    .select("display_name, profile")
    .eq("user_id", user.id)
    .single();
  if (error) throw error;
  const profile = data.profile;
  if (
    !profile ||
    typeof profile !== "object" ||
    Array.isArray(profile) ||
    (profile.heightCm !== null && !Number.isFinite(profile.heightCm)) ||
    !profile.weightRecords ||
    typeof profile.weightRecords !== "object" ||
    Array.isArray(profile.weightRecords) ||
    !profile.preferences ||
    typeof profile.preferences !== "object" ||
    !["keto", "vegetarian", "pescatarian"].includes(profile.preferences.dietType) ||
    typeof profile.preferences.avoidFoods !== "string" ||
    !Array.isArray(profile.recommendedMeals) ||
    !profile.checkedItems ||
    typeof profile.checkedItems !== "object" ||
    Array.isArray(profile.checkedItems)
  ) {
    throw new TypeError("雲端個人資料格式不正確。");
  }
  currentUser = {
    ...user,
    displayName: data.display_name || user.user_metadata?.display_name || user.email,
  };
  heightCm = profile.heightCm;
  weightRecords = profile.weightRecords;
  profilePreferences = profile.preferences;
  recommendedMealIds = profile.recommendedMeals;
  checkedItems = profile.checkedItems;
  storageAvailable = true;
  profileName.textContent = currentUser.displayName;
  const shortName = currentUser.displayName.split("@")[0] || currentUser.displayName;
  userIdentity.textContent = shortName;
  userIdentity.title = user.email;
  heightInput.value = heightCm ?? "";
  dietTypeInput.value = profilePreferences.dietType;
  avoidFoodsInput.value = profilePreferences.avoidFoods;
  weightFormMessage.textContent = "輸入體重後儲存；腰圍為選填，留空儲存會移除此日腰圍。";
  renderWeightCalendar();
  renderShoppingList();
  renderRecommendationLists();
  renderMeals();
  updateBmi();
}

function displayAuthGate(message = "") {
  authGate.hidden = false;
  document.querySelector("#siteHeader").hidden = true;
  document.querySelector("#siteApp").hidden = true;
  document.querySelector("#siteFooter").hidden = true;
  loginForm.hidden = false;
  newPasswordForm.hidden = true;
  authMessage.textContent = message;
}

function displayPasswordSetup() {
  authGate.hidden = false;
  document.querySelector("#siteHeader").hidden = true;
  document.querySelector("#siteApp").hidden = true;
  document.querySelector("#siteFooter").hidden = true;
  loginForm.hidden = true;
  newPasswordForm.hidden = false;
  authMessage.textContent = "邀請已驗證，請先設定自己的登入密碼。";
}

function updateTheme(nextTheme, persist = true) {
  theme = nextTheme === "light" ? "light" : "dark";
  document.documentElement.dataset.theme = theme;
  document.querySelector('meta[name="theme-color"]').content =
    theme === "light" ? "#eef2f8" : "#080e11";
  for (const button of themeToggleButtons) {
    const nextLabel = theme === "light" ? "暗黑模式" : "明亮模式";
    button.setAttribute("aria-label", `切換至${nextLabel}`);
    button.title = `切換至${nextLabel}`;
    button.querySelector(".theme-toggle-label").textContent = nextLabel;
    button.querySelector("[aria-hidden='true']").textContent = theme === "light" ? "☾" : "☀";
  }
  if (!persist) return;
  try {
    localStorage.setItem(themeStorageKey, theme);
    if (currentUser?.id) {
      localStorage.setItem(`${themeStorageKey}:${currentUser.id}`, theme);
    }
  } catch (error) {
    console.error("Could not save the goHealth theme preference.", error);
  }
}

function restoreUserTheme(userId) {
  try {
    const savedTheme = localStorage.getItem(`${themeStorageKey}:${userId}`);
    if (savedTheme === "light" || savedTheme === "dark") {
      updateTheme(savedTheme, false);
    }
  } catch (error) {
    console.error("Could not load the goHealth account theme preference.", error);
  }
}

updateTheme(theme, false);

for (const button of themeToggleButtons) {
  button.addEventListener("click", () => {
    updateTheme(theme === "dark" ? "light" : "dark");
  });
}

async function handleAuthenticatedSession(session) {
  if (!session?.user) {
    currentUser = null;
    adminHomeButton.hidden = true;
    displayAuthGate();
    return;
  }
  try {
    await activateProfile(session.user);
    restoreUserTheme(session.user.id);
  } catch (error) {
    console.error("Could not load the signed-in goHealth profile.", error);
    await supabaseClient.auth.signOut();
    displayAuthGate(`無法載入個人資料：${error.message}`);
    return;
  }

  authGate.hidden = true;
  document.querySelector("#siteHeader").hidden = false;
  document.querySelector("#siteApp").hidden = false;
  document.querySelector("#siteFooter").hidden = false;
  const isAdmin = session.user.app_metadata?.role === "admin";
  adminHomeButton.hidden = !isAdmin;
}

async function invokeAdminFunction(body) {
  const { data, error } = await supabaseClient.functions.invoke("admin-users", { body });
  if (error) {
    let message = data?.message;
    if (!message && error.context instanceof Response) {
      try {
        const errorBody = await error.context.clone().json();
        message = errorBody?.message;
      } catch {
        message = "";
      }
    }
    throw new Error(message || error.message);
  }
  if (!data?.ok && !Array.isArray(data?.users)) {
    throw new Error(data?.message || "管理操作未完成。");
  }
  return data;
}

function renderFallbackAdminUsers() {
  const searchTerm = adminUsersFallbackSearchInput.value.trim().toLocaleLowerCase();
  const rows = fallbackAdminUsers.filter((row) =>
    `${row.displayName} ${row.email}`.toLocaleLowerCase().includes(searchTerm),
  );
  adminUsersTable.tBodies[0].innerHTML = rows.map((row) => `
    <tr>
      <td>${row.displayName}</td>
      <td>${row.email}</td>
      <td>${row.role}</td>
      <td>${row.status}</td>
      <td>${row.lastSignIn}</td>
      <td>${row.actions}</td>
    </tr>
  `).join("");
}

async function refreshAdminUsers() {
  adminUserListMessage.textContent = "載入帳號中…";
  try {
    const { users } = await invokeAdminFunction({ action: "list" });
    const tableRows = users.map((user) => {
      const isSelf = user.id === currentUser?.id;
      const isProtectedOwner = user.owner === true;
      const lastSignIn = user.lastSignInAt
        ? new Date(user.lastSignInAt).toLocaleString("zh-TW", {
          timeZone: "Asia/Taipei",
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
        })
        : "尚無登入紀錄";
      const roleAction = user.role === "admin"
        ? `<button type="button" data-admin-action="set-role" data-user-id="${escapeHtml(user.id)}" data-role="user" ${isProtectedOwner || isSelf ? "disabled" : ""}>取消管理權</button>`
        : `<button type="button" data-admin-action="set-role" data-user-id="${escapeHtml(user.id)}" data-role="admin" ${isSelf ? "disabled" : ""}>授予管理權</button>`;
      const statusAction = user.disabled
        ? `<button type="button" data-admin-action="set-disabled" data-user-id="${escapeHtml(user.id)}" data-disabled="false" ${isProtectedOwner || isSelf ? "disabled" : ""}>恢復帳號</button>`
        : `<button type="button" data-admin-action="set-disabled" data-user-id="${escapeHtml(user.id)}" data-disabled="true" ${isProtectedOwner || isSelf ? "disabled" : ""}>暫停帳號</button>`;
      const resetAction = `<button type="button" data-admin-action="reset" data-user-email="${escapeHtml(user.email || "")}" ${isProtectedOwner ? "disabled" : ""}>重設密碼</button>`;
      const deleteAction = `<button class="admin-danger-button" type="button" data-admin-action="delete" data-user-id="${escapeHtml(user.id)}" data-display-name="${escapeHtml(user.displayName)}" ${isProtectedOwner || isSelf ? "disabled" : ""}>永久刪除</button>`;
      return {
        displayName: `${escapeHtml(user.displayName)}${isProtectedOwner ? ' <span class="admin-role-badge">SSU・固定管理者</span>' : ""}`,
        email: escapeHtml(user.email || ""),
        role: user.role === "admin" ? '<span class="admin-role-badge">管理者</span>' : "使用者",
        status: user.disabled
          ? '<span class="admin-status-badge account-disabled">已暫停</span>'
          : user.emailConfirmed
            ? '<span class="admin-status-badge">正常</span>'
            : '<span class="admin-status-badge account-pending">待驗證</span>',
        lastSignIn: escapeHtml(lastSignIn),
        lastSignInSort: user.lastSignInAt || "",
        actions: `<div class="admin-table-actions">${roleAction}${statusAction}${resetAction}${deleteAction}</div>`,
      };
    });

    adminUserListMessage.textContent = "";
    if (typeof DataTable !== "undefined" && !adminUsersDataTable) {
      adminUsersFallbackSearch.hidden = true;
      adminUsersDataTable = new DataTable(adminUsersTable, {
        data: tableRows,
        pageLength: 10,
        lengthMenu: [10, 25, 50],
        order: [[0, "asc"]],
        columns: [
          { data: "displayName" },
          { data: "email" },
          { data: "role" },
          { data: "status" },
          {
            data: "lastSignIn",
            render: (value, type, row) =>
              type === "sort" || type === "type" ? row.lastSignInSort : value,
          },
          { data: "actions", orderable: false },
        ],
        columnDefs: [
          { targets: [5], searchable: false },
        ],
        language: {
          search: "搜尋：",
          searchPlaceholder: "輸入姓名或 Email",
          lengthMenu: "每頁顯示 _MENU_ 筆",
          info: "顯示第 _START_–_END_ 筆，共 _TOTAL_ 位使用者",
          infoEmpty: "目前沒有使用者",
          infoFiltered: "（從 _MAX_ 位使用者中篩選）",
          zeroRecords: "找不到符合的使用者",
          emptyTable: "目前沒有 goHealth 使用者帳號",
          paginate: { first: "第一頁", last: "最後一頁", next: "下一頁", previous: "上一頁" },
        },
      });
    } else if (adminUsersDataTable) {
      adminUsersDataTable.clear();
      adminUsersDataTable.rows.add(tableRows).draw();
    } else {
      adminUsersFallbackSearch.hidden = false;
      fallbackAdminUsers = tableRows;
      renderFallbackAdminUsers();
    }
  } catch (error) {
    adminUserListMessage.textContent = `無法載入帳號：${error.message}`;
  }
}

async function initializeAuthentication() {
  if (!supabaseClient) {
    displayAuthGate("登入服務尚未設定，請聯絡 goHealth 管理者。");
    return;
  }

  loginForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const submitButton = loginForm.querySelector("button[type='submit']");
    submitButton.disabled = true;
    authMessage.textContent = "正在登入…";
    try {
      const { data, error } = await supabaseClient.auth.signInWithPassword({
        email: document.querySelector("#loginEmail").value.trim(),
        password: document.querySelector("#loginPassword").value,
      });
      if (error) throw error;
      await handleAuthenticatedSession(data.session);
    } catch (error) {
      authMessage.textContent = `登入失敗：${error.message}`;
    } finally {
      submitButton.disabled = false;
    }
  });

  newPasswordForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const password = document.querySelector("#newPassword").value;
    if (password.length < 8) {
      authMessage.textContent = "密碼至少需要 8 個字元。";
      return;
    }
    const submitButton = newPasswordForm.querySelector("button[type='submit']");
    submitButton.disabled = true;
    try {
      const { data, error } = await supabaseClient.auth.updateUser({ password });
      if (error) throw error;
      awaitingPasswordSetup = false;
      await handleAuthenticatedSession(data.user ? { user: data.user } : null);
    } catch (error) {
      authMessage.textContent = `設定密碼失敗：${error.message}`;
    } finally {
      submitButton.disabled = false;
    }
  });

  document.querySelector("#forgotPasswordButton").addEventListener("click", async () => {
    const email = document.querySelector("#loginEmail").value.trim();
    if (!email) {
      authMessage.textContent = "請先輸入 Email，再按忘記密碼。";
      return;
    }
    authMessage.textContent = "正在寄送密碼重設連結…";
    try {
      const { error } = await supabaseClient.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}${window.location.pathname}`,
      });
      authMessage.textContent = error
        ? `無法寄送重設連結：${error.message}`
        : "若此 Email 已註冊，將收到密碼重設信。";
    } catch (error) {
      authMessage.textContent = `無法寄送重設連結：${error.message}`;
    }
  });

  document.querySelector("#signOutButton").addEventListener("click", async () => {
    const { error } = await supabaseClient.auth.signOut();
    if (error) {
      profileMessage.textContent = `登出失敗：${error.message}`;
      return;
    }
    currentUser = null;
    displayAuthGate();
  });

  supabaseClient.auth.onAuthStateChange((event, session) => {
    if (event === "SIGNED_OUT") {
      currentUser = null;
      displayAuthGate();
      return;
    }
    if (event === "PASSWORD_RECOVERY" || (event === "SIGNED_IN" && awaitingPasswordSetup)) {
      displayPasswordSetup();
      return;
    }
    if (event === "SIGNED_IN" && session) {
      queueMicrotask(() => {
        void handleAuthenticatedSession(session).catch((error) => {
          authMessage.textContent = `無法載入個人資料：${error.message}`;
        });
      });
    }
  });

  const { data, error } = await supabaseClient.auth.getSession();
  if (error) throw error;
  if (awaitingPasswordSetup && data.session) {
    displayPasswordSetup();
  } else if (data.session) {
    await handleAuthenticatedSession(data.session);
  } else {
    displayAuthGate();
  }

  document.querySelector("#adminHomeButton").addEventListener("click", async () => {
    if (currentUser?.app_metadata?.role !== "admin") return;
    adminMessage.textContent = "";
    adminDialog.showModal();
    await refreshAdminUsers();
  });
  refreshAdminUsersButton.addEventListener("click", () => {
    void refreshAdminUsers();
  });
  document.querySelector("#closeAdminDialog").addEventListener("click", () => adminDialog.close());
  document.querySelector("#inviteUserForm").addEventListener("submit", async (event) => {
    event.preventDefault();
    const inviteForm = event.currentTarget;
    const submitButton = inviteForm.querySelector("button[type='submit']");
    submitButton.disabled = true;
    adminMessage.textContent = "正在寄送邀請…";
    try {
      await invokeAdminFunction({
        action: "invite",
        email: document.querySelector("#inviteEmail").value,
        displayName: document.querySelector("#inviteDisplayName").value,
      });
      inviteForm.reset();
      adminMessage.textContent = "邀請已寄出；使用者可透過 Email 連結首次設定密碼。";
      await refreshAdminUsers();
    } catch (error) {
      adminMessage.textContent = `邀請失敗：${error.message}`;
    } finally {
      submitButton.disabled = false;
    }
  });
  adminUsersFallbackSearchInput.addEventListener("input", renderFallbackAdminUsers);
  adminUsersTable.addEventListener("click", async (event) => {
    const button = event.target.closest("[data-admin-action]");
    if (!button || currentUser?.app_metadata?.role !== "admin") return;
    if (button.disabled) return;
    button.disabled = true;
    try {
      if (button.dataset.adminAction === "reset") {
        await invokeAdminFunction({
          action: "reset-password",
          email: button.dataset.userEmail,
        });
        adminMessage.textContent = "密碼重設連結已寄出。";
      } else if (button.dataset.adminAction === "set-disabled") {
        const disabled = button.dataset.disabled !== "true";
        const action = disabled ? "停用" : "啟用";
        if (!window.confirm(`確定要${action}這個使用者帳號嗎？`)) return;
        await invokeAdminFunction({
          action: "set-disabled",
          userId: button.dataset.userId,
          disabled,
        });
        adminMessage.textContent = `帳號已${action}。`;
      } else if (button.dataset.adminAction === "set-role") {
        const role = button.dataset.role;
        const action = role === "admin" ? "授予管理權" : "取消管理權";
        const displayName = button.closest("tr").querySelector("td").textContent.trim();
        if (!window.confirm(`確定要對「${displayName}」${action}嗎？`)) return;
        await invokeAdminFunction({
          action: "set-role",
          userId: button.dataset.userId,
          role,
        });
        adminMessage.textContent = `已${action}。目標使用者需重新登入，權限變更才會生效。`;
      } else if (button.dataset.adminAction === "delete") {
        const displayName = button.dataset.displayName;
        if (!window.confirm(`確定永久刪除「${displayName}」的帳號與所有健康資料嗎？此操作無法復原。`)) return;
        const confirmation = window.prompt(`請輸入 DELETE 以永久刪除「${displayName}」及其健康資料。`);
        if (confirmation !== "DELETE") {
          adminMessage.textContent = "已取消刪除。";
          return;
        }
        await invokeAdminFunction({
          action: "delete-user",
          userId: button.dataset.userId,
        });
        adminMessage.textContent = `帳號「${displayName}」及其健康資料已永久刪除。`;
      }
      await refreshAdminUsers();
    } catch (error) {
      adminMessage.textContent = `操作失敗：${error.message}`;
    } finally {
      button.disabled = false;
    }
  });

  preferencesForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    profilePreferences = {
      dietType: dietTypeInput.value,
      avoidFoods: avoidFoodsInput.value.trim(),
    };
    renderRecommendationLists();
    await saveProfileData();
  });
  document.querySelector("#profile").addEventListener("click", async (event) => {
    const button = event.target.closest("[data-recommendation-id]");
    if (!button) return;
    await toggleRecommendedMeal(button);
  });
  mealGrid.addEventListener("click", async (event) => {
    const detailsSummary = event.target.closest(".meal-details > summary");
    if (detailsSummary) {
      event.preventDefault();
      const shouldOpen = !detailsSummary.parentElement.open;
      mealGrid.querySelectorAll(".meal-details").forEach((details) => {
        details.open = shouldOpen;
      });
      return;
    }

    const button = event.target.closest("[data-recommendation-id]");
    if (!button) return;
    await toggleRecommendedMeal(button);
  });
}

function renderWeightCalendar() {
  const year = displayedCalendarMonth.getFullYear();
  const month = displayedCalendarMonth.getMonth();
  const firstWeekday = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  calendarMonthLabel.textContent = displayedCalendarMonth.toLocaleDateString("zh-TW", {
    year: "numeric",
    month: "long",
  });
  const cells = [];
  for (let blank = 0; blank < firstWeekday; blank += 1) {
    cells.push('<span class="calendar-empty" aria-hidden="true"></span>');
  }
  for (let day = 1; day <= daysInMonth; day += 1) {
    const date = new Date(year, month, day);
    const dateKey = formatDateKey(date);
    const isSelected = dateKey === selectedWeightDay;
    const isToday = dateKey === formatDateKey(new Date());
    const record = weightRecords[dateKey];
    const hasRecord = Boolean(record);
    const details = [
      Number.isFinite(record?.weight) ? `體重 ${record.weight} 公斤` : "",
      Number.isFinite(record?.waist) ? `腰圍 ${record.waist} 公分` : "",
    ].filter(Boolean);
    cells.push(`<button class="calendar-day${isSelected ? " selected" : ""}${isToday ? " today" : ""}${hasRecord ? " has-record" : ""}" type="button" role="gridcell" data-weight-date="${dateKey}" aria-pressed="${isSelected}" aria-label="${year} 年 ${month + 1} 月 ${day} 日${details.length ? `，${details.join("，")}` : ""}">
      <span>${day}</span>${Number.isFinite(record?.weight) ? `<small>${record.weight}</small>` : hasRecord ? '<small>腰圍</small>' : ""}
    </button>`);
  }
  weightCalendar.innerHTML = cells.join("");
  selectedWeightDate.textContent = new Date(`${selectedWeightDay}T12:00:00`).toLocaleDateString("zh-TW", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "long",
  });
  const selectedRecord = weightRecords[selectedWeightDay];
  weightInput.value = selectedRecord?.weight ?? "";
  waistInput.value = selectedRecord?.waist ?? "";
  heightInput.value = heightCm ?? "";
  const hasSelectedRecord = Boolean(selectedRecord);
  weightFormMessage.textContent = hasSelectedRecord
    ? "已有紀錄，可修改後重新儲存。"
    : "輸入體重後儲存；腰圍為選填，留空儲存會移除此日腰圍。";
  deleteWeightButton.hidden = !hasSelectedRecord;
  updateBmi();
  updateWeightSummary();
  renderWeightTrend();
  applyTextScale();
}

function shiftCalendarMonth(offset) {
  const selectedDay = Number(selectedWeightDay.slice(-2));
  displayedCalendarMonth = new Date(
    displayedCalendarMonth.getFullYear(),
    displayedCalendarMonth.getMonth() + offset,
    1,
  );
  const monthDays = new Date(
    displayedCalendarMonth.getFullYear(),
    displayedCalendarMonth.getMonth() + 1,
    0,
  ).getDate();
  selectedWeightDay = formatDateKey(
    new Date(
      displayedCalendarMonth.getFullYear(),
      displayedCalendarMonth.getMonth(),
      Math.min(selectedDay, monthDays),
    ),
  );
  renderWeightCalendar();
}

function getMonthWeightEntries() {
  const monthPrefix = `${displayedCalendarMonth.getFullYear()}-${String(displayedCalendarMonth.getMonth() + 1).padStart(2, "0")}-`;
  return Object.entries(weightRecords)
    .filter(([date, record]) => date.startsWith(monthPrefix) && Number.isFinite(record.weight))
    .sort(([left], [right]) => left.localeCompare(right));
}

function updateWeightSummary() {
  const entries = getMonthWeightEntries();
  if (entries.length === 0) {
    latestWeight.textContent = "—";
    weightChange.textContent = "—";
    weightChange.classList.remove("weight-up", "weight-down");
  } else {
    const [first, last] = [entries[0][1].weight, entries.at(-1)[1].weight];
    const change = Math.round((last - first) * 10) / 10;
    latestWeight.textContent = `${last.toFixed(1)} kg`;
    weightChange.textContent = entries.length === 1
      ? "單筆"
      : `${change > 0 ? "+" : ""}${change.toFixed(1)} kg`;
    weightChange.classList.toggle("weight-up", change > 0);
    weightChange.classList.toggle("weight-down", change < 0);
  }
  const waistEntries = Object.entries(weightRecords)
    .filter(([date, record]) =>
      date.startsWith(`${displayedCalendarMonth.getFullYear()}-${String(displayedCalendarMonth.getMonth() + 1).padStart(2, "0")}-`) &&
      Number.isFinite(record.waist),
    )
    .sort(([left], [right]) => left.localeCompare(right));
  latestWaist.textContent = waistEntries.length
    ? `${waistEntries.at(-1)[1].waist.toFixed(1)} cm`
    : "—";
}

function renderWeightTrend() {
  const entries = getMonthWeightEntries();
  trendCount.textContent = entries.length ? `${entries.length} 筆紀錄` : "尚無紀錄";
  if (entries.length === 0) {
    weightTrendChart.innerHTML = '<text x="180" y="60" text-anchor="middle" class="chart-empty-label">儲存每日體重後顯示趨勢</text>';
    return;
  }
  const width = 360;
  const height = 110;
  const pad = { top: 16, right: 15, bottom: 22, left: 15 };
  const values = entries.map(([, record]) => record.weight);
  const low = Math.min(...values);
  const high = Math.max(...values);
  const range = Math.max(high - low, 0.4);
  const daysInMonth = new Date(
    displayedCalendarMonth.getFullYear(),
    displayedCalendarMonth.getMonth() + 1,
    0,
  ).getDate();
  const points = entries.map(([date, record]) => {
    const value = record.weight;
    const day = Number(date.slice(-2));
    const x = pad.left + ((day - 1) / Math.max(daysInMonth - 1, 1)) * (width - pad.left - pad.right);
    const y = pad.top + ((high - value + (range - (high - low)) / 2) / range) * (height - pad.top - pad.bottom);
    return { x, y, day, value };
  });
  const path = points.map((point, index) => `${index === 0 ? "M" : "L"} ${point.x.toFixed(1)} ${point.y.toFixed(1)}`).join(" ");
  const circles = points.map((point) => `<circle cx="${point.x}" cy="${point.y}" r="4" class="chart-point"><title>${point.day} 日：${point.value} kg</title></circle>`).join("");
  weightTrendChart.innerHTML = `
    <path d="M 15 83 H 345" class="chart-gridline" />
    <path d="${path}" class="chart-line" />
    ${circles}
    <text x="15" y="103" class="chart-axis-label">1 日</text>
    <text x="345" y="103" text-anchor="end" class="chart-axis-label">${daysInMonth} 日</text>
    <text x="15" y="12" class="chart-axis-label">${Math.max(...values).toFixed(1)} kg</text>
    <text x="345" y="12" text-anchor="end" class="chart-axis-label">${Math.min(...values).toFixed(1)} kg</text>`;
}

function saveWeightRecords() {
  return saveProfileData();
}

function updateBmi() {
  const currentWeight = Number(weightInput.value);
  const currentHeight = Number(heightInput.value);
  if (
    !Number.isFinite(currentWeight) ||
    currentWeight < 20 ||
    currentWeight > 350 ||
    !Number.isFinite(currentHeight) ||
    currentHeight < 100 ||
    currentHeight > 250
  ) {
    bmiValue.textContent = "—";
    bmiCategory.textContent = heightCm ? "選取日期並輸入體重" : "請先設定身高及體重";
    return;
  }
  const bmi = Math.round((currentWeight / (currentHeight / 100) ** 2) * 10) / 10;
  bmiValue.textContent = bmi.toFixed(1);
  bmiCategory.textContent = bmi < 18.5
    ? "成人參考：過輕"
    : bmi < 24
      ? "成人參考：正常範圍"
      : bmi < 27
        ? "成人參考：過重"
        : "成人參考：肥胖";
}

function getMeals() {
  return monthlyMeals[Number(selectedMenuDate.getDate()) - 1] || [];
}

function buildMonthlyMeals(month) {
  const daysInMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
  const lunarVegetarianDays = [];
  for (let day = 1; day <= daysInMonth; day += 1) {
    const date = new Date(month.getFullYear(), month.getMonth(), day);
    if (isLunarVegetarianDay(date)) lunarVegetarianDays.push(day - 1);
  }
  const regularMealCount = (daysInMonth - lunarVegetarianDays.length) * 2;
  const lunarVegetarianMealCount = lunarVegetarianDays.length * 2;
  if (regularMeals.length < regularMealCount) {
    throw new Error(`本月一般菜單需要 ${regularMealCount} 道不重複料理，目前可用食譜只有 ${regularMeals.length} 道。`);
  }
  if (lunarVegetarianMeals.length < lunarVegetarianMealCount) {
    throw new Error(`本月農曆初一、十五需要 ${lunarVegetarianMealCount} 道蛋奶素料理，目前只有 ${lunarVegetarianMeals.length} 道。`);
  }
  const monthKey = `${month.getFullYear()}-${String(month.getMonth() + 1).padStart(2, "0")}`;
  let seed = 2166136261;
  for (const character of monthKey) {
    seed = Math.imul(seed ^ character.charCodeAt(0), 16777619);
  }
  const random = () => {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    return seed / 0x100000000;
  };
  const shuffle = (meals) => {
    const shuffled = [...meals];
    for (let index = shuffled.length - 1; index > 0; index -= 1) {
      const swapIndex = Math.floor(random() * (index + 1));
      [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
    }
    return shuffled;
  };
  const shuffledRegularMeals = shuffle(regularMeals);
  const shuffledLunarMeals = shuffle(lunarVegetarianMeals);
  let regularMealIndex = 0;
  let lunarMealIndex = 0;
  const lunarVegetarianDaySet = new Set(lunarVegetarianDays);
  monthlyMeals = Array.from({ length: daysInMonth }, (_, day) => {
    if (lunarVegetarianDaySet.has(day)) {
      const dayMeals = shuffledLunarMeals.slice(lunarMealIndex, lunarMealIndex + 2);
      lunarMealIndex += 2;
      return dayMeals;
    }
    const dayMeals = shuffledRegularMeals.slice(regularMealIndex, regularMealIndex + 2);
    regularMealIndex += 2;
    return dayMeals;
  });
}

function changeMenuMonth(offset) {
  const selectedDay = selectedMenuDate.getDate();
  displayedMenuMonth = new Date(
    displayedMenuMonth.getFullYear(),
    displayedMenuMonth.getMonth() + offset,
    1,
  );
  const daysInMonth = new Date(
    displayedMenuMonth.getFullYear(),
    displayedMenuMonth.getMonth() + 1,
    0,
  ).getDate();
  selectedMenuDate = new Date(
    displayedMenuMonth.getFullYear(),
    displayedMenuMonth.getMonth(),
    Math.min(selectedDay, daysInMonth),
  );
  buildMonthlyMeals(displayedMenuMonth);
  renderMeals();
  renderShoppingList();
}

function renderDayPicker() {
  const year = displayedMenuMonth.getFullYear();
  const month = displayedMenuMonth.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstWeekday = new Date(year, month, 1).getDay();
  menuMonthLabel.textContent = displayedMenuMonth.toLocaleDateString("zh-TW", {
    year: "numeric",
    month: "long",
  });
  const blankDays = Array.from({ length: firstWeekday }, () =>
    '<span class="menu-calendar-empty" aria-hidden="true"></span>',
  );
  const todayKey = formatDateKey(new Date());
  const calendarDays = Array.from({ length: daysInMonth }, (_, index) => {
    const day = index + 1;
    const date = new Date(year, month, day);
    const isSelected =
      selectedMenuDate.getFullYear() === year &&
      selectedMenuDate.getMonth() === month &&
      selectedMenuDate.getDate() === day;
    const dayMeals = monthlyMeals[index] || [];
    const mealNames = dayMeals.map((meal) => meal.name).join("、");
    const lunarDay = getLunarDay(date);
    const isVegetarianDay = lunarDay === 1 || lunarDay === 15;
    const isWeekend = date.getDay() === 0 || date.getDay() === 6;
    const dateKey = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    const holidayName = window.goHealthTaiwanHolidays[year]?.[dateKey] || "";
    const lunarLabel = lunarDay === 1 ? "初一" : "十五";
    const classes = [
      "day-button",
      isSelected && "active",
      dateKey === todayKey && "today",
      isWeekend && "weekend-day",
      holidayName && "national-holiday-day",
      isVegetarianDay && "lunar-vegetarian-day",
    ].filter(Boolean).join(" ");
    const dayLabel = [
      isWeekend && "週末",
      holidayName && `台灣國定假日：${holidayName}`,
      isVegetarianDay && `農曆${lunarLabel}，蛋奶素午晚餐`,
    ].filter(Boolean).join("，");
    const shortHolidayName = holidayName.includes("/")
      ? "教師節"
      : holidayName.startsWith("臺灣光復")
        ? "光復節"
        : holidayName;
    const calendarNotes = [
      isVegetarianDay
        ? `<span class="menu-day-note lunar-note" data-short-label="${lunarLabel}素">${lunarLabel}・素</span>`
        : "",
      holidayName
        ? `<span class="menu-day-note holiday-note" data-short-label="${escapeHtml(shortHolidayName.slice(0, 2))}">${escapeHtml(shortHolidayName)}</span>`
        : "",
      isWeekend && !holidayName
        ? '<span class="menu-day-note weekend-note">週末</span>'
        : "",
    ].filter(Boolean).join("");
    const notes = calendarNotes ||
      '<span class="menu-day-note meal-note">午晚餐</span>';
    return `<button class="${classes}" type="button" data-menu-date="${dateKey}" aria-pressed="${isSelected}" aria-label="${month + 1} 月 ${day} 日${dayLabel ? `，${dayLabel}` : ""}：${escapeHtml(mealNames)}"${holidayName ? ` title="${escapeHtml(holidayName)}"` : ""}>
      <span class="menu-day-date">
        <span class="menu-day-weekday">週${["日", "一", "二", "三", "四", "五", "六"][date.getDay()]}</span>
        <strong>${String(day).padStart(2, "0")}</strong>
      </span>
      <span class="menu-day-notes">${notes}</span>
    </button>`;
  });
  dayPicker.innerHTML = [...blankDays, ...calendarDays].join("");
}

function renderOverview(meals) {
  const totals = meals.reduce(
    (sum, meal) => ({
      kcal: sum.kcal + meal.kcal,
      protein: sum.protein + meal.protein,
      fat: sum.fat + meal.fat,
      carbs: sum.carbs + meal.carbs,
      fiber: sum.fiber + meal.fiber,
    }),
    { kcal: 0, protein: 0, fat: 0, carbs: 0, fiber: 0 },
  );
  const netCarbs = totals.carbs - totals.fiber;
  const dayNumber = selectedMenuDate.getDate();
  const formattedDate = selectedMenuDate.toLocaleDateString("zh-TW", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "long",
  });
  const lunarDay = getLunarDay(selectedMenuDate);
  const vegetarianLabel = lunarDay === 1 ? "初一" : "十五";
  const dailyMenuDescription = isLunarVegetarianDay(selectedMenuDate)
    ? `農曆${vegetarianLabel}｜午、晚餐皆為蛋奶素低碳料理；營養數值為估算，依實際食材份量而異。`
    : "今日午餐與晚餐料理各不重複；營養估算合計供一般參考。";
  dayOverview.innerHTML = `
    <div>
      <h3>${formattedDate} <span>DAY ${String(dayNumber).padStart(2, "0")} / ${monthlyMeals.length}</span></h3>
      <p>${dailyMenuDescription}</p>
    </div>
    <div class="day-totals" aria-label="兩餐營養估算">
      <div class="total-item"><strong>${totals.kcal}</strong><span>kcal 熱量</span></div>
      <div class="total-item"><strong>${totals.protein} g</strong><span>蛋白質</span></div>
      <div class="total-item"><strong>${totals.fat} g</strong><span>脂肪</span></div>
      <div class="total-item"><strong>${netCarbs} g</strong><span>淨碳水</span></div>
    </div>`;
}

function getFoodSafetyNote(meal) {
  const ingredients = meal.ingredients.join(" ");
  if (/雞胸|雞腿|雞絞肉|雞肉|去骨雞|chicken/i.test(ingredients)) {
    return "選包裝完整、全程冷藏的雞肉，購買後盡快冷藏，1–2 天內烹調或冷凍。生熟食分開處理；雞肉中心溫度至少 74°C，最厚處也要熟透。";
  }
  if (/蝦|蛤蜊|魚|鮭|鯖|鮪|鱸|蛤/i.test(ingredients)) {
    return "挑選冷藏妥善、氣味清新且肉質有彈性的海鮮；離開冷藏後儘快料理。魚肉中心約 63°C 且不透明；蝦仁熟至不透明、蛤蜊肉熟透。";
  }
  if (/豬|pork/i.test(ingredients)) {
    return "選購包裝完整、冷藏溫度穩定的豬肉，1–2 天內使用或冷凍。生肉與蔬菜分開處理；整塊豬肉中心至少 63°C，離火靜置 3 分鐘。";
  }
  if (/蛋|egg/i.test(ingredients)) {
    return "雞蛋選外殼完整、冷藏保存的品項，使用前再清洗雙手並檢查有無裂痕。蛋料理加熱至蛋白與蛋黃凝固；孕婦、長者及免疫力較弱者避免生蛋。";
  }
  if (/豆腐|豆漿/i.test(ingredients)) {
    return "豆腐選冷藏且在期限內的品項，開封後密封冷藏並儘早用完；同時挑選葉片完整、無黏滑或異味的蔬菜。";
  }
  return "選擇外觀完整、無異味的食材，留意包裝日期與冷藏條件；生鮮食材和即食蔬菜分開處理，料理前後確實清潔雙手與器具。";
}

function getPreparationNote(meal) {
  if (meal.tips) return meal.tips;
  const ingredients = meal.ingredients.join(" ");
  if (/鮭|鯖|鮪|鱸|魚/i.test(ingredients)) {
    return "魚排用廚房紙巾輕輕擦乾再下鍋，有助表面上色；煎烤時先讓魚肉定型再翻面，減少破碎。";
  }
  if (/蝦|蛤/i.test(ingredients)) {
    return "海鮮瀝乾再下鍋，鍋子不要塞太滿；分批快炒較容易熟得均勻、不出水。";
  }
  if (/雞胸|雞腿|雞絞肉|雞肉|去骨雞/i.test(ingredients)) {
    return "雞肉厚薄盡量一致，擦乾表面再煎；先煎至定色再翻面，以食物溫度計確認最厚處熟透。";
  }
  if (/豬/i.test(ingredients)) {
    return "豬肉切成厚薄相近的大小；先把鍋燒熱再分批煎炒，避免肉片堆疊而出水。";
  }
  if (/蛋/i.test(ingredients)) {
    return "蛋液可先充分打散；用中小火慢慢加熱，半凝固時再加入配料，成品口感會更柔嫩。";
  }
  return "先將食材瀝乾、切成大小相近的份量，依熟成時間由久到短下鍋；豆腐先壓去水分較容易煎出金黃色。";
}

function getMealPhotoSet(meal) {
  const ingredients = meal.ingredients.join(" ");
  if (/歐姆蛋|烘蛋|蛋沙拉/.test(meal.name)) {
    return {
      finished: "meal-eggs.jpg",
      fresh: "ingredients-eggs.jpg",
      freshLabel: "雞蛋食材",
    };
  }
  const photoSets = [
    { pattern: /雞胸|雞腿|雞絞肉|雞肉|去骨雞/, finished: "meal-chicken.jpg", fresh: "ingredients-chicken.jpg", freshLabel: "雞肉食材" },
    { pattern: /豬/, finished: "meal-pork.jpg", fresh: "ingredients-vegetables.jpg", freshLabel: "蔬菜食材" },
    { pattern: /鮭/, finished: "meal-salmon.jpg", fresh: "ingredients-vegetables.jpg", freshLabel: "蔬菜食材" },
    { pattern: /鯖|鱸|鮪|魚/, finished: "meal-fish.jpg", fresh: "ingredients-vegetables.jpg", freshLabel: "蔬菜食材" },
    { pattern: /蝦|蛤/, finished: "meal-salmon.jpg", fresh: "ingredients-vegetables.jpg", freshLabel: "蔬菜食材" },
    { pattern: /豆腐|豆漿|豆腐/, finished: "meal-salad.jpg", fresh: "ingredients-vegetables.jpg", freshLabel: "蔬菜食材" },
  ];
  const match = photoSets.find(({ pattern }) => pattern.test(ingredients));
  if (match) return match;
  return {
    finished: "meal-salad.jpg",
    fresh: "ingredients-vegetables.jpg",
    freshLabel: "新鮮蔬菜",
  };
}

function renderMealPhotos(meal) {
  const photos = getMealPhotoSet(meal);
  return `<div class="meal-photo-pair">
    <figure class="meal-photo meal-photo-finished">
      <img src="images/${photos.finished}" alt="${escapeHtml(meal.name)}完成料理情境照" loading="lazy" decoding="async" />
      <figcaption>完成料理參考</figcaption>
    </figure>
    <figure class="meal-photo meal-photo-ingredients">
      <img src="images/${photos.fresh}" alt="${escapeHtml(photos.freshLabel)}實拍" loading="lazy" decoding="async" />
      <figcaption>${escapeHtml(photos.freshLabel)}</figcaption>
    </figure>
    <a class="photo-credit" href="https://unsplash.com/license" target="_blank" rel="noopener noreferrer">Unsplash 實拍・情境參考</a>
  </div>`;
}

function renderMeals() {
  const meals = getMeals();
  const dayNumber = selectedMenuDate.getDate();
  renderDayPicker();
  renderOverview(meals);
  mealGrid.innerHTML = meals.map((meal, index) => {
    const recommendationId = mealIds.get(meal);
    const isSaved = recommendedMealIds.includes(recommendationId);
    const totalCarbs = meal.carbs;
    const netCarbs = totalCarbs - meal.fiber;
    const mealTime = index === 0 ? "午餐" : "晚餐";
    const label = isLunarVegetarianDay(selectedMenuDate)
      ? `LUNAR VEGETARIAN / 蛋奶素${mealTime}`
      : index === 0 ? "LUNCH / 午餐" : "DINNER / 晚餐";
    const workflow = [
      "先洗手並備妥砧板與刀具。蔬菜洗淨瀝乾；生肉、魚與即食蔬菜分開處理，生鮮食材在烹調前保持冷藏。",
      ...meal.steps,
      "先試味再補鹽，依序放上主菜、蔬菜與醬汁，趁熱享用；生菜或冷盤請用乾淨器具另外盛裝。",
    ];
    return `<article class="meal-card">
      <div class="meal-art">${renderMealPhotos(meal)}</div>
      <div class="meal-card-top">
        <div><span class="meal-type">${label}</span><h4>${escapeHtml(meal.name)}</h4></div>
        <div class="meal-kcal"><strong>${meal.kcal}</strong><span>kcal / 份</span></div>
      </div>
      <div class="meal-tags">${isLunarVegetarianDay(selectedMenuDate) ? '<span class="meal-tag lunar-meal-tag">蛋奶素・低碳</span>' : ""}<span class="meal-tag">淨碳水 ${netCarbs} g</span><span class="meal-tag">膳食纖維 ${meal.fiber} g</span></div>
      <button class="meal-save-button" type="button" data-recommendation-id="${recommendationId}" aria-pressed="${isSaved}">${isSaved ? "已收藏推薦菜單<span class=\"meal-save-heart\" aria-hidden=\"true\">♥</span>" : "加入我的推薦菜單"}</button>
      <div class="macro-strip" aria-label="每份營養估算">
        <div><strong>${meal.protein} g</strong><span>蛋白質</span></div>
        <div><strong>${meal.fat} g</strong><span>脂肪</span></div>
        <div><strong>${totalCarbs} g</strong><span>總碳水</span></div>
      </div>
      <details class="meal-details">
        <summary>食材、料理步驟、好吃秘訣與鮮度提醒</summary>
        <h5>食材（1 人份）</h5>
        <ul>${meal.ingredients.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>
        <h5>料理流程｜依序完成</h5>
        <ol class="cooking-flow">${workflow.map((step) => `<li>${escapeHtml(step)}</li>`).join("")}</ol>
        <div class="kitchen-tip"><strong>煮得美味的小技巧</strong><p>${escapeHtml(getPreparationNote(meal))}</p></div>
        <div class="freshness-tip"><strong>食材鮮度與熟度</strong><p>${escapeHtml(getFoodSafetyNote(meal))}</p></div>
      </details>
    </article>`;
  }).join("");
  renderRecommendationLists();
  applyTextScale();
}

function updateShoppingProgress() {
  const inputs = [...shoppingList.querySelectorAll('input[type="checkbox"]')];
  const completed = inputs.filter((input) => input.checked).length;
  shoppingProgress.textContent = storageAvailable
    ? `${completed} / ${inputs.length} 已完成`
    : `${completed} / ${inputs.length} 已完成・尚未同步`;
}

function renderShoppingList() {
  activeShoppingWeek = Math.ceil(selectedMenuDate.getDate() / 7);
  const monthKey = `${displayedMenuMonth.getFullYear()}-${String(displayedMenuMonth.getMonth() + 1).padStart(2, "0")}`;
  const firstDay = (activeShoppingWeek - 1) * 7 + 1;
  const lastDay = Math.min(firstDay + 6, monthlyMeals.length);
  const shoppingKey = `${monthKey}-week-${activeShoppingWeek}`;
  shoppingWeekTitle.textContent = `${displayedMenuMonth.getMonth() + 1} 月第 ${activeShoppingWeek} 週採買`;
  const savedWeek = checkedItems[shoppingKey] || [];
  const ingredientCounts = new Map();
  for (const meals of monthlyMeals.slice(firstDay - 1, lastDay)) {
    for (const meal of meals) {
      for (const ingredient of meal.ingredients) {
        ingredientCounts.set(ingredient, (ingredientCounts.get(ingredient) || 0) + 1);
      }
    }
  }
  const categories = new Map([
    ["魚類與海鮮", []],
    ["肉、蛋與豆製品", []],
    ["蔬菜、菇類與水果", []],
    ["乳品、油脂與調味", []],
  ]);
  for (const [ingredient, count] of ingredientCounts) {
    const category = /鮭|鯖|鱈|鯛|鱸|鮪|魚|蝦|蛤|干貝|透抽|沙丁/.test(ingredient)
      ? "魚類與海鮮"
      : /雞|豬|羊|鴨|火雞|豆腐|豆皮|豆漿/.test(ingredient)
        ? "肉、蛋與豆製品"
        : /菠菜|高麗菜|櫛瓜|花椰菜|蘆筍|蘑菇|香菇|茄子|青江菜|小松菜|小黃瓜|蘿蔓|番茄|酪梨|生菜|抱子甘藍|茴香|甜椒|蔬菜/.test(ingredient)
          ? "蔬菜、菇類與水果"
          : "乳品、油脂與調味";
    categories.get(category).push([ingredient, count]);
  }
  let itemIndex = 0;
  shoppingList.innerHTML = [...categories].filter(([, items]) => items.length).map(([category, items]) => {
    const categoryHtml = `<h4 class="shopping-category">${escapeHtml(category)}</h4>`;
    const itemsHtml = items.map(([name, amount]) => {
      const id = `week-${activeShoppingWeek}-item-${itemIndex}`;
      const checked = savedWeek.includes(id);
      itemIndex += 1;
      return `<label class="shopping-item" for="${id}">
        <input id="${id}" type="checkbox" data-shopping-id="${id}" ${checked ? "checked" : ""} />
        <span>${escapeHtml(name)}<small>${amount} 道料理使用</small></span>
      </label>`;
    }).join("");
    return categoryHtml + itemsHtml;
  }).join("");
  updateShoppingProgress();
  applyTextScale();
}

function applyTextScale() {
  document.body.style.setProperty("--copy-scale", String(textScale));
  document.querySelectorAll("body *").forEach((element) => {
    if (
      element.closest(
        "h1, h2, h3, h4, h5, h6, .brand, .text-size-control, [aria-hidden='true']",
      )
    ) {
      return;
    }
    const hasOwnText = [...element.childNodes].some(
      (node) => node.nodeType === Node.TEXT_NODE && node.textContent.trim(),
    );
    if (!hasOwnText) return;
    if (!element.dataset.copyBaseSize) {
      element.dataset.copyBaseSize = getComputedStyle(element).fontSize;
    }
    element.classList.add("scalable-copy");
    element.style.fontSize = `${Number.parseFloat(element.dataset.copyBaseSize) * textScale}px`;
  });
  textScaleValue.value = `${Math.round(textScale * 100)}%`;
  textScaleValue.textContent = textScaleValue.value;
  textSmallerButton.disabled = textScale <= 0.9;
  textLargerButton.disabled = textScale >= 1.3;
}

function setTextScale(scale) {
  textScale = Math.min(1.3, Math.max(0.9, Math.round(scale * 10) / 10));
  applyTextScale();
  try {
    localStorage.setItem(textScaleStorageKey, String(textScale));
  } catch (error) {
    console.error("Could not save the goHealth text size preference.", error);
  }
}

function saveShoppingProgress() {
  const monthKey = `${displayedMenuMonth.getFullYear()}-${String(displayedMenuMonth.getMonth() + 1).padStart(2, "0")}`;
  const shoppingKey = `${monthKey}-week-${activeShoppingWeek}`;
  checkedItems[shoppingKey] = [...shoppingList.querySelectorAll('input[type="checkbox"]:checked')]
    .map((input) => input.dataset.shoppingId);
  updateShoppingProgress();
  void saveProfileData();
}

try {
  const savedTextScale = localStorage.getItem(textScaleStorageKey);
  if (savedTextScale !== null) {
    const parsedTextScale = Number(savedTextScale);
    if (!Number.isFinite(parsedTextScale)) {
      throw new TypeError("Saved text size preference has an invalid format.");
    }
    textScale = Math.min(1.3, Math.max(0.9, parsedTextScale));
  }
} catch (error) {
  console.error("Could not load the goHealth text size preference.", error);
}

textSmallerButton.addEventListener("click", () => setTextScale(textScale - 0.1));
textLargerButton.addEventListener("click", () => setTextScale(textScale + 0.1));
weightInput.addEventListener("input", updateBmi);
heightInput.addEventListener("input", updateBmi);
saveHeightButton.addEventListener("click", async () => {
  if (!heightInput.value || !heightInput.reportValidity()) {
    weightFormMessage.textContent = "請輸入 100–250 公分之間的身高。";
    return;
  }
  const height = Number(heightInput.value);
  if (!Number.isFinite(height) || height < 100 || height > 250) {
    weightFormMessage.textContent = "請輸入 100–250 公分之間的身高。";
    return;
  }
  heightCm = height;
  if (await saveProfileData()) {
    weightFormMessage.textContent = "身高資料已儲存在此瀏覽器。";
    updateBmi();
  }
});
document.querySelector("#previousMonth").addEventListener("click", () => {
  shiftCalendarMonth(-1);
});
document.querySelector("#nextMonth").addEventListener("click", () => {
  shiftCalendarMonth(1);
});
document.querySelector("#todayMonth").addEventListener("click", () => {
  const today = new Date();
  displayedCalendarMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  selectedWeightDay = formatDateKey(today);
  renderWeightCalendar();
});
weightCalendar.addEventListener("click", (event) => {
  const dayButton = event.target.closest("[data-weight-date]");
  if (!dayButton) return;
  selectedWeightDay = dayButton.dataset.weightDate;
  renderWeightCalendar();
});
weightForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (!weightInput.reportValidity()) return;
  const weight = Number(weightInput.value);
  const waist = waistInput.value ? Number(waistInput.value) : null;
  if (!Number.isFinite(weight) || weight < 20 || weight > 350) {
    weightFormMessage.textContent = "請輸入 20–350 公斤之間的有效體重。";
    return;
  }
  if (waist !== null && (!Number.isFinite(waist) || waist < 30 || waist > 200)) {
    weightFormMessage.textContent = "請輸入 30–200 公分之間的有效腰圍。";
    return;
  }
  weightRecords[selectedWeightDay] = {
    weight: Math.round(weight * 10) / 10,
    ...(waist !== null ? { waist: Math.round(waist * 10) / 10 } : {}),
  };
  if (await saveWeightRecords()) {
    weightFormMessage.textContent = waist === null
      ? "體重紀錄已儲存；此日未記錄腰圍。"
      : "體重與腰圍紀錄已儲存在此瀏覽器。";
    renderWeightCalendar();
  }
});
deleteWeightButton.addEventListener("click", async () => {
  if (!Object.hasOwn(weightRecords, selectedWeightDay)) return;
  delete weightRecords[selectedWeightDay];
  if (await saveWeightRecords()) {
    weightFormMessage.textContent = "已刪除此日的體重紀錄。";
    renderWeightCalendar();
  }
});

previousMenuMonthButton.addEventListener("click", () => changeMenuMonth(-1));
nextMenuMonthButton.addEventListener("click", () => changeMenuMonth(1));
todayMenuMonthButton.addEventListener("click", () => {
  selectedMenuDate = new Date();
  displayedMenuMonth = new Date(
    selectedMenuDate.getFullYear(),
    selectedMenuDate.getMonth(),
    1,
  );
  buildMonthlyMeals(displayedMenuMonth);
  renderMeals();
  renderShoppingList();
});

dayPicker.addEventListener("click", (event) => {
  const button = event.target.closest("[data-menu-date]");
  if (!button) return;
  const [year, month, day] = button.dataset.menuDate.split("-").map(Number);
  selectedMenuDate = new Date(year, month - 1, day);
  renderMeals();
  renderShoppingList();
});

shoppingList.addEventListener("change", (event) => {
  if (event.target.matches('input[type="checkbox"]')) {
    saveShoppingProgress();
  }
});

const appTabList = document.querySelector(".main-nav");
const appTabs = [...appTabList.querySelectorAll('[role="tab"]')];
const appPanels = [...document.querySelectorAll("[data-tab-panel]")];

function activateAppPanel(panelName, options = {}) {
  const targetPanel = appPanels.find((panel) => panel.dataset.tabPanel === panelName);
  if (!targetPanel) return false;

  const visiblePanels = appPanels.filter((panel) => panel.dataset.tabPanel === panelName);
  const panelChanged = visiblePanels.some((panel) => panel.hidden);
  for (const panel of appPanels) {
    panel.hidden = !visiblePanels.includes(panel);
  }
  for (const tab of appTabs) {
    const selected = tab.dataset.tabTarget === panelName;
    tab.setAttribute("aria-selected", String(selected));
    tab.tabIndex = selected ? 0 : -1;
    if (selected && appTabList.scrollWidth > appTabList.clientWidth) {
      tab.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "nearest" });
    }
  }

  const hash = options.hash || (panelName === "home" ? "#top" : `#${panelName}`);
  if (options.pushHistory && window.location.hash !== hash) {
    window.history.pushState(null, "", hash);
  }
  if (panelChanged && options.scrollToTop !== false) {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
  return true;
}

function activatePanelFromHash(hash, options = {}) {
  const target = document.getElementById(hash.slice(1));
  const panel = target?.closest("[data-tab-panel]");
  if (!panel) return false;
  activateAppPanel(panel.dataset.tabPanel, { ...options, hash });
  if (options.scrollToTarget && target !== panel) {
    target.scrollIntoView({ behavior: "smooth", block: "start" });
  }
  return true;
}

for (const tab of appTabs) {
  tab.addEventListener("click", () => {
    activateAppPanel(tab.dataset.tabTarget, { pushHistory: true });
  });
}

function provideHapticFeedback() {
  if (typeof navigator.vibrate === "function") {
    navigator.vibrate(8);
  }
}

document.addEventListener("click", (event) => {
  if (event.target.closest("button, input[type='checkbox'], input[type='radio']")) {
    provideHapticFeedback();
  }
});

document.addEventListener("change", (event) => {
  if (event.target.matches("select, input[type='range']")) {
    provideHapticFeedback();
  }
});

document.addEventListener("pointermove", (event) => {
  if (event.pointerType === "touch") return;
  const control = event.target.closest(".nav-tab, .header-cta, .button, .month-button, .calendar-nav button");
  if (!control) return;
  const bounds = control.getBoundingClientRect();
  control.style.setProperty("--glass-x", `${event.clientX - bounds.left}px`);
  control.style.setProperty("--glass-y", `${event.clientY - bounds.top}px`);
});

appTabList.addEventListener("keydown", (event) => {
  const currentIndex = appTabs.indexOf(document.activeElement);
  if (currentIndex < 0) return;
  let nextIndex;
  if (event.key === "ArrowRight") nextIndex = (currentIndex + 1) % appTabs.length;
  else if (event.key === "ArrowLeft") nextIndex = (currentIndex - 1 + appTabs.length) % appTabs.length;
  else if (event.key === "Home") nextIndex = 0;
  else if (event.key === "End") nextIndex = appTabs.length - 1;
  else return;
  event.preventDefault();
  appTabs[nextIndex].focus();
  appTabs[nextIndex].click();
});

document.addEventListener("click", (event) => {
  const link = event.target.closest('a[href^="#"]');
  if (!link) return;
  const hash = link.getAttribute("href");
  if (!hash || !activatePanelFromHash(hash, { pushHistory: true, scrollToTarget: true })) return;
  event.preventDefault();
});

function syncAppPanelFromHash() {
  activatePanelFromHash(window.location.hash, { scrollToTarget: true });
}

window.addEventListener("popstate", syncAppPanelFromHash);
window.addEventListener("hashchange", syncAppPanelFromHash);

if (!activatePanelFromHash(window.location.hash)) {
  activateAppPanel("home");
}

buildMonthlyMeals(displayedMenuMonth);
renderMeals();
renderShoppingList();
renderWeightCalendar();
heightInput.value = heightCm ?? "";
updateBmi();
void initializeAuthentication().catch((error) => {
  displayAuthGate(`無法連線到登入服務：${error.message}`);
  console.error("Could not initialize goHealth authentication.", error);
});
