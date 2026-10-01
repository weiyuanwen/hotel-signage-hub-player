type Props = {
  code: string | null;
  expiresAt: string | null;
  error: string | null;
  mode?: "pin" | "link";
};

export function PairingScreen({ code, expiresAt, error, mode = "pin" }: Props) {
  // The TV runs on the player origin, so this is the address staff need to
  // reach this screen — useful for a front desk that pairs several rooms and
  // wants to bookmark it. Deriving it beats a build-time variable that can
  // drift from wherever the player is actually served.
  const origin = window.location.origin;

  return (
    <main className="flex min-h-[100dvh] flex-col justify-between px-10 py-12 md:px-20">
      <p className="text-sm text-muted">Ghép màn hình với phòng</p>
      <div>
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
            <p className="font-medium text-[clamp(3.5rem,12vw,8rem)] leading-none tracking-[0.28em] text-primary">
              {code ?? "······"}
            </p>
            {expiresAt ? (
              <p className="mt-6 text-sm text-muted">Hết hạn sau 90 giây. Mã mới sẽ hiện nếu hết hạn.</p>
            ) : null}
          </>
        )}
        {error ? <p className="mt-4 text-sm text-danger">{error}</p> : null}
      </div>
      <div className="flex flex-col items-center gap-4">
        <p className="text-sm text-muted">
          Địa chỉ player: <span className="font-mono text-ink">{origin}</span>
        </p>
        <img src="/logo.svg" alt="SignageHub" className="h-6 w-auto" />
      </div>
    </main>
  );
}
