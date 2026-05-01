import { ISSUE_DESTINATIONS, MAX_QTY } from "./config.v53.9.js";
import { state } from "./state.v53.9.js";
import { getItems } from "./catalog.v53.9.js";
import { nowIso, todayIso, parseNumber, createRequestId } from "./utils.v53.9.js";

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

export function collectRows(node, values, options = {}) {
  if (!state.employee) throw new Error("ยังไม่ได้เข้าสู่ระบบ");
  if (!state.mode) throw new Error("ยังไม่ได้เลือกโหมด");
  const items = getItems(node);
  
  const businessDate = state.mode === "receive" && options.businessDate ? String(options.businessDate).slice(0,10) : todayIso();
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
        date: businessDate,
        business_date: businessDate,
        employee: state.employee,
        item_key: item.item_key,
        item_name: item.item_name_th || item.item_name,
        brand: item.brand || "-",
        unit: entryUnitForMode(item, state.mode),
        mode: state.mode,
        mode_target: item.mode_target || item.stock_location || item.location || "",
        mode_target_label: item.mode_target_label || item.stock_location_th || item.location_th || "",
        base_unit: item.base_unit || item.unit || "",
        purchase_unit: item.purchase_unit || item.order_rounding_unit || item.unit || "",
        conversion_qty: normalizeConversionQty(item),
        count_entry_mode: item.count_entry_mode || "base",
        issue_entry_mode: item.issue_entry_mode || "base",
        receive_entry_mode: item.receive_entry_mode || "base",
        display_stock_unit: item.display_stock_unit || item.unit || "",
        target_category: item.mode_target || "",
        main_category: item.main_category || "",
        sub_category: item.sub_category || "",
        entered_qty: qty,
        qty_input: qty,
        input_unit: entryUnitForMode(item, state.mode),
        mode: state.mode,
        mode_target: item.mode_target || item.stock_location || item.location || "",
        mode_target_label: item.mode_target_label || item.stock_location_th || item.location_th || "",
        qty: qty,
        from_category: state.mode === "issue" ? "stock" : "",
        to_category: item.mode_target || item.receive_target || item.count_zone || "",
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
