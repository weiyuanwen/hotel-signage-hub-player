import { useEffect, useState } from "react";
import { NAME_CLASS, type OccupiedProps } from "./types";

export function GardenWelcome({ hotel, room, guest }: OccupiedProps) {
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const id = requestAnimationFrame(() => setInView(true));
    return () => cancelAnimationFrame(id);
  }, []);

  return (
    <div
      data-template="garden"
      className="relative flex min-h-[100dvh] flex-1 flex-col justify-between px-10 py-12 md:px-20"
      style={{
        background: "linear-gradient(180deg, oklch(0.93 0.022 140), oklch(0.90 0.028 150))",
        color: "oklch(0.32 0.04 55)",
      }}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          {hotel.logo_url ? <img src={hotel.logo_url} alt="" className="h-10 w-auto" /> : null}
          <p className="text-sm" style={{ color: "oklch(0.45 0.03 145)" }}>
            {hotel.name}
          </p>
        </div>
        <p className="text-sm tracking-[0.18em] uppercase" style={{ color: "oklch(0.45 0.03 145)" }}>
          {room.code}
        </p>
      </div>
      <p
        className={`${NAME_CLASS} max-w-[18ch] transition-opacity duration-500 ${inView ? "opacity-100" : "opacity-0"}`}
        style={{ color: "oklch(0.34 0.07 145)" }}
      >
        {guest.display_name}
      </p>
      {guest.message ? (
        <p
          className={`max-w-[36ch] self-end text-xl transition-opacity delay-[120ms] duration-500 md:text-2xl ${
            inView ? "opacity-100" : "opacity-0"
          }`}
        >
          {guest.message}
        </p>
      ) : (
        <span />
      )}
    </div>
  );
}
