import { useEffect, useState } from "react";
import { NAME_CLASS, type OccupiedProps } from "./types";

export function StoneWelcome({ hotel, room, guest }: OccupiedProps) {
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const id = requestAnimationFrame(() => setInView(true));
    return () => cancelAnimationFrame(id);
  }, []);

  return (
    <div
      data-template="stone"
      className="relative flex min-h-[100dvh] flex-1 flex-col px-10 py-12 md:px-20"
      style={{ background: "oklch(0.11 0.012 55)", color: "oklch(0.93 0.02 80)" }}
    >
      <div className="flex items-center gap-4">
        {hotel.logo_url ? <img src={hotel.logo_url} alt="" className="h-10 w-auto" /> : null}
        <p className="text-sm" style={{ color: "oklch(0.66 0.02 55)" }}>
          {hotel.name}
        </p>
      </div>
      <div
        className={`absolute inset-x-0 bottom-0 flex h-[32%] items-end justify-between gap-6 px-10 py-12 transition-transform duration-[600ms] ease-[cubic-bezier(0.22,1,0.36,1)] md:px-20 ${
          inView ? "translate-y-0" : "translate-y-5"
        }`}
        style={{ background: "oklch(0.15 0.016 55)" }}
      >
        <div>
          <p className={NAME_CLASS} style={{ color: "oklch(0.91 0.025 85)" }}>
            {guest.display_name}
          </p>
          {guest.message ? <p className="mt-4 max-w-[36ch] text-xl md:text-2xl">{guest.message}</p> : null}
        </div>
        <p className="text-sm tracking-[0.18em] uppercase" style={{ color: "oklch(0.72 0.08 75)" }}>
          {room.code}
        </p>
      </div>
    </div>
  );
}
