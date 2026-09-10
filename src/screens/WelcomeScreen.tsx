import { useEffect, useRef, useState } from "react";
import type { ScreenData } from "../lib/api";
import { normalizeLayout } from "../lib/welcomeLayout";
import { HospitalityWelcome } from "../welcome/HospitalityWelcome";
import { LayoutWelcome } from "../welcome/LayoutWelcome";

type Props = {
  screen: ScreenData;
  justPaired?: boolean;
};

export function WelcomeScreen({ screen, justPaired = false }: Props) {
  const signature = screenSignature(screen);
  const [visible, setVisible] = useState(true);
  const [shown, setShown] = useState(screen);
  const shownRef = useRef(screen);

  useEffect(() => {
    if (screenSignature(shownRef.current) === signature) {
      shownRef.current = screen;
      setShown(screen);
      setVisible(true);
      return;
    }
    setVisible(false);
    const id = window.setTimeout(() => {
      shownRef.current = screen;
      setShown(screen);
      setVisible(true);
    }, 280);
    return () => window.clearTimeout(id);
  }, [screen, signature]);

  const templateKey = shown.guest ? (shown.template?.key ?? "dusk") : "dusk";
  const useLook =
    Boolean(shown.guest) &&
    shown.template?.mode !== "video" &&
    shown.media.kind !== "video" &&
    shown.template?.layout != null;
  const occupiedLayout = useLook ? normalizeLayout(shown.template?.layout, templateKey) : null;

  return (
    <main className="relative isolate overflow-hidden">
      {justPaired ? (
        <p className="absolute top-0 z-20 w-full bg-primary px-10 py-3 text-sm text-bg" role="status">
          Đã ghép với phòng {shown.room.code}. Mọi TV trong phòng này hiện cùng nội dung.
        </p>
      ) : null}
      <div
        className="transition-opacity duration-[280ms] ease-out"
        style={{ opacity: visible ? 1 : 0 }}
      >
        {shown.guest && occupiedLayout ? (
          <LayoutWelcome screen={shown} layout={occupiedLayout} />
        ) : (
          <HospitalityWelcome screen={shown} templateKey={templateKey} />
        )}
      </div>
    </main>
  );
}

function screenSignature(screen: ScreenData): string {
  return [
    screen.guest?.display_name ?? "",
    screen.guest?.message ?? "",
    screen.guest ? (screen.template?.key ?? "dusk") : "vacant",
    screen.media.background_url ?? "",
    JSON.stringify(screen.template?.layout ?? null),
    screen.template?.mode ?? "",
    screen.media.kind ?? "",
  ].join("|");
}
