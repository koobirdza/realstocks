import { CACHE_TTL, GOOGLE_SCRIPT_URL } from "./config.v53.9.js";
import { getCache, setCache, clearCache } from "./store.v53.9.js";

function buildUrl(action, params = {}) {
  if (!GOOGLE_SCRIPT_URL) throw new Error("Missing RealStock API URL");

  const url = new URL(GOOGLE_SCRIPT_URL);
  url.searchParams.set("action", action);

  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== "") {
      url.searchParams.set(k, v);
    }
  });

  return url.toString();
}

async function fetchJsonWithTimeout(url, options = {}, timeoutMs = 30000) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(url, {
      ...options,
      signal: controller.signal
    });

    const text = await res.text();

    try {
      return JSON.parse(text);
    } catch (err) {
      return {
        ok: false,
        status: res.status,
        message: `invalid json: ${text.slice(0, 200)}`
      };
    }
  } catch (err) {
    return {
      ok: false,
      message:
        err?.name === "AbortError"
          ? "request timeout"
          : err?.message || String(err)
    };
  } finally {
    clearTimeout(timeout);
  }
}

export async function getJson(action, params = {}, cacheName = "", ttlMs = 0, timeoutMs = 30000) {
  if (cacheName && ttlMs > 0) {
    const hit = getCache(cacheName);
    if (hit?.value) return hit.value;
  }

  const json = await fetchJsonWithTimeout(
    buildUrl(action, { ...params, _: Date.now() }),
    {
      method: "GET",
      cache: "no-store"
    },
    timeoutMs
  );

  if (cacheName && ttlMs > 0 && json?.ok) {
    setCache(cacheName, json, ttlMs);
  }

  return json;
}

export function clearDataCaches() {
  clearCache("bootstrap.");
  clearCache("catalog.");
  clearCache("stock.");
  clearCache("order.");
  clearCache("diag.");
  clearCache("queue.");
  clearCache("snapshot.");
}

export const health = () => getJson("health");

export const diagnostics = () =>
  getJson("diagnostics", { admin: 1 }, "diag.admin", CACHE_TTL.diagnostics);

export const preflight = () =>
  getJson("preflight", { admin: 1 });

export const bootstrapData = () =>
  getJson("bootstrapLite", {}, "bootstrap.lite", CACHE_TTL.bootstrap);

export const getCatalog = (mode) =>
  getJson("catalog", { mode }, `catalog.${mode}`, CACHE_TTL.catalog, 60000);

export const getCurrentStock = () =>
  getJson("currentStock", {}, "stock.current", CACHE_TTL.stock, 60000);

export const getOrderView = () =>
  getJson("orderView", {}, "order.view", CACHE_TTL.orderView, 60000);

export const adminWarm = () =>
  getJson("adminWarm", { admin: 1 }, "", 0, 60000);

export const adminBuildCatalogView = () =>
  getJson("adminBuildCatalogView", { admin: 1 }, "", 0, 60000);

export const adminNightly = () =>
  getJson("adminNightly", { admin: 1 }, "", 0, 60000);

export const adminProcessQueue = (rebuild = false) =>
  getJson(
    "adminProcessQueue",
    {
      admin: 1,
      limit: 1,
      rebuild: rebuild ? 1 : ""
    },
    "",
    0,
    60000
  );

export const adminInstallQueueTrigger = () =>
  getJson("adminInstallQueueTrigger", { admin: 1 });

export const queueStatus = () =>
  getJson("queueStatus", {}, "queue.status", 5000);

export const queueItems = (limit = 20) =>
  getJson("queueItems", { limit }, "queue.items", 5000);

export const snapshotBootstrap = (force = false) =>
  getJson(
    "snapshotBootstrap",
    { force: force ? 1 : "" },
    "snapshot.bootstrap",
    CACHE_TTL.bootstrap || 300000,
    60000
  );

export const snapshotStatus = () =>
  getJson("snapshotStatus", { admin: 1 }, "snapshot.status", 10000, 30000);

export const adminRebuildSnapshot = () =>
  getJson("adminRebuildSnapshot", { admin: 1 }, "", 0, 60000);

function normalizeRowsForQueue(action, rows) {
  return (rows || []).map((row) => {
    const qty = Number(row.qty_input ?? row.entered_qty ?? row.qty ?? 0);

    const location =
      row.stock_zone ||
      row.location ||
      row.mode_target ||
      row.mode_target_key ||
      "";

    return {
      item_key: row.item_key || row.itemKey || "",
      item_name: row.item_name || row.item_name_th || "",
      item_name_th: row.item_name_th || row.item_name || "",
      brand: row.brand || "",

      qty,
      qty_input: qty,

      unit:
        row.unit ||
        row.input_unit ||
        row.base_unit ||
        row.purchase_unit ||
        "",

      input_unit:
        row.input_unit ||
        row.unit ||
        row.base_unit ||
        row.purchase_unit ||
        "",

      base_unit: row.base_unit || "",
      purchase_unit: row.purchase_unit || "",
      conversion_qty: Number(row.conversion_qty || 1),

      stock_zone: location,
      location,
      mode_target: row.mode_target || row.mode_target_key || location,

      category: row.category || location,
      main_category: row.main_category || "",
      sub_category: row.sub_category || "",

      employee: row.employee || "",
      note: row.note || "",
      reason_code: row.reason_code || "",
      allow_negative: row.allow_negative || "",

      from_stock_zone: row.from_stock_zone || row.from_location || "",
      to_stock_zone: row.to_stock_zone || row.to_location || "",

      action
    };
  });
}

function runBackgroundQueueAndSnapshot() {
  fetch(
    buildUrl("adminProcessQueue", {
      admin: 1,
      limit: 1
    }),
    {
      method: "GET",
      cache: "no-store"
    }
  )
    .then(() => {
      return fetch(
        buildUrl("adminRebuildSnapshot", {
          admin: 1
        }),
        {
          method: "GET",
          cache: "no-store"
        }
      );
    })
    .catch((err) => {
      console.warn("background queue/snapshot process failed", err);
    });
}

export async function submitAction(action, requestId, rows) {
  if (!GOOGLE_SCRIPT_URL) {
    return { ok: false, message: "Missing RealStock API URL" };
  }

  if (!action) {
    return { ok: false, message: "missing action" };
  }

  if (!requestId) {
    return { ok: false, message: "missing requestId" };
  }

  if (!Array.isArray(rows) || !rows.length) {
    return { ok: false, message: "missing rows" };
  }

  const payload = {
    action,
    requestId,
    rows: normalizeRowsForQueue(action, rows),
    queue: true,
    clientVersion: "v54.1.0-option-a-background-save"
  };

  try {
    const saveJson = await fetchJsonWithTimeout(
      GOOGLE_SCRIPT_URL,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
        body: JSON.stringify(payload)
      },
      30000
    );

    if (!saveJson?.ok) {
      return {
        ...saveJson,
        queued: false,
        processed: false,
        background: false,
        message: saveJson?.message || "save queue failed"
      };
    }

    clearDataCaches();

    runBackgroundQueueAndSnapshot();

    return {
      ...saveJson,
      queued: true,
      processed: false,
      background: true,
      message: saveJson.message || "บันทึกเข้าคิวแล้ว ระบบกำลังประมวลผล"
    };
  } catch (err) {
    return {
      ok: false,
      queued: false,
      processed: false,
      background: false,
      message: err?.message || String(err)
    };
  }
}
