import type { UiLocale } from "./copy";

type Props = {
  locale: UiLocale;
  onPick: (locale: UiLocale) => void;
  className?: string;
  variant?: "flags" | "pills";
  tone?: "warm" | "glass";
};

export function LanguageToggle({
  locale,
  onPick,
  className = "mt-7 flex items-center justify-center gap-2.5",
  tone = "glass",
}: Props) {
  return (
    <div className={className} role="group" aria-label="Language">
      <PillButton id="lang-vi" label="Tiếng Việt" active={locale === "vi"} tone={tone} onPick={() => onPick("vi")} />
      <PillButton id="lang-en" label="English" active={locale === "en"} tone={tone} onPick={() => onPick("en")} />
    </div>
  );
}

function PillButton({
  id,
  label,
  active,
  tone,
  onPick,
}: {
  id: string;
  label: string;
  active: boolean;
  tone: "warm" | "glass";
  onPick: () => void;
}) {
  const styles =
    tone === "warm"
      ? active
        ? "border-[#d4b07a] bg-[#d4b07a] text-[#1c1814]"
        : "border-[#c4b8a6]/40 bg-transparent text-[#e8dfd0] hover:border-[#c4b8a6]/70"
      : active
        ? "border-white bg-white text-[#12161c] shadow-sm"
        : "border-white/30 bg-black/25 text-white/85 backdrop-blur-sm hover:border-white/55";

  return (
    <button
      id={id}
      type="button"
      aria-label={label}
      aria-pressed={active}
      onClick={onPick}
      className={`rounded-full border px-[clamp(0.75rem,1.25vw,1.1rem)] py-[clamp(0.28rem,0.42vw,0.42rem)] text-[clamp(0.72rem,1vw,0.92rem)] font-medium tracking-[0.03em] outline-none transition-colors focus-visible:ring-2 focus-visible:ring-white/80 ${styles}`}
    >
      {label}
    </button>
  );
}
