import { ISSUE_DESTINATIONS, MAX_QTY } from "./config.v51.js";
import { state } from "./state.v51.js";
import { getItems } from "./catalog.v51.js";
import { nowIso, todayIso, parseNumber, createRequestId } from "./utils.v51.js";

function normalizeConversionQty(item = {}) {
  const n = parseNumber(item.conversion_qty, 1);
  return Number.isFinite(n) && n > 0 ? n : 1;
}

function entryModeFor(item = {}, mode = "") {
  if (mode === "count") return item.count_entry_mode || "base";
  if (mode === "issue") return item.issue_entry_mode || "base";
  if (mode === "receive") return item.receive_entry_mode || "base";
  return "base";
}

function entryUnitForMode(item = {}, mode = "") {
  const entryMode = entryModeFor(item, mode);
  const purchaseUnit = item.purchase_unit || item.order_rounding_unit || item.unit || "";
  if (entryMode === "purchase" && purchaseUnit) return purchaseUnit;
  return item.unit || "";
}

function purchaseUnitForMode(item = {}, mode = "") {
  if (mode === "receive" || mode === "order") {
    return item.purchase_unit || item.order_rounding_unit || item.unit || "";
  }
  return item.unit || "";
}

function destinationLabel(destKey = "") {
  const found = ISSUE_DESTINATIONS.find((x) => String(x.key) === String(destKey));
  return found?.label || destKey || "";
}

export function collectRows(node, values) {
  if (!state.employee) throw new Error("ยังไม่ได้เข้าสู่ระบบ");
  if (!state.mode) throw new Error("ยังไม่ได้เลือกโหมด");
  const items = getItems(node);
  if (state.mode === "issue" && !state.destination) throw new Error("กรุณาเลือกปลายทางการเบิกก่อนบันทึก");
  const rows = values
    .filter((x) => x.value !== "")
    .map((x) => {
      const item = items[x.index];
      if (!item) return null;
      const qty = parseNumber(x.value, NaN);
      if (!Number.isFinite(qty) || qty < 0 || qty > MAX_QTY) throw new Error(`จำนวนไม่ถูกต้อง: ${item.item_name}`);
      if ((state.mode === "issue" || state.mode === "receive" || state.mode === "order") && qty === 0) return null;
      return {
        tx_id: createRequestId(),
        timestamp: nowIso(),
        date: todayIso(),
        employee: state.employee,
        item_key: item.item_key,
        item_name: item.item_name,
        brand: item.brand || "-",
        unit: entryUnitForMode(item, state.mode),
        base_unit: item.base_unit || item.unit || "",
        purchase_unit: item.purchase_unit || item.order_rounding_unit || item.unit || "",
        conversion_qty: normalizeConversionQty(item),
        count_entry_mode: item.count_entry_mode || "base",
        issue_entry_mode: item.issue_entry_mode || "base",
        receive_entry_mode: item.receive_entry_mode || "base",
        display_stock_unit: item.display_stock_unit || item.unit || "",
        item_type: item.item_type || "",
        target_category: item.target_category || "",
        main_category: item.main_category || "",
        sub_category: item.sub_category || "",
        entered_qty: qty,
        qty_input: qty,
        input_unit: entryUnitForMode(item, state.mode),
        qty: qty,
        from_category: state.mode === "issue" ? "stock" : "",
        to_category: state.mode === "issue" ? destinationLabel(state.destination || "") : (item.target_category || ""),
        count_department: item.count_department || "",
        count_zone: item.count_zone || item.stock_zone || "",
        stock_zone: state.mode === "count" ? (item.count_zone || item.stock_type || item.target_category || "") : state.mode === "receive" ? (item.receive_target || item.stock_type || item.target_category || "") : state.mode === "issue" ? (item.issue_source || item.stock_type || item.target_category || "") : (item.basis_zone || item.receive_target || item.stock_type || item.target_category || ""),
        note:
          state.mode === "receive" && normalizeConversionQty(item) !== 1
            ? `receive ${qty} ${entryUnitForMode(item, state.mode)} = ${qty * normalizeConversionQty(item)} ${item.base_unit || item.unit || ""}`
            : (state.mode === "count" && entryModeFor(item, state.mode) === "purchase" && normalizeConversionQty(item) !== 1)
              ? `count ${qty} ${entryUnitForMode(item, state.mode)} = ${qty * normalizeConversionQty(item)} ${item.base_unit || item.unit || ""}`
              : (state.mode === "issue" && entryModeFor(item, state.mode) === "purchase" && normalizeConversionQty(item) !== 1)
                ? `issue ${qty} ${entryUnitForMode(item, state.mode)} = ${qty * normalizeConversionQty(item)} ${item.base_unit || item.unit || ""}`
                : "",
        snapshot_date: item.nightly_snapshot_date || ""
      };
    })
    .filter(Boolean);

  if (!rows.length) {
    const msg = state.mode === "count" ? "กรุณากรอกยอดนับอย่างน้อย 1 รายการ" :
      state.mode === "issue" ? "กรุณากรอกจำนวนที่เบิกอย่างน้อย 1 รายการ" :
      state.mode === "receive" ? "กรุณากรอกจำนวนที่รับอย่างน้อย 1 รายการ" :
      "กรุณากรอกจำนวนที่สั่งอย่างน้อย 1 รายการ";
    throw new Error(msg);
  }
  return rows;
}
