import { Cloud, CloudFog, CloudLightning, CloudRain, CloudSun, Snowflake, Sun } from "@phosphor-icons/react";
import { cqw } from "../lib/welcomeLayout";
import { useClock } from "./useClock";
import type { UiLocale } from "./copy";
import type { WeatherNow } from "./useWeather";

export function ClockWidget({
  timeZone,
  locale,
  timeSize,
  dateSize,
}: {
  timeZone: string;
  locale: UiLocale;
  timeSize?: number;
  dateSize?: number;
}) {
  const clock = useClock(timeZone, locale);

  return (
    <div className="text-white">
      <p
        className="font-medium tabular-nums tracking-tight leading-none"
        style={{ fontSize: timeSize != null ? cqw(timeSize) : "clamp(1.75rem, 3.2vw, 2.75rem)" }}
      >
        <span>{clock.hour}</span>
        <span className={`px-[0.06em] ${clock.blink ? "opacity-100" : "opacity-25"}`}>:</span>
        <span>{clock.minute}</span>
      </p>
      <p
        className="mt-2 font-medium capitalize text-white/85"
        style={{ fontSize: dateSize != null ? cqw(dateSize) : "clamp(0.8rem, 1.15vw, 1.05rem)" }}
      >
        {clock.weekday}
      </p>
      <p
        className="text-white/70"
        style={{ fontSize: dateSize != null ? cqw(dateSize) : "clamp(0.8rem, 1.15vw, 1.05rem)" }}
      >
        {clock.date}
      </p>
    </div>
  );
}

const ICONS = {
  sun: Sun,
  "cloud-sun": CloudSun,
  cloud: Cloud,
  rain: CloudRain,
  storm: CloudLightning,
  snow: Snowflake,
  fog: CloudFog,
};

export function WeatherWidget({ weather, size }: { weather: WeatherNow | null; size?: number }) {
  if (!weather) return null;
  const kind = iconKind(weather.code);
  const Glyph = ICONS[kind] ?? CloudSun;
  const fontSize = size != null ? cqw(size) : "clamp(1.75rem, 3.2vw, 2.75rem)";
  const iconSize = size != null ? cqw(size * 0.85) : "clamp(1.75rem, 3vw, 2.6rem)";

  return (
    <div className="flex items-center gap-3 text-white">
      <Glyph size={42} weight="fill" className="shrink-0" style={{ width: iconSize, height: iconSize }} aria-hidden />
      <p className="font-medium tabular-nums tracking-tight leading-none" style={{ fontSize }}>
        {weather.celsius}°C
      </p>
    </div>
  );
}

function iconKind(code: number): keyof typeof ICONS {
  if (code === 0 || code === 1) return "sun";
  if (code === 2 || code === 3) return "cloud-sun";
  if (code === 45 || code === 48) return "fog";
  if (code >= 71 && code <= 77) return "snow";
  if (code >= 95) return "storm";
  if (code >= 51) return "rain";
  return "cloud";
}
