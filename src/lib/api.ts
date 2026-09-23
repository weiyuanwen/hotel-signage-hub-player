export function apiBase(): string {
  if (import.meta.env.PROD) {
    return "/api";
  }
  return (import.meta.env.VITE_API_URL?.trim() || "http://hubback.test/api").replace(/\/$/, "");
}

export class ApiError extends Error {
  constructor(
    public status: number,
    public body: unknown,
  ) {
    super(
      typeof body === "object" && body && "message" in body
        ? String((body as { message: string }).message)
        : `HTTP ${status}`,
    );
  }
}

export async function deviceFetch<T>(
  path: string,
  init: RequestInit = {},
  token?: string | null,
): Promise<{ data: T; etag: string | null; status: number }> {
  const headers = new Headers(init.headers);
  headers.set("Accept", "application/json");
  if (init.body && !(init.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }
  if (token) headers.set("Authorization", `Bearer ${token}`);

  const res = await fetch(`${apiBase()}${path}`, { ...init, headers });
  const etag = res.headers.get("ETag");

  if (res.status === 304) {
    return { data: undefined as T, etag, status: 304 };
  }

  const body = res.status === 204 ? {} : await res.json().catch(() => ({}));
  if (!res.ok) throw new ApiError(res.status, body);
  return { data: body as T, etag, status: res.status };
}

export type PairingPending = { status: "pending" };
export type PairingClaimed = {
  status: "paired";
  token?: string;
  device_id: number;
  hotel_id: number;
  room_id: number;
};

export type ScreenData = {
  hotel: {
    id: number;
    name: string;
    timezone?: string;
    default_locale: string;
    logo_url: string | null;
    wifi?: { ssid: string; password: string | null } | null;
  };
  room: {
    id: number;
    code: string;
    kind: "guest" | "public";
    content_revision: number;
  };
  guest: {
    display_name: string;
    message: string | null;
    locale: string;
  } | null;
  template: { key: string; mode?: "look" | "video"; layout?: import("./welcomeLayout").WelcomeLayout | null } | null;
  media: {
    background_url: string | null;
    kind?: "image" | "video" | null;
  };
  weather?: {
    key: string;
    label: string;
    latitude: number;
    longitude: number;
    celsius?: number;
    code?: number;
  } | null;
};
