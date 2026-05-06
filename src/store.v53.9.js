import { STORAGE_KEYS } from './config.v53.9.js';
export function getCache(name){ try{ const raw=localStorage.getItem(STORAGE_KEYS.cachePrefix+name); if(!raw)return null; const o=JSON.parse(raw); if(o.exp && Date.now()>o.exp){ localStorage.removeItem(STORAGE_KEYS.cachePrefix+name); return null; } return o; }catch(e){ return null; } }
export function setCache(name,value,ttl){ try{ localStorage.setItem(STORAGE_KEYS.cachePrefix+name, JSON.stringify({ value, exp: Date.now()+ttl })); }catch(e){} }
export function clearCache(prefix=''){ Object.keys(localStorage).forEach(k=>{ if(k.startsWith(STORAGE_KEYS.cachePrefix+prefix)) localStorage.removeItem(k); }); }
export function getSession(){ try{return JSON.parse(localStorage.getItem(STORAGE_KEYS.session)||'{}');}catch(e){return{};} }
export function setSession(s){ localStorage.setItem(STORAGE_KEYS.session, JSON.stringify(s||{})); }
