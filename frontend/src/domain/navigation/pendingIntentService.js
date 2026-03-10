const KEY = "bv_pending_intent";

export function setPendingIntent(intent) {
  if (!intent) return;
  sessionStorage.setItem(KEY, JSON.stringify(intent));
}

export function getPendingIntent() {
  try {
    const raw = sessionStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function clearPendingIntent() {
  sessionStorage.removeItem(KEY);
}