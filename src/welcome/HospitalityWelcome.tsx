import { Sparkle, WifiHigh } from "@phosphor-icons/react";
import { useEffect } from "react";
import type { ScreenData } from "../lib/api";
import { headline, thanks, vacantBody, vacantTitle, wifiPasswordLabel, type UiLocale } from "./copy";
import { LanguageToggle } from "./LanguageToggle";
import { ClockWidget, WeatherWidget } from "./Widgets";
import { useLocaleCycle } from "./useLocaleCycle";
import { useWeather } from "./useWeather";
import { embedSrc, parseVideoUrl } from "./videoSource";

const FALLBACK_GROUNDS =
  "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1920&q=80";

const OVERLAY: Record<string, string> = {
  dusk: "rgb(18 10 4 / 0.32)",
  linen: "rgb(8 10 14 / 0.28)",
  harbor: "rgb(4 12 22 / 0.34)",
  garden: "rgb(6 14 10 / 0.32)",
  stone: "rgb(16 12 8 / 0.3)",
};

type Props = {
  screen: ScreenData;
  templateKey: string | null;
};

export function HospitalityWelcome({ screen, templateKey }: Props) {
  const guest = screen.guest;
  const timeZone = screen.hotel.timezone || "Asia/Ho_Chi_Minh";
  const { locale, pick } = useLocaleCycle(guest?.locale ?? screen.hotel.default_locale);
  const weather = useWeather(screen.hotel.id, screen.weather ?? null);
  const media = screen.media.background_url;
  const overlay = OVERLAY[templateKey ?? "dusk"] ?? OVERLAY.dusk;

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
        className="relative overflow-hidden"
        style={{
          width: "min(100vw, calc(100dvh * 16 / 9))",
          height: "min(100dvh, calc(100vw * 9 / 16))",
        }}
      >
        <Backdrop src={media} kind={screen.media.kind ?? null} />
        <div className="absolute inset-0 bg-black/25" />
        <div className="absolute inset-0" style={{ background: overlay }} />

        <div className="relative flex h-full flex-col justify-between px-[4.5%] py-[4.2%]">
          <header className="flex items-start justify-between">
            <ClockWidget timeZone={timeZone} locale={locale} />
            <WeatherWidget weather={weather} />
          </header>

          <WelcomeCard
            locale={locale}
            hotel={screen.hotel}
            guest={guest}
            onPick={pick}
          />

          <footer className="flex items-end justify-between gap-6 text-white/80">
            <WifiCorner wifi={screen.hotel.wifi} locale={locale} />
            <p className="shrink-0 text-[clamp(0.7rem,1vw,0.9rem)] tracking-[0.16em] uppercase text-white/55">
              {screen.room.code}
            </p>
          </footer>
        </div>
      </div>
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
  if (!wifi?.ssid) return <span />;

  return (
    <div className="flex min-w-0 items-start gap-2.5 text-left text-white" aria-label={`Wi-Fi ${wifi.ssid}`}>
      <WifiHigh
        size={22}
        weight="regular"
        className="mt-0.5 size-[clamp(1.15rem,1.8vw,1.5rem)] shrink-0 text-white/90"
        aria-hidden
      />
      <div className="min-w-0">
        <p className="truncate text-[clamp(0.85rem,1.4vw,1.2rem)] font-medium tracking-wide">{wifi.ssid}</p>
        {wifi.password ? (
          <p className="mt-0.5 text-[clamp(0.75rem,1.15vw,0.95rem)] leading-snug">
            <span className="text-white/55">{wifiPasswordLabel(locale)}</span>
            <span className="ml-2 tabular-nums tracking-[0.06em] text-white/90">{wifi.password}</span>
          </p>
        ) : null}
      </div>
    </div>
  );
}

function WelcomeCard({
  locale,
  hotel,
  guest,
  onPick,
}: {
  locale: UiLocale;
  hotel: ScreenData["hotel"];
  guest: ScreenData["guest"];
  onPick: (locale: UiLocale) => void;
}) {
  const greet = guest ? headline(locale, guest.display_name) : null;
  const body = guest ? thanks(locale, hotel.name, guest.message) : vacantBody(locale, hotel.name);

  return (
    <section
      className="welcome-glass mx-auto w-[min(86%,52rem)] px-[clamp(1.5rem,4vw,3.25rem)] py-[clamp(1.4rem,3.4vw,2.6rem)] text-center"
      aria-live="polite"
    >
      <div className="flex flex-col items-center gap-3 text-white">
        {hotel.logo_url ? (
          <img
            src={hotel.logo_url}
            alt=""
            className="h-[clamp(4.5rem,9vw,8rem)] w-auto max-w-[min(72%,24rem)] object-contain"
          />
        ) : (
          <Sparkle size={28} weight="fill" className="size-[1.75rem] text-white" aria-hidden />
        )}
        <p className="text-[clamp(0.95rem,1.5vw,1.25rem)] font-medium tracking-wide">{hotel.name}</p>
      </div>

      <h1
        key={`${locale}-${guest ? guest.display_name : hotel.name}`}
        className="welcome-copy mt-5 whitespace-nowrap text-balance font-medium uppercase leading-[1.12] tracking-[-0.03em] text-white text-[clamp(1.2rem,3.2vw,2.45rem)]"
      >
        {greet ? `${greet.greeting} ${greet.name}` : vacantTitle(locale, hotel.name)}
      </h1>

      <p
        key={`${locale}-${body.lead}-${body.wish}`}
        className="welcome-copy mx-auto mt-4 max-w-[46ch] text-[clamp(0.9rem,1.35vw,1.15rem)] leading-relaxed text-white/82"
      >
        <span className="block">{body.lead}</span>
        <span className="mt-1 block">{body.wish}</span>
      </p>

      <LanguageToggle locale={locale} onPick={onPick} />
    </section>
  );
}

function Backdrop({ src, kind }: { src: string | null; kind: "image" | "video" | null }) {
  const url = src ?? FALLBACK_GROUNDS;
  const playback = src ? parseVideoUrl(src) : null;
  const embed = playback ? embedSrc(playback, "background") : null;

  if (embed) {
    return (
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
        <iframe
          src={embed}
          title=""
          className="absolute inset-0 size-full border-0"
          allow="autoplay; encrypted-media; picture-in-picture"
          tabIndex={-1}
        />
      </div>
    );
  }

  if (kind === "video" || playback?.provider === "file" || isVideo(url)) {
    return (
      <video
        className="absolute inset-0 size-full object-cover"
        src={playback?.provider === "file" ? playback.url : url}
        autoPlay
        muted
        loop
        playsInline
        aria-hidden
      />
    );
  }
  return <img src={url} alt="" className="absolute inset-0 size-full object-cover" />;
}

function isVideo(url: string): boolean {
  return /\.(mp4|webm|ogg)(\?|$)/i.test(url);
}
