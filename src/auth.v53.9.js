import { getSession, setSession, clearSessionStore } from "./store.v53.9.js";
import { setEmployee } from "./state.v53.9.js";
export function restoreSession() { const session = getSession(); if (session?.employee) setEmployee(session.employee); }
export function persistSession(employee) { setSession(employee); }
export function logoutSession() { clearSessionStore(); setEmployee(""); }
