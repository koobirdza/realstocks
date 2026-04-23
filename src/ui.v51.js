import { MODE_META, ISSUE_DESTINATIONS, APP_VERSION } from "./config.v51.js";
import { state } from "./state.v51.js";
import { $, $$, escapeHtml } from "./utils.v51.js";
import { getItems, pathLabels, needsDestination, getChildren } from "./catalog.v51.js";
import { t, getLang } from "./i18n.v51.js";

const dom = {};

const LABEL_FIXES = new Map([
  ["BAR_STATION", "บาร์น้ำ"],
  ["BAR", "บาร์น้ำ"],
  ["BAR_ROOM", "บาร์น้ำ"],
  ["BAR_STOCK_ROOM", "สต๊อกบาร์น้ำ"],
  ["BAR_STOCK", "สต๊อกบาร์น้ำ"],
  ["FRONT_STATION", "หน้าร้าน"],
  ["FRONT", "หน้าร้าน"],
  ["KITCHEN_BACKROOM", "ครัวหลัง"],
  ["KITCHEN", "ครัว"],
  ["KITCHEN_ROOM", "ครัว"],
  ["STOCK_ROOM", "ห้องสต๊อก"],
  ["STOCK", "ห้องสต๊อก"],
  ["VEG_STATION", "ของสด/ผัก"],
  ["VEG_ROOM", "ของสด/ผัก"],
  ["VEG", "ของสด/ผัก"],
  ["SAUCE_CORE", "ซอสหลัก"],
  ["SAUCE_SECONDARY", "ซอสรอง"],
  ["FRESH_MEAT", "เนื้อสด"],
  ["MEAT", "เนื้อสัตว์"],
  ["NOODLE_CARB", "เส้น/ข้าว"],
  ["DRY_GOODS", "ของแห้ง"],
  ["BEVERAGE", "เครื่องดื่ม"],
  ["PACKAGING", "บรรจุภัณฑ์"],
  ["GENERAL", "ทั่วไป"],
  ["โซนผัก/ของสด", "ของสด/ผัก"],
  ["ผัก/ของสด", "ของสด/ผัก"],
  ["โซนของสด/ผัก", "ของสด/ผัก"],
  ["อื่นๆ", "อื่น ๆ"],
  ["อนๆ", "อื่น ๆ"],
  ["นำจิม", "น้ำจิ้ม"],
  ["นำจิ้ม", "น้ำจิ้ม"],
  ["น้ำจิม", "น้ำจิ้ม"],
  ["นำจิม (แพ็คถุง)", "น้ำจิ้ม (แพ็กถุง)"],
  ["นำจิ้ม (แพ็คถุง)", "น้ำจิ้ม (แพ็กถุง)"],
  ["น้ำจิม (แพ็คถุง)", "น้ำจิ้ม (แพ็กถุง)"],
  ["น้ำจิ้ม (แพ็คถุง)", "น้ำจิ้ม (แพ็กถุง)"],
  ["เครืองดืม", "เครื่องดื่ม"],
]);

const ICON_FIXES = new Map([
  ["ครัว", "🍳"],
  ["ห้องสต๊อก", "📦"],
  ["หน้าร้าน", "🏪"],
  ["สต๊อกบาร์น้ำ", "🍹"],
  ["ของสด/ผัก", "🥬"],
  ["สต๊อกของสด/ผัก", "🥬"],
  ["กะทิ / นม", "🥛"],
  ["กะทิ/นม", "🥛"],
  ["ซอส / เครื่องปรุง", "🧂"],
  ["ซอส/เครื่องปรุง", "🧂"],
  ["น้ำจิ้ม (แพ็กถุง)", "🥣"],
  ["ของแห้ง", "🥫"],
  ["บรรจุภัณฑ์", "🛍️"],
  ["ลูกชิ้น / ของแปรรูป / ของทอด", "🍢"],
  ["ลูกชิ้น/ของแปรรูป/ของทอด", "🍢"],
  ["เส้น / ข้าว", "🍜"],
  ["เส้น/ข้าว", "🍜"],
  ["อาหารเจ", "🥗"],
  ["อื่น ๆ", "📦"],
  ["อุปกรณ์ครัว", "🍴"],
  ["อุปกรณ์ทำความสะอาด", "🧽"],
  ["เครื่องดื่ม", "🥤"],
  ["วัตถุดิบชงชา", "🧋"],
]);

function normalizeLabel(input = '') {
  const raw = String(input || '').replace(/\s+/g, ' ').trim();
  if (!raw) return '';
  if (LABEL_FIXES.has(raw)) return LABEL_FIXES.get(raw);
  let label = raw;
  if (/^[A-Z0-9_]+$/.test(label)) {
    const mapped = LABEL_FIXES.get(label) || LABEL_FIXES.get(label.toUpperCase());
    if (mapped) return mapped;
  }
  label = label.replace(/^โซนผัก\/ของสด$/, 'ของสด/ผัก');
  label = label.replace(/^ผัก\/ของสด$/, 'ของสด/ผัก');
  label = label.replace(/^โซนของสด\/ผัก$/, 'ของสด/ผัก');
  label = label.replace(/^อื่นๆ$/, 'อื่น ๆ');
  label = label.replace(/น้ำจิม/g, 'น้ำจิ้ม');
  label = label.replace(/นำจิม/g, 'น้ำจิ้ม');
  label = label.replace(/นำจิ้ม/g, 'น้ำจิ้ม');
  label = label.replace(/แพ็ค/g, 'แพ็ก');
  label = label.replace(/เครืองดืม/g, 'เครื่องดื่ม');
  return label;
}

function pickIconForLabel(label = '', fallback = '📁') {
  const fixed = normalizeLabel(label);
  if (ICON_FIXES.has(fixed)) return ICON_FIXES.get(fixed);
  const checks = [
    [/กะทิ|นม/, '🥛'],
    [/เครื่องดื่ม|โค้ก|ชา|กาแฟ|น้ำ/, '🥤'],
    [/ชงชา|ชงกาแฟ|ไซรัป/, '🧋'],
    [/ซอส|เครื่องปรุง|ซีอิ๊ว|น้ำปลา|พริกเผา|น้ำมันหอย/, '🧂'],
    [/น้ำจิ้ม/, '🥣'],
    [/ของแห้ง|เห็ด|สาหร่าย|แห้ง/, '🥫'],
    [/บรรจุภัณฑ์|ถุง|กล่อง|แพ็กเกจ/, '🛍️'],
    [/ลูกชิ้น|แปรรูป|ทอด|ไส้กรอก/, '🍢'],
    [/เส้น|ข้าว|วุ้นเส้น|มาม่า/, '🍜'],
    [/อาหารเจ/, '🥗'],
    [/ผัก|ของสด|เห็ด|เต้าหู้/, '🥬'],
    [/ครัว/, '🍳'],
    [/บาร์น้ำ|บาร์/, '🍹'],
    [/หน้าร้าน/, '🏪'],
    [/ห้องสต๊อก|สต๊อก/, '📦'],
    [/อุปกรณ์ครัว/, '🍴'],
    [/ทำความสะอาด|ล้างจาน|น้ำยาถู|สก๊อตไบรต์/, '🧽'],
    [/อื่น/, '📦'],
  ];
  for (const [re, icon] of checks) if (re.test(fixed)) return icon;
  if (fallback && fallback !== '📁') return fallback;
  return '📄';
}


export function bindDom() {
  ["loginPage","appPage","employeeName","loginBtn","logoutBtn","employeeDisplay","modeBadge","healthBadge","versionLabel","homeBtn","backBtn","breadcrumb","nodePanel","itemPanel","destinationPanel","destinationButtons","toast","errorBox","cacheStamp","adminPanel","warmBtn","nightlyBtn","preflightBtn","diagText","langThBtn","langLoBtn","titleText","subtitleText"].forEach((id) => dom[id] = $(id));
  if (dom.versionLabel) dom.versionLabel.textContent = APP_VERSION;
  return dom;
}

export function refreshStaticText() {
  if (dom.titleText) dom.titleText.textContent = t('title');
  if (dom.subtitleText) dom.subtitleText.textContent = t('subtitle');
  if (dom.homeBtn) dom.homeBtn.textContent = t('home');
  if (dom.backBtn) dom.backBtn.textContent = t('back');
  if (dom.logoutBtn) dom.logoutBtn.textContent = t('logout');
  if (dom.employeeName) dom.employeeName.placeholder = getLang()==='lo' ? 'ຊື່ພະນັກງານ' : 'ชื่อพนักงาน';
}

export function showError(message = "") { dom.errorBox.textContent = message; dom.errorBox.classList.toggle("hidden", !message); }
export function setHealth(ok, text) { dom.healthBadge.textContent = text; dom.healthBadge.style.background = ok ? "#dcfce7" : "#fee2e2"; dom.healthBadge.style.color = ok ? "#166534" : "#991b1b"; }
export function toast(message, type = "info", ms = 1800) { dom.toast.className = `toast ${type}`; dom.toast.textContent = message; dom.toast.classList.remove("hidden"); clearTimeout(dom.toast._t); dom.toast._t = setTimeout(() => dom.toast.classList.add("hidden"), ms); }

export function renderSession() {
  dom.loginPage.classList.toggle("hidden", !!state.employee);
  dom.appPage.classList.toggle("hidden", !state.employee);
  dom.employeeDisplay.textContent = state.employee || "-";
  dom.homeBtn.classList.toggle("hidden", !state.mode);
  dom.backBtn.classList.toggle("hidden", !state.mode || !state.path.length);
  const meta = MODE_META[state.mode];
  dom.modeBadge.textContent = meta?.label || t('modeNotSelected');
  dom.modeBadge.dataset.modeColor = meta?.color || "";
  document.body.dataset.mode = state.mode || "";
  document.documentElement.dataset.mode = state.mode || "";
}

export function renderAdmin() { dom.adminPanel.classList.toggle("hidden", !state.admin); if (state.admin && dom.diagText) dom.diagText.innerHTML = escapeHtml(state.infoBanner || ''); }
export function renderBreadcrumb(tree) { const crumbs = pathLabels(tree, state.path); dom.breadcrumb.innerHTML = crumbs.map((c, idx) => { const label = normalizeLabel(c.label || ''); const icon = pickIconForLabel(label, c.icon || '📁'); return `${idx ? '<span class="crumb-sep">›</span>' : ''}<span class="crumb"><span class="crumb-icon">${icon}</span><span>${escapeHtml(label)}</span></span>`; }).join(''); if (dom.cacheStamp) dom.cacheStamp.innerHTML = ""; }
export function renderDestinationPicker() {
  const visible = needsDestination(state.mode);
  dom.destinationPanel.classList.toggle("hidden", !visible);
  if (!visible) return;
  const panelHints = dom.destinationPanel.querySelectorAll('.hint, small, [data-role="hint"]');
  panelHints.forEach((el) => el.remove());
  dom.destinationButtons.innerHTML = ISSUE_DESTINATIONS.map((d) => {
    const label = normalizeLabel(String(d.label || d.key || '')) || d.label;
    return `<button class="btn" data-dest="${escapeHtml(d.key)}" ${state.destination === d.key ? 'data-selected="1"' : ''}>${escapeHtml(label)}</button>`;
  }).join('');
}

function nodeCardsHtml(nodes = []) {
  if (!nodes.length) return `<div class="card pad">${escapeHtml(t('noCategory'))}</div>`;
  return nodes.map((node) => {
    const label = normalizeLabel(String(node.label || node.key || 'ไม่ระบุหมวด'));
    const compact = label.replace(/\s+/g, '');
    const longClass = compact.length >= 7 ? ' long' : '';
    const icon = pickIconForLabel(label, node.icon || '📁');
    return `<button class="nav-btn nav-card ${escapeHtml(node.type || '')}" data-node="${escapeHtml(node.key || '')}"><div class="nav-top"><span class="nav-icon">${escapeHtml(icon)}</span><span class="nav-title${longClass}">${escapeHtml(label)}</span></div></button>`;
  }).join('');
}

function bindNodeClicks(onOpen) { $$('[data-node]', dom.nodePanel).forEach((el) => el.addEventListener('click', () => onOpen(el.dataset.node))); }

function extractNodesFromLegacyHtml(html = '') {
  if (!html || typeof DOMParser === 'undefined') return [];
  try {
    const doc = new DOMParser().parseFromString(`<div>${html}</div>`, 'text/html');
    const els = Array.from(doc.querySelectorAll('[data-node]'));
    return els.map((el) => {
      const key = el.getAttribute('data-node') || '';
      const iconEl = el.querySelector('.nav-icon, [data-role="icon"], .icon');
      const titleEl = el.querySelector('.nav-title, [data-role="title"], h3, h4, strong, .title');
      const rawText = (titleEl?.textContent || el.textContent || '').replace(/เปิดหมวด/g, '').replace(/\s+/g, ' ').trim();
      const label = normalizeLabel(rawText || key || 'ไม่ระบุหมวด');
      const icon = pickIconForLabel(label, (iconEl?.textContent || '📁').trim() || '📁');
      return { key, label, icon, type: el.classList.contains('leaf') ? 'leaf' : '' };
    }).filter((x) => x.key);
  } catch (e) {
    return [];
  }
}

export function renderNodesFromHtml(html, onOpen) {
  dom.itemPanel.classList.remove("item-panel-list");
  dom.itemPanel.classList.add("hidden");
  dom.nodePanel.classList.remove("hidden");
  const extracted = extractNodesFromLegacyHtml(html);
  dom.nodePanel.innerHTML = nodeCardsHtml(extracted);
  bindNodeClicks(onOpen);
}
export function renderNodes(node, onOpen) { dom.itemPanel.classList.remove("item-panel-list"); dom.itemPanel.classList.add("hidden"); dom.nodePanel.classList.remove("hidden"); dom.nodePanel.innerHTML = nodeCardsHtml(getChildren(node)); bindNodeClicks(onOpen); }

export function setSaveLocked(locked, label = "") { const saveBtn = $("saveBtn"); if (!saveBtn) return; saveBtn.disabled = !!locked; saveBtn.dataset.originalLabel ||= saveBtn.textContent; saveBtn.textContent = locked ? (label || t('save')) : saveBtn.dataset.originalLabel; $$('[data-step], [data-qty-index]', dom.itemPanel).forEach((el) => { el.disabled = !!locked; }); }
function formatDisplayDate(value) {
  const raw = String(value || '').trim();
  if (!raw) return '-';
  const m = raw.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (m) {
    const [, y, mo, d] = m;
    return `${d}/${mo}/${String(Number(y) + 543).slice(-2)}`;
  }
  const parsed = new Date(raw);
  if (!Number.isNaN(parsed.getTime())) {
    const d = String(parsed.getDate()).padStart(2, '0');
    const mo = String(parsed.getMonth() + 1).padStart(2, '0');
    const y = String(parsed.getFullYear() + 543).slice(-2);
    return `${d}/${mo}/${y}`;
  }
  return escapeHtml(raw);
}

function translateInlineZoneText(value = '') {
  const raw = String(value || '').trim();
  if (!raw) return '';
  return raw
    .split(/\s*[|,/]\s*/g)
    .map((part) => normalizeLabel(part))
    .join(' / ');
}

function normalizeCompareText(value = '') {
  return String(value || '')
    .toLowerCase()
    .replace(/[•()\-_/]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function buildItemDisplayName(item = {}) {
  const baseName = String(item.item_name || '').trim();
  const brand = String(item.brand || '').trim();
  const unit = String(item.unit || '').trim();
  const compareBase = normalizeCompareText(baseName);
  const nameParts = [baseName].filter(Boolean);
  if (unit && unit !== '-' && !compareBase.includes(normalizeCompareText(unit))) {
    nameParts.push(unit);
  }
  const safeBrand = (brand && brand !== '-' && !compareBase.includes(normalizeCompareText(brand))) ? brand : '';
  return {
    titleLine: nameParts.join(' • ') || '-',
    brandLine: safeBrand,
  };
}

function itemMetaModel(mode, item, stock, order) {
  if (mode === 'count') {
    const zone = escapeHtml(translateInlineZoneText(item.count_zone || item.stock_type || item.target_category || '-'));
    const latestDate = formatDisplayDate(stock.latest_count_ts || stock.nightly_snapshot_date || item.nightly_snapshot_date || '');
    const latestQty = escapeHtml(stock.latest_count_qty ?? stock.current_stock ?? '-');
    return {
      primary: `นับล่าสุด ${latestQty}`,
      secondary: [zone, latestDate].filter(Boolean).join(' • '),
    };
  }
  if (mode === 'issue') {
    return {
      primary: `ตัดจาก ${escapeHtml(translateInlineZoneText(item.issue_source || item.stock_type || item.target_category || 'ห้องสต๊อก'))}`,
      secondary: `ใช้ได้ที่ ${escapeHtml(translateInlineZoneText(item.usage_zones || '-'))}`,
    };
  }
  if (mode === 'receive') {
    return {
      primary: `รับเข้า ${escapeHtml(translateInlineZoneText(item.receive_target || item.stock_type || item.target_category || '-'))}`,
      secondary: `${escapeHtml(t('flow'))} ${escapeHtml(translateInlineZoneText(item.flow_type || 'central'))}`,
    };
  }
  return {
    primary: `${escapeHtml(t('snapshot'))} ${escapeHtml(order.nightly_snapshot_date || '-')}`,
    secondary: `${escapeHtml(t('threshold'))} ${escapeHtml(order.threshold_stock ?? '-')} • ${escapeHtml(t('target'))} ${escapeHtml(order.target_par ?? '-')}`,
  };
}
export function renderItems(node, stockMap = {}, orderRows = [], onSave) {
  let items = getItems(node); dom.nodePanel.classList.add("hidden"); dom.itemPanel.classList.remove("hidden"); const meta = MODE_META[state.mode];
  const orderMap = Object.fromEntries(orderRows.map((x) => [x.item_key, x]));
  if (state.mode === 'order') items = items.filter((item) => Number(orderMap[item.item_key]?.suggested_order_qty || 0) > 0);
  if (!items.length) { dom.itemPanel.innerHTML = `<div class="card pad">${state.mode === 'order' ? t('orderEmpty') : t('noItems')}</div>`; return; }
  dom.itemPanel.classList.toggle('item-panel-list', state.mode !== 'order');
  dom.itemPanel.dataset.listMode = state.mode || '';
  const qtyPlaceholder = state.mode === 'receive' ? 'รับเข้า' : state.mode === 'issue' ? 'เบิก' : 'นับ';
  const saveDisabled = state.mode === 'issue' && !state.destination ? 'disabled' : '';
  dom.itemPanel.innerHTML = `<div class="card pad"><div class="list-summary"><div class="between"><div><strong>${escapeHtml(meta.label)}</strong></div><div class="pill">${items.length} รายการ</div></div></div><div class="grid">${items.map((item, idx) => { const stock = stockMap[item.item_key] || {}; const order = orderMap[item.item_key] || {}; const suggestion = Number(order.suggested_order_qty || 0); const displayName = buildItemDisplayName(item); const metaModel = itemMetaModel(state.mode, item, stock, order); if (state.mode === 'order') { return `<div class="item order-item"><div class="between" style="margin-bottom:8px;align-items:flex-start"><div class="item-head"><h4 class="item-title"><span class="item-index">${idx + 1}.</span>${escapeHtml(displayName.titleLine)}</h4>${displayName.brandLine ? `<div class="item-brand">${escapeHtml(displayName.brandLine)}</div>` : ''}</div></div><div class="meta">${metaModel.primary}</div><div class="meta">${metaModel.secondary}</div><div class="between" style="margin-top:12px;align-items:flex-end"><div><div class="hint">${escapeHtml(t('suggestedQty'))}</div><div style="font-size:34px;font-weight:800;line-height:1.05">${escapeHtml(suggestion)}</div></div><div class="pill">${escapeHtml(t('useReceive'))}</div></div></div>`; } return `<div class="item item-card-v2" data-item-index="${idx}"><div class="item-main"><div class="item-head"><h4 class="item-title"><span class="item-index">${idx + 1}.</span>${escapeHtml(displayName.titleLine)}</h4>${displayName.brandLine ? `<div class="item-brand">${escapeHtml(displayName.brandLine)}</div>` : ''}</div><div class="item-bottom"><div class="item-meta-block"><div class="item-meta-primary">${metaModel.primary}</div>${metaModel.secondary ? `<div class="item-meta-secondary">${metaModel.secondary}</div>` : ''}</div><div class="item-stepper" aria-label="item quantity controls"><button class="btn step step-minus" data-step="${idx}:-1" aria-label="ลดจำนวน">−</button><input class="input qty" data-qty-index="${idx}" inputmode="decimal" enterkeyhint="next" type="number" min="0" step="any" placeholder="${qtyPlaceholder}" /><button class="btn step step-plus" data-step="${idx}:1" aria-label="เพิ่มจำนวน">+</button></div></div></div></div>`; }).join('')}</div>${state.mode === 'order' ? '' : `<div class="footer-bar"><div class="row"><button id="saveBtn" class="btn primary" ${saveDisabled}>${escapeHtml(meta.saveLabel)}</button></div></div>`}</div>`;

  const inputs = Array.from($$('[data-qty-index]', dom.itemPanel));
  const itemCards = Array.from($$('[data-item-index]', dom.itemPanel));
  const saveBtn = $("saveBtn");

  function setActive(index, opts = {}) {
    itemCards.forEach((card) => card.classList.toggle('is-active', Number(card.dataset.itemIndex) === index));
    const targetInput = inputs[index];
    const targetCard = itemCards[index];
    if (!targetInput || !targetCard) return;
    if (opts.focus) targetInput.focus({ preventScroll: true });
    if (opts.select) {
      try { targetInput.select(); } catch (e) {}
    }
    if (opts.scroll !== false) targetCard.scrollIntoView({ block: 'center', behavior: opts.behavior || 'smooth' });
  }

  $$('[data-step]', dom.itemPanel).forEach((el) => el.addEventListener('click', () => {
    const [idx, step] = el.dataset.step.split(':').map(Number);
    const input = dom.itemPanel.querySelector(`[data-qty-index="${idx}"]`);
    const current = Number(input.value || 0);
    const nextValue = Math.max(0, current + step);
    input.value = String(nextValue);
    input.dispatchEvent(new Event('input', { bubbles: true }));
    setActive(idx, { focus: true, select: true, scroll: false });
  }));

  inputs.forEach((input, idx) => {
    input.addEventListener('focus', () => setActive(idx, { focus: false, select: true }));
    input.addEventListener('pointerdown', () => itemCards[idx]?.classList.add('is-active'));
    input.addEventListener('input', () => itemCards[idx]?.classList.add('is-active'));
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === 'Go' || e.key === 'Next') {
        e.preventDefault();
        const next = idx + 1;
        if (inputs[next]) setActive(next, { focus: true, select: true });
        else saveBtn?.focus();
        return;
      }
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (inputs[idx + 1]) setActive(idx + 1, { focus: true, select: true });
        else saveBtn?.focus();
        return;
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (inputs[idx - 1]) setActive(idx - 1, { focus: true, select: true });
        return;
      }
    });
    input.addEventListener('blur', () => {
      setTimeout(() => {
        if (!dom.itemPanel.contains(document.activeElement)) itemCards[idx]?.classList.remove('is-active');
      }, 0);
    });
  });

  if (inputs.length) setActive(0, { focus: false, select: false, scroll: false, behavior: 'auto' });
  if (state.mode !== 'order') saveBtn?.addEventListener("click", onSave);
}
export function renderSkeleton() { dom.itemPanel.classList.remove("item-panel-list"); dom.nodePanel.classList.remove("hidden"); dom.itemPanel.classList.add("hidden"); dom.nodePanel.innerHTML = '<div class="skeleton"></div><div class="skeleton"></div><div class="skeleton"></div>'; }
