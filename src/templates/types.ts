import type { ScreenData } from "../lib/api";

export type OccupiedProps = {
  hotel: ScreenData["hotel"];
  room: ScreenData["room"];
  guest: NonNullable<ScreenData["guest"]>;
};

export const NAME_CLASS =
  "text-balance font-medium text-[clamp(2.75rem,8vw,6.5rem)] leading-[1.05] tracking-[-0.03em]";
