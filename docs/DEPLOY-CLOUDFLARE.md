# Deploy IC-Gold lên Cloudflare Workers (Wrangler)

Hướng dẫn từng bước deploy source Nuxt lên **Cloudflare Workers** bằng **Wrangler CLI**.

---

## 1. Chuẩn bị

- **Node.js** 18+ (khuyến nghị 20+)
- **npm** hoặc **pnpm**
- Tài khoản **Cloudflare**
- **Wrangler CLI** (cài global hoặc dùng qua `npx`)

```bash
# Cài Wrangler global (tùy chọn)
npm install -g wrangler
```

---

## 2. Clone & cài dependency

```bash
git clone <repo-url> IC-Gold
cd IC-Gold
npm install
```

---

## 3. Cấu hình biến môi trường (local)

Tạo file `.env` ở thư mục gốc (copy từ `.env.example`):

```bash
cp .env.example .env
```

Điền giá trị thật:

| Biến | Mô tả |
|------|--------|
| `SUPABASE_URL` | URL project Supabase |
| `SUPABASE_KEY` | **Anon** key (public) |
| `SUPABASE_SERVICE_KEY` | **Service role** key (bí mật) |
| `RESEND_API_KEY` | API key Resend |
| `EMAIL_FROM` | Email gửi đi (vd: noreply@ic-gold.com) |
| `SITE_URL` | URL site production (vd: https://ic-gold.com) |
| `TELEGRAM_SUPPORT_LINK` | (Tuỳ chọn) Link Telegram support |

**Lưu ý:** Khi deploy bằng `wrangler deploy`, build chạy trên máy bạn nên **các biến trên phải có trong `.env`** (hoặc export trong shell) để Nuxt nhúng đúng vào build. Nếu dùng Cloudflare Pages/CI thì set biến ở Dashboard → Build.

---

## 4. Build cho Cloudflare

Build với preset **cloudflare-module** (Nitro sinh output tương thích Workers):

```bash
npm run build:cf
```

- Lệnh này set `NITRO_PRESET=cloudflare-module` rồi chạy `nuxt build`.
- Kết quả nằm trong `.output/`:
  - `.output/server/index.mjs` — entry Worker
  - `.output/public/` — static assets

**Không** dùng `npm run build` (không preset) nếu mục tiêu là deploy Workers.

---

## 5. Đăng nhập Wrangler & deploy

**Đăng nhập Cloudflare (lần đầu):**

```bash
npx wrangler login
```

Trình duyệt mở để bạn đăng nhập và cho phép Wrangler.

**Deploy:**

```bash
npx wrangler deploy
```

Hoặc gộp build + deploy trong một lệnh:

```bash
npm run deploy:cf
```

(`deploy:cf` = `NITRO_PRESET=cloudflare-module nuxt build` + `wrangler deploy`)

Sau khi xong, Wrangler in ra URL dạng:

- `https://ic-gold.<subdomain>.workers.dev`

---

## 6. Cấu hình `wrangler.toml`

File ở thư mục gốc:

```toml
name = "ic-gold"
main = ".output/server/index.mjs"
compatibility_date = "2025-04-01"
compatibility_flags = ["nodejs_compat"]

[assets]
directory = ".output/public/"
binding = "ASSETS"
```

- **name**: Tên Worker trên Cloudflare.
- **main**: Entry point (sau khi chạy `build:cf`).
- **compatibility_flags**: `nodejs_compat` để dùng API kiểu Node (Buffer, …) trong Worker.
- **assets**: Thư mục static, binding `ASSETS` để Nitro phục vụ file tĩnh.

Đổi `name` nếu muốn tên Worker khác (ví dụ môi trường staging).

---

## 7. Biến môi trường khi deploy từ máy local

Khi chạy `npm run deploy:cf` trên máy mình:

- Build chạy **local**, nên Nuxt đọc `process.env` từ **`.env`** (hoặc biến môi trường shell).
- Đảm bảo `.env` có đủ: `SUPABASE_URL`, `SUPABASE_KEY`, `SUPABASE_SERVICE_KEY`, `RESEND_API_KEY`, `EMAIL_FROM`, `SITE_URL`, (và `TELEGRAM_SUPPORT_LINK` nếu dùng).

**Nếu deploy qua Cloudflare Pages (Git push):**

- Vào **Dashboard → Pages → Project → Settings → Environment variables**.
- Thêm từng biến với **đúng tên** (không cần prefix `NUXT_` cho các biến trong `runtimeConfig` của Nuxt vì chúng được đọc lúc build qua `process.env`).

---

## 8. Custom domain (tuỳ chọn)

1. Vào **Cloudflare Dashboard → Workers & Pages → ic-gold**.
2. Tab **Settings** → **Domains and routes** → **Add custom domain**.
3. Nhập domain (vd: `ic-gold.com` hoặc `www.ic-gold.com`).
4. Nếu domain đã add site vào Cloudflare, DNS thường tự thêm (CNAME hoặc A/AAAA). Chỉ cần trỏ domain tới Worker theo hướng dẫn trên Dashboard.

Sau khi DNS active, truy cập qua domain thay vì `*.workers.dev`.

---

## 9. Kiểm tra sau deploy

- Mở URL Worker (hoặc custom domain).
- Thử: đăng nhập, nạp/rút, Copy Trade, referral, v.v.
- Nếu lỗi 500/login: kiểm tra lại env (đặc biệt `SUPABASE_SERVICE_KEY`, `SUPABASE_URL`, `SUPABASE_KEY`).

---

## 10. Tóm tắt lệnh thường dùng

| Mục đích | Lệnh |
|----------|------|
| Build (không deploy) | `npm run build:cf` |
| Build + deploy | `npm run deploy:cf` |
| Đăng nhập Cloudflare | `npx wrangler login` |
| Chỉ deploy (đã build sẵn) | `npx wrangler deploy` |
| Xem log Worker | Dashboard → Workers → ic-gold → Logs (Real-time / Tail) |

---

## 11. Lưu ý quan trọng

1. **Luôn dùng `build:cf` / `deploy:cf`** khi deploy Workers; không dùng `build` thuần.
2. **Env khi deploy local:** Có đủ biến trong `.env` (hoặc export) trước khi chạy `deploy:cf`.
3. **Password / bcrypt:** Project dùng `bcryptjs` (pure JS) để verify mật khẩu trên Worker; không dùng RPC Supabase cho bcrypt để tránh lỗi trên edge.
4. **Máy khác deploy:** Chỉ cần clone repo, cài dependency, tạo `.env` (hoặc set env), rồi chạy `npm run deploy:cf` — không bắt buộc phải dùng một máy cố định.

Nếu bạn dùng **Cloudflare Pages** (build trên Git) thay vì deploy tay bằng Wrangler, hãy set **Build command** là `npm run build:cf` và **Build output directory** không dùng (Pages với Workers thường dùng “Worker” build); cấu hình chi tiết tùy cách bạn gắn Worker với Pages.
