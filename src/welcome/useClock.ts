import { useEffect, useState } from "react";
import type { UiLocale } from "./copy";

export type ClockParts = {
  hour: string;
  minute: string;
  blink: boolean;
  weekday: string;
  date: string;
};

export function useClock(timeZone: string, locale: UiLocale): ClockParts {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(id);
  }, []);

  const intlLocale = locale === "vi" ? "vi-VN" : "en-GB";
  const hour = new Intl.DateTimeFormat(intlLocale, {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone,
  }).formatToParts(now);

  const hh = hour.find((p) => p.type === "hour")?.value ?? "00";
  const mm = hour.find((p) => p.type === "minute")?.value ?? "00";
  const weekday = new Intl.DateTimeFormat(intlLocale, { weekday: "long", timeZone }).format(now);
  const date = new Intl.DateTimeFormat(intlLocale, {
    day: "2-digit",
    month: locale === "vi" ? "2-digit" : "short",
    year: "numeric",
    timeZone,
  }).format(now);

  return {
    hour: hh.padStart(2, "0"),
    minute: mm.padStart(2, "0"),
    blink: now.getSeconds() % 2 === 0,
    weekday: locale === "vi" ? capitalizeVi(weekday) : weekday,
    date,
  };
}

function capitalizeVi(value: string): string {
  return value.charAt(0).toLocaleUpperCase("vi-VN") + value.slice(1);
}
