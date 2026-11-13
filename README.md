# 🔒 LocketGold-DinhTuan
> **Shadowrocket Module** — Mở khóa toàn diện Locket Gold VIP (Chạy độc lập 100% Offline / Tự chủ)  
> **Tác giả & Phân phối:** dtuandzxyz  

---

## 📋 Tính năng

| Tính năng | Trạng thái |
|---|---|
| ✅ Locket Gold (không giới hạn) | Hoạt động |
| ✅ Video thời lượng 45 giây | Hoạt động |
| ✅ Upload từ Camera Roll / Thư viện ảnh | Hoạt động |
| ✅ Huy hiệu Gold Profile (Vương miện / Viền vàng) | Hoạt động |
| ✅ Tự chủ 100% (Không gửi dữ liệu UID ra ngoài server lạ) | Đã tối ưu |
| ✅ Tự động gỡ mờ ảnh (Unblur) & gỡ bỏ paywall | Hoạt động |
| ✅ Tắt quảng cáo trong ứng dụng | Hoạt động |
| ✅ Chặn telemetry / Sentry tracking | Hoạt động |

---

## 🛡️ Tính năng Tự Chủ (Offline 100%)
- Mặc định toàn bộ module hoạt động **trực tiếp trên thiết bị của bạn**, không gửi UID / username tới bất kỳ máy chủ bên thứ ba nào (`mhiep20077`).
- Bạn có thể tùy chỉnh danh sách bạn bè VIP muốn cấp huy hiệu vàng trong biến `BASE_VIP_USERS` tại file `js/locket_filter_resp.js`.
- Nếu muốn tự tạo mạng lưới VIP riêng cho bạn bè qua Cloudflare Worker của chính bạn, xem thư mục `worker/`.

---

## 📥 Hướng dẫn cài đặt (Shadowrocket)

### Bước 1: Thêm Config URL
1. Mở ứng dụng **Shadowrocket** trên iOS
2. Vào tab **Config**
3. Nhấn vào biểu tượng dấu **`+`** ở góc trên cùng bên phải
4. Dán đường dẫn cấu hình:

```text
https://raw.githubusercontent.com/dtuandzxyz/LocketGold-DinhTuan/main/LocketGold-DinhTuan.conf
```
*(Lưu ý: Nếu bạn lưu trên repo `Locket-Filter-Module`, hãy dùng link: `https://raw.githubusercontent.com/dtuandzxyz/Locket-Filter-Module/main/LocketGold-DinhTuan.conf`)*

---

### Bước 2: Bật Giải mã HTTPS (MITM)
1. Trong tab **Config**, bấm vào biểu tượng chữ **`i`** bên cạnh config vừa thêm.
2. Bật mục **HTTPS Decryption**.
3. Nhấn **Generate New CA Certificate** (Tạo chứng chỉ mới).
4. Nhấn **Install Certificate to System**.
5. Mở Cài đặt trên iPhone:  
   - `Cài đặt (Settings) → Đã tải về hồ sơ (Profile Downloaded)` → Chọn **Cài đặt**.  
   - `Cài đặt → Cài đặt chung (General) → Giới thiệu (About) → Cài đặt tin cậy chứng chỉ (Certificate Trust Settings)` → Gạt bật tin cậy toàn bộ cho chứng chỉ vừa cài.

---

### Bước 3: Kích hoạt & Sử dụng
- Bật công tắc kết nối VPN trong **Shadowrocket**.
- Mở ứng dụng **Locket** và tận hưởng toàn bộ tính năng Gold VIP! 🎉

---

## 🗂️ Cấu trúc thư mục

```text
LocketGold-DinhTuan/
├── LocketGold-DinhTuan.conf      ← File cấu hình chính (import vào Shadowrocket)
├── js/
│   ├── deleteHeader_Firebase.js  ← Xóa cache headers Firebase
│   ├── deleteHeader_RC.js        ← Xóa cache headers RevenueCat
│   ├── revenuecat.js             ← Giả lập gói subscription Locket Gold
│   ├── locketfix.js              ← Mở khóa tính năng Gold qua Firebase Remote Config
│   ├── locket_change_profile.js  ← Huy hiệu Profile Gold & đồng bộ VIP cục bộ
│   └── locket_filter_resp.js     ← Mở khóa response API & gỡ mờ ảnh (Unblur)
├── worker/
│   └── worker.js                 ← Mã nguồn Cloudflare Worker tự chủ (tùy chọn)
├── .gitattributes
└── README.md
```

---

## ⚠️ Lưu ý

- Dự án phục vụ cho mục đích **học tập và nghiên cứu kỹ thuật**.
- Yêu cầu ứng dụng Shadowrocket trên hệ điều hành iOS.

---

## 📞 Bản quyền & Tác giả

> **LocketGold-DinhTuan** — Phát triển bởi **dtuandzxyz**
