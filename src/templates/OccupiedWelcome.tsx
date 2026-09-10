import type { OccupiedProps } from "./types";
import { HospitalityWelcome } from "../welcome/HospitalityWelcome";
import type { ScreenData } from "../lib/api";

export function OccupiedWelcome({
  templateKey,
  hotel,
  room,
  guest,
  media,
}: OccupiedProps & { templateKey: string; media: ScreenData["media"] }) {
  return (
    <HospitalityWelcome
      templateKey={templateKey}
      screen={{
        hotel,
        room,
        guest,
        template: { key: templateKey },
        media,
      }}
    />
  );
}
