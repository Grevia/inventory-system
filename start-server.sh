#!/bin/bash

# 庫存管理系統伺服器啟動腳本

# 設定專案目錄
PROJECT_DIR="/Users/user/cursor-web-app"
PORT=8007

echo "🚀 啟動庫存管理系統伺服器..."
echo "📁 專案目錄: $PROJECT_DIR"
echo "🌐 伺服器地址: http://localhost:$PORT"
echo ""

# 檢查目錄是否存在
if [ ! -d "$PROJECT_DIR" ]; then
    echo "❌ 錯誤：專案目錄不存在: $PROJECT_DIR"
    exit 1
fi

# 切換到專案目錄
cd "$PROJECT_DIR"

# 檢查必要檔案是否存在
if [ ! -f "index.html" ]; then
    echo "❌ 錯誤：找不到 index.html"
    exit 1
fi

echo "✅ 專案目錄檢查完成"
echo "📄 找到檔案:"
ls -la *.html *.js *.css 2>/dev/null | head -10

echo ""
echo "🔄 啟動伺服器..."
echo "按 Ctrl+C 停止伺服器"
echo ""

# 啟動伺服器
python3 -m http.server $PORT 