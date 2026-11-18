import { useMemo } from "react";
import { encodeQrMatrix } from "../lib/qr";

type Props = {
  value: string;
  className?: string;
  ariaLabel?: string;
};

export function QrCode({ value, className = "size-16", ariaLabel }: Props) {
  const encoded = useMemo(() => {
    const matrix = encodeQrMatrix(value);
    if (!matrix) return null;
    const size = matrix.length;
    let d = "";
    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        if (matrix[r][c]) {
          d += `M${c + 2} ${r + 2}h1v1h-1z`;
        }
      }
    }
    return { viewSize: size + 4, d };
  }, [value]);

  if (!encoded) return null;

  return (
    <svg
      viewBox={`0 0 ${encoded.viewSize} ${encoded.viewSize}`}
      shapeRendering="crispEdges"
      role={ariaLabel ? "img" : undefined}
      aria-label={ariaLabel}
      aria-hidden={ariaLabel ? undefined : true}
      className={`shrink-0 rounded-lg bg-white shadow-[0_2px_12px_rgb(0_0_0/0.35)] ${className}`}
    >
      <rect width={encoded.viewSize} height={encoded.viewSize} fill="#ffffff" />
      <path d={encoded.d} fill="#111111" />
    </svg>
  );
}
