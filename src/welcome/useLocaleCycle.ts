import { useCallback, useEffect, useRef, useState } from "react";
import { asUiLocale, type UiLocale } from "./copy";

const CYCLE_MS = 12_000;
const PAUSE_MS = 45_000;

export function useLocaleCycle(preferred: string | null | undefined) {
  const [locale, setLocale] = useState<UiLocale>(() => asUiLocale(preferred));
  const pausedUntil = useRef(0);

  useEffect(() => {
    setLocale(asUiLocale(preferred));
  }, [preferred]);

  const pick = useCallback((next: UiLocale) => {
    pausedUntil.current = Date.now() + PAUSE_MS;
    setLocale(next);
  }, []);

  useEffect(() => {
    const id = window.setInterval(() => {
      if (Date.now() < pausedUntil.current) return;
      setLocale((cur) => (cur === "vi" ? "en" : "vi"));
    }, CYCLE_MS);
    return () => window.clearInterval(id);
  }, []);

  return { locale, pick };
}
