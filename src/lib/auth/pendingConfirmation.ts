export interface PendingConfirmation {
  email: string;
  destination?: string;
  deliveryMedium?: string;
}

const PENDING_CONFIRMATION_KEY = "alugfacil.auth.pending-confirmation";

function canUseStorage() {
  return typeof window !== "undefined" && typeof window.sessionStorage !== "undefined";
}

export function setPendingConfirmation(data: PendingConfirmation) {
  if (!canUseStorage()) return;
  window.sessionStorage.setItem(PENDING_CONFIRMATION_KEY, JSON.stringify(data));
}

export function getPendingConfirmation(): PendingConfirmation | null {
  if (!canUseStorage()) return null;
  const raw = window.sessionStorage.getItem(PENDING_CONFIRMATION_KEY);
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as PendingConfirmation;
    if (!parsed.email) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function clearPendingConfirmation() {
  if (!canUseStorage()) return;
  window.sessionStorage.removeItem(PENDING_CONFIRMATION_KEY);
}
