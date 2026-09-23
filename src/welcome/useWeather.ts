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
  celsius?: number;
  code?: number;
};

const THIRTY_MIN = 30 * 60 * 1000;

type CacheShape = {
  at: number;
  celsius: number;
  code: number;
  key: string;
};

export function useWeather(hotelId: number, place: WeatherPlace | null): WeatherNow | null {
  const [weather, setWeather] = useState<WeatherNow | null>(() => {
    if (!place) return null;
    if (typeof place.celsius === "number" && typeof place.code === "number") {
      return { celsius: place.celsius, code: place.code };
    }
    return readCache(hotelId, place.key)?.now ?? null;
  });

  useEffect(() => {
    if (!place) {
      setWeather(null);
      return;
    }

    if (typeof place.celsius === "number" && typeof place.code === "number") {
      const next = { celsius: place.celsius, code: place.code };
      setWeather(next);
      writeCache(hotelId, place.key, { at: Date.now(), ...next, key: place.key });
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
  }, [hotelId, place?.key, place?.latitude, place?.longitude, place?.celsius, place?.code]);

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
