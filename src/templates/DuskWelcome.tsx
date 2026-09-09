import { useEffect, useState } from "react";
import { NAME_CLASS, type OccupiedProps } from "./types";

export function DuskWelcome({ hotel, room, guest }: OccupiedProps) {
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const id = requestAnimationFrame(() => setInView(true));
    return () => cancelAnimationFrame(id);
  }, []);

  return (
    <div
      data-template="dusk"
      className="relative flex min-h-[100dvh] flex-1 flex-col justify-between px-10 py-12 md:px-20"
      style={{ background: "oklch(0.10 0 0)", color: "oklch(0.94 0.012 110)" }}
    >
      <div className="flex items-center gap-4">
        {hotel.logo_url ? <img src={hotel.logo_url} alt="" className="h-10 w-auto" /> : null}
        <p className="text-sm" style={{ color: "oklch(0.68 0.02 110)" }}>
          {hotel.name}
        </p>
      </div>
      <div className="max-w-[18ch]">
        <p
          className={`${NAME_CLASS} transition-[opacity,transform] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
            inView ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0"
          }`}
          style={{ color: "oklch(0.78 0.11 110)" }}
        >
          {guest.display_name}
        </p>
        {guest.message ? <p className="mt-6 max-w-[36ch] text-xl md:text-2xl">{guest.message}</p> : null}
      </div>
      <p className="text-sm tracking-[0.18em] uppercase" style={{ color: "oklch(0.62 0.07 230)" }}>
        {room.code}
      </p>
    </div>
  );
}
