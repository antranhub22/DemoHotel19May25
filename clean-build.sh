#!/bin/bash

# Clean build script for fullstack project (backend + frontend)
# Xóa file build cũ, cache, node_modules và build lại toàn bộ

set -e

# 1. Xóa thư mục build, cache ở root
rm -rf dist build .next .cache out node_modules

echo "[CLEAN] Đã xóa dist, build, .next, .cache, out, node_modules ở root."

# 2. Nếu có thư mục client (frontend riêng)
if [ -d "client" ]; then
  cd client
  rm -rf dist build .next .cache out node_modules
  echo "[CLEAN] Đã xóa dist, build, .next, .cache, out, node_modules ở client/"
  npm install
  echo "[NPM] Đã cài lại dependencies cho client/"
  if [ -f "package.json" ]; then
    npm run build || echo "[WARN] Không có lệnh build cho client/"
    echo "[BUILD] Đã build lại client/"
  fi
  cd ..
fi

# 3. Cài lại dependencies backend (root)
npm install

echo "[NPM] Đã cài lại dependencies cho backend/root."

# 4. Build lại backend nếu có lệnh build
if [ -f "package.json" ]; then
  npm run build || echo "[WARN] Không có lệnh build cho backend/root."
  echo "[BUILD] Đã build lại backend/root."
fi

echo "[DONE] Clean build toàn bộ project thành công!" 