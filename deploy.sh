#!/bin/bash

# 庫存管理系統部署腳本
# 版本：v1.0.0

echo "🚀 開始部署庫存管理系統..."

# 檢查 Git 是否已初始化
if [ ! -d ".git" ]; then
    echo "📁 初始化 Git 倉庫..."
    git init
    git add .
    git commit -m "Initial commit: 庫存管理系統 v1.0.0"
    echo "✅ Git 倉庫初始化完成"
else
    echo "📁 Git 倉庫已存在"
fi

# 檢查是否有遠端倉庫
if ! git remote get-url origin > /dev/null 2>&1; then
    echo "⚠️  請先設定 GitHub 遠端倉庫："
    echo "   git remote add origin https://github.com/your-username/inventory-system.git"
    echo "   git branch -M main"
    echo "   git push -u origin main"
else
    echo "🔄 推送到遠端倉庫..."
    git add .
    git commit -m "Update: $(date)"
    git push origin main
    echo "✅ 程式碼已推送到 GitHub"
fi

echo ""
echo "🎉 部署步驟完成！"
echo ""
echo "📋 接下來請執行以下步驟："
echo "1. 前往 GitHub 倉庫設定"
echo "2. 進入 Pages 設定"
echo "3. Source 選擇：Deploy from a branch"
echo "4. Branch 選擇：main"
echo "5. 資料夾選擇：/ (root)"
echo "6. 點擊 Save"
echo ""
echo "🌐 您的應用程式將在以下網址可用："
echo "   https://your-username.github.io/inventory-system/"
echo ""
echo "📞 如需協助，請查看 README.md 文件" 