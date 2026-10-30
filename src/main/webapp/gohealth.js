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
    : '<p class="recommendation-empty">尚未收藏。從左側推薦或菜單加入喜歡的料理。</p>';
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
  const firstWeekday = (new Date(year, month, 1).getDay() + 6) % 7;
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
  renderHealthAnalytics();
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

function gaugeArcPoint(cx, cy, r, t) {
  return [cx - r * Math.cos(Math.PI * t), cy - r * Math.sin(Math.PI * t)];
}

function gaugeArc(cx, cy, r, t0, t1) {
  const [x0, y0] = gaugeArcPoint(cx, cy, r, t0);
  const [x1, y1] = gaugeArcPoint(cx, cy, r, t1);
  return `M ${x0.toFixed(2)} ${y0.toFixed(2)} A ${r} ${r} 0 0 1 ${x1.toFixed(2)} ${y1.toFixed(2)}`;
}

function renderGauge(svg, { value, min, max, segments, label, decimals, status }) {
  const cx = 100;
  const cy = 100;
  const r = 78;
  const uid = svg.id;
  const clamp = (v) => Math.min(Math.max((v - min) / (max - min), 0), 1);
  const arcs = segments.map((seg, index) => {
    const t0 = clamp(seg.from);
    const t1 = clamp(seg.to);
    return `<path d="${gaugeArc(cx, cy, r, t0, t1)}" stroke="${seg.color}" class="gauge-seg" filter="url(#${uid}Glow)" />`;
  }).join("");
  let needle = "";
  let readout = `<text x="100" y="96" text-anchor="middle" class="gauge-value">—</text>`;
  if (Number.isFinite(value)) {
    const t = clamp(value);
    const [nx, ny] = gaugeArcPoint(cx, cy, r - 16, t);
    const [mx, my] = gaugeArcPoint(cx, cy, r + 4, t);
    const active = segments.find((seg) => value >= seg.from && value < seg.to) || segments.at(-1);
    needle = `<line x1="${nx.toFixed(2)}" y1="${ny.toFixed(2)}" x2="${mx.toFixed(2)}" y2="${my.toFixed(2)}" class="gauge-needle" stroke="${active.color}" />
      <circle cx="${mx.toFixed(2)}" cy="${my.toFixed(2)}" r="3.5" class="gauge-hub" />`;
    readout = `<text x="100" y="92" text-anchor="middle" class="gauge-value" style="fill:${active.color}">${value.toFixed(decimals)}</text>
      <text x="100" y="116" text-anchor="middle" class="gauge-status" style="fill:${active.color}">${status(value)}</text>`;
  } else {
    readout += `<text x="100" y="124" text-anchor="middle" class="gauge-status">${label}</text>`;
  }
  const ticks = Array.from({ length: 11 }, (_, i) => {
    const [x0, y0] = gaugeArcPoint(cx, cy, r + 8, i / 10);
    const [x1, y1] = gaugeArcPoint(cx, cy, r + (i % 5 === 0 ? 14 : 11), i / 10);
    return `<line x1="${x0.toFixed(1)}" y1="${y0.toFixed(1)}" x2="${x1.toFixed(1)}" y2="${y1.toFixed(1)}" class="gauge-tick" />`;
  }).join("");
  svg.innerHTML = `<defs><filter id="${uid}Glow" filterUnits="userSpaceOnUse" x="0" y="0" width="200" height="130"><feGaussianBlur stdDeviation="2.2" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>
    ${ticks}${arcs}${needle}${readout}
    <text x="${cx - r}" y="${cy + 12}" text-anchor="middle" class="gauge-end">${min}</text>
    <text x="${cx + r}" y="${cy + 12}" text-anchor="middle" class="gauge-end">${max}</text>`;
}

function renderHealthTrend(svg, entries) {
  const width = 640;
  const height = 230;
  const pad = { top: 18, right: 46, bottom: 28, left: 46 };
  if (entries.length === 0) {
    svg.innerHTML = '<text x="320" y="115" text-anchor="middle" class="chart-empty-label">儲存體重後顯示科學趨勢分析</text>';
    return;
  }
  const toTime = (key) => {
    const [y, m, d] = key.split("-").map(Number);
    return new Date(y, m - 1, d).getTime();
  };
  const times = entries.map(([key]) => toTime(key));
  const t0 = times[0];
  const t1 = Math.max(times.at(-1), t0 + 86400000 * 6);
  const x = (time) => pad.left + ((time - t0) / (t1 - t0)) * (width - pad.left - pad.right);
  const scale = (values, flip = true) => {
    const lo = Math.min(...values);
    const hi = Math.max(...values);
    const span = Math.max(hi - lo, 1);
    const min = lo - span * 0.15;
    const max = hi + span * 0.15;
    return { min, max, y: (v) => pad.top + (1 - (v - min) / (max - min)) * (height - pad.top - pad.bottom) };
  };
  const weights = entries.map(([, r]) => r.weight);
  const ws = scale(weights);
  const pts = entries.map(([key, r], i) => ({ x: x(times[i]), y: ws.y(r.weight), v: r.weight, key }));
  const line = pts.map((p, i) => `${i ? "L" : "M"} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(" ");
  const base = height - pad.bottom;
  const area = `${line} L ${pts.at(-1).x.toFixed(1)} ${base} L ${pts[0].x.toFixed(1)} ${base} Z`;
  const avgPts = pts.map((p, i) => {
    const windowStart = times[i] - 6 * 86400000;
    const inWindow = entries.filter((_, j) => times[j] <= times[i] && times[j] >= windowStart);
    const avg = inWindow.reduce((sum, [, r]) => sum + r.weight, 0) / inWindow.length;
    return { x: p.x, y: ws.y(avg) };
  });
  const avgLine = avgPts.map((p, i) => `${i ? "L" : "M"} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(" ");
  const waistEntries = entries.filter(([, r]) => Number.isFinite(r.waist));
  let waistMarkup = "";
  let waistAxis = "";
  if (waistEntries.length) {
    const wsc = scale(waistEntries.map(([, r]) => r.waist));
    const wp = waistEntries.map(([key, r]) => ({ x: x(toTime(key)), y: wsc.y(r.waist), v: r.waist, key }));
    waistMarkup = `<path d="${wp.map((p, i) => `${i ? "L" : "M"} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(" ")}" class="ht-waist" filter="url(#htGlow)" />` +
      wp.map((p) => `<rect x="${(p.x - 3).toFixed(1)}" y="${(p.y - 3).toFixed(1)}" width="6" height="6" transform="rotate(45 ${p.x.toFixed(1)} ${p.y.toFixed(1)})" class="ht-waist-dot"><title>${p.key}：腰圍 ${p.v} cm</title></rect>`).join("");
    waistAxis = `<text x="${width - 6}" y="${pad.top + 4}" text-anchor="end" class="ht-axis ht-axis-waist">${wsc.max.toFixed(0)} cm</text>
      <text x="${width - 6}" y="${base}" text-anchor="end" class="ht-axis ht-axis-waist">${wsc.min.toFixed(0)} cm</text>`;
  }
  const grid = Array.from({ length: 5 }, (_, i) => {
    const gy = pad.top + (i / 4) * (height - pad.top - pad.bottom);
    return `<line x1="${pad.left}" x2="${width - pad.right}" y1="${gy.toFixed(1)}" y2="${gy.toFixed(1)}" class="ht-grid" />`;
  }).join("");
  const vgrid = Array.from({ length: 7 }, (_, i) => {
    const gx = pad.left + (i / 6) * (width - pad.left - pad.right);
    return `<line y1="${pad.top}" y2="${base}" x1="${gx.toFixed(1)}" x2="${gx.toFixed(1)}" class="ht-grid ht-grid-v" />`;
  }).join("");
  const fmt = (time) => {
    const d = new Date(time);
    return `${d.getMonth() + 1}/${d.getDate()}`;
  };
  const dots = pts.map((p) => `<circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="3.4" class="ht-dot"><title>${p.key}：${p.v} kg</title></circle>`).join("");
  const last = pts.at(-1);
  svg.innerHTML = `<defs>
      <linearGradient id="htArea" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#00f0ff" stop-opacity=".45"/><stop offset="1" stop-color="#7a5cff" stop-opacity="0"/></linearGradient>
      <linearGradient id="htLine" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#00f0ff"/><stop offset="1" stop-color="#b86bff"/></linearGradient>
      <filter id="htGlow" filterUnits="userSpaceOnUse" x="0" y="0" width="640" height="230"><feGaussianBlur stdDeviation="2.6" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
    </defs>
    ${grid}${vgrid}
    <path d="${area}" fill="url(#htArea)" />
    <path d="${line}" class="ht-line" filter="url(#htGlow)" />
    <path d="${avgLine}" class="ht-avg" />
    ${waistMarkup}${dots}
    <circle cx="${last.x.toFixed(1)}" cy="${last.y.toFixed(1)}" r="7" class="ht-pulse" />
    <text x="6" y="${pad.top + 4}" class="ht-axis">${ws.max.toFixed(1)} kg</text>
    <text x="6" y="${base}" class="ht-axis">${ws.min.toFixed(1)} kg</text>
    ${waistAxis}
    <text x="${pad.left}" y="${height - 8}" class="ht-axis">${fmt(t0)}</text>
    <text x="${width - pad.right}" y="${height - 8}" text-anchor="end" class="ht-axis">${fmt(t1)}</text>`;
}

function renderCheckinHeatmap(svg, streakLabel) {
  const weeks = 12;
  const cell = 15;
  const gap = 4;
  const left = 30;
  const cellW = (640 - left - 4) / weeks - gap;
  const top = 8;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const mondayOffset = (today.getDay() + 6) % 7;
  const start = new Date(today);
  start.setDate(today.getDate() - mondayOffset - (weeks - 1) * 7);
  const cells = [];
  for (let w = 0; w < weeks; w += 1) {
    for (let d = 0; d < 7; d += 1) {
      const date = new Date(start);
      date.setDate(start.getDate() + w * 7 + d);
      if (date > today) continue;
      const key = formatDateKey(date);
      const record = weightRecords[key];
      const level = record ? (Number.isFinite(record.waist) ? "ww" : "w") : "none";
      cells.push(`<rect x="${left + w * (cellW + gap)}" y="${top + d * (cell + gap)}" width="${cellW}" height="${cell}" rx="4" class="hm-cell hm-${level}"><title>${key}${record ? `：${record.weight ?? "—"} kg` : "：未登記"}</title></rect>`);
    }
  }
  const dayNames = ["一", "", "三", "", "五", "", "日"].map((name, d) =>
    name ? `<text x="6" y="${top + d * (cell + gap) + 12}" class="ht-axis">${name}</text>` : "").join("");
  let streak = 0;
  const cursor = new Date(today);
  if (!weightRecords[formatDateKey(cursor)]) cursor.setDate(cursor.getDate() - 1);
  while (weightRecords[formatDateKey(cursor)]) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  const total = Object.keys(weightRecords).length;
  streakLabel.textContent = `連續 ${streak} 天 · 累計 ${total} 筆`;
  svg.innerHTML = `${dayNames}${cells.join("")}`;
}

function lastDaysRate(field, days) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  let hit = 0;
  for (let i = 0; i < days; i += 1) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    const record = weightRecords[formatDateKey(date)];
    if (record && Number.isFinite(record[field])) hit += 1;
  }
  return hit / days;
}

function ringArc(cx, cy, r, ratio) {
  const t = Math.min(Math.max(ratio, 0), 0.9999) * Math.PI * 2;
  const x = cx + r * Math.sin(t);
  const y = cy - r * Math.cos(t);
  return `M ${cx} ${cy - r} A ${r} ${r} 0 ${t > Math.PI ? 1 : 0} 1 ${x.toFixed(2)} ${y.toFixed(2)}`;
}

function renderBodyScan(svg, info) {
  const { weight, waist, bmi, whtr } = info;
  const widthScale = Number.isFinite(bmi) ? Math.min(Math.max(bmi / 22, 0.8), 1.35) : 1;
  const waistScale = Number.isFinite(whtr) ? Math.min(Math.max(whtr / 0.46, 0.85), 1.4) : widthScale;
  const color = Number.isFinite(bmi) ? (bmi < 18.5 ? "#38bdf8" : bmi < 24 ? "#34f5a8" : bmi < 27 ? "#facc15" : bmi < 30 ? "#fb923c" : "#ff4d7d") : "#00f0ff";
  const fmt = (v, d, unit) => (Number.isFinite(v) ? `${v.toFixed(d)}${unit}` : "—");
  const healthy = Number.isFinite(bmi) ? Math.max(0, 1 - Math.max(18.5 - bmi, bmi - 24, 0) / 8) : 0;
  const rings = [
    { label: "01", name: "30 日登記率", ratio: lastDaysRate("weight", 30), color: "#00f0ff" },
    { label: "02", name: "腰圍登記率", ratio: lastDaysRate("waist", 30), color: "#34f5a8" },
    { label: "03", name: "健康體位接近度", ratio: healthy, color: "#ff4d7d" },
  ];
  const cx = 565;
  const cy = 140;
  const ringMarkup = rings.map((ring, i) => {
    const r = 112 - i * 26;
    return `<circle cx="${cx}" cy="${cy}" r="${r}" class="bs-track" />
      <path d="${ringArc(cx, cy, r, ring.ratio)}" class="bs-ring" style="stroke:${ring.color}" filter="url(#bsGlow)" />`;
  }).join("");
  const ringLabels = rings.map((ring, i) => {
    const y = 292 + i * 17;
    return `<text x="440" y="${y}" class="bs-num" style="fill:${ring.color}">${ring.label}</text>
      <text x="468" y="${y}" class="bs-note">${ring.name} ${Math.round(ring.ratio * 100)}%</text>`;
  }).join("");
  const calls = [
    { y: 70, ty: 62, name: "WEIGHT 體重", value: fmt(weight, 1, " kg"), bx: 292, by: 92 },
    { y: 150, ty: 142, name: "BMI", value: fmt(bmi, 1, ""), bx: 266, by: 120 },
    { y: 230, ty: 222, name: "WAIST 腰圍", value: fmt(waist, 1, " cm"), bx: 90 + 120 - 28 * waistScale + 8, by: 160 },
    { y: 290, ty: 282, name: "WHtR 腰身比", value: fmt(whtr, 2, ""), bx: 276, by: 190 },
  ].map((c) => `<polyline points="20,${c.y} 150,${c.y} ${c.bx.toFixed(0)},${c.by}" class="bs-lead" />
      <circle cx="${c.bx.toFixed(0)}" cy="${c.by}" r="3" class="bs-lead-dot" />
      <text x="20" y="${c.ty - 2}" class="bs-note">${c.name}</text>
      <text x="20" y="${c.ty + 18}" class="bs-readout" style="fill:${color}">${c.value}</text>`).join("");
  svg.innerHTML = `<defs>
      <filter id="bsGlow" filterUnits="userSpaceOnUse" x="0" y="0" width="700" height="345"><feGaussianBlur stdDeviation="2.4" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
      <linearGradient id="bsScan" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${color}" stop-opacity="0"/><stop offset="1" stop-color="${color}" stop-opacity=".55"/></linearGradient>
      <clipPath id="bsClip"><rect x="0" y="0" width="200" height="316" /></clipPath>
    </defs>
    ${calls}
    <g transform="translate(190 8)">
      <g transform="translate(100 0) scale(${waistScale.toFixed(3)} 1) translate(-100 0)" style="color:${color}">
        <g transform="translate(100 0) scale(${(widthScale / waistScale).toFixed(3)} 1) translate(-100 0)">
          <ellipse cx="100" cy="30" rx="16" ry="20" class="bs-body" />
          <path d="M93 49 C93 58 92 62 86 65 C70 69 52 73 46 88 C40 104 38 130 34 156 C32 166 30 174 33 180 C37 184 42 178 44 170 C48 150 52 126 58 110 C60 130 68 145 66 160 C64 175 58 190 62 205 C64 235 64 262 66 290 C67 300 66 308 68 312 L92 312 C94 296 96 260 98 232 L100 220 L102 232 C104 260 106 296 108 312 L132 312 C134 308 133 300 134 290 C136 262 136 235 138 205 C142 190 136 175 134 160 C132 145 140 130 142 110 C148 126 152 150 156 170 C158 178 163 184 167 180 C170 174 168 166 166 156 C162 130 160 104 154 88 C148 73 130 69 114 65 C108 62 107 58 107 49" class="bs-body" />
          <path d="M84 84 Q100 76 116 84 L118 128 Q100 138 82 128 Z" class="bs-organ" />
          <circle cx="104" cy="104" r="8" class="bs-heart" />
          <path d="M86 150 Q100 160 114 150 L112 172 Q100 180 88 172 Z" class="bs-organ" />
        </g>
      </g>
      <rect x="0" y="0" width="200" height="22" fill="url(#bsScan)" clip-path="url(#bsClip)" class="bs-scan" />
    </g>
    ${ringMarkup}${ringLabels}
    <circle cx="${cx}" cy="${cy}" r="30" class="bs-core" />
    <text x="${cx}" y="${cy + 5}" text-anchor="middle" class="bs-core-text">${Math.round(rings[0].ratio * 100)}%</text>`;
}

function renderWeeklyBars(svg, records) {
  if (!records.length) {
    svg.innerHTML = '<text x="160" y="95" text-anchor="middle" class="chart-empty-label">儲存體重後顯示每週平均</text>';
    return;
  }
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const monday = new Date(today);
  monday.setDate(today.getDate() - ((today.getDay() + 6) % 7));
  const weeks = [];
  for (let w = 7; w >= 0; w -= 1) {
    const start = new Date(monday);
    start.setDate(monday.getDate() - w * 7);
    const values = [];
    for (let d = 0; d < 7; d += 1) {
      const date = new Date(start);
      date.setDate(start.getDate() + d);
      const record = weightRecords[formatDateKey(date)];
      if (record && Number.isFinite(record.weight)) values.push(record.weight);
    }
    weeks.push({ start, avg: values.length ? values.reduce((a, b) => a + b, 0) / values.length : null });
  }
  const known = weeks.filter((w) => w.avg !== null).map((w) => w.avg);
  if (!known.length) {
    svg.innerHTML = '<text x="160" y="95" text-anchor="middle" class="chart-empty-label">近 8 週尚無體重紀錄</text>';
    return;
  }
  const lo = Math.min(...known) - 1;
  const hi = Math.max(...known) + 1;
  const bw = 28;
  const gap = 10;
  const base = 160;
  const topY = 34;
  const bars = weeks.map((w, i) => {
    const x = 12 + i * (bw + gap);
    if (w.avg === null) {
      return `<rect x="${x}" y="${base - 4}" width="${bw}" height="4" rx="2" class="wb-empty" /><text x="${x + bw / 2}" y="178" text-anchor="middle" class="ht-axis">${w.start.getMonth() + 1}/${w.start.getDate()}</text>`;
    }
    const h = 6 + ((w.avg - lo) / (hi - lo)) * (base - topY - 6);
    const prev = weeks.slice(0, i).reverse().find((p) => p.avg !== null);
    const cls = !prev ? "wb-first" : w.avg <= prev.avg ? "wb-down" : "wb-up";
    return `<rect x="${x}" y="${(base - h).toFixed(1)}" width="${bw}" height="${h.toFixed(1)}" rx="4" class="wb-bar ${cls}"><title>${w.start.getMonth() + 1}/${w.start.getDate()} 當週平均 ${w.avg.toFixed(1)} kg</title></rect>
      <text x="${x + bw / 2}" y="${(base - h - 5).toFixed(1)}" text-anchor="middle" class="wb-val">${w.avg.toFixed(1)}</text>
      <text x="${x + bw / 2}" y="178" text-anchor="middle" class="ht-axis">${w.start.getMonth() + 1}/${w.start.getDate()}</text>`;
  }).join("");
  svg.innerHTML = `<line x1="8" x2="312" y1="${base}" y2="${base}" class="ht-grid" style="stroke-dasharray:none" />${bars}`;
}

function renderVitalMonitor(svg, info) {
  const fmt = (v, d) => (Number.isFinite(v) ? v.toFixed(d) : "—");
  const beat = "M0 95 H30 L36 95 L42 70 L50 120 L56 38 L64 140 L70 95 H110 L116 90 L124 80 L132 90 L138 95 H180 L186 95 L192 70 L200 120 L206 38 L214 140 L220 95 H260 L266 90 L274 80 L282 90 L288 95 H320";
  svg.innerHTML = `<defs><filter id="vmGlow" filterUnits="userSpaceOnUse" x="0" y="0" width="320" height="190"><feGaussianBlur stdDeviation="2" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>
    <path d="M6 22 V6 H30 M290 6 H314 V22 M314 168 V184 H290 M30 184 H6 V168" class="vm-corner" />
    <g transform="translate(0 -18) scale(1 .7)"><path d="${beat}" class="vm-ecg-base" /><path d="${beat}" class="vm-ecg" filter="url(#vmGlow)" /></g>
    <line x1="14" x2="306" y1="100" y2="100" class="ht-grid" />
    <text x="16" y="124" class="vm-label">WEIGHT</text><text x="16" y="150" class="vm-value">${fmt(info.weight, 1)}<tspan class="vm-unit"> kg</tspan></text>
    <text x="112" y="124" class="vm-label">BMI</text><text x="112" y="150" class="vm-value">${fmt(info.bmi, 1)}</text>
    <text x="180" y="124" class="vm-label">WAIST</text><text x="180" y="150" class="vm-value">${fmt(info.waist, 1)}<tspan class="vm-unit"> cm</tspan></text>
    <text x="16" y="176" class="vm-label">WHtR ${fmt(info.whtr, 2)}</text>`;
}

function renderHealthAnalytics() {
  const bmiSvg = document.querySelector("#bmiGauge");
  if (!bmiSvg) return;
  const records = Object.entries(weightRecords)
    .filter(([, record]) => Number.isFinite(record.weight))
    .sort(([a], [b]) => a.localeCompare(b));
  const latest = records.at(-1)?.[1];
  const height = Number(heightCm);
  const hasHeight = Number.isFinite(height) && height >= 100 && height <= 250;
  const bmi = latest && hasHeight ? latest.weight / (height / 100) ** 2 : NaN;
  renderGauge(bmiSvg, {
    value: bmi,
    min: 10,
    max: 40,
    label: hasHeight ? "尚無體重" : "請先設定身高",
    decimals: 1,
    segments: [
      { from: 10, to: 18.5, color: "#38bdf8" },
      { from: 18.5, to: 24, color: "#34f5a8" },
      { from: 24, to: 27, color: "#facc15" },
      { from: 27, to: 30, color: "#fb923c" },
      { from: 30, to: 41, color: "#ff4d7d" },
    ],
    status: (v) => (v < 18.5 ? "體重過輕" : v < 24 ? "健康體位" : v < 27 ? "過重" : v < 30 ? "輕度肥胖" : "中重度肥胖"),
  });
  const waistRecord = records.slice().reverse().find(([, record]) => Number.isFinite(record.waist));
  const whtr = waistRecord && hasHeight ? waistRecord[1].waist / height : NaN;
  renderGauge(document.querySelector("#whtrGauge"), {
    value: whtr,
    min: 0.3,
    max: 0.7,
    label: hasHeight ? "尚無腰圍" : "請先設定身高",
    decimals: 2,
    segments: [
      { from: 0.3, to: 0.4, color: "#38bdf8" },
      { from: 0.4, to: 0.5, color: "#34f5a8" },
      { from: 0.5, to: 0.6, color: "#fb923c" },
      { from: 0.6, to: 0.71, color: "#ff4d7d" },
    ],
    status: (v) => (v < 0.4 ? "偏瘦" : v < 0.5 ? "理想範圍" : v < 0.6 ? "內臟脂肪風險" : "高風險"),
  });
  const info = { weight: latest?.weight, waist: waistRecord?.[1].waist, bmi, whtr };
  renderBodyScan(document.querySelector("#bodyScan"), info);
  renderWeeklyBars(document.querySelector("#weeklyBars"), records);
  renderVitalMonitor(document.querySelector("#vitalMonitor"), info);
  renderHealthTrend(document.querySelector("#healthTrendChart"), records.slice(-60));
  renderCheckinHeatmap(document.querySelector("#checkinHeatmap"), document.querySelector("#healthStreak"));
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
  const firstWeekday = (new Date(year, month, 1).getDay() + 6) % 7;
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
    const notes = calendarNotes;
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
