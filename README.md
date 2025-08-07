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

### 3. 開箱明細功能 ⭐ **新增**
- 採購單號查詢（比對 po_header 工作表 A 欄位）
- 進貨廠商自動顯示（從 po_header 工作表 C 欄位獲取）
- 需開箱數量顯示（從 po_header 工作表 T 欄位獲取）
- 20 個商品項目管理
- 商品分類選擇（手機、平板、筆電、手錶）
- 商品序號輸入
- 批號自動生成（廠商代碼 + 6位數字流水號）
- 廠商代碼查詢（從 supplier_contacts 工作表獲取）
- 開箱記錄提交和儲存

### 4. 出貨表功能
- 出貨記錄新增、編輯、刪除
- 出貨資料匯出為 Excel
- 出貨記錄管理

### 5. 匯入採購到貨功能
- Google Sheets 資料讀取
- 資料預覽（前 20 筆）
- 選擇性匯入
- 進度顯示

### 6. 員工管理功能
- 員工註冊
- 員工狀態管理（在職中/已離職）
- 員工清單查看

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

#### 方法一：使用啟動腳本（推薦）
```bash
# 啟動伺服器
./start-server.sh

# 停止伺服器
./stop-server.sh

# 檢查伺服器狀態
./check-server.sh
```

#### 方法二：手動啟動
```bash
cd /Users/user/cursor-web-app
python3 -m http.server 8007
```

### 存取應用程式
```
http://localhost:8007/index.html
```

## 📁 檔案結構

```
cursor-web-app/
├── index.html                    # 主頁面
├── styles.css                    # 樣式表
├── script.js                     # JavaScript 邏輯
├── config.js                     # Google Sheets API 配置
├── README.md                     # 說明文件
├── GOOGLE_SHEETS_SETUP.md        # Google Sheets 設定指南
├── QUICK_SETUP.md                # 快速設定指南
├── test-google-sheets.html       # Google Sheets 連線測試頁面
├── test.html                     # 測試頁面
├── start-server.sh               # 伺服器啟動腳本
├── stop-server.sh                # 伺服器停止腳本
└── check-server.sh               # 伺服器狀態檢查腳本
```

## 🔗 Google Sheets 設定

### 資料來源
- **po_header 工作表**：採購單號查詢、廠商名稱（C 欄位）、到貨總數（T 欄位）
- **採購明細工作表**：匯入採購到貨資料來源
- **supplier_contacts 工作表**：廠商代碼查詢（A 欄位：廠商代碼，B 欄位：廠商名稱）

### 資料寫入
- **開箱明細工作表**：自動寫入開箱記錄
- **到貨明細工作表**：自動寫入到貨記錄
- **出貨明細工作表**：自動寫入出貨記錄

### 權限設定
- 確保 Google Sheets 已設為「任何人都可以編輯」（測試用）
- 或設定特定使用者的編輯權限
- 詳細設定請參考 `GOOGLE_SHEETS_SETUP.md`

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

### 開箱明細流程 ⭐ **新增**
1. 員工登入
2. 進入開箱明細功能
3. 輸入採購單號並查詢
4. 系統自動顯示：
   - 進貨廠商（從 po_header 工作表 C 欄位獲取）
   - 需開箱數量（從 po_header 工作表 T 欄位獲取）
5. 系統自動查詢廠商代碼（從 supplier_contacts 工作表獲取）
6. 填寫商品資料：
   - 選擇商品分類
   - 輸入商品序號
   - 系統自動生成批號（廠商代碼 + 6位數字流水號）
7. 提交開箱明細
8. 系統自動寫入 Google Sheets

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
- **資料寫入**：Google Sheets API (支援開箱明細、到貨明細等)
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
✅ **開箱明細**：完整的開箱流程和批號管理  
✅ **廠商管理**：自動廠商代碼查詢和批號生成  
✅ **Google Sheets 整合**：完整的資料讀寫功能  

## 📞 支援

如有問題或建議，請聯繫開發團隊。

## 🔧 最新更新 (v1.1.0)

### 2025-08-07 更新內容
- ✅ **新增開箱明細功能**：完整的開箱流程管理
- ✅ **進貨廠商自動顯示**：從 po_header 工作表 C 欄位自動獲取廠商名稱
- ✅ **需開箱數量顯示**：從 po_header 工作表 T 欄位獲取正確數量
- ✅ **批號自動生成**：廠商代碼 + 6位數字流水號格式
- ✅ **廠商代碼查詢**：從 supplier_contacts 工作表自動查詢廠商代碼
- ✅ **Google Sheets 整合**：完整的資料讀寫功能
- ✅ **配置檔案管理**：新增 config.js 統一管理 Google Sheets 設定
- ✅ **伺服器管理腳本**：新增 start-server.sh、stop-server.sh、check-server.sh
- ✅ **錯誤修復**：修正 config.js 載入問題和 SPREADSHEET_ID 引用問題

### 技術改進
- 修正 HTML 中缺少 config.js 載入的問題
- 修正 script.js 中 SPREADSHEET_ID 硬編碼問題
- 新增詳細的調試日誌功能
- 改善錯誤處理和用戶提示

---

**版本**：v1.1.0  
**最後更新**：2025-08-07 