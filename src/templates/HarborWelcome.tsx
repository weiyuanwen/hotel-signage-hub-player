import { useEffect, useState } from "react";
import { NAME_CLASS, type OccupiedProps } from "./types";

export function HarborWelcome({ hotel, room, guest }: OccupiedProps) {
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const id = requestAnimationFrame(() => setInView(true));
    return () => cancelAnimationFrame(id);
  }, []);

  return (
    <div
      data-template="harbor"
      className="grid min-h-[100dvh] flex-1 grid-cols-[42%_1fr]"
      style={{ background: "oklch(0.16 0.028 230)", color: "oklch(0.93 0.015 95)" }}
    >
      <div
        className={`flex flex-col justify-between px-10 py-12 transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] md:px-16 ${
          inView ? "translate-x-0" : "-translate-x-4"
        }`}
        style={{ background: "oklch(0.12 0.032 230)" }}
      >
        <p className="text-sm" style={{ color: "oklch(0.72 0.03 220)" }}>
          {hotel.name}
        </p>
        <p
          className={`${NAME_CLASS} transition-opacity duration-500 ${inView ? "opacity-100" : "opacity-0"}`}
          style={{ color: "oklch(0.88 0.04 95)" }}
        >
          {guest.display_name}
        </p>
        <span />
      </div>
      <div className="flex flex-col justify-between px-10 py-12 md:px-16">
        {hotel.logo_url ? <img src={hotel.logo_url} alt="" className="h-10 w-auto" /> : <span />}
        {guest.message ? <p className="max-w-[36ch] text-xl md:text-2xl">{guest.message}</p> : <span />}
        <p className="text-sm tracking-[0.18em] uppercase" style={{ color: "oklch(0.70 0.06 200)" }}>
          {room.code}
        </p>
      </div>
    </div>
  );
}
