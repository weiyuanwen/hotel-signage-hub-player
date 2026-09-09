import { DuskWelcome } from "./DuskWelcome";
import { GardenWelcome } from "./GardenWelcome";
import { HarborWelcome } from "./HarborWelcome";
import { LinenWelcome } from "./LinenWelcome";
import { StoneWelcome } from "./StoneWelcome";
import type { OccupiedProps } from "./types";

const SCENES = {
  dusk: DuskWelcome,
  linen: LinenWelcome,
  harbor: HarborWelcome,
  garden: GardenWelcome,
  stone: StoneWelcome,
} as const;

export function OccupiedWelcome({ templateKey, ...props }: OccupiedProps & { templateKey: string }) {
  const Scene = SCENES[templateKey as keyof typeof SCENES] ?? DuskWelcome;
  return <Scene {...props} />;
}
