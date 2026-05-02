import { CACHE_TTL, GOOGLE_SCRIPT_URL, SAVE_TIMEOUT_MS } from "./config.v53.9.js";
import { getCache, setCache, clearCache } from "./store.v53.9.js";
import { withTimeout } from "./utils.v53.9.js";
function buildUrl(action, params = {}) { const url = new URL(GOOGLE_SCRIPT_URL); url.searchParams.set("action", action); Object.entries(params).forEach(([k,v]) => { if (v !== undefined && v !== null && v !== "") url.searchParams.set(k,v); }); return url.toString(); }
export async function getJson(action, params = {}, cacheName = "", ttlMs = 0) { if (cacheName && ttlMs > 0) { const hit = getCache(cacheName); if (hit?.value) return hit.value; } const res = await fetch(buildUrl(action, { ...params, _: Date.now() }), { method: "GET", cache: "no-store" }); const json = await res.json(); if (cacheName && ttlMs > 0 && json?.ok) setCache(cacheName, json, ttlMs); return json; }
export function clearDataCaches() { clearCache("bootstrap."); clearCache("catalog."); clearCache("stock."); clearCache("order."); clearCache("diag."); }
export const health = () => getJson("health");
export const diagnostics = () => getJson("diagnostics", { admin: 1 }, "diag.admin", CACHE_TTL.diagnostics);
export const preflight = () => getJson("preflight", { admin: 1 });
export const bootstrapData = () => getJson("bootstrapLite", {}, "bootstrap.lite", CACHE_TTL.bootstrap);
export const getCatalog = (mode) => getJson("catalog", { mode }, `catalog.${mode}`, CACHE_TTL.catalog);
export const getCurrentStock = () => getJson("currentStock", {}, "stock.current", CACHE_TTL.stock);
export const getOrderView = () => getJson("orderView", {}, "order.view", CACHE_TTL.orderView);
export const adminWarm = () => getJson("adminWarm", { admin: 1 });
export const adminBuildCatalogView = () => getJson("adminBuildCatalogView", { admin: 1 });
export const adminNightly = () => getJson("adminNightly", { admin: 1 });
function legacyActionName(action) {
  if (action === "count") return "submitCount";
  if (action === "receive") return "submitReceive";
  if (action === "issue") return "submitWithdraw";
  if (action === "order") return "submitOrder";
  if (action === "transfer") return "submitTransfer";
  return action;
}

function buildLegacyWriteUrl(action, requestId, row) {
  const url = new URL(GOOGLE_SCRIPT_URL);
  url.searchParams.set("action", legacyActionName(action));
  url.searchParams.set("requestId", requestId);
  const map = {
    item_key: row.item_key,
    qty_input: row.qty_input ?? row.entered_qty ?? row.qty,
    qty: row.qty_input ?? row.entered_qty ?? row.qty,
    unit: row.unit,
    stock_zone: row.stock_zone || row.location || row.mode_target,
    location: row.stock_zone || row.location || row.mode_target,
    employee: row.employee,
    note: row.note,
    reason_code: row.reason_code,
    allow_negative: row.allow_negative,
    from_stock_zone: row.from_stock_zone || row.from_location,
    to_stock_zone: row.to_stock_zone || row.to_location
  };
  Object.entries(map).forEach(([k, v]) => {
    if (v !== undefined && v !== null && String(v) !== "") url.searchParams.set(k, v);
  });
  url.searchParams.set("_", Date.now());
  return url.toString();
}

async function submitActionPost(action, requestId, rows) {
  const res = await withTimeout(fetch(GOOGLE_SCRIPT_URL, {
    method: "POST",
    headers: { "Content-Type": "text/plain;charset=utf-8" },
    body: JSON.stringify({ action, requestId, rows })
  }), SAVE_TIMEOUT_MS, "save timeout");
  const text = await res.text();
  try { return JSON.parse(text); }
  catch (err) { return { ok: false, message: `invalid json from backend: ${text.slice(0, 180)}` }; }
}

async function submitActionGetFallback(action, requestId, rows) {
  // Fallback สำหรับ Apps Script / browser environment ที่ POST มีปัญหา redirect/CORS
  // ใช้ทีละ row เพื่อให้ backend legacy compat รับได้ และยังมี requestId เดียวกัน
  const results = [];
  for (let i = 0; i < rows.length; i += 1) {
    const url = buildLegacyWriteUrl(action, `${requestId}-${i + 1}`, rows[i]);
    const res = await withTimeout(fetch(url, { method: "GET", cache: "no-store" }), SAVE_TIMEOUT_MS, "save fallback timeout");
    const json = await res.json();
    results.push(json);
    if (!json?.ok) return { ...json, fallback: true, failedRow: i + 1 };
  }
  return { ok: true, fallback: true, accepted: results.reduce((sum, r) => sum + Number(r.accepted || r.saved || 0), 0), results };
}

export async function submitAction(action, requestId, rows) {
  if (!GOOGLE_SCRIPT_URL) return { ok: false, message: "Missing RealStock Web App URL" };
  if (!Array.isArray(rows) || !rows.length) return { ok: false, message: "missing rows" };
  try {
    const json = await submitActionPost(action, requestId, rows);
    if (json?.ok) return json;
    // ถ้า backend เป็นเวอร์ชันที่ยังไม่รับ POST/action ใหม่ ให้ fallback ทันที
    const msg = String(json?.message || json?.error || "");
    if (/unknown action|invalid action|missing action/i.test(msg)) {
      return await submitActionGetFallback(action, requestId, rows);
    }
    return json;
  } catch (err) {
    // network/CORS/redirect failure → fallback GET compat
    try { return await submitActionGetFallback(action, requestId, rows); }
    catch (fallbackErr) { return { ok: false, message: `${err?.message || err}; fallback failed: ${fallbackErr?.message || fallbackErr}` }; }
  }
}
