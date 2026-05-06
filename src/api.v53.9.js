import { CACHE_TTL, GOOGLE_SCRIPT_URL, SAVE_TIMEOUT_MS } from './config.v53.9.js';
import { getCache, setCache, clearCache } from './store.v53.9.js';
function buildUrl(action, params={}){ const url=new URL(GOOGLE_SCRIPT_URL); url.searchParams.set('action',action); Object.entries(params).forEach(([k,v])=>{ if(v!==undefined&&v!==null&&v!=='') url.searchParams.set(k,v); }); return url.toString(); }
export async function getJson(action, params={}, cacheName='', ttlMs=0){ if(cacheName&&ttlMs>0){ const hit=getCache(cacheName); if(hit?.value) return hit.value; } const res=await fetch(buildUrl(action,{...params,_:Date.now()}),{method:'GET',cache:'no-store'}); const json=await res.json(); if(cacheName&&ttlMs>0&&json?.ok) setCache(cacheName,json,ttlMs); return json; }
export function clearDataCaches(){ clearCache('bootstrap.'); clearCache('catalog.'); clearCache('stock.'); clearCache('order.'); clearCache('queue.'); }
export const health=()=>getJson('health');
export const bootstrapData=()=>getJson('bootstrapLite',{},'bootstrap.lite',CACHE_TTL.bootstrap);
export const getCatalog=(mode)=>getJson('catalog',{mode},`catalog.${mode}`,CACHE_TTL.catalog);
export const getCurrentStock=()=>getJson('currentStock',{},'stock.current',CACHE_TTL.stock);
export const getOrderView=()=>getJson('orderView',{},'order.view',CACHE_TTL.orderView);
export const queueStatus=()=>getJson('queueStatus',{_:Date.now()},'',0);
export const queueItems=(limit=50)=>getJson('queueItems',{limit,_:Date.now()},'',0);
export const adminNightly=()=>getJson('adminNightly',{admin:1});
export const adminProcessQueue=(rebuild=0)=>getJson('adminProcessQueue',{admin:1,rebuild});
export async function submitAction(action, requestId, rows){
  if(!GOOGLE_SCRIPT_URL) return { ok:false, message:'Missing API URL' };
  if(!Array.isArray(rows)||!rows.length) return { ok:false, message:'missing rows' };
  const controller = new AbortController();
  const timer = setTimeout(()=>controller.abort(), SAVE_TIMEOUT_MS);
  try{
    const res = await fetch(GOOGLE_SCRIPT_URL, { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({ action, requestId, rows }), signal:controller.signal });
    const text = await res.text();
    let json; try{ json=JSON.parse(text); }catch(e){ json={ok:false,message:`invalid json: ${text.slice(0,160)}`}; }
    return json;
  }catch(err){ return { ok:false, message: err.name==='AbortError' ? 'queue save timeout' : String(err.message||err) }; }
  finally{ clearTimeout(timer); }
}
