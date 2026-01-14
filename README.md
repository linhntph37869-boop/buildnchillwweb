# ❄️ BuildnChill - Minecraft Community Website ❄️

<p align="center">
  <img src="https://foodtek.vn/sites/default/files/2026-01/PC.webp" alt="BuildnChill Banner" width="100%" style="border-radius: 15px; border: 2px solid #0ea5e9; box-shadow: 0 4px 20px rgba(14, 165, 233, 0.4);">
</p>

---

## 🏔️ Giới Thiệu
**BuildnChill** là một nền tảng Web Full-stack hiện đại dành riêng cho cộng đồng Minecraft. Website mang phong cách **Winter Theme (Mùa Đông)** dịu mắt, tích hợp đầy đủ tính năng từ tin tức, cửa hàng vật phẩm đến hệ thống quản trị chuyên nghiệp.

> "Xây dựng đam mê - Tận hưởng khoảnh khắc chill"

---

## ✨ Tính Năng Nổi Bật

### 🌐 Dành Cho Người Chơi
- 🏠 **Trang Chủ**: Banner chuyển động mượt mà, cập nhật trạng thái Server real-time.
- 🛒 **Cửa Hàng Mùa Đông**: Hệ thống nạp rank/vật phẩm tích hợp **VietQR** tự động.
- 📰 **Tin Tức**: Hệ thống bài viết phân trang, tìm kiếm thông minh.
- ❄️ **Hiệu Ứng Tuyết Rơi**: Mang lại cảm giác chill ngay khi vừa truy cập.
- 📱 **Responsive**: Hiển thị hoàn hảo trên mọi thiết bị (Mobile, Tablet, PC).

### 🛠️ Dành Cho Quản Trị Viên (Admin)
- 📊 **Dashboard Thống Kê**: Theo dõi doanh thu, đơn hàng theo ngày/tháng/năm.
- 📦 **Quản Lý Shop**: CRUD danh mục, sản phẩm, và xử lý đơn hàng tập trung.
- 📝 **Soạn Thảo Bài Viết**: Trình soạn thảo Rich Text chuyên nghiệp cho tin tức.
- 🔔 **Discord Webhook**: Tự động gửi thông báo đơn hàng mới về Discord.
- ⚙️ **Cài Đặt Hệ Thống**: Tùy chỉnh IP Server, Version, và các thông tin liên hệ ngay trên web.

---

## 🛠️ Công Nghệ Sử Dụng

| Công Nghệ | Mô Tả |
| :--- | :--- |
| **Vite + React** | Frontend Framework tốc độ cao |
| **Supabase** | Backend-as-a-Service (Database, Auth, Storage) |
| **Framer Motion** | Hiệu ứng chuyển động mượt mà |
| **Bootstrap 5** | Grid system và UI components |
| **React Icons** | Bộ icon đa dạng (Bi, Ai, Md,...) |

---

## 🚀 Bắt Đầu Ngay

### 1. Cài đặt môi trường
```bash
# Clone project
git clone [url-cua-ban]

# Cài đặt dependencies
npm install
```

### 2. Cấu hình biến môi trường
Tạo file `.env` từ `.env.example` và điền thông tin Supabase của bạn:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Chạy môi trường Development
```bash
npm run dev
```

---

## 📂 Cấu Trúc Thư Mục

```text
buildnchill-web-main/
├── public/              # Tài nguyên tĩnh (Sitemap, Robots.txt, Favicon)
├── src/
│   ├── components/      # Các thành phần giao diện (Navbar, Shop Management,...)
│   ├── context/         # Quản lý State toàn cục (DataContext)
│   ├── pages/           # Các trang giao diện chính
│   ├── styles/          # CSS Custom (Winter Theme, Carousel, Shop)
│   ├── supabaseClient.js # Cấu hình kết nối Backend
│   └── App.jsx          # Entry point điều hướng
├── .env                 # Biến môi trường (Secret)
└── index.html           # Cấu trúc HTML & Meta SEO
```

---

## 📈 Tối Ưu SEO
Website đã được cấu hình SEO nâng cao:
- ✅ **Sitemap & Robots**: Tự động hóa việc quét dữ liệu của Google.
- ✅ **Dynamic Meta**: Title và Description thay đổi theo từng trang/bài viết.
- ✅ **Open Graph**: Hiển thị hình ảnh chuyên nghiệp khi chia sẻ lên FB/Discord.

---

## 📜 Giấy Phép
Dự án được phát triển bởi **BuildnChill Team**. Vui lòng không sao chép khi chưa được sự đồng ý.

---
<p align="center">
  Made with ❄️ by BuildnChill
</p>