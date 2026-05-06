export const state = { mode:'count', catalog:{count:[],receive:[],issue:[],order:[],transfer:[]}, visibleCount:80, draft:{}, employee:'', apiReady:false };
export function setMode(mode){ state.mode=mode; state.visibleCount=80; }
export function setCatalog(mode, rows){ state.catalog[mode]=rows||[]; }
export function setQty(key, qty){ state.draft[key]=qty; }
export function clearDraft(){ state.draft={}; }
