import { useEffect } from "react";
import type { ScreenData } from "../lib/api";
import { FONT_FAMILY, TONE_FILTER, TONE_OVERLAY, cqw, type WelcomeLayout } from "../lib/welcomeLayout";
import { headline, thanks, wifiPasswordLabel, type UiLocale } from "./copy";
import { LanguageToggle } from "./LanguageToggle";
import { ClockWidget, WeatherWidget } from "./Widgets";
import { useLocaleCycle } from "./useLocaleCycle";
import { useWeather } from "./useWeather";
import { WifiHigh } from "@phosphor-icons/react";

type Props = {
  screen: ScreenData;
  layout: WelcomeLayout;
};

export function LayoutWelcome({ screen, layout }: Props) {
  const guest = screen.guest;
  const timeZone = screen.hotel.timezone || "Asia/Ho_Chi_Minh";
  const { locale, pick } = useLocaleCycle(guest?.locale ?? screen.hotel.default_locale);
  const weather = useWeather(screen.hotel.id, screen.weather ?? null);
  const greet = guest ? headline(locale, guest.display_name) : null;
  const body = guest ? thanks(locale, screen.hotel.name, guest.message) : null;
  const font = FONT_FAMILY[layout.font];
  const background = screen.media.background_url;

  useEffect(() => {
    document.documentElement.dataset.tv = "1";
    return () => {
      delete document.documentElement.dataset.tv;
    };
  }, []);

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        pick("vi");
        document.getElementById("lang-vi")?.focus();
      }
      if (event.key === "ArrowRight") {
        event.preventDefault();
        pick("en");
        document.getElementById("lang-en")?.focus();
      }
      if (event.key === "Enter") {
        const active = document.activeElement;
        if (active instanceof HTMLButtonElement) active.click();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [pick]);

  return (
    <div className="flex h-[100dvh] w-screen items-center justify-center overflow-hidden bg-black">
      <div
        className="welcome-stage relative overflow-hidden"
        style={{
          width: "min(100vw, calc(100dvh * 16 / 9))",
          height: "min(100dvh, calc(100vw * 9 / 16))",
          fontFamily: font,
        }}
      >
        {background ? (
          <img
            src={background}
            alt=""
            className="absolute inset-0 size-full object-cover"
            style={{ filter: TONE_FILTER[layout.tone] }}
          />
        ) : (
          <div className="absolute inset-0 bg-black" />
        )}
        <div className="absolute inset-0" style={{ background: TONE_OVERLAY[layout.tone] }} />
        <div className="absolute inset-x-0 bottom-0 h-[28%] bg-gradient-to-t from-black/45 to-transparent" />

        <div className="absolute inset-0 p-[4.2%]">
          <header className="flex items-start justify-between">
            <ClockWidget timeZone={timeZone} locale={locale} />
            <WeatherWidget weather={weather} />
          </header>
        </div>

        {layout.slots.logo.visible !== false ? (
          <Placed x={layout.slots.logo.x} y={layout.slots.logo.y}>
            {screen.hotel.logo_url ? (
              <img
                src={screen.hotel.logo_url}
                alt=""
                className="h-[11cqh] w-auto max-w-[28cqw] object-contain"
              />
            ) : (
              <span className="block size-[4cqw] rounded-full bg-white/20" />
            )}
          </Placed>
        ) : null}

        {greet ? (
          <Placed x={layout.slots.name.x} y={layout.slots.name.y} className="max-w-[70%]">
            <h1
              key={`${locale}-${greet.name}`}
              className="welcome-copy leading-[1.08] font-medium tracking-[-0.03em] uppercase"
              style={{
                color: layout.colors.name,
                fontSize: cqw(layout.sizes.name),
              }}
            >
              {greet.greeting} {greet.name}
            </h1>
          </Placed>
        ) : null}

        {layout.slots.slogan.visible !== false && layout.slogan.trim() ? (
          <Placed x={layout.slots.slogan.x} y={layout.slots.slogan.y} className="max-w-[62%]">
            <p className="welcome-copy leading-snug" style={{ color: layout.colors.slogan, fontSize: cqw(layout.sizes.slogan) }}>
              {layout.slogan}
            </p>
          </Placed>
        ) : null}

        {layout.slots.message.visible !== false && body ? (
          <Placed x={layout.slots.message.x} y={layout.slots.message.y} className="max-w-[58%]">
            <p
              key={`${locale}-${body.lead}-${body.wish}`}
              className="welcome-copy leading-relaxed"
              style={{ color: layout.colors.muted, fontSize: cqw(layout.sizes.message) }}
            >
              <span className="block">{body.lead}</span>
              <span className="mt-[0.4cqw] block">{body.wish}</span>
            </p>
          </Placed>
        ) : null}

        <Placed x={layout.slots.room.x} y={layout.slots.room.y}>
          <p className="tracking-[0.16em] uppercase" style={{ color: layout.colors.muted, fontSize: cqw(layout.sizes.room) }}>
            {screen.room.code}
          </p>
        </Placed>

        <WifiCorner wifi={screen.hotel.wifi} locale={locale} />

        <div className="absolute bottom-[4.2%] left-1/2 -translate-x-1/2">
          <LanguageToggle locale={locale} onPick={pick} className="flex justify-center gap-10" />
        </div>
      </div>
    </div>
  );
}

function Placed({
  x,
  y,
  className = "",
  children,
}: {
  x: number;
  y: number;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={`absolute ${className}`} style={{ left: `${x}%`, top: `${y}%` }}>
      {children}
    </div>
  );
}

function WifiCorner({
  wifi,
  locale,
}: {
  wifi: ScreenData["hotel"]["wifi"];
  locale: UiLocale;
}) {
  if (!wifi?.ssid) return null;
  return (
    <div className="absolute bottom-[4.2%] left-[4.2%] flex max-w-[42%] items-start gap-[0.7cqw] text-white">
      <WifiHigh size={22} weight="regular" className="mt-[0.2cqw] size-[2cqw] shrink-0 text-white/90" />
      <div className="min-w-0">
        <p className="truncate text-[1.45cqw] font-medium tracking-wide">{wifi.ssid}</p>
        {wifi.password ? (
          <p className="mt-[0.2cqw] text-[1.2cqw] text-white/80">
            <span className="text-white/55">{wifiPasswordLabel(locale)}</span>
            <span className="ml-[0.5cqw] tabular-nums tracking-[0.06em]">{wifi.password}</span>
          </p>
        ) : null}
      </div>
    </div>
  );
}
