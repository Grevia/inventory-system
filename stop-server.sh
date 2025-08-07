#!/bin/bash

# 庫存管理系統伺服器停止腳本

echo "🛑 停止庫存管理系統伺服器..."

# 查找並終止所有 Python HTTP 伺服器
PIDS=$(ps aux | grep "python3 -m http.server" | grep -v grep | awk '{print $2}')

if [ -z "$PIDS" ]; then
    echo "✅ 沒有找到運行中的伺服器"
else
    echo "🔍 找到以下伺服器進程:"
    ps aux | grep "python3 -m http.server" | grep -v grep
    
    echo ""
    echo "🔄 正在終止伺服器..."
    echo $PIDS | xargs kill -9
    
    echo "✅ 伺服器已停止"
fi

echo ""
echo "💡 提示：使用 ./start-server.sh 重新啟動伺服器" 