# Hotel Signage Hub - TV Player

Web player fullscreen cho Smart TV. Gọi Device API của backend.

```bash
cp .env.example .env
# Điền VITE_REVERB_APP_KEY giống REVERB_APP_KEY ở backend
npm install
npm run dev
```

Mở http://localhost:5173. API: http://hubback.test/api. Reverb: localhost:8080.

Luồng: TV hiện PIN 6 ký tự → CMS Phòng → Ghép TV → màn chào / branding phòng trống.
