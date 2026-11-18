import { useEffect, useState } from "react";
import { QrCode } from "../welcome/QrCode";

type Props = {
  code: string | null;
  expiresAt: string | null;
  error: string | null;
  mode?: "pin" | "link";
};

function resolveCmsBase(origin: string): string {
  const env = (import.meta.env.VITE_CMS_URL as string | undefined)?.trim();
  if (env) return env.replace(/\/$/, "");
  if (origin.includes("://app.")) return origin.replace("://app.", "://");
  return "https://signagehub.online";
}

export function PairingScreen({ code, expiresAt, error, mode = "pin" }: Props) {
  const origin = window.location.origin;
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!expiresAt) return;
    setNow(Date.now());
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, [expiresAt]);

  const remaining = expiresAt
    ? Math.max(0, Math.ceil((new Date(expiresAt).getTime() - now) / 1000))
    : null;
  const progress = remaining != null ? Math.min(100, Math.max(0, (remaining / 90) * 100)) : 0;
  const cmsBase = resolveCmsBase(origin);
  const qrHref = code
    ? `${cmsBase}/rooms?pin=${encodeURIComponent(code)}`
    : `${cmsBase}/rooms`;

  return (
    <main className="flex min-h-[100dvh] flex-col justify-between px-10 py-12 md:px-20">
      <p className="text-sm text-muted">Ghép màn hình với phòng</p>
      <div className="flex flex-col gap-10 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0">
          {mode === "link" ? (
            <>
              <p className="mb-6 text-lg text-muted">Đang ghép bằng link từ quầy</p>
              <p className="font-medium text-[clamp(2rem,6vw,4rem)] leading-tight tracking-tight text-primary">
                Chờ một nhịp.
              </p>
            </>
          ) : (
            <>
              <p className="mb-6 text-lg text-muted">Nhập mã này tại quầy lễ tân</p>
              <p className="font-mono font-medium text-[clamp(3.5rem,11vw,7.5rem)] leading-none tracking-[0.26em] text-primary">
                {code ?? "······"}
              </p>
              {remaining != null ? (
                <div className="mt-6 max-w-md space-y-2">
                  <div className="h-1 w-full overflow-hidden rounded-full bg-white/12">
                    <div
                      className="h-full rounded-full bg-primary transition-[width] duration-1000 ease-linear"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <p className="text-sm tabular-nums text-muted">
                    {remaining > 0
                      ? `Mã còn hiệu lực ${remaining} giây · Tự cấp mã mới khi hết hạn.`
                      : "Đang cấp mã PIN mới…"}
                  </p>
                </div>
              ) : null}
            </>
          )}
          {error ? <p className="mt-4 text-sm text-danger">{error}</p> : null}
        </div>

        {mode === "pin" && code ? (
          <div className="flex shrink-0 items-center gap-4 rounded-2xl border border-white/12 bg-surface/80 p-4">
            <QrCode value={qrHref} className="size-28 md:size-32" ariaLabel="Mã QR mở quầy ghép phòng" />
            <div className="max-w-[14rem] space-y-1">
              <p className="text-sm font-medium text-ink">Ghép nhanh bằng điện thoại</p>
              <p className="text-xs leading-relaxed text-muted">
                Quét mã để mở danh sách phòng kèm sẵn mã PIN {code}, rồi bấm Ghép TV.
              </p>
            </div>
          </div>
        ) : null}
      </div>
      <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
        <p className="text-sm text-muted">
          Địa chỉ player: <span className="font-mono text-ink">{origin}</span>
        </p>
        <img src="/logo.svg" alt="SignageHub" className="player-logo h-7 w-auto" />
      </div>
    </main>
  );
}
