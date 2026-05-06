export function withTimeout(promise, ms, message='timeout') { const ctrl = new AbortController(); const t = setTimeout(()=>ctrl.abort(), ms); return promise.finally(()=>clearTimeout(t)); }
export function esc(s){ return String(s ?? '').replace(/[&<>"]/g, c=>({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;' }[c])); }
export function uid(prefix='req'){ return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2,8)}`; }
export function n(v){ const x=Number(String(v??'').replace(/,/g,'')); return Number.isFinite(x)?x:0; }
