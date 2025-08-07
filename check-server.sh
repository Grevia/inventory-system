#!/bin/bash

# 庫存管理系統伺服器狀態檢查腳本

echo "🔍 檢查庫存管理系統伺服器狀態..."
echo ""

# 檢查專案目錄
PROJECT_DIR="/Users/user/cursor-web-app"
if [ -d "$PROJECT_DIR" ]; then
    echo "✅ 專案目錄存在: $PROJECT_DIR"
else
    echo "❌ 專案目錄不存在: $PROJECT_DIR"
    exit 1
fi

# 檢查必要檔案
cd "$PROJECT_DIR"
echo ""
echo "📄 檢查必要檔案:"
for file in index.html script.js styles.css config.js; do
    if [ -f "$file" ]; then
        echo "✅ $file"
    else
        echo "❌ $file (缺失)"
    fi
done

# 檢查伺服器進程
echo ""
echo "🖥️  檢查伺服器進程:"
PIDS=$(ps aux | grep "python3 -m http.server" | grep -v grep | awk '{print $2}')

if [ -z "$PIDS" ]; then
    echo "❌ 沒有找到運行中的伺服器"
    echo ""
    echo "💡 使用以下命令啟動伺服器:"
    echo "   ./start-server.sh"
else
    echo "✅ 找到運行中的伺服器:"
    ps aux | grep "python3 -m http.server" | grep -v grep
    
    echo ""
    echo "🌐 測試伺服器連線:"
    
    # 測試不同端口
    for port in 8000 8001 8002 8003 8004 8005 8006 8007 8008 8009; do
        if curl -s -o /dev/null -w "%{http_code}" "http://localhost:$port/index.html" | grep -q "200"; then
            echo "✅ 端口 $port: http://localhost:$port/index.html"
            echo "   📁 伺服器根目錄: $(curl -s http://localhost:$port/ | grep -o 'cursor-web-app' | head -1 || echo '未知')"
        fi
    done
fi

echo ""
echo "📋 可用的 URL:"
echo "   🏠 主系統: http://localhost:8007/index.html"
echo "   🧪 測試頁面: http://localhost:8007/test-google-sheets.html"
echo "   📊 其他測試: http://localhost:8007/test.html" 