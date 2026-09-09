import type { ScreenData } from "../lib/api";
import { NAME_CLASS } from "./types";

export function VacantWelcome({ screen }: { screen: ScreenData }) {
  const bg = screen.media.background_url;

  return (
    <div className="relative flex min-h-[100dvh] flex-1 flex-col overflow-hidden">
      {bg ? <img src={bg} alt="" className="absolute inset-0 size-full object-cover" /> : null}
      <div className={`absolute inset-0 ${bg ? "bg-bg/80" : "bg-bg"}`} />
      <div className="relative flex flex-1 flex-col justify-between px-10 py-12 md:px-20">
        <div className="flex items-center gap-4">
          {screen.hotel.logo_url ? (
            <img src={screen.hotel.logo_url} alt="" className="h-10 w-auto" />
          ) : null}
          <p className="text-sm text-muted">{screen.hotel.name}</p>
        </div>
        <div className="max-w-[18ch]">
          <p className={`${NAME_CLASS} text-ink`}>{screen.hotel.name}</p>
          <p className="mt-6 text-xl text-muted">Chào mừng quý khách</p>
        </div>
        <p className="text-sm tracking-[0.18em] text-accent uppercase">{screen.room.code}</p>
      </div>
    </div>
  );
}
