export const APP_VERSION = "v53.9.0-frontend-clean";

// GitHub Pages setup:
// 1) เปิด URL แบบนี้ครั้งแรก: https://<your-github-page>/RealStock/?api=<REALSTOCK_WEB_APP_URL>
// 2) ระบบจะจำ API URL ไว้ใน localStorage
// 3) หรือแก้ DEFAULT_GOOGLE_SCRIPT_URL ด้านล่างเป็น Web App URL ของ RealStock โดยตรง
const DEFAULT_GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzezGcafF5xqDKLFdlpGqG5km5P56rcrcg5rZjdvlKKEqkhITn0i8GID-APIBgdmkG47w/exec";
const params = new URLSearchParams(window.location.search);
const apiFromQuery = params.get("api") || "";
if (apiFromQuery) localStorage.setItem("realstock.apiUrl", apiFromQuery);
export const GOOGLE_SCRIPT_URL = apiFromQuery || localStorage.getItem("realstock.apiUrl") || DEFAULT_GOOGLE_SCRIPT_URL;

export const ENABLE_SERVICE_WORKER = false;
export const CACHE_TTL = { bootstrap: 5 * 60 * 1000, catalog: 10 * 60 * 1000, stock: 5 * 60 * 1000, orderView: 5 * 60 * 1000, diagnostics: 15 * 1000 };
export const STORAGE_KEYS = { session: "realstock.v53_9.session", draft: "realstock.v53_9.draft", cachePrefix: "realstock.v53_9.cache.", lang: "realstock.v53_9.lang" };

// usage_zones ถูกถอดออกแล้ว: issue ไม่ต้องเลือก usage destination
export const ISSUE_DESTINATIONS = [];

export const MODE_META = {
  count: { label: "นับสต๊อก", color: "count", saveLabel: "บันทึกยอดนับ", helper: "กรอกยอดที่มีจริงของจุดนับนี้ แล้วบันทึกเป็น log ล่าสุด" },
  issue: { label: "เบิกของ", color: "issue", saveLabel: "บันทึกการเบิก", helper: "กรอกจำนวนที่เบิก/ใช้จริงจาก location นั้น ๆ" },
  receive: { label: "รับของ", color: "receive", saveLabel: "บันทึกรับของ", helper: "รับเข้าตามจำนวนจริงใน location ปลายทาง รองรับ conversion_qty" },
  order: { label: "สั่งของ", color: "order", saveLabel: "", helper: "รายงานจำนวนที่ควรสั่งจาก Policy_Item / Order_View" }
};
export const SAVE_TIMEOUT_MS = 12000;
export const MAX_QTY = 999999;
export const ENABLE_CONVERSION_QTY = true;
export const ENABLE_COUNT_ISSUE_CONVERSION = true;
