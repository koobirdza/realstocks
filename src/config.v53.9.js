export const APP_VERSION = "v54.1.3-complete-baseline-queue";
const DEFAULT_GOOGLE_SCRIPT_URL = "https://realstock-api.koobirdza.workers.dev/realstock";
const params = new URLSearchParams(window.location.search);
const apiFromQuery = params.get("api") || "";
if (apiFromQuery) localStorage.setItem("realstock.apiUrl", apiFromQuery);
export const GOOGLE_SCRIPT_URL = apiFromQuery || localStorage.getItem("realstock.apiUrl") || DEFAULT_GOOGLE_SCRIPT_URL;
export const CACHE_TTL = { bootstrap: 5*60*1000, catalog: 10*60*1000, stock: 5*60*1000, orderView: 5*60*1000, diagnostics: 15*1000 };
export const STORAGE_KEYS = { session: "realstock.v54_1_3.session", draft: "realstock.v54_1_3.draft", cachePrefix: "realstock.v54_1_3.cache.", lang: "realstock.v54_1_3.lang" };
export const MODE_META = {
  count: { label:"นับสต๊อก", color:"count", saveLabel:"บันทึกยอดนับ", helper:"กรอกยอดที่มีจริงของจุดนับนี้" },
  issue: { label:"เบิกของ", color:"issue", saveLabel:"บันทึกการเบิก", helper:"กรอกจำนวนที่เบิก/ใช้จริง" },
  receive: { label:"รับของ", color:"receive", saveLabel:"บันทึกรับของ", helper:"กรอกจำนวนรับเข้าจริง" },
  order: { label:"สั่งของ", color:"order", saveLabel:"", helper:"ดูรายการควรสั่ง" },
  transfer: { label:"โอนย้าย", color:"order", saveLabel:"บันทึกโอนย้าย", helper:"ย้ายของระหว่าง location" }
};
export const SAVE_TIMEOUT_MS = 12000;
export const MAX_RENDER_ITEMS_INITIAL = 80;
export const MAX_RENDER_ITEMS_STEP = 80;
export const ENABLE_IDLE_PRELOAD = true;
