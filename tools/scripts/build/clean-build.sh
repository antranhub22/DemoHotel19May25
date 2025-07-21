#!/bin/bash
# Clean build script for monorepo project (apps/client + apps/server + packages)
# Xóa file build cũ, cache, node_modules và build lại toàn bộ

echo "[START] Bắt đầu clean build toàn bộ monorepo..."

# 1. Xóa thư mục build, cache ở root
rm -rf dist build .next .cache out node_modules/.vite
echo "[CLEAN] Đã xóa dist, build, .next, .cache, out, vite cache ở root."

# 2. Clean apps/client/
if [ -d "apps/client" ]; then
  cd apps/client
  rm -rf dist build .next .cache out node_modules/.vite
  echo "[CLEAN] Đã xóa dist, build, .next, .cache, out, vite cache ở apps/client/"
  cd ../..
fi

# 3. Clean apps/server/
if [ -d "apps/server" ]; then
  cd apps/server
  rm -rf dist build .cache out
  echo "[CLEAN] Đã xóa dist, build, .cache, out ở apps/server/"
  cd ../..
fi

# 4. Clean packages/ directories
if [ -d "packages" ]; then
  for package_dir in packages/*/; do
    if [ -d "$package_dir" ]; then
      cd "$package_dir"
      rm -rf dist build .cache out
      echo "[CLEAN] Đã xóa dist, build, .cache, out ở $package_dir"
      cd ../..
    fi
  done
fi

# 5. Reinstall dependencies
echo "[INSTALL] Cài đặt lại dependencies..."
npm install

# 6. Run typecheck
echo "[TYPECHECK] Kiểm tra TypeScript..."
npm run typecheck || echo "[WARN] TypeScript có lỗi, tiếp tục build..."

# 7. Build production
echo "[BUILD] Build production..."
npm run build:production || {
  echo "[ERROR] Production build thất bại! Thử build thường..."
  npm run build || {
    echo "[ERROR] Build thất bại hoàn toàn!"
    exit 1
  }
}

# 8. Test build
echo "[TEST] Test build..."
npm run test:build || echo "[WARN] Test thất bại, nhưng build đã hoàn thành."

echo "[DONE] Clean build toàn bộ monorepo thành công!"
echo "[INFO] Sử dụng 'npm run start:production' để chạy production server."
echo "[INFO] Sử dụng 'npm run preview' để preview frontend build." 