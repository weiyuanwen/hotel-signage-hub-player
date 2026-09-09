# Design

Scene: TV at the foot of a dim hotel bed. Guest reads a name from three meters.

Strategy: Committed. Olive-gold (seed hue 110) carries the PIN and guest name. Surface stays near-black, chroma 0.

```css
:root {
  --bg: oklch(0.10 0 0);
  --surface: oklch(0.16 0 0);
  --ink: oklch(0.94 0.012 110);
  --muted: oklch(0.68 0.02 110);
  --primary: oklch(0.78 0.11 110);
  --accent: oklch(0.62 0.07 230);
  --danger: oklch(0.68 0.14 25);
}
```

Type: Geist only, large display for PIN and guest name. Theme: dark locked. Motion: 200ms opacity on content change. Radius: 0 (TV plane).
