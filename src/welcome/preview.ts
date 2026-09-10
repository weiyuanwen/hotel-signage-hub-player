import type { ScreenData } from "../lib/api";

const hotel = {
  id: 1,
  name: "Saigon Pearl",
  timezone: "Asia/Ho_Chi_Minh",
  default_locale: "vi",
  logo_url: null as string | null,
  wifi: { ssid: "SaigonPearl-Guest", password: "pearl2026" },
};

const room = {
  id: 1,
  code: "101",
  kind: "guest" as const,
  content_revision: 1,
};

export function previewFromQuery(): ScreenData | null {
  const params = new URLSearchParams(window.location.search);
  const mode = params.get("preview");
  if (!mode) return null;

  const video = params.get("video");
  const media =
    video === "file"
      ? {
          background_url: "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4",
          kind: "video" as const,
        }
      : video === "youtube"
        ? {
            background_url: "https://www.youtube.com/watch?v=jfKfPfyJRdk",
            kind: "video" as const,
          }
        : { background_url: null as string | null, kind: null };

  if (mode === "vacant") {
    return {
      hotel,
      room,
      guest: null,
      template: null,
      media,
      weather: {
        key: "ho-chi-minh",
        label: "TP. Hồ Chí Minh",
        latitude: 10.7769,
        longitude: 106.7009,
      },
    };
  }
    return {
      hotel,
      room,
      guest: {
        display_name: "Nguyen Van Duy",
        message: "Cảm ơn quý khách đã chọn Saigon Pearl. Chúc quý khách có những trải nghiệm tuyệt vời.",
        locale: "vi",
      },
      template: { key: mode === "linen" || mode === "harbor" || mode === "garden" || mode === "stone" ? mode : "dusk" },
      media,
      weather: {
        key: "ho-chi-minh",
        label: "TP. Hồ Chí Minh",
        latitude: 10.7769,
        longitude: 106.7009,
      },
    };
}
