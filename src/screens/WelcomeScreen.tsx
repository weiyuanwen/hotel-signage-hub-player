import { useEffect, useState } from "react";
import type { ScreenData } from "../lib/api";
import { OccupiedWelcome } from "../templates/OccupiedWelcome";
import { VacantWelcome } from "../templates/VacantWelcome";

type Props = {
  screen: ScreenData;
  justPaired?: boolean;
};

export function WelcomeScreen({ screen, justPaired = false }: Props) {
  const guest = screen.guest;
  const templateKey = guest ? (screen.template?.key ?? "dusk") : null;
  const [visible, setVisible] = useState(true);
  const [shownKey, setShownKey] = useState(templateKey);

  useEffect(() => {
    if (!guest) {
      setShownKey(null);
      setVisible(true);
      return;
    }
    if (shownKey === null) {
      setShownKey(templateKey);
      setVisible(true);
      return;
    }
    if (templateKey === shownKey) {
      setVisible(true);
      return;
    }
    setVisible(false);
    const id = window.setTimeout(() => {
      setShownKey(templateKey);
      setVisible(true);
    }, 280);
    return () => window.clearTimeout(id);
  }, [guest, templateKey, shownKey]);

  return (
    <main className="relative isolate flex min-h-[100dvh] flex-col overflow-hidden">
      {justPaired ? (
        <p className="relative z-10 bg-primary px-10 py-3 text-sm text-bg md:px-20" role="status">
          Đã ghép với phòng {screen.room.code}. Mọi TV trong phòng này hiện cùng nội dung.
        </p>
      ) : null}
      <div
        className="relative flex flex-1 flex-col transition-opacity duration-[280ms] ease-out"
        style={{ opacity: visible ? 1 : 0 }}
      >
        {guest && (shownKey ?? templateKey) ? (
          <OccupiedWelcome
            templateKey={shownKey ?? templateKey!}
            hotel={screen.hotel}
            room={screen.room}
            guest={guest}
          />
        ) : (
          <VacantWelcome screen={screen} />
        )}
      </div>
    </main>
  );
}
