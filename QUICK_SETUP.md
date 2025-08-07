# 快速設定指南

## 🚀 5 分鐘快速設定

### 1. 設定 Google Cloud 專案（2分鐘）

1. 前往 [Google Cloud Console](https://console.cloud.google.com/)
2. 建立新專案或選擇現有專案
3. 啟用 Google Sheets API：
   - 前往「API 和服務」>「程式庫」
   - 搜尋「Google Sheets API」並啟用
   - 搜尋「Google Drive API」並啟用

### 2. 建立憑證（2分鐘）

1. 前往「API 和服務」>「憑證」
2. 建立 API Key：
   - 點擊「建立憑證」>「API 金鑰」
   - 複製 API Key
3. 建立 OAuth 2.0 客戶端 ID：
   - 點擊「建立憑證」>「OAuth 2.0 客戶端 ID」
   - 選擇「網頁應用程式」
   - 授權的 JavaScript 來源：`http://localhost:8000`
   - 授權的重新導向 URI：`http://localhost:8000`
   - 複製客戶端 ID

### 3. 更新配置檔案（1分鐘）

編輯 `config.js` 檔案：

```javascript
const GOOGLE_SHEETS_CONFIG = {
    SPREADSHEET_ID: '您的_Google_Sheets_ID', // 從 Google Sheets URL 複製
    API_KEY: '您的_API_Key',                // 從步驟 2 複製
    CLIENT_ID: '您的_Client_ID',            // 從步驟 2 複製
    // ... 其他設定保持不變
};
```

### 4. 測試連線

1. 啟動伺服器：
   ```bash
   python3 -m http.server 8000
   ```

2. 開啟測試頁面：
   ```
   http://localhost:8000/test-google-sheets.html
   ```

3. 按照頁面指示測試連線

## 📋 必要條件

- Google 帳戶
- Google Sheets 檔案
- 現代瀏覽器（Chrome、Firefox、Safari、Edge）

## 🔧 故障排除

### 常見問題

**Q: API Key 或 Client ID 無效**
A: 確認已正確複製，並檢查 Google Cloud Console 中的設定

**Q: CORS 錯誤**
A: 確認授權的 JavaScript 來源已包含 `http://localhost:8000`

**Q: 權限錯誤**
A: 確認 Google Sheets 已設為「任何人都可以編輯」或已授權特定使用者

**Q: 工作表不存在**
A: 系統會自動建立工作表，或手動建立以下工作表：
- `po_header`
- `採購明細`
- `開箱明細`
- `到貨明細`
- `出貨明細`

## 📞 需要幫助？

1. 查看詳細設定指南：`GOOGLE_SHEETS_SETUP.md`
2. 使用測試頁面：`test-google-sheets.html`
3. 檢查瀏覽器控制台的錯誤訊息 