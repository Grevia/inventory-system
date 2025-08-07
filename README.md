# 庫存管理系統

一個基於 Web 的庫存管理系統，提供點到貨、開箱明細、出貨表等功能。

## 功能特色

### 點到貨功能
- 採購單號查詢
- 到貨數量統計
- 條碼掃描支援
- 資料匯出功能

### 開箱明細功能
- 開箱記錄管理
- 批號自動生成
- 進貨廠商顯示
- Google Sheets 整合

### 出貨表功能
- 出貨記錄管理
- 資料匯出功能
- 記錄編輯和刪除

### 員工管理功能
- 員工註冊
- 員工清單管理
- 資料備份和還原
- 狀態管理

## 資料來源

### Google Sheets 整合
- **po_header**: 採購單標頭資料
  - A 欄：採購單號
  - C 欄：進貨廠商名稱
  - T 欄：進貨總數
- **po_detail**: 採購明細資料
- **supplier_contacts**: 廠商聯絡資料
  - A 欄：廠商代碼
  - B 欄：廠商名稱

## 技術架構

- **前端**: HTML5, CSS3, JavaScript (ES6+)
- **後端**: Google Sheets API
- **部署**: GitHub Pages
- **版本控制**: Git

## 快速開始

1. 克隆專案
```bash
git clone https://github.com/Grevia/inventory-system.git
cd inventory-system
```

2. 設定 Google Sheets API
   - 參考 `GOOGLE_SHEETS_SETUP.md` 進行設定
   - 或使用 `QUICK_SETUP.md` 快速設定

3. 啟動本地伺服器
```bash
# 使用提供的腳本
./start-server.sh

# 或手動啟動
python3 -m http.server 8000
```

4. 開啟瀏覽器
```
http://localhost:8000
```

## 伺服器管理

### 啟動伺服器
```bash
./start-server.sh
```

### 停止伺服器
```bash
./stop-server.sh
```

### 檢查伺服器狀態
```bash
./check-server.sh
```

## 部署

### 推送到 GitHub Pages
```bash
git add .
git commit -m "更新訊息"
git push origin main
```

### 設定 GitHub Pages
1. 前往 GitHub 專案設定
2. 找到 Pages 設定
3. 選擇 Source 為 "Deploy from a branch"
4. 選擇 main 分支和 / (root) 資料夾

## 最新更新

### v1.1.6 (2025-08-07)
- 修復正式環境登入按鈕點擊無反應問題
- 移除事件衝突的全域點擊事件監聽器
- 簡化事件處理邏輯
- 確保登入和員工資料編輯按鈕正常工作

### v1.1.5 (2025-08-07)
- 修復登入按鈕點擊無反應問題
- 增強事件監聽器穩定性

### v1.1.4 (2025-08-07)
- 增強登入按鈕事件監聽器穩定性
- 修復員工資料編輯按鈕問題

### v1.1.3 (2025-08-07)
- 修復員工登入按鈕點擊無反應問題
- 新增員工資料備份和還原功能

### v1.1.2 (2025-08-07)
- 修復正式環境導航功能錯誤
- 修復 `navigateToShipping` 和 `navigateToUnboxing` 函數未定義問題

### v1.1.1 (2025-08-07)
- 新增員工資料備份和還原功能
- 支援 JSON 檔案匯出/匯入
- 解決員工資料在環境更新後消失的問題

### v1.1.0 (2025-08-07)
- 新增開箱明細功能
  - 批號自動生成（XXX廠商代碼 + 6位數字流水號）
  - 進貨廠商顯示（從 po_header C 欄位獲取）
  - 需開箱數量顯示（從 po_header T 欄位獲取）
- 新增出貨表功能
  - 出貨記錄管理
  - 資料匯出功能
- 新增員工管理功能
  - 員工註冊和清單管理
  - 資料備份和還原
- 新增 Google Sheets 寫入功能
- 新增伺服器管理腳本

### v1.0.0 (2025-08-06)
- 初始版本
- 基本點到貨功能
- Google Sheets 讀取功能

## 聯絡資訊

如有問題或建議，請透過 GitHub Issues 聯絡。

---

**最後部署時間**: 2025-08-07 12:35:00 UTC 