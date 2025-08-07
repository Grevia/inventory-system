// Google Sheets API 配置
const GOOGLE_SHEETS_CONFIG = {
    // 您的 Google Sheets ID（從 URL 中獲取）
    SPREADSHEET_ID: '1wJLOHKOrT06CMpuY9X37FhXdQBRCU_gv2KCvJBkMC4k',
    
    // Google Cloud Console 設定
    API_KEY: 'AIzaSyCBUyP7kE-MJ2Q0zJd4g16xBHbWGt-Ozbw', // 您的 API Key
    CLIENT_ID: '421445275591-55lksi6gm284nb16af1285lrp3v3ct85.apps.googleusercontent.com', // 您的 Client ID
    
    // 工作表名稱設定
    SHEETS: {
        PO_HEADER: 'po_header',
        PURCHASE_DETAIL: '採購明細',
        UNBOXING_DETAIL: '開箱明細',
        RECEIVING_DETAIL: '到貨明細',
        SHIPPING_DETAIL: '出貨明細',
        SUPPLIER_CONTACTS: 'supplier_contacts'
    },
    
    // API 範圍
    SCOPES: [
        'https://www.googleapis.com/auth/spreadsheets',
        'https://www.googleapis.com/auth/drive.readonly'
    ]
};

// 導出配置
if (typeof module !== 'undefined' && module.exports) {
    module.exports = GOOGLE_SHEETS_CONFIG;
} 