# 🚀 HƯỚNG DẪN CẬP NHẬT API KEYS

## ✅ **ĐÃ SẴN SÀNG - Real API Keys đã được extract!**

### 📋 **BƯỚC 1: Copy nội dung từ file real keys**

File `REAL_ENV_KEYS.txt` đã chứa tất cả API keys thật từ Render của bạn:

- ✅ **OpenAI API Key**: `sk-proj-utj8LvQHYhjq...` (real key)
- ✅ **Vapi API Key**: `38aa6751-0df9-4c6d-806a-66d26187a018`
- ✅ **Vapi Public Key**: `4fba1458-6ea8-45c5-9653-76bbb54e64b5`
- ✅ **6 Assistant IDs**: cho Vietnamese, French, Korean, Russian, Chinese, English
- ✅ **Production URLs**: `https://minhonmuine.talk2go.online`

### 📋 **BƯỚC 2: Update .env file**

```bash
# 1. Mở file .env trong project root
# 2. Xóa toàn bộ nội dung cũ
# 3. Copy toàn bộ từ REAL_ENV_KEYS.txt
# 4. Paste vào .env và Save
```

### 📋 **BƯỚC 3: Kiểm tra cập nhật thành công**

Sau khi update .env, chạy lệnh này để verify:

```bash
node check-env.cjs
```

**Kết quả mong đợi:** Tất cả ✅ GREEN checkmarks

### 📋 **BƯỚC 4: Restart development server**

```bash
npm run dev
```

## 🎯 **SAU KHI CẬP NHẬT:**

- **❌ "Vapi API key not found"** → Sẽ biến mất
- **❌ 401 Authentication errors** → Sẽ được fix
- **❌ Voice assistant failures** → Sẽ hoạt động
- **✅ Multi-language support** → Sẽ hoạt động (6 ngôn ngữ)
- **✅ OpenAI integration** → Sẽ hoạt động

## ⚠️ **LƯU Ý QUAN TRỌNG:**

1. **Không commit .env file** lên git (đã có trong .gitignore)
2. **Backup** file .env trước khi thay đổi
3. **Restart dev server** sau khi update để load keys mới

## 🔧 **NẾU GẶP VẤN ĐỀ:**

- **File .env không tồn tại**: Tạo file mới tên `.env` trong project root
- **Validation script báo lỗi**: Kiểm tra copy paste có đúng không
- **Dev server không khởi động**: Check syntax errors trong .env
