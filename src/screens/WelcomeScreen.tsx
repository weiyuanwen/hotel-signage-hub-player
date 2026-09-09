import type { ScreenData } from "../lib/api";

type Props = {
  screen: ScreenData;
  justPaired?: boolean;
};

export function WelcomeScreen({ screen, justPaired = false }: Props) {
  const guest = screen.guest;
  const bg = screen.media.background_url;

  return (
    <main className="relative isolate flex min-h-[100dvh] flex-col overflow-hidden">
      {bg ? (
        <img
          src={bg}
          alt=""
          className="absolute inset-0 size-full object-cover"
        />
      ) : null}
      <div className={`absolute inset-0 ${bg ? "bg-bg/80" : "bg-bg"}`} />
      {justPaired ? (
        <p
          className="relative bg-primary px-10 py-3 text-sm text-bg md:px-20"
          role="status"
        >
          Đã ghép với phòng {screen.room.code}. Mọi TV trong phòng này hiện cùng nội dung.
        </p>
      ) : null}
      <div className="relative flex flex-1 flex-col justify-between px-10 py-12 md:px-20">
        <div className="flex items-center gap-4">
          {screen.hotel.logo_url ? (
            <img src={screen.hotel.logo_url} alt="" className="h-10 w-auto" />
          ) : null}
          <p className="text-sm text-muted">{screen.hotel.name}</p>
        </div>
        <div className="max-w-[18ch]">
          {guest ? (
            <>
              <p className="text-balance font-medium text-[clamp(2.75rem,8vw,6.5rem)] leading-[1.05] tracking-[-0.03em] text-primary">
                {guest.display_name}
              </p>
              {guest.message ? (
                <p className="mt-6 max-w-[36ch] text-xl text-ink md:text-2xl">{guest.message}</p>
              ) : null}
            </>
          ) : (
            <>
              <p className="text-balance font-medium text-[clamp(2.75rem,8vw,6.5rem)] leading-[1.05] tracking-[-0.03em] text-ink">
                {screen.hotel.name}
              </p>
              <p className="mt-6 text-xl text-muted">Chào mừng quý khách</p>
            </>
          )}
        </div>
        <p className="text-sm tracking-[0.18em] text-accent uppercase">{screen.room.code}</p>
      </div>
    </main>
  );
}
