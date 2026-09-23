import type { ReactNode } from "react";
import type { UiLocale } from "./copy";

type Props = {
  locale: UiLocale;
  onPick: (locale: UiLocale) => void;
  className?: string;
  variant?: "flags" | "pills";
};

export function LanguageToggle({
  locale,
  onPick,
  className = "mt-8 flex justify-center gap-10",
  variant = "flags",
}: Props) {
  return (
    <div className={className} role="group" aria-label="Language">
      {variant === "pills" ? (
        <>
          <PillButton id="lang-vi" label="Tiếng Việt" active={locale === "vi"} onPick={() => onPick("vi")} />
          <PillButton id="lang-en" label="English" active={locale === "en"} onPick={() => onPick("en")} />
        </>
      ) : (
        <>
          <LangButton id="lang-vi" label="Tiếng Việt" active={locale === "vi"} onPick={() => onPick("vi")}>
            <FlagVn />
          </LangButton>
          <LangButton id="lang-en" label="English" active={locale === "en"} onPick={() => onPick("en")}>
            <FlagGb />
          </LangButton>
        </>
      )}
    </div>
  );
}

function PillButton({
  id,
  label,
  active,
  onPick,
}: {
  id: string;
  label: string;
  active: boolean;
  onPick: () => void;
}) {
  return (
    <button
      id={id}
      type="button"
      aria-label={label}
      aria-pressed={active}
      onClick={onPick}
      className={`rounded-full border px-[1.35cqw] py-[0.42cqw] text-[1.05cqw] tracking-[0.04em] outline-none transition-colors focus-visible:ring-2 focus-visible:ring-[#d4b07a]/80 ${
        active
          ? "border-[#d4b07a] bg-[#d4b07a] text-[#1c1814]"
          : "border-[#c4b8a6]/40 bg-transparent text-[#e8dfd0]"
      }`}
    >
      {label}
    </button>
  );
}

function LangButton({
  id,
  label,
  active,
  onPick,
  children,
}: {
  id: string;
  label: string;
  active: boolean;
  onPick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      id={id}
      type="button"
      aria-label={label}
      aria-pressed={active}
      onClick={onPick}
      className="flex flex-col items-center gap-2 rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-white/80"
    >
      <span className="block h-8 w-[2.85rem] overflow-hidden rounded-[2px] shadow-[0_1px_8px_rgb(0_0_0/0.35)]">
        {children}
      </span>
      <span className={`h-[3px] w-8 rounded-full ${active ? "bg-white" : "bg-transparent"}`} />
    </button>
  );
}

function FlagVn() {
  return (
    <svg viewBox="0 0 36 24" className="size-full" aria-hidden>
      <rect width="36" height="24" fill="#da251d" />
      <polygon
        fill="#ff0"
        points="18,4.2 19.9,10 26,10 21,13.6 22.9,19.4 18,15.8 13.1,19.4 15,13.6 10,10 16.1,10"
      />
    </svg>
  );
}

function FlagGb() {
  return (
    <svg viewBox="0 0 36 24" className="size-full" aria-hidden>
      <rect width="36" height="24" fill="#012169" />
      <path d="M0 0 L36 24 M36 0 L0 24" stroke="#fff" strokeWidth="5" />
      <path d="M0 0 L36 24 M36 0 L0 24" stroke="#c8102e" strokeWidth="2.2" />
      <path d="M18 0 V24 M0 12 H36" stroke="#fff" strokeWidth="8" />
      <path d="M18 0 V24 M0 12 H36" stroke="#c8102e" strokeWidth="4.4" />
    </svg>
  );
}
