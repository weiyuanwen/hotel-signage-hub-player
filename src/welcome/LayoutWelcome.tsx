import { useEffect } from "react";
import type { ScreenData } from "../lib/api";
import {
  FONT_FAMILY,
  SPLIT_PANEL,
  TONE_FILTER,
  TONE_OVERLAY,
  cqh,
  cqw,
  isSplitLayout,
  type WelcomeLayout,
} from "../lib/welcomeLayout";
import { headline, wifiPasswordLabel, type UiLocale } from "./copy";
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
  const split = isSplitLayout(layout);
  const greet = guest ? headline(locale, guest.display_name, split ? "letter" : "banner") : null;
  const lead = layout.lead.trim();
  const wish = layout.wish.trim();
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
            className={`absolute object-cover ${split ? "inset-y-0 right-0" : "inset-0 size-full"}`}
            style={{
              filter: TONE_FILTER[layout.tone],
              ...(split ? { left: `${SPLIT_PANEL.width}%`, width: `${100 - SPLIT_PANEL.width}%` } : {}),
            }}
          />
        ) : (
          <div className="absolute inset-0 bg-black" />
        )}
        {split ? (
          <>
            <div className="absolute inset-y-0 left-0" style={{ width: `${SPLIT_PANEL.width}%`, background: SPLIT_PANEL.color }} />
            <div className="absolute inset-y-0" style={{ left: `${SPLIT_PANEL.width}%`, width: 1, background: SPLIT_PANEL.edge }} />
            <div
              className="absolute inset-y-0 right-0"
              style={{ width: `${100 - SPLIT_PANEL.width}%`, background: "rgb(8 10 12 / 0.14)" }}
            />
          </>
        ) : (
          <>
            <div className="absolute inset-0" style={{ background: TONE_OVERLAY[layout.tone] }} />
            <div className="absolute inset-x-0 bottom-0 h-[28%] bg-gradient-to-t from-black/45 to-transparent" />
          </>
        )}

        {split ? (
          <div
            className="absolute top-[4.2%] right-[4.2%] flex items-start gap-[1.6cqw] drop-shadow-[0_1px_10px_rgb(0_0_0/0.45)]"
          >
            <WeatherWidget weather={weather} size={layout.sizes.weather} />
            <ClockWidget timeZone={timeZone} locale={locale} timeSize={layout.sizes.time} dateSize={layout.sizes.clock} />
          </div>
        ) : (
          <div className="absolute inset-0 p-[4.2%]">
            <header className="flex items-start justify-between">
              <ClockWidget timeZone={timeZone} locale={locale} timeSize={layout.sizes.time} dateSize={layout.sizes.clock} />
              <WeatherWidget weather={weather} size={layout.sizes.weather} />
            </header>
          </div>
        )}

        {layout.slots.logo.visible !== false ? (
          <Placed x={layout.slots.logo.x} y={layout.slots.logo.y}>
            {screen.hotel.logo_url ? (
              <img
                src={screen.hotel.logo_url}
                alt=""
                className="w-auto object-contain"
                style={{ height: cqh(layout.sizes.logo), maxWidth: cqw(layout.sizes.logo * 2.55) }}
              />
            ) : (
              <span
                className="block rounded-full bg-white/20"
                style={{ width: cqh(layout.sizes.logo * 0.36), height: cqh(layout.sizes.logo * 0.36) }}
              />
            )}
          </Placed>
        ) : null}

        {greet ? (
          <Placed x={layout.slots.name.x} y={layout.slots.name.y} className={split ? "max-w-[34%]" : "max-w-[70%]"}>
            {split ? (
              <h1 key={`${locale}-${greet.name}`} className="welcome-copy leading-[1.12] font-medium">
                <span
                  className="block italic font-normal"
                  style={{ color: layout.colors.slogan, fontSize: cqw(layout.sizes.name * 0.78) }}
                >
                  {greet.greeting}
                </span>
                <span className="mt-[0.06em] block italic" style={{ color: layout.colors.name, fontSize: cqw(layout.sizes.name) }}>
                  {greet.name}
                </span>
              </h1>
            ) : (
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
            )}
          </Placed>
        ) : null}

        {layout.slots.slogan.visible !== false && layout.slogan.trim() ? (
          <Placed x={layout.slots.slogan.x} y={layout.slots.slogan.y} className={split ? "max-w-[32%]" : "max-w-[62%]"}>
            <p
              className={`welcome-copy leading-snug ${split ? "italic" : ""}`}
              style={{ color: layout.colors.slogan, fontSize: cqw(layout.sizes.slogan) }}
            >
              {layout.slogan}
            </p>
          </Placed>
        ) : null}

        {layout.slots.message.visible !== false && (lead || wish) ? (
          <Placed x={layout.slots.message.x} y={layout.slots.message.y} className={split ? "max-w-[32%]" : "max-w-[58%]"}>
            <p
              key={`${locale}-${lead}-${wish}`}
              className="welcome-copy leading-relaxed"
              style={{ color: layout.colors.muted, fontSize: cqw(layout.sizes.message) }}
            >
              {lead ? <span className="block">{lead}</span> : null}
              {wish ? <span className={`block ${lead ? "mt-[0.4cqw]" : ""}`}>{wish}</span> : null}
            </p>
          </Placed>
        ) : null}

        <Placed x={layout.slots.room.x} y={layout.slots.room.y}>
          <p className="tracking-[0.16em] uppercase" style={{ color: layout.colors.muted, fontSize: cqw(layout.sizes.room) }}>
            {screen.room.code}
          </p>
        </Placed>

        <WifiCorner
          wifi={screen.hotel.wifi}
          locale={locale}
          ssidSize={layout.sizes.wifi}
          passwordSize={layout.sizes.wifiPassword}
          left={split ? SPLIT_PANEL.width + 2.4 : 4.2}
        />

        {split ? (
          <div className="absolute bottom-[4.6%] left-0 flex justify-center" style={{ width: `${SPLIT_PANEL.width}%` }}>
            <LanguageToggle locale={locale} onPick={pick} variant="pills" className="flex justify-center gap-[0.7cqw]" />
          </div>
        ) : (
          <div className="absolute bottom-[4.2%] left-1/2 -translate-x-1/2">
            <LanguageToggle locale={locale} onPick={pick} className="flex justify-center gap-10" />
          </div>
        )}
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
  ssidSize,
  passwordSize,
  left,
}: {
  wifi: ScreenData["hotel"]["wifi"];
  locale: UiLocale;
  ssidSize: number;
  passwordSize: number;
  left: number;
}) {
  if (!wifi?.ssid) return null;
  return (
    <div
      className="absolute bottom-[4.2%] flex max-w-[42%] items-start gap-[0.7cqw] text-white drop-shadow-[0_1px_8px_rgb(0_0_0/0.45)]"
      style={{ left: `${left}%` }}
    >
      <WifiHigh
        size={22}
        weight="regular"
        className="mt-[0.2cqw] shrink-0 text-white/90"
        style={{ width: cqw(ssidSize * 1.38), height: cqw(ssidSize * 1.38) }}
      />
      <div className="min-w-0">
        <p className="truncate font-medium tracking-wide" style={{ fontSize: cqw(ssidSize) }}>
          {wifi.ssid}
        </p>
        {wifi.password ? (
          <p className="mt-[0.2cqw] text-white/80" style={{ fontSize: cqw(passwordSize) }}>
            <span className="text-white/55">{wifiPasswordLabel(locale)}</span>
            <span className="ml-[0.5cqw] tabular-nums tracking-[0.06em]">{wifi.password}</span>
          </p>
        ) : null}
      </div>
    </div>
  );
}
