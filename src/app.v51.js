import { ENABLE_SERVICE_WORKER } from "./config.v51.js";
import { state, setEmployee, setMode, resetNav } from "./state.v51.js";
import { restoreSession, persistSession, logoutSession } from "./auth.v51.js";
import { bindDom, refreshStaticText, renderSession, setHealth, showError, toast, renderAdmin, renderBreadcrumb, renderDestinationPicker, renderNodesFromHtml, renderItems, renderSkeleton, setSaveLocked } from "./ui.v51.js";
import { t, getLang, setLang } from "./i18n.v51.js";
import { bootstrapData, health, submitAction, clearDataCaches, adminWarm, adminNightly, diagnostics, preflight } from "./api.v51.js";
import { getNodeByPath, needsDestination, warmCatalogMode, getWarmMode } from "./catalog.v51.js";
import { collectRows } from "./inventory.v51.js";
import { $, $$, createRequestId, params, debounce } from "./utils.v51.js";
import { setDraft, getDraft, clearDraft, getCache, setCache } from "./store.v51.js";
function currentWarm() { return getWarmMode(state.mode); }
function currentTree() { return currentWarm().tree; }
function currentNode() { return getNodeByPath(currentTree(), state.path) || currentTree(); }
function currentHtml() { return currentWarm().html; }
function readInputValues() { return $$('[data-qty-index]', document).map((el) => ({ index: Number(el.dataset.qtyIndex), value: el.value.trim() })); }
const autosaveDraft = debounce(() => { if (state.mode === 'order') return; const values = readInputValues().filter((x) => x.value !== ""); if (!values.length || !state.mode || !state.employee) return; setDraft({ employee: state.employee, mode: state.mode, path: [...state.path], destination: state.destination, values }); }, 180);
function attachInputAutosave() { if (state.mode === 'order') return; $$('[data-qty-index]', document).forEach((el) => el.addEventListener('input', autosaveDraft)); $('clearBtn')?.addEventListener('click', () => { $$('[data-qty-index]', document).forEach((el) => el.value = ''); clearDraft(); toast(t('cleared')); }); $('restoreBtn')?.addEventListener('click', () => { const draft = getDraft()?.value; if (!draft || draft.mode !== state.mode) return toast(t('noDraft'), 'info'); draft.values.forEach((row) => { const input = document.querySelector(`[data-qty-index="${row.index}"]`); if (input) input.value = row.value; }); toast(t('restored'), 'success'); }); }
async function refreshHealth() { try { const res = await health(); state.nightlyCutoffHour = Number(res?.nightlyCutoffHour || 22); setHealth(!!res?.ok, res?.ok ? t('healthReady', { hour: state.nightlyCutoffHour }) : t('healthProblem', { message: res?.message || '' })); } catch (err) { setHealth(false, t('healthFail')); } }
async function refreshDiagnostics() { if (!state.admin) return; try { const [diag, pf] = await Promise.all([diagnostics().catch(() => null), preflight().catch(() => null)]); const lines = []; if (diag?.ok) lines.push(`รอบคำนวณกลางคืน: ${diag.diagnostics.nightlyRuns || 0} • ล่าสุด: ${diag.diagnostics.lastNightlyAt || '-'}`); if (pf?.ok) lines.push(`สถานะตรวจความพร้อม: ${pf.summary.status}`); state.infoBanner = lines.join(' | ') || 'นับ/เบิก/รับของ = บันทึกลง log อย่างเดียว • สั่งของ = รายงานจากรอบคำนวณกลางคืน'; renderAdmin(); } catch (err) {} }
function applyWarmMode(mode, rows, cached = false) { const warmed = warmCatalogMode(mode, rows || []); state.catalogRowsByMode[mode] = rows || []; state.treeByMode[mode] = warmed.tree; state.instantReadyModes[mode] = true; if (state.mode === mode) { state.scheduleBadgeByPath = warmed.scheduleBadgeByPath; state.lastCacheStamp = cached ? 'ใช้แคช • อ้างอิงรอบข้อมูลล่าสุด 22:00' : 'พร้อมใช้งาน • โหลดครั้งเดียวแล้วใช้ต่อ'; } }
async function ensureBootstrapLoaded(force = false) { if (state.bootstrapped && !force) return; const boot = await bootstrapData(); if (!boot?.ok) throw new Error(boot?.message || 'โหลดข้อมูลเริ่มต้นไม่สำเร็จ'); ['count','issue','receive','order'].forEach((mode) => applyWarmMode(mode, boot.catalogs?.[mode] || [], true)); state.stockMap = boot.stock || {}; state.orderRows = boot.orderView || []; state.nightlyCutoffHour = Number(boot.nightlyCutoffHour || 22); state.bootstrapped = true; state.lastCacheStamp = getLang()==='lo' ? 'ພ້ອມໃຊ້ງານ • ໂຫຼດຄັ້ງດຽວແລ້ວໃຊ້ຕໍ່' : 'พร้อมใช้งาน • โหลดครั้งเดียวแล้วใช้ต่อ'; }

function applyLatestCountUpdates(updates = []) {
  if (!Array.isArray(updates) || !updates.length) return;
  updates.forEach((row) => {
    if (!row?.item_key) return;
    const prev = state.stockMap[row.item_key] || {};
    state.stockMap[row.item_key] = {
      ...prev,
      latest_count_ts: row.latest_count_ts || prev.latest_count_ts || '',
      latest_count_qty: row.latest_count_qty ?? prev.latest_count_qty ?? prev.current_stock ?? '-',
      nightly_snapshot_date: prev.nightly_snapshot_date || row.latest_count_ts || ''
    };
  });
  const cached = getCache("bootstrap.main");
  if (cached?.value?.ok) {
    const next = { ...cached.value, stock: { ...(cached.value.stock || {}) } };
    updates.forEach((row) => {
      if (!row?.item_key) return;
      const prev = next.stock[row.item_key] || {};
      next.stock[row.item_key] = {
        ...prev,
        latest_count_ts: row.latest_count_ts || prev.latest_count_ts || '',
        latest_count_qty: row.latest_count_qty ?? prev.latest_count_qty ?? prev.current_stock ?? '-',
        nightly_snapshot_date: prev.nightly_snapshot_date || row.latest_count_ts || ''
      };
    });
    setCache("bootstrap.main", next, 5 * 60 * 1000);
  }
}

function render() {
  renderSession();
  renderAdmin();
  renderDestinationPicker();

  if (!state.employee || !state.mode) return;

  renderBreadcrumb(currentTree());
  const node = currentNode();
  const html = currentHtml();

  if (state.path.length === 0 && html.targets) {
    renderNodesFromHtml(html.targets, (key) => {
      state.path.push(key);
      showError('');
      render();
    });
    return;
  }

  if (state.path.length === 1 && html.subsByTarget?.[state.path[0]]) {
    renderNodesFromHtml(html.subsByTarget[state.path[0]], (key) => {
      state.path.push(key);
      showError('');
      render();
    });
    return;
  }

  const children = Object.keys(node?.children || {});
  if (children.length) {
    renderNodesFromHtml('', () => {});
    return;
  }

  renderItems(node, state.stockMap, state.orderRows, handleSave);
  attachInputAutosave();
  const receiveDateInput = $('receiveDateInput');
  if (receiveDateInput) {
    state.receiveDate = receiveDateInput.value || new Date().toISOString().slice(0,10);
    receiveDateInput.addEventListener('change', () => { state.receiveDate = receiveDateInput.value || new Date().toISOString().slice(0,10); });
    receiveDateInput.addEventListener('input', () => { state.receiveDate = receiveDateInput.value || new Date().toISOString().slice(0,10); });
  }
  setSaveLocked(state.saveInFlight);
}

async function chooseMode(mode) {
  setMode(mode);
  showError('');
  render();
  renderSkeleton();
  await ensureBootstrapLoaded();
  state.scheduleBadgeByPath = getWarmMode(mode).scheduleBadgeByPath;
  render();
}

async function handleSave() {
  if (state.saveInFlight || state.mode === 'order') return;

  try {
    showError('');
    const node = currentNode();
    if (needsDestination(state.mode) && !state.destination) {
      throw new Error(t('selectDestination'));
    }

    const rows = collectRows(node, readInputValues(), { businessDate: state.mode === 'receive' ? (($('receiveDateInput')?.value || state.receiveDate || new Date().toISOString().slice(0,10))) : '' });
    const requestId = createRequestId();

    state.saveInFlight = true;
    setSaveLocked(true, t('save'));
    toast(
      state.mode === 'receive'
        ? 'กำลังบันทึกรับของ...'
        : state.mode === 'issue'
          ? 'กำลังบันทึกการเบิก...'
          : 'กำลังบันทึกยอด...',
      'info',
      900
    );

    const res = await submitAction(state.mode, requestId, rows);
    if (!res?.ok) throw new Error(res?.message || t('saveFailed'));

    if (state.mode === 'count' && Array.isArray(res.latestCountUpdates) && res.latestCountUpdates.length) {
      applyLatestCountUpdates(res.latestCountUpdates);
    }

    clearDraft();
    if (state.path.length) state.path.pop();
    render();
    toast(t('accepted', { hour: state.nightlyCutoffHour }), 'success', 2000);
  } catch (err) {
    showError(err?.message || t('saveFailed'));
    toast('เกิดข้อผิดพลาด', 'error');
  } finally {
    state.saveInFlight = false;
    setSaveLocked(false);
  }
}

function bindEvents() {
  $('langThBtn')?.addEventListener('click', () => {
    setLang('th');
    refreshStaticText();
    render();
    refreshHealth();
  });

  $('langLoBtn')?.addEventListener('click', () => {
    setLang('lo');
    refreshStaticText();
    render();
    refreshHealth();
  });

  $('loginBtn').addEventListener('click', async () => {
    const name = $('employeeName').value.trim();
    if (!name) return showError(t('enterEmployee'));

    try {
      setEmployee(name);
      persistSession(name);
      showError('');
      render();
      await ensureBootstrapLoaded();
    } catch (err) {
      showError(t('loginFailed'));
    }
  });

  $('employeeName').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') $('loginBtn').click();
  });

  $('logoutBtn').addEventListener('click', () => {
    logoutSession();
    resetNav();
    state.mode = '';
    state.bootstrapped = false;
    render();
  });

  $$('[data-mode]').forEach((el) => {
    el.addEventListener('click', () => chooseMode(el.dataset.mode));
  });

  $('homeBtn').addEventListener('click', () => {
    resetNav();
    render();
  });

  $('backBtn').addEventListener('click', () => {
    state.path.pop();
    render();
  });

  $('destinationButtons').addEventListener('click', (e) => {
    const btn = e.target.closest('[data-dest]');
    if (!btn) return;
    state.destination = btn.dataset.dest;
    renderDestinationPicker();
  });

  $('warmBtn')?.addEventListener('click', async () => {
    const res = await adminWarm();
    toast(res?.ok ? t('warmOk') : t('warmFail'), res?.ok ? 'success' : 'error');
    refreshDiagnostics();
  });

  $('nightlyBtn')?.addEventListener('click', async () => {
    const res = await adminNightly();
    toast(res?.ok ? `${t('nightlyOk')} • ${res.orderRows}` : t('nightlyFail'), res?.ok ? 'success' : 'error', 2500);
    if (res?.ok) {
      clearDataCaches();
      state.bootstrapped = false;
      await ensureBootstrapLoaded(true);
      render();
    }
    refreshDiagnostics();
  });

  $('preflightBtn')?.addEventListener('click', async () => {
    const pf = await preflight();
    toast(pf?.ok ? `ตรวจความพร้อม: ${pf.summary.status}` : t('preflightFail'), pf?.ok ? 'success' : 'error', 2500);
    state.infoBanner = pf?.ok ? `สถานะตรวจความพร้อม: ${pf.summary.status}` : 'ตรวจความพร้อมไม่ผ่าน';
    renderAdmin();
  });
}

async function bootstrap() {
 bindDom(); state.admin = params().get('admin') === '1'; restoreSession(); bindEvents(); render(); await refreshHealth(); if (state.employee) { try { await ensureBootstrapLoaded(); } catch (err) {} } await refreshDiagnostics(); if (ENABLE_SERVICE_WORKER && 'serviceWorker' in navigator) navigator.serviceWorker.register('./sw.js').catch(() => {}); if (!ENABLE_SERVICE_WORKER && 'serviceWorker' in navigator) { try { const regs = await navigator.serviceWorker.getRegistrations(); for (const reg of regs) { await reg.unregister(); } } catch (err) {} } }
bootstrap();
