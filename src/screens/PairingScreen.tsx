type Props = {
  code: string | null;
  expiresAt: string | null;
  error: string | null;
  mode?: "pin" | "link";
};

export function PairingScreen({ code, expiresAt, error, mode = "pin" }: Props) {
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
      <p className="text-sm text-muted">Hotel Signage Hub</p>
    </main>
  );
}
