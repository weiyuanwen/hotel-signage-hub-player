import { useCallback, useEffect, useRef, useState } from "react";
import {
  ApiError,
  deviceFetch,
  type PairingClaimed,
  type PairingPending,
  type ScreenData,
} from "./lib/api";
import { createEcho } from "./lib/echo";
import {
  clearPendingPin,
  clearSession,
  getMeta,
  getPendingPin,
  getToken,
  persistPairing,
  persistPendingPin,
  persistMeta,
  type DeviceMeta,
} from "./lib/session";
import { PairingScreen } from "./screens/PairingScreen";
import { WelcomeScreen } from "./screens/WelcomeScreen";
import { readScreenCache, writeScreenCache } from "./lib/screenCache";
import { previewFromQuery } from "./welcome/preview";

type PairingState = {
  code: string;
  expiresAt: string;
};

function pairTokenFromLocation(): string | null {
  const token = new URLSearchParams(window.location.search).get("pair")?.trim();
  return token || null;
}

function clearPairQuery() {
  const url = new URL(window.location.href);
  if (!url.searchParams.has("pair")) return;
  url.searchParams.delete("pair");
  window.history.replaceState({}, "", url.pathname + url.search + url.hash);
}

export function App() {
  const [pairing, setPairing] = useState<PairingState | null>(null);
  const [pairingMode, setPairingMode] = useState<"pin" | "link">("pin");
  const [screen, setScreen] = useState<ScreenData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [paired, setPaired] = useState(() => Boolean(getToken()));
  const [justPaired, setJustPaired] = useState(false);
  const tokenRef = useRef<string | null>(getToken());
  const metaRef = useRef<DeviceMeta | null>(getMeta());
  const revisionRef = useRef<string | null>(null);
  const echoRef = useRef<ReturnType<typeof createEcho> | null>(null);
  const requestingPin = useRef(false);

  const loadScreen = useCallback(async () => {
    const token = tokenRef.current;
    if (!token) return;
    const headers: HeadersInit = {};
    if (revisionRef.current) headers["If-None-Match"] = revisionRef.current;
    try {
      const res = await deviceFetch<ScreenData>("/device/screen", { headers }, token);
      if (res.status === 304) return;
      setScreen(res.data);
      writeScreenCache(res.data);
      setError(null);
      if (res.etag) revisionRef.current = res.etag;
      if (metaRef.current) {
        const next = { ...metaRef.current, hotelId: res.data.hotel.id, roomId: res.data.room.id };
        metaRef.current = next;
        persistMeta(next);
      }
    } catch (err) {
      if (err instanceof ApiError && (err.status === 401 || err.status === 403)) {
        clearSession();
        tokenRef.current = null;
        metaRef.current = null;
        setPaired(false);
        setScreen(null);
        void requestPin();
        return;
      }
      const cached = readScreenCache();
      if (cached) {
        setScreen(cached);
      }
      setError("Không tải được nội dung. Đang giữ màn hình trước.");
    }
  }, []);

  const applyClaim = useCallback(
    async (claimed: PairingClaimed) => {
      if (!claimed.token) return;
      const meta = {
        deviceId: claimed.device_id,
        hotelId: claimed.hotel_id,
        roomId: claimed.room_id,
      };
      persistPairing(claimed.token, meta);
      tokenRef.current = claimed.token;
      metaRef.current = meta;
      setPaired(true);
      setJustPaired(true);
      setPairing(null);
      setPairingMode("pin");
      await loadScreen();
    },
    [loadScreen],
  );

  const requestPin = useCallback(async () => {
    const existing = getPendingPin();
    if (existing) {
      setPairing(existing);
      setError(null);
      return;
    }
    if (requestingPin.current) return;
    requestingPin.current = true;
    try {
      const res = await deviceFetch<{ code: string; expires_at: string }>("/device/pairing-codes", {
        method: "POST",
        body: JSON.stringify({ name: "TV Player" }),
      });
      const next = { code: res.data.code, expiresAt: res.data.expires_at };
      persistPendingPin(next);
      setPairing(next);
      setError(null);
    } catch (err) {
      if (err instanceof ApiError && err.status === 429) {
        setError("Xin PIN quá nhanh. Đợi khoảng một phút rồi tải lại.");
        return;
      }
      setError("Không xin được mã PIN. Kiểm tra kết nối backend.");
    } finally {
      requestingPin.current = false;
    }
  }, []);

  const consumePairLink = useCallback(
    async (token: string) => {
      setPairingMode("link");
      setError(null);
      try {
        const res = await deviceFetch<PairingClaimed>(`/device/pairing-links/${token}`, {
          method: "POST",
        });
        clearPairQuery();
        await applyClaim(res.data);
      } catch {
        clearPairQuery();
        setPairingMode("pin");
        setError("Link ghép không còn hiệu lực. Đang xin mã PIN.");
        await requestPin();
      }
    },
    [applyClaim, requestPin],
  );

  useEffect(() => {
    if (previewFromQuery()) return;
    if (tokenRef.current) {
      const cached = readScreenCache();
      if (cached) setScreen(cached);
      void loadScreen();
      return;
    }
    const pair = pairTokenFromLocation();
    if (pair) {
      void consumePairLink(pair);
      return;
    }
    void requestPin();
    // Mount-only: PIN / session bootstrap.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!pairing || tokenRef.current) return;

    const poll = window.setInterval(async () => {
      if (new Date(pairing.expiresAt).getTime() <= Date.now()) {
        await requestPin();
        return;
      }
      try {
        const res = await deviceFetch<PairingPending | PairingClaimed>(
          `/device/pairing-codes/${pairing.code}`,
        );
        if (res.status === 202 || res.data.status !== "paired") return;
        await applyClaim(res.data);
      } catch (err) {
        if (err instanceof ApiError && err.status === 422) {
          clearPendingPin();
          await requestPin();
        }
      }
    }, 2000);

    return () => window.clearInterval(poll);
  }, [pairing, loadScreen, requestPin, applyClaim]);

  useEffect(() => {
    const token = tokenRef.current;
    if (!token || !screen) return;

    async function beat() {
      try {
        const res = await deviceFetch<{ content_revision?: number }>("/device/heartbeat", { method: "POST" }, token);
        const revision = res.data.content_revision;
        if (revision != null && String(revision) !== revisionRef.current) {
          revisionRef.current = null;
          await loadScreen();
        }
      } catch {
        /* keep last frame */
      }
    }

    const id = window.setInterval(() => {
      void beat();
    }, 3000);
    void beat();

    return () => window.clearInterval(id);
  }, [screen, loadScreen]);

  useEffect(() => {
    const token = tokenRef.current;
    const meta = metaRef.current;
    if (!token || !meta || !screen) return;

    const echo = createEcho(token);
    echoRef.current = echo;
    echo
      .private(`room.${meta.hotelId}.${meta.roomId}`)
      .listen(".content.updated", (payload: { hotel_id?: number; room_id?: number }) => {
        if (payload.hotel_id != null && payload.hotel_id !== meta.hotelId) return;
        if (payload.room_id != null && payload.room_id !== meta.roomId) return;
        revisionRef.current = null;
        void loadScreen();
      });
    echo.private(`device.${meta.deviceId}`).listen(".device.command", (payload: { command: string }) => {
      if (payload.command === "reload") {
        void loadScreen();
        return;
      }
      if (payload.command === "unpair") {
        echo.disconnect();
        clearSession();
        tokenRef.current = null;
        metaRef.current = null;
        revisionRef.current = null;
        setPaired(false);
        setScreen(null);
        void requestPin();
      }
    });

    return () => {
      echo.disconnect();
      echoRef.current = null;
    };
  }, [screen?.room.id, requestPin, loadScreen]);

  useEffect(() => {
    if (!justPaired) return;
    const hide = window.setTimeout(() => setJustPaired(false), 6000);
    return () => window.clearTimeout(hide);
  }, [justPaired]);

  const preview = previewFromQuery();
  if (preview) return <WelcomeScreen screen={preview} />;

  if (!paired || !screen) {
    if (paired) {
      return (
        <main className="flex min-h-[100dvh] items-center px-10">
          <p className="text-xl text-muted">{error ?? "Đang tải nội dung phòng."}</p>
        </main>
      );
    }
    return (
      <PairingScreen
        mode={pairingMode}
        code={pairing?.code ?? null}
        expiresAt={pairing?.expiresAt ?? null}
        error={error}
      />
    );
  }

  return <WelcomeScreen screen={screen} justPaired={justPaired} />;
}
