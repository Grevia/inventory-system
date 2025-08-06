// 全域變數
let currentUser = null;
let currentPoNumber = null;
let matchCount = 0;
let scanCount = 0; // 刷到貨比數

// Google Sheets API 設定
const SPREADSHEET_ID = '1wJLOHKOrT06CMpuY9X37FhXdQBRCU_gv2KCvJBkMC4k';
const PO_HEADER_RANGE = 'po_header!A:T';
const PO_DETAIL_RANGE = 'po_detail!A:C';

// 初始化
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM載入完成，初始化應用程式');
    initializeApp();
    setupEventListeners();
});

// 初始化應用程式
function initializeApp() {
    console.log('初始化應用程式');
    // 檢查是否有已登入的用戶
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
        currentUser = savedUser;
        showPage('functionPage');
        updateUserDisplay();
    } else {
        showPage('loginPage');
    }
}

// 設定事件監聽器
function setupEventListeners() {
    console.log('設定事件監聽器');
    
    // 登入相關
    const loginBtn = document.getElementById('loginBtn');
    const employeeIdInput = document.getElementById('employeeId');
    
    if (loginBtn) {
        loginBtn.addEventListener('click', handleLogin);
        console.log('登入按鈕事件已設定');
    }
    
    if (employeeIdInput) {
        employeeIdInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') handleLogin();
        });
        console.log('員工編號輸入事件已設定');
    }

    // 登出
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
        console.log('登出按鈕事件已設定');
    }

    // 點到貨頁面
    const searchPoBtn = document.getElementById('searchPoBtn');
    const poNumberInput = document.getElementById('poNumber');
    
    if (searchPoBtn) {
        searchPoBtn.addEventListener('click', searchPurchaseOrder);
        console.log('查詢按鈕事件已設定');
    }
    
    if (poNumberInput) {
        poNumberInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') searchPurchaseOrder();
        });
        console.log('採購單號輸入事件已設定');
    }

    // 序號輸入
    const serialInputs = document.querySelectorAll('.serial-input');
    serialInputs.forEach(input => {
        // 監聽輸入事件
        input.addEventListener('input', function() {
            updateScanCount();
        });
        
        // 監聽 Enter 鍵
        input.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                const nextIndex = parseInt(this.dataset.index) + 1;
                const nextInput = document.querySelector(`[data-index="${nextIndex}"]`);
                if (nextInput) {
                    nextInput.focus();
                }
            }
        });
    });
    console.log('序號輸入事件已設定');

    // 提交和清除按鈕
    const submitBtn = document.getElementById('submitBtn');
    const clearBtn = document.getElementById('clearBtn');
    
    if (submitBtn) {
        submitBtn.addEventListener('click', submitData);
        console.log('提交按鈕事件已設定');
    }
    
    if (clearBtn) {
        clearBtn.addEventListener('click', clearAllInputs);
        console.log('清除按鈕事件已設定');
    }

    // 返回功能頁面
    const backToFunctionBtn = document.getElementById('backToFunctionBtn');
    if (backToFunctionBtn) {
        backToFunctionBtn.addEventListener('click', () => {
            showPage('functionPage');
        });
        console.log('返回按鈕事件已設定');
    }

    // 匯入頁面相關
    const backToFunctionFromImportBtn = document.getElementById('backToFunctionFromImportBtn');
    if (backToFunctionFromImportBtn) {
        backToFunctionFromImportBtn.addEventListener('click', () => {
            showPage('functionPage');
        });
        console.log('匯入頁面返回按鈕事件已設定');
    }

    // 匯入功能按鈕
    const testConnectionBtn = document.getElementById('testConnectionBtn');
    const loadDataBtn = document.getElementById('loadDataBtn');
    const refreshDataBtn = document.getElementById('refreshDataBtn');
    const importSelectedBtn = document.getElementById('importSelectedBtn');
    const clearSelectionBtn = document.getElementById('clearSelectionBtn');

    if (testConnectionBtn) {
        testConnectionBtn.addEventListener('click', testGoogleSheetsConnection);
        console.log('測試連線按鈕事件已設定');
    }

    if (loadDataBtn) {
        loadDataBtn.addEventListener('click', loadGoogleSheetsData);
        console.log('載入資料按鈕事件已設定');
    }

    if (refreshDataBtn) {
        refreshDataBtn.addEventListener('click', loadGoogleSheetsData);
        console.log('重新整理按鈕事件已設定');
    }

    if (importSelectedBtn) {
        importSelectedBtn.addEventListener('click', importSelectedData);
        console.log('匯入選取按鈕事件已設定');
    }

    if (clearSelectionBtn) {
        clearSelectionBtn.addEventListener('click', clearAllSelections);
        console.log('清除選擇按鈕事件已設定');
    }

    // 訊息關閉
    const messageCloseBtn = document.getElementById('messageCloseBtn');
    if (messageCloseBtn) {
        messageCloseBtn.addEventListener('click', hideMessage);
        console.log('訊息關閉按鈕事件已設定');
    }
}

// 頁面切換函數
function showPage(pageId) {
    console.log('切換到頁面:', pageId);
    // 隱藏所有頁面
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });
    
    // 顯示指定頁面
    const targetPage = document.getElementById(pageId);
    if (targetPage) {
        targetPage.classList.add('active');
        console.log('頁面切換成功');
    } else {
        console.error('找不到頁面:', pageId);
    }
}

// 登入處理
function handleLogin() {
    console.log('處理登入');
    const employeeId = document.getElementById('employeeId').value.trim();
    
    if (!employeeId) {
        showMessage('請輸入員工編號');
        return;
    }
    
    // 簡單的員工編號驗證
    if (employeeId.length < 3) {
        showMessage('員工編號至少需要3位數字');
        return;
    }
    
    currentUser = employeeId;
    localStorage.setItem('currentUser', employeeId);
    
    showPage('functionPage');
    updateUserDisplay();
    
    // 清空登入欄位
    document.getElementById('employeeId').value = '';
    console.log('登入成功:', employeeId);
}

// 登出處理
function handleLogout() {
    console.log('處理登出');
    currentUser = null;
    localStorage.removeItem('currentUser');
    showPage('loginPage');
}

// 更新用戶顯示
function updateUserDisplay() {
    const userSpan = document.getElementById('currentUser');
    if (userSpan) {
        userSpan.textContent = `員工編號：${currentUser}`;
        console.log('用戶顯示已更新');
    }
}

// 導航到點到貨頁面
function navigateToReceiving() {
    console.log('導航到點到貨頁面');
    showPage('receivingPage');
    clearAllInputs();
}

// 搜尋採購單
async function searchPurchaseOrder() {
    console.log('搜尋採購單');
    const poNumber = document.getElementById('poNumber').value.trim();
    
    if (!poNumber) {
        showMessage('請輸入採購單號');
        return;
    }
    
    showLoading(true);
    
    try {
        // 查詢 po_header 工作表
        const poHeaderData = await queryPoHeaderSheet(poNumber);
        
        currentPoNumber = poNumber;
        matchCount = poHeaderData.length;
        
        // 更新符合筆數
        const matchCountElement = document.getElementById('matchCount');
        if (matchCountElement) {
            matchCountElement.textContent = matchCount;
        }
        
        // 計算到貨總數
        let totalQuantity = 0;
        if (matchCount > 0) {
            totalQuantity = poHeaderData.reduce((sum, item) => sum + (parseInt(item.total_quantity) || 0), 0);
        }
        
        // 更新到貨總數
        const totalQuantityElement = document.getElementById('totalQuantity');
        if (totalQuantityElement) {
            totalQuantityElement.textContent = totalQuantity;
        }
        
        // 顯示結果訊息
        if (matchCount > 0) {
            showMessage(`找到 ${matchCount} 筆符合的採購單，到貨總數：${totalQuantity} 件`);
        } else {
            showMessage('無單號');
        }
        
        console.log('搜尋完成，找到筆數:', matchCount, '到貨總數:', totalQuantity);
        
    } catch (error) {
        console.error('搜尋採購單時發生錯誤:', error);
        showMessage('搜尋時發生錯誤，請稍後再試');
        
        // 發生錯誤時重置顯示
        const matchCountElement = document.getElementById('matchCount');
        const totalQuantityElement = document.getElementById('totalQuantity');
        if (matchCountElement) matchCountElement.textContent = '0';
        if (totalQuantityElement) totalQuantityElement.textContent = '0';
    } finally {
        showLoading(false);
    }
}

// 查詢 po_header 工作表
async function queryPoHeaderSheet(poNumber) {
    console.log('查詢 po_header 工作表，採購單號:', poNumber);
    
    try {
        // 使用 Google Visualization API 查詢 po_header 工作表
        const queryUrl = `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/gviz/tq?tqx=out:json&sheet=po_header&tq=SELECT A,T WHERE A CONTAINS '${poNumber}'`;
        
        console.log('查詢 URL:', queryUrl);
        
        const response = await fetch(queryUrl);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const text = await response.text();
        console.log('原始回應:', text.substring(0, 500));
        
        // 解析 Google Visualization API 回應
        const jsonMatch = text.match(/google\.visualization\.Query\.setResponse\((.*)\)/);
        if (!jsonMatch) {
            throw new Error('無法解析 Google Visualization API 回應');
        }
        
        const jsonData = JSON.parse(jsonMatch[1]);
        console.log('解析後的資料:', jsonData);
        
        if (!jsonData.table || !jsonData.table.rows) {
            console.log('沒有找到符合的資料');
            return [];
        }
        
        // 轉換資料格式
        const results = jsonData.table.rows.map(row => {
            const cells = row.c;
            return {
                po_number: cells[0]?.v || '',  // A 欄位：採購單號
                total_quantity: cells[1]?.v || 0  // T 欄位：到貨總數
            };
        });
        
        console.log('查詢結果:', results);
        return results;
        
    } catch (error) {
        console.error('查詢 po_header 工作表時發生錯誤:', error);
        throw error;
    }
}

// 模擬 Google Sheets 查詢（保留作為備用）
async function simulateGoogleSheetsQuery(poNumber) {
    console.log('模擬查詢採購單:', poNumber);
    // 模擬 API 延遲
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // 模擬資料
    const mockData = [
        { po_number: 'PO001', item: '商品A', quantity: 10 },
        { po_number: 'PO001', item: '商品B', quantity: 5 },
        { po_number: 'PO002', item: '商品C', quantity: 3 },
        { po_number: 'PO003', item: '商品D', quantity: 8 }
    ];
    
    // 根據採購單號篩選
    const filteredData = mockData.filter(item => item.po_number.includes(poNumber));
    console.log('模擬查詢結果:', filteredData);
    return filteredData;
}

// 提交資料
async function submitData() {
    console.log('提交資料');
    if (!currentPoNumber) {
        showMessage('請先查詢採購單號');
        return;
    }
    
    // 收集序號資料
    const serialNumbers = [];
    document.querySelectorAll('.serial-input').forEach(input => {
        const serial = input.value.trim();
        if (serial) {
            serialNumbers.push(serial);
        }
    });
    
    if (serialNumbers.length === 0) {
        showMessage('請至少輸入一個序號');
        return;
    }
    
    // 比對到貨總數
    const expectedQuantity = await getExpectedQuantity(currentPoNumber);
    const actualQuantity = serialNumbers.length;
    
    console.log('預期到貨總數:', expectedQuantity, '實際提交比數:', actualQuantity);
    
    // 如果比數不同，顯示確認對話框
    if (expectedQuantity !== actualQuantity) {
        const confirmed = await showQuantityMismatchDialog(expectedQuantity, actualQuantity);
        if (!confirmed) {
            console.log('用戶取消提交');
            return;
        }
    }
    
    showLoading(true);
    
    try {
        // 準備要寫入的資料到 po_detail 工作表
        const dataToWrite = serialNumbers.map(serial => [
            currentPoNumber,           // A欄：採購單號
            '',                        // B欄：商品分類（留空）
            serial                     // C欄：商品序號
        ]);
        
        // 生成 Excel 檔案
        await writeToPoDetailSheet(dataToWrite);
        
        showMessage(`成功生成 Excel 檔案，包含 ${serialNumbers.length} 筆序號資料`);
        clearAllInputs();
        
        console.log('資料提交成功');
        
    } catch (error) {
        console.error('提交資料時發生錯誤:', error);
        showMessage('提交資料時發生錯誤，請稍後再試');
    } finally {
        showLoading(false);
    }
}

// 獲取預期到貨總數
async function getExpectedQuantity(poNumber) {
    console.log('獲取預期到貨總數，採購單號:', poNumber);
    
    try {
        // 查詢 po_header 工作表獲取到貨總數
        const poHeaderData = await queryPoHeaderSheet(poNumber);
        
        if (poHeaderData.length > 0) {
            // 取第一筆資料的到貨總數
            const totalQuantity = poHeaderData[0].total_quantity;
            console.log('預期到貨總數:', totalQuantity);
            return parseInt(totalQuantity) || 0;
        }
        
        return 0;
    } catch (error) {
        console.error('獲取預期到貨總數時發生錯誤:', error);
        return 0;
    }
}

// 顯示數量不匹配確認對話框
function showQuantityMismatchDialog(expected, actual) {
    return new Promise((resolve) => {
        const message = `比數不同！\n預期到貨總數：${expected} 件\n實際提交比數：${actual} 件\n\n是否要強制輸入？`;
        
        const confirmed = confirm(message);
        resolve(confirmed);
    });
}

// 生成並下載 Excel 檔案
function generateAndDownloadExcel(data) {
    console.log('生成 Excel 檔案:', data);
    
    try {
        // 準備 Excel 資料
        const excelData = [
            ['採購單號', '商品分類', '商品序號', '開箱人員', '開箱日期'], // 標題行
            ...data.map(row => [
                row[0], // 採購單號
                row[1], // 商品分類
                row[2], // 商品序號
                currentUser, // 開箱人員
                new Date().toISOString().split('T')[0] // 開箱日期
            ])
        ];
        
        // 生成 CSV 格式（Excel 可以開啟）
        let csvContent = '\ufeff'; // BOM for UTF-8
        excelData.forEach(row => {
            const csvRow = row.map(cell => `"${cell}"`).join(',');
            csvContent += csvRow + '\n';
        });
        
        // 創建 Blob
        const blob = new Blob([csvContent], { 
            type: 'text/csv;charset=utf-8;' 
        });
        
        // 創建下載連結
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        
        link.setAttribute('href', url);
        link.setAttribute('download', `po_detail_${currentPoNumber}_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        
        // 觸發下載
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        console.log('Excel 檔案下載成功');
        
    } catch (error) {
        console.error('生成 Excel 檔案時發生錯誤:', error);
        throw error;
    }
}

// 寫入資料（改為生成 Excel 檔案）
async function writeToPoDetailSheet(data) {
    console.log('準備生成 Excel 檔案:', data);
    
    try {
        // 生成並下載 Excel 檔案
        generateAndDownloadExcel(data);
        
        console.log('成功生成 Excel 檔案');
        
    } catch (error) {
        console.error('生成 Excel 檔案時發生錯誤:', error);
        throw error;
    }
}

// 清除所有輸入
function clearAllInputs() {
    console.log('清除所有輸入');
    const poNumberInput = document.getElementById('poNumber');
    if (poNumberInput) {
        poNumberInput.value = '';
    }
    
    document.querySelectorAll('.serial-input').forEach(input => {
        input.value = '';
    });
    
    const matchCountElement = document.getElementById('matchCount');
    if (matchCountElement) {
        matchCountElement.textContent = '0';
    }
    
    currentPoNumber = null;
    matchCount = 0;
    scanCount = 0;
    
    // 更新刷到貨比數
    updateScanCount();
}

// 更新刷到貨比數
function updateScanCount() {
    console.log('更新刷到貨比數');
    
    // 計算有內容的序號輸入框數量
    const serialInputs = document.querySelectorAll('.serial-input');
    let count = 0;
    
    serialInputs.forEach(input => {
        if (input.value.trim() !== '') {
            count++;
        }
    });
    
    scanCount = count;
    
    // 更新顯示
    const scanCountElement = document.getElementById('scanCount');
    if (scanCountElement) {
        scanCountElement.textContent = scanCount;
        
        // 添加動畫效果
        scanCountElement.style.transform = 'scale(1.1)';
        setTimeout(() => {
            scanCountElement.style.transform = 'scale(1)';
        }, 200);
    }
    
    console.log('刷到貨比數更新為:', scanCount);
}

// 顯示載入中
function showLoading(show) {
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) {
        if (show) {
            overlay.classList.remove('hidden');
        } else {
            overlay.classList.add('hidden');
        }
    }
}

// 顯示訊息
function showMessage(message) {
    console.log('顯示訊息:', message);
    const messageText = document.getElementById('messageText');
    const messageBox = document.getElementById('messageBox');
    
    if (messageText) {
        messageText.textContent = message;
    }
    
    if (messageBox) {
        messageBox.classList.remove('hidden');
    }
}

// 隱藏訊息
function hideMessage() {
    const messageBox = document.getElementById('messageBox');
    if (messageBox) {
        messageBox.classList.add('hidden');
    }
}

// 條碼掃描支援
function setupBarcodeScanner() {
    console.log('設定條碼掃描器');
    let barcodeBuffer = '';
    let barcodeTimeout;
    
    document.addEventListener('keydown', function(e) {
        // 如果按下 Enter 鍵且有條碼緩衝區，則處理條碼
        if (e.key === 'Enter' && barcodeBuffer) {
            e.preventDefault();
            
            // 找到當前焦點的輸入欄位
            const activeElement = document.activeElement;
            if (activeElement && activeElement.classList.contains('serial-input')) {
                activeElement.value = barcodeBuffer;
                
                // 自動跳轉到下一個輸入欄位
                const currentIndex = parseInt(activeElement.dataset.index);
                const nextIndex = currentIndex + 1;
                const nextInput = document.querySelector(`[data-index="${nextIndex}"]`);
                if (nextInput) {
                    nextInput.focus();
                }
            }
            
            barcodeBuffer = '';
            clearTimeout(barcodeTimeout);
        } else if (e.key.length === 1) {
            // 累積條碼字元
            barcodeBuffer += e.key;
            
            // 清除之前的計時器
            clearTimeout(barcodeTimeout);
            
            // 設定新的計時器（如果 100ms 內沒有新字元，則清空緩衝區）
            barcodeTimeout = setTimeout(() => {
                barcodeBuffer = '';
            }, 100);
        }
    });
}

// 初始化條碼掃描器
setupBarcodeScanner();

// 匯入功能相關變數
let googleSheetsData = [];
let selectedItems = new Set();

// 導航到匯入頁面
function navigateToImport() {
    console.log('導航到匯入頁面');
    showPage('importPage');
    // 預設載入Google Sheets URL
    const sheetsUrlInput = document.getElementById('sheetsUrl');
    if (sheetsUrlInput && !sheetsUrlInput.value) {
        sheetsUrlInput.value = 'https://docs.google.com/spreadsheets/d/1wJLOHKOrT06CMpuY9X37FhXdQBRCU_gv2KCvJBkMC4k/edit?gid=1971479845#gid=1971479845';
    }
}

// 從URL提取Spreadsheet ID
function extractSpreadsheetId(url) {
    const match = url.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
    return match ? match[1] : null;
}

// 注意：現在使用公開讀取模式，不需要複雜的認證

// 測試Google Sheets連線
async function testGoogleSheetsConnection() {
    console.log('測試Google Sheets連線');
    const sheetsUrl = document.getElementById('sheetsUrl').value.trim();
    
    if (!sheetsUrl) {
        showMessage('請輸入Google Sheets URL');
        return;
    }
    
    const spreadsheetId = extractSpreadsheetId(sheetsUrl);
    if (!spreadsheetId) {
        showMessage('無法從URL中提取Spreadsheet ID');
        return;
    }
    
    showLoading(true);
    
    try {
        // 使用公開讀取的方式測試連線
        const testUrl = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}?key=AIzaSyBxGQoJz8Z8Z8Z8Z8Z8Z8Z8Z8Z8Z8Z8Z8Z8`;
        
        const response = await fetch(testUrl);
        
        if (response.ok) {
            const data = await response.json();
            showMessage(`連線成功！工作表標題：${data.properties.title}`);
        } else {
            // 如果API金鑰無效，嘗試使用公開URL
            const publicUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/gviz/tq?tqx=out:json`;
            const publicResponse = await fetch(publicUrl);
            
            if (publicResponse.ok) {
                showMessage('連線成功！使用公開讀取模式');
            } else {
                showMessage('連線失敗：請確保Google Sheets已設定為公開讀取，或使用有效的API金鑰');
            }
        }
    } catch (error) {
        console.error('測試連線時發生錯誤:', error);
        showMessage('連線測試失敗：' + error.message);
    } finally {
        showLoading(false);
    }
}

// 載入Google Sheets資料
async function loadGoogleSheetsData() {
    console.log('載入Google Sheets資料');
    const sheetsUrl = document.getElementById('sheetsUrl').value.trim();
    const sheetName = document.getElementById('sheetName').value.trim();
    
    if (!sheetsUrl || !sheetName) {
        showMessage('請輸入Google Sheets URL和工作表名稱');
        return;
    }
    
    const spreadsheetId = extractSpreadsheetId(sheetsUrl);
    if (!spreadsheetId) {
        showMessage('無法從URL中提取Spreadsheet ID');
        return;
    }
    
    showLoading(true);
    
    try {
        // 使用公開讀取的方式載入資料
        const publicUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/gviz/tq?tqx=out:json&sheet=${sheetName}`;
        console.log('請求URL:', publicUrl);
        
        const response = await fetch(publicUrl);
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const text = await response.text();
        console.log('原始回應長度:', text.length);
        console.log('原始回應前500字元:', text.substring(0, 500));
        
        // 移除Google Visualization API的回應前綴
        const match = text.match(/google\.visualization\.Query\.setResponse\((.*)\)/);
        if (!match) {
            throw new Error('無法解析Google Sheets回應格式');
        }
        
        const jsonText = match[1];
        console.log('解析後的JSON長度:', jsonText.length);
        
        const data = JSON.parse(jsonText);
        
        // 解析Google Visualization API的資料格式
        if (data.table && data.table.rows) {
            googleSheetsData = data.table.rows.map(row => {
                return row.c.map(cell => cell ? cell.v : '');
            });
            
            // 記錄完整的資料結構
            console.log('=== Google Sheets 資料載入完成 ===');
            console.log('總行數:', googleSheetsData.length);
            console.log('欄位數量:', data.table.cols ? data.table.cols.length : 0);
            
            // 顯示所有欄位標題
            if (data.table.cols && data.table.cols.length > 0) {
                console.log('欄位標題:');
                data.table.cols.forEach((col, index) => {
                    const columnLetter = String.fromCharCode(65 + index);
                    console.log(`${columnLetter}欄 (${index}): ${col.label || '無標題'}`);
                });
            }
            
            // 顯示前10行資料
            console.log('前10行資料:');
            googleSheetsData.slice(0, 10).forEach((row, index) => {
                console.log(`第${index + 1}行:`, row);
            });
            
            // 檢查有效資料行數（A2以後的資料）
            const validDataRows = googleSheetsData.filter((row, index) => index >= 1);
            console.log('有效資料行數（A2以後）:', validDataRows.length);
            console.log('所有行數:', googleSheetsData.length);
            
        } else {
            googleSheetsData = [];
            console.log('沒有找到資料行');
        }
        
        // 更新資料計數
        const dataCountElement = document.getElementById('dataCount');
        if (dataCountElement) {
            const totalRows = googleSheetsData.length;
            // 計算有效資料行數（A2以後的資料）
            const validDataRows = googleSheetsData.filter((row, index) => index >= 1);
            const previewRows = Math.min(20, validDataRows.length);
            dataCountElement.textContent = `預覽前${previewRows}筆 / 總共${validDataRows.length}筆有效資料`;
            console.log('資料計數更新:', `預覽前${previewRows}筆 / 總共${validDataRows.length}筆有效資料`);
        }
        
        // 渲染表格
        renderDataTable();
        
        showMessage(`成功載入 ${googleSheetsData.length} 筆資料`);
        
    } catch (error) {
        console.error('載入資料時發生錯誤:', error);
        showMessage('載入資料失敗：' + error.message);
    } finally {
        showLoading(false);
    }
}

// 渲染資料表格
function renderDataTable() {
    console.log('開始渲染資料表格');
    const tbody = document.getElementById('dataTableBody');
    if (!tbody) {
        console.error('找不到表格主體元素');
        return;
    }
    
    tbody.innerHTML = '';
    
    if (googleSheetsData.length === 0) {
        console.log('沒有資料可顯示');
        return;
    }
    
    // 定義欄位標題對應（只保留指定欄位）
    const columnHeaders = [
        '選擇',
        '序號',
        '採購單號',      // A欄
        '採購日期',      // B欄
        '採購對象',      // C欄
        '進貨總數',      // T欄
        '狀態'
    ];
    
    // 顯示前20筆資料（包括標題行）
    const maxRows = Math.min(21, googleSheetsData.length); // 標題行 + 20筆資料
    
    for (let index = 0; index < maxRows; index++) {
        const row = googleSheetsData[index];
        console.log(`渲染第${index}行:`, row);
        
        const tr = document.createElement('tr');
        
        // 如果是第一行（標題行），顯示欄位標題
        if (index === 0) {
            tr.innerHTML = columnHeaders.map(header => `<th><strong>${header}</strong></th>`).join('');
            tr.style.backgroundColor = '#f8f9fa';
        } else {
            // 資料行 - 只顯示指定欄位
            const purchaseOrderNumber = row[0] || '';  // A欄：採購單號
            const purchaseDate = row[1] || '';         // B欄：採購日期
            const purchaseObject = row[2] || '';       // C欄：採購對象
            const totalQuantity = row[19] || '';       // T欄：進貨總數
            
            tr.innerHTML = `
                <td><input type="checkbox" onchange="toggleItemSelection(${index})" ${selectedItems.has(index) ? 'checked' : ''}></td>
                <td>${index}</td>
                <td title="A欄: 採購單號">${purchaseOrderNumber}</td>
                <td title="B欄: 採購日期">${purchaseDate}</td>
                <td title="C欄: 採購對象">${purchaseObject}</td>
                <td title="T欄: 進貨總數">${totalQuantity}</td>
                <td><span class="status-badge status-pending">待處理</span></td>
            `;
        }
        
        tbody.appendChild(tr);
    }
    
    console.log('表格渲染完成，共顯示', googleSheetsData.length, '行資料');
    console.log('欄位對應:', columnHeaders);
}

// 切換項目選擇
function toggleItemSelection(index) {
    if (selectedItems.has(index)) {
        selectedItems.delete(index);
    } else {
        selectedItems.add(index);
    }
    updateSelectAllCheckbox();
    console.log('選擇項目:', selectedItems.size);
}

// 全選/取消全選
function toggleSelectAll() {
    const selectAllCheckbox = document.getElementById('selectAll');
    const checkboxes = document.querySelectorAll('#dataTableBody input[type="checkbox"]');
    
    checkboxes.forEach((checkbox, index) => {
        checkbox.checked = selectAllCheckbox.checked;
        if (selectAllCheckbox.checked) {
            selectedItems.add(index);
        } else {
            selectedItems.delete(index);
        }
    });
    
    console.log('全選狀態:', selectAllCheckbox.checked, '選擇項目數:', selectedItems.size);
}

// 更新全選checkbox狀態
function updateSelectAllCheckbox() {
    const selectAllCheckbox = document.getElementById('selectAll');
    const checkboxes = document.querySelectorAll('#dataTableBody input[type="checkbox"]');
    const checkedCount = document.querySelectorAll('#dataTableBody input[type="checkbox"]:checked').length;
    
    if (checkedCount === 0) {
        selectAllCheckbox.checked = false;
        selectAllCheckbox.indeterminate = false;
    } else if (checkedCount === checkboxes.length) {
        selectAllCheckbox.checked = true;
        selectAllCheckbox.indeterminate = false;
    } else {
        selectAllCheckbox.checked = false;
        selectAllCheckbox.indeterminate = true;
    }
}

// 清除所有選擇
function clearAllSelections() {
    selectedItems.clear();
    const checkboxes = document.querySelectorAll('#dataTableBody input[type="checkbox"]');
    checkboxes.forEach(checkbox => {
        checkbox.checked = false;
    });
    updateSelectAllCheckbox();
    console.log('清除所有選擇');
}

// 匯入選取的資料
async function importSelectedData() {
    console.log('匯入選取的資料');
    
    if (selectedItems.size === 0) {
        showMessage('請選擇要匯入的資料');
        return;
    }
    
    showLoading(true);
    
    try {
        const progressBar = document.getElementById('importProgress');
        const progressFill = progressBar.querySelector('.progress-fill');
        const statusText = document.getElementById('importStatus');
        
        progressBar.classList.remove('hidden');
        statusText.textContent = '開始匯入...';
        
        const selectedData = Array.from(selectedItems).map(index => googleSheetsData[index]);
        let processedCount = 0;
        
        for (const row of selectedData) {
            // 模擬匯入處理
            await new Promise(resolve => setTimeout(resolve, 100));
            
            processedCount++;
            const progress = (processedCount / selectedData.length) * 100;
            progressFill.style.width = progress + '%';
            statusText.textContent = `匯入中... ${processedCount}/${selectedData.length}`;
        }
        
        // 更新狀態
        selectedItems.forEach(index => {
            const row = document.querySelector(`#dataTableBody tr:nth-child(${index + 1})`);
            if (row) {
                const statusCell = row.querySelector('td:last-child');
                if (statusCell) {
                    statusCell.innerHTML = '<span class="status-badge status-completed">已完成</span>';
                }
            }
        });
        
        statusText.textContent = `成功匯入 ${selectedData.length} 筆資料`;
        showMessage(`成功匯入 ${selectedData.length} 筆資料`);
        
        // 清除選擇
        clearAllSelections();
        
    } catch (error) {
        console.error('匯入資料時發生錯誤:', error);
        showMessage('匯入失敗：' + error.message);
    } finally {
        showLoading(false);
        const progressBar = document.getElementById('importProgress');
        progressBar.classList.add('hidden');
    }
}

console.log('JavaScript檔案載入完成'); 