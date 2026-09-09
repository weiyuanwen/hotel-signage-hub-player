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
  type DeviceMeta,
} from "./lib/session";
import { PairingScreen } from "./screens/PairingScreen";
import { WelcomeScreen } from "./screens/WelcomeScreen";

type PairingState = {
  code: string;
  expiresAt: string;
};

export function App() {
  const [pairing, setPairing] = useState<PairingState | null>(null);
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
      setError(null);
      if (res.etag) revisionRef.current = res.etag;
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
      setError("Không tải được nội dung. Đang giữ màn hình trước.");
    }
  }, []);

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

  useEffect(() => {
    if (tokenRef.current) {
      void loadScreen();
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
        const claimed = res.data;
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
        await loadScreen();
      } catch (err) {
        if (err instanceof ApiError && err.status === 422) {
          clearPendingPin();
          await requestPin();
        }
      }
    }, 2000);

    return () => window.clearInterval(poll);
  }, [pairing, loadScreen, requestPin]);

  useEffect(() => {
    const token = tokenRef.current;
    if (!token || !screen) return;

    const beat = window.setInterval(() => {
      void deviceFetch("/device/heartbeat", { method: "POST" }, token).catch(() => undefined);
    }, 30_000);
    void deviceFetch("/device/heartbeat", { method: "POST" }, token).catch(() => undefined);

    return () => window.clearInterval(beat);
  }, [screen]);

  useEffect(() => {
    const token = tokenRef.current;
    const meta = metaRef.current;
    if (!token || !meta || !screen) return;

    const echo = createEcho(token);
    echoRef.current = echo;
    echo
      .private(`room.${meta.hotelId}.${meta.roomId}`)
      .listen(".content.updated", (payload: ScreenData) => {
        setScreen(payload);
        revisionRef.current = String(payload.room.content_revision);
      });
    echo.private(`device.${meta.deviceId}`).listen(".device.command", (payload: { command: string }) => {
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
  }, [screen?.room.id, requestPin]);

  useEffect(() => {
    if (!justPaired) return;
    const hide = window.setTimeout(() => setJustPaired(false), 6000);
    return () => window.clearTimeout(hide);
  }, [justPaired]);

  if (!paired || !screen) {
    if (paired) {
      return (
        <main className="flex min-h-[100dvh] items-center px-10">
          <p className="text-xl text-muted">{error ?? "Đang tải nội dung phòng."}</p>
        </main>
      );
    }
    return <PairingScreen code={pairing?.code ?? null} expiresAt={pairing?.expiresAt ?? null} error={error} />;
  }

  return <WelcomeScreen screen={screen} justPaired={justPaired} />;
}
