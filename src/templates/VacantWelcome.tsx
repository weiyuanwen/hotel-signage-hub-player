import type { ScreenData } from "../lib/api";
import { HospitalityWelcome } from "../welcome/HospitalityWelcome";

export function VacantWelcome({ screen }: { screen: ScreenData }) {
  return <HospitalityWelcome screen={screen} templateKey="dusk" />;
}
