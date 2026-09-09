import { useEffect, useState } from "react";
import { NAME_CLASS, type OccupiedProps } from "./types";

export function LinenWelcome({ hotel, room, guest }: OccupiedProps) {
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const id = requestAnimationFrame(() => setInView(true));
    return () => cancelAnimationFrame(id);
  }, []);

  return (
    <div
      data-template="linen"
      className="flex min-h-[100dvh] flex-1 flex-col items-center justify-between px-10 py-12 text-center md:px-20"
      style={{ background: "oklch(0.97 0.012 85)", color: "oklch(0.28 0.035 55)" }}
    >
      <div className="flex flex-col items-center gap-4">
        {hotel.logo_url ? <img src={hotel.logo_url} alt="" className="h-10 w-auto" /> : null}
        <p className="text-sm" style={{ color: "oklch(0.48 0.02 55)" }}>
          {hotel.name}
        </p>
        <div className="h-0 w-12 border-t" style={{ borderColor: "oklch(0.82 0.03 75)" }} />
      </div>
      <div>
        <p
          className={`${NAME_CLASS} transition-opacity duration-[400ms] ${inView ? "opacity-100" : "opacity-0"}`}
          style={{ color: "oklch(0.38 0.08 45)" }}
        >
          {guest.display_name}
        </p>
        {guest.message ? (
          <p className="mt-6 max-w-[36ch] text-xl md:text-2xl" style={{ color: "oklch(0.28 0.035 55)" }}>
            {guest.message}
          </p>
        ) : null}
      </div>
      <p className="text-sm tracking-[0.18em] uppercase" style={{ color: "oklch(0.48 0.02 55)" }}>
        {room.code}
      </p>
    </div>
  );
}
