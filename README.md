# 庫存管理系統

## 📋 系統功能

### 1. 員工登入系統
- 員工編號登入
- 登入後轉至功能頁面
- 登出功能

### 2. 點到貨功能
- 採購單號查詢（比對 po_header 工作表 A 欄位）
- 符合筆數顯示
- 到貨總數顯示（比對 po_header 工作表 T 欄位）
- 10 個序號輸入框（支援手動輸入和條碼掃描）
- 刷到貨比數即時統計
- 數量比對功能（預期 vs 實際）
- Excel 檔案自動生成和下載

### 3. 匯入採購到貨功能
- Google Sheets 資料讀取
- 資料預覽（前 20 筆）
- 選擇性匯入
- 進度顯示

## 🚀 部署指南

### GitHub Pages 部署（推薦）

1. **創建 GitHub 倉庫**
   ```bash
   # 初始化 Git 倉庫
   git init
   git add .
   git commit -m "Initial commit"
   
   # 在 GitHub 創建新倉庫
   # 然後推送程式碼
   git remote add origin https://github.com/your-username/inventory-system.git
   git branch -M main
   git push -u origin main
   ```

2. **啟用 GitHub Pages**
   - 前往倉庫設定 → Pages
   - Source 選擇：Deploy from a branch
   - Branch 選擇：main
   - 資料夾選擇：/ (root)
   - 點擊 Save

3. **設定自訂網域（可選）**
   - 在 Pages 設定中添加自訂網域
   - 設定 DNS 記錄

### Netlify 部署

1. **註冊 Netlify 帳戶**
2. **連接 GitHub 倉庫**
3. **設定部署選項**：
   - Build command：留空
   - Publish directory：留空（根目錄）
4. **點擊 Deploy site**

### Vercel 部署

1. **註冊 Vercel 帳戶**
2. **導入 GitHub 專案**
3. **自動部署設定**
4. **獲取生產環境 URL**

## 🔧 本地開發

### 安裝依賴
```bash
# 不需要額外依賴，純 HTML/CSS/JavaScript
```

### 啟動開發伺服器
```bash
python3 -m http.server 8000
```

### 存取應用程式
```
http://localhost:8000/cursor-web-app/index.html
```

## 📁 檔案結構

```
cursor-web-app/
├── index.html          # 主頁面
├── styles.css          # 樣式表
├── script.js           # JavaScript 邏輯
├── README.md           # 說明文件
└── test.html           # 測試頁面
```

## 🔗 Google Sheets 設定

### 資料來源
- **po_header 工作表**：採購單號查詢和到貨總數比對
- **採購明細工作表**：匯入採購到貨資料來源

### 權限設定
- 確保 Google Sheets 已設為「任何人都可以查看」
- 或設定適當的存取權限

## 🎯 使用流程

### 點到貨流程
1. 員工登入
2. 進入點到貨功能
3. 輸入採購單號並查詢
4. 查看符合筆數和到貨總數
5. 輸入序號（手動或掃描）
6. 提交資料
7. 數量比對確認
8. 自動下載 Excel 檔案

### 匯入採購到貨流程
1. 進入匯入採購到貨功能
2. 設定 Google Sheets URL
3. 載入資料預覽
4. 選擇要匯入的資料
5. 執行匯入

## 🔒 安全性考量

- 所有資料處理都在客戶端進行
- 不儲存敏感資訊
- Google Sheets 存取權限控制
- 檔案下載為本地處理

## 📊 技術規格

- **前端**：HTML5, CSS3, JavaScript (ES6+)
- **資料來源**：Google Sheets API
- **檔案格式**：CSV (Excel 相容)
- **瀏覽器支援**：Chrome, Firefox, Safari, Edge
- **響應式設計**：支援桌面和行動裝置

## 🚀 正式版本特點

✅ **完整功能**：所有核心功能都已實現  
✅ **用戶體驗**：直觀的介面和流暢的操作  
✅ **資料處理**：完整的資料查詢和匯出功能  
✅ **錯誤處理**：完善的錯誤處理和用戶提示  
✅ **響應式設計**：支援各種裝置和螢幕尺寸  
✅ **無需後端**：純前端解決方案，部署簡單  

## 📞 支援

如有問題或建議，請聯繫開發團隊。

---

**版本**：v1.0.0  
**最後更新**：2025-08-02 