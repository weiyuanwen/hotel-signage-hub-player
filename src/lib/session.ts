const TOKEN_KEY = "hsh.player.token";
const META_KEY = "hsh.player.meta";
const PENDING_KEY = "hsh.player.pendingPin";

export type PendingPin = {
  code: string;
  expiresAt: string;
};

export type DeviceMeta = {
  deviceId: number;
  hotelId: number;
  roomId: number;
};

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function getMeta(): DeviceMeta | null {
  const raw = localStorage.getItem(META_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as DeviceMeta;
  } catch {
    return null;
  }
}

export function persistPairing(token: string, meta: DeviceMeta): void {
  localStorage.setItem(TOKEN_KEY, token);
  persistMeta(meta);
  clearPendingPin();
}

export function persistMeta(meta: DeviceMeta): void {
  localStorage.setItem(META_KEY, JSON.stringify(meta));
}

export function getPendingPin(): PendingPin | null {
  const raw = sessionStorage.getItem(PENDING_KEY);
  if (!raw) return null;
  try {
    const pending = JSON.parse(raw) as PendingPin;
    if (new Date(pending.expiresAt).getTime() <= Date.now()) {
      clearPendingPin();
      return null;
    }
    return pending;
  } catch {
    return null;
  }
}

export function persistPendingPin(pending: PendingPin): void {
  sessionStorage.setItem(PENDING_KEY, JSON.stringify(pending));
}

export function clearPendingPin(): void {
  sessionStorage.removeItem(PENDING_KEY);
}

export function clearSession(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(META_KEY);
  clearPendingPin();
  localStorage.removeItem("hsh.player.screen");
}
