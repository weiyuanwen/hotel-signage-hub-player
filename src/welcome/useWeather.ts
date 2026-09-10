import { useEffect, useState } from "react";

export type WeatherNow = {
  celsius: number;
  code: number;
};

export type WeatherPlace = {
  key: string;
  label: string;
  latitude: number;
  longitude: number;
};

const THIRTY_MIN = 30 * 60 * 1000;

type CacheShape = {
  at: number;
  celsius: number;
  code: number;
  key: string;
};

export function useWeather(hotelId: number, place: WeatherPlace | null): WeatherNow | null {
  const [weather, setWeather] = useState<WeatherNow | null>(() =>
    place ? (readCache(hotelId, place.key)?.now ?? null) : null,
  );

  useEffect(() => {
    if (!place) {
      setWeather(null);
      return;
    }

    let cancelled = false;

    async function refresh() {
      if (!place) return;
      try {
        const cached = readCache(hotelId, place.key);
        if (cached && Date.now() - cached.at < THIRTY_MIN) {
          if (!cancelled) setWeather({ celsius: cached.celsius, code: cached.code });
          return;
        }

        const url = `https://api.open-meteo.com/v1/forecast?latitude=${place.latitude}&longitude=${place.longitude}&current=temperature_2m,weather_code`;
        const res = await fetch(url);
        if (!res.ok) return;
        const json = (await res.json()) as {
          current?: { temperature_2m?: number; weather_code?: number };
        };
        const celsius = json.current?.temperature_2m;
        const code = json.current?.weather_code;
        if (typeof celsius !== "number" || typeof code !== "number") return;
        const next = { celsius: Math.round(celsius), code };
        writeCache(hotelId, place.key, { at: Date.now(), ...next, key: place.key });
        if (!cancelled) setWeather(next);
      } catch {
        /* keep last reading */
      }
    }

    void refresh();
    const id = window.setInterval(() => void refresh(), THIRTY_MIN);
    return () => {
      cancelled = true;
      window.clearInterval(id);
    };
  }, [hotelId, place?.key, place?.latitude, place?.longitude]);

  return weather;
}

function cacheKey(hotelId: number, region: string): string {
  return `hsh.player.weather.${hotelId}.${region}`;
}

function readCache(hotelId: number, region: string): (CacheShape & { now: WeatherNow }) | null {
  const raw = localStorage.getItem(cacheKey(hotelId, region));
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as CacheShape;
    if (typeof parsed.celsius !== "number") return null;
    return { ...parsed, now: { celsius: parsed.celsius, code: parsed.code } };
  } catch {
    return null;
  }
}

function writeCache(hotelId: number, region: string, value: CacheShape): void {
  localStorage.setItem(cacheKey(hotelId, region), JSON.stringify(value));
}
