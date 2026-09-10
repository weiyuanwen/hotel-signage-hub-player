import type { ScreenData } from "./api";

const KEY = "hsh.player.screen";

export function readScreenCache(): ScreenData | null {
  const raw = localStorage.getItem(KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as ScreenData;
    if (!parsed?.hotel?.id || !parsed?.room?.id) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function writeScreenCache(screen: ScreenData): void {
  localStorage.setItem(KEY, JSON.stringify(screen));
}

export function clearScreenCache(): void {
  localStorage.removeItem(KEY);
}
