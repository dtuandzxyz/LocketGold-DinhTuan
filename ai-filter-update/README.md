# 🤖 AI Filter Update — LocketGold-DinhTuan
> **Branch thử nghiệm** — Thêm chức năng AI Filter vào src gốc  
> **Tác giả:** dtuandzxyz  
> **Trạng thái:** Thử nghiệm — chưa merge vào src gốc

---

## 📋 Thay đổi so với src gốc

| File | Thay đổi |
|---|---|
| `locketfix.js` | Đổi `ai_filters: "disabled"` → `"enabled"` |
| `locket_filter_resp.js` | Xóa skip block, thay bằng AI Filter unlock logic |
| `locket_filter_resp.js` | Set `WORKER_HOST = ""` (Offline 100%) |
| `locket_change_profile.js` | Set `WORKER_HOST = ""` (Offline 100%) |
| `locket_pb_req.js` | **File mới** — Request handler: remap filter ID + inject AI prompt |
| `LocketGold-DinhTuan-AIFilter.conf` | **File mới** — Config có thêm rule cho `locket_pb_req` |

---

## 🗂️ Cấu trúc

```
ai-filter-update/
├── LocketGold-DinhTuan-AIFilter.conf   ← Config mới (thêm rule AI Filter)
└── js/
    ├── deleteHeader_Firebase.js         ← Giữ nguyên từ src gốc
    ├── deleteHeader_RC.js               ← Giữ nguyên từ src gốc
    ├── revenuecat.js                    ← Giữ nguyên từ src gốc
    ├── locketfix.js                     ← Patch: ai_filters enabled
    ├── locket_change_profile.js         ← Patch: Worker offline
    ├── locket_filter_resp.js            ← Patch: AI Filter unlock + Worker offline
    └── locket_pb_req.js                 ← MỚI: Request handler AI Filter
```

---

## 🔄 Luồng hoạt động AI Filter

```
User chọn filter trong Locket
        ↓
App gửi POST → api.locketcamera.com/generateFilteredImage
        ↓
[locket_pb_req.js — Request]
  - Map sticker ID tùy chỉnh → filter ID gốc Locket
  - Inject đúng AI prompt vào body
        ↓
Server Locket nhận request → AI xử lý ảnh
        ↓
Server trả response (200 OK hoặc 402/403 nếu không phải Gold)
        ↓
[locket_filter_resp.js — Response]
  - Nếu 402/403 → patch thành 200, inject unlock flags
  - Nếu 200 → gỡ cờ is_locked, requires_gold
        ↓
App nhận ảnh đã qua AI filter ✅
```

---

## ✅ Tính năng AI Filter được hỗ trợ

**Photobooth Stickers (AI transform):**
- 🌹 Ngậm Hoa Hồng · 🧌 Tai Ogre Shrek · 🦸 Siêu Anh Hùng
- 👻 Bóng Ma Nhỏ · 🏴‍☠️ Mũ Cướp Biển · 🌋 Núi Lửa Dung Nham
- 🌊 Mưa Bão · 🎮 Llama Fortnite · 🎨 Tranh Màu Nước
- ☀️ Nắng Hoàng Hôn · 🌿 Rừng Nhiệt Đới · 🧟 Zombie Chibi
- 🎆 Fireworks · 🎄 Harry Potter · ⛏️ Minecraft · 🔥 Fire Flame
- 🕷️ Giant Spider · 🌊 Ocean Underwater · 🛸 UFO Alien

**DIO Filters (Locket gốc):**
- 💃 Disco Lights · 👰 Wedding · 🤠 Cowboy · 💅 Influencer
- 💇 Looks Maxxing · 🧔 Beard · 💚 Slimed · 🤡 Clown
- Và 20+ filter khác...

---

## ⚠️ Lưu ý khi test

- Dùng file `.conf` mới: `LocketGold-DinhTuan-AIFilter.conf`
- **Không** ghi đè lên src gốc
- Nếu AI Filter hoạt động ổn → merge ngược lại src gốc thủ công
- Toàn bộ Offline — không gửi dữ liệu ra server bên ngoài
