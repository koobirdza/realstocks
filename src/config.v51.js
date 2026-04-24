export const APP_VERSION = "v53.1.0-phase2-catalog-view";
export const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzezGcafF5xqDKLFdlpGqG5km5P56rcrcg5rZjdvlKKEqkhITn0i8GID-APIBgdmkG47w/exec";
export const ENABLE_SERVICE_WORKER = false;
export const CACHE_TTL = { bootstrap: 5 * 60 * 1000, catalog: 10 * 60 * 1000, stock: 5 * 60 * 1000, orderView: 5 * 60 * 1000, diagnostics: 15 * 1000 };
export const STORAGE_KEYS = { session: "realstock.v53_1.session", draft: "realstock.v53_1.draft", cachePrefix: "realstock.v53_1.cache.", lang: "realstock.v53_1.lang" };
export const ISSUE_DESTINATIONS = [
  { key: "front", label: "หน้าร้าน" },
  { key: "kitchen", label: "ครัว" },
  { key: "bar", label: "บาร์น้ำ" },
  { key: "veg", label: "ของสด/ผัก" }
];
export const MODE_META = {
  count: { label: "นับสต๊อก", color: "count", saveLabel: "บันทึกยอดนับ", helper: "กรอกยอดที่มีจริงของจุดนับนี้ แล้วบันทึกเป็น log ล่าสุด" },
  issue: { label: "เบิกของ", color: "issue", saveLabel: "บันทึกการเบิก", helper: "เลือกปลายทางการเบิกก่อน แล้วกรอกจำนวนที่เบิกออกจริง" },
  receive: { label: "รับของ", color: "receive", saveLabel: "บันทึกรับของ", helper: "ใช้เมื่อของมาถึงแล้ว รับเข้าตามจำนวนจริงในโซนปลายทาง รองรับ conversion_qty เช่น 1 แพ็ค = 12 ขวด" },
  order: { label: "สั่งของ", color: "order", saveLabel: "", helper: "โหมดนี้เป็นรายงานจำนวนที่ควรสั่งจากการคำนวณรอบกลางคืน โดยแสดงเป็นหน่วยซื้อเมื่อมี purchase_unit/conversion_qty" }
};
export const SAVE_TIMEOUT_MS = 12000;
export const MAX_QTY = 999999;

export const ENABLE_CONVERSION_QTY = true;

export const ENABLE_COUNT_ISSUE_CONVERSION = true;
