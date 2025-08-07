# Google Sheets API 設定指南

## 1. 建立 Google Cloud 專案

1. 前往 [Google Cloud Console](https://console.cloud.google.com/)
2. 建立新專案或選擇現有專案
3. 啟用 Google Sheets API 和 Google Drive API

## 2. 建立憑證

### 建立 API Key
1. 在 Google Cloud Console 中，前往「API 和服務」>「憑證」
2. 點擊「建立憑證」>「API 金鑰」
3. 複製生成的 API Key

### 建立 OAuth 2.0 客戶端 ID
1. 在「憑證」頁面，點擊「建立憑證」>「OAuth 2.0 客戶端 ID」
2. 選擇「網頁應用程式」
3. 設定授權的 JavaScript 來源：
   - `http://localhost:8000`
   - `http://localhost:8001`
   - `http://localhost:8002`
   - 您的實際網域
4. 設定授權的重新導向 URI：
   - `http://localhost:8000`
   - `http://localhost:8001`
   - `http://localhost:8002`
   - 您的實際網域
5. 複製生成的客戶端 ID

## 3. 設定 Google Sheets

1. 建立或開啟您的 Google Sheets
2. 確保工作表包含以下工作表：
   - `po_header`：採購單號和進貨總數
   - `採購明細`：採購詳細資料
   - `開箱明細`：開箱記錄（將自動建立）
   - `到貨明細`：到貨記錄（將自動建立）
   - `出貨明細`：出貨記錄（將自動建立）

3. 設定工作表權限：
   - 點擊「共用」按鈕
   - 選擇「任何人都可以編輯」（測試用）
   - 或設定特定使用者的編輯權限

## 4. 更新配置檔案

編輯 `config.js` 檔案：

```javascript
const GOOGLE_SHEETS_CONFIG = {
    // 從 Google Sheets URL 複製的 ID
    SPREADSHEET_ID: '您的_Google_Sheets_ID',
    
    // 從 Google Cloud Console 複製的憑證
    API_KEY: '您的_API_Key',
    CLIENT_ID: '您的_Client_ID',
    
    // 工作表名稱（可根據需要修改）
    SHEETS: {
        PO_HEADER: 'po_header',
        PURCHASE_DETAIL: '採購明細',
        UNBOXING_DETAIL: '開箱明細',
        RECEIVING_DETAIL: '到貨明細',
        SHIPPING_DETAIL: '出貨明細'
    },
    
    SCOPES: [
        'https://www.googleapis.com/auth/spreadsheets',
        'https://www.googleapis.com/auth/drive.readonly'
    ]
};
```

## 5. 測試設定

1. 啟動本地伺服器：
   ```bash
   python3 -m http.server 8000
   ```

2. 開啟瀏覽器，前往 `http://localhost:8000`

3. 第一次使用時，系統會要求您登入 Google 帳戶並授權存取

4. 測試開箱明細功能，確認資料能成功寫入 Google Sheets

## 6. 資料格式說明

### 開箱明細工作表格式
| A | B | C | D | E | F | G |
|---|---|---|---|---|---|---|
| 採購單號 | 商品分類 | 商品序號 | 批號 | 開箱人員 | 開箱日期 | 建立時間 |

### 到貨明細工作表格式
| A | B | C | D | E | F |
|---|---|---|---|---|---|
| 採購單號 | 商品分類 | 商品序號 | 到貨人員 | 到貨日期 | 建立時間 |

## 7. 故障排除

### 常見錯誤及解決方案

1. **"Google Sheets API 未初始化"**
   - 檢查 `config.js` 檔案是否正確載入
   - 確認 API Key 和 Client ID 已正確設定

2. **"請先登入 Google 帳戶"**
   - 點擊登入按鈕進行 Google 帳戶授權
   - 確認已授權存取 Google Sheets

3. **"寫入 Google Sheets 失敗"**
   - 檢查工作表權限設定
   - 確認工作表名稱是否正確
   - 檢查網路連線

4. **CORS 錯誤**
   - 確認授權的 JavaScript 來源已正確設定
   - 檢查是否使用 HTTPS（生產環境）

## 8. 安全注意事項

1. **API Key 保護**：
   - 在生產環境中，不要將 API Key 暴露在前端程式碼中
   - 考慮使用後端 API 來處理 Google Sheets 操作

2. **權限控制**：
   - 定期檢查 Google Sheets 的存取權限
   - 移除不需要的編輯者

3. **資料備份**：
   - 定期備份重要的 Google Sheets 資料
   - 考慮設定版本控制

## 9. 進階設定

### 自訂工作表名稱
您可以修改 `config.js` 中的工作表名稱：

```javascript
SHEETS: {
    PO_HEADER: '您的_po_header_工作表名稱',
    UNBOXING_DETAIL: '您的_開箱明細_工作表名稱',
    // ... 其他工作表
}
```

### 自訂欄位順序
如果需要修改資料寫入的欄位順序，請編輯 `writeToGoogleSheet` 函數中的 `values.push()` 部分。 