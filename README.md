# Hotel Signage Hub - TV Player Client

Ứng dụng Web Player siêu nhẹ hiển thị toàn màn hình (Full-screen Signage Player) chuyên dụng cho Smart TV (Tizen, webOS) và Android TV Box đặt tại các phòng khách sạn.

## Tính năng chính
- **Màn hình chào mừng cá nhân hóa:** Hiển thị tên khách, thông tin phòng, thông điệp chào đón và media động chất lượng cao.
- **Cập nhật theo thời gian thực:** Kết nối WebSocket trực tiếp với backend server để nhận lệnh render lại giao diện tức thì mà không cần reload trang.
- **Chế độ Offline & Cache:** Tự động lưu trữ nội dung và media vào Local Storage / IndexedDB để đảm bảo màn hình luôn hoạt động liên tục ngay cả khi mất kết nối mạng.
- **Ghép nối màn hình:** Tự động sinh mã xác thực (Pairing PIN) khi kích hoạt màn hình lần đầu.

## Tech Stack
- **Frontend Core:** Vite + React / Vue (hoặc Vanilla JS siêu nhẹ)
- **Styling & UI:** Tailwind CSS, CSS Transitions
- **Realtime Client:** Laravel Echo / Pusher JS Client
