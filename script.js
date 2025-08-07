// 全域變數
let currentUser = null;
let currentPoNumber = null;
let matchCount = 0;
let scanCount = 0; // 刷到貨比數

// 員工管理相關變數
let employeeCounter = 1; // 員工編號計數器
let employees = []; // 員工資料陣列

// 管理員帳號密碼
const ADMIN_USERNAME = 'Greaia_admin';
const ADMIN_PASSWORD = 'admin0110';

// Google Sheets API 設定
const SPREADSHEET_ID = GOOGLE_SHEETS_CONFIG.SPREADSHEET_ID;
const PO_HEADER_RANGE = 'po_header!A:T';
const PO_DETAIL_RANGE = 'po_detail!A:C';

// 全域錯誤處理
window.addEventListener('error', function(e) {
    console.error('JavaScript 錯誤:', e.error);
    console.error('錯誤位置:', e.filename, ':', e.lineno);
    console.error('錯誤訊息:', e.message);
    
    // 顯示錯誤訊息給用戶
    if (typeof showMessage === 'function') {
        showMessage('發生錯誤: ' + e.message);
    }
    
    // 防止錯誤阻止其他功能
    e.preventDefault();
    return false;
});

// 全域未處理的 Promise 錯誤
window.addEventListener('unhandledrejection', function(e) {
    console.error('未處理的 Promise 錯誤:', e.reason);
    e.preventDefault();
});

// 全域點擊事件調試（簡化版）
document.addEventListener('click', function(e) {
    // 只在開發模式下記錄點擊事件
    if (e.target.tagName === 'BUTTON') {
        console.log('按鈕被點擊:', e.target.id, e.target.className);
    }
});

// 初始化
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM載入完成，初始化應用程式');
    try {
        initializeApp();
        setupEventListeners();
        console.log('應用程式初始化完成');
    } catch (error) {
        console.error('初始化過程中發生錯誤:', error);
        alert('應用程式初始化失敗: ' + error.message);
    }
});

// 備用初始化 - 確保在 DOM 完全載入後執行
window.addEventListener('load', function() {
    console.log('頁面完全載入，檢查事件監聽器');
    
    // 檢查登入按鈕是否存在且有事件監聽器
    const loginBtn = document.getElementById('loginBtn');
    const employeeEditBtn = document.getElementById('employeeEditBtn');
    
    console.log('頁面載入後檢查 - 登入按鈕:', loginBtn);
    console.log('頁面載入後檢查 - 員工編輯按鈕:', employeeEditBtn);
    
    if (loginBtn && !loginBtn.hasAttribute('data-has-listener')) {
        console.log('重新設定登入按鈕事件');
        setupEventListeners();
    }
    
    if (employeeEditBtn && !employeeEditBtn.hasAttribute('data-has-listener')) {
        console.log('重新設定員工編輯按鈕事件');
        setupEventListeners();
    }
});

// 初始化應用程式
function initializeApp() {
    console.log('初始化應用程式');
    
    // 檢查必要函數是否定義
    const requiredFunctions = ['showPage', 'showMessage', 'showAdminAuth', 'handleLogin', 'handleAdminAuth'];
    const missingFunctions = [];
    
    requiredFunctions.forEach(funcName => {
        if (typeof window[funcName] !== 'function') {
            missingFunctions.push(funcName);
            console.error(`必要函數未定義: ${funcName}`);
        }
    });
    
    if (missingFunctions.length > 0) {
        console.error('缺少必要函數:', missingFunctions);
        alert('系統初始化失敗：缺少必要函數 - ' + missingFunctions.join(', '));
        return;
    }
    
    // 確保載入覆蓋層和訊息框是隱藏的
    const loadingOverlay = document.getElementById('loadingOverlay');
    const messageBox = document.getElementById('messageBox');
    
    if (loadingOverlay) {
        loadingOverlay.classList.add('hidden');
        console.log('載入覆蓋層已隱藏');
    }
    
    if (messageBox) {
        messageBox.classList.add('hidden');
        console.log('訊息框已隱藏');
    }
    
    // 檢查是否有已登入的用戶
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
        currentUser = savedUser;
        showPage('functionPage');
        updateUserDisplay();
    } else {
        showPage('loginPage');
    }
    
    // 初始化出貨表單預設日期
    const shippingDateInput = document.getElementById('shippingDate');
    if (shippingDateInput) {
        const today = new Date().toISOString().split('T')[0];
        shippingDateInput.value = today;
    }
}

// 設定事件監聽器
function setupEventListeners() {
    console.log('設定事件監聽器');
    
    // 確保載入覆蓋層是隱藏的
    const loadingOverlay = document.getElementById('loadingOverlay');
    if (loadingOverlay) {
        loadingOverlay.classList.add('hidden');
        console.log('確保載入覆蓋層已隱藏');
    }
    
    // 確保訊息框是隱藏的
    const messageBox = document.getElementById('messageBox');
    if (messageBox) {
        messageBox.classList.add('hidden');
        console.log('確保訊息框已隱藏');
    }
    
    // 登入相關
    const loginBtn = document.getElementById('loginBtn');
    const employeeIdInput = document.getElementById('employeeId');
    
    console.log('尋找登入按鈕:', loginBtn);
    console.log('登入按鈕元素:', loginBtn ? loginBtn.outerHTML : 'null');
    
    if (loginBtn) {
        try {
            // 移除舊的事件監聽器（如果有的話）
            loginBtn.removeEventListener('click', loginBtn._clickHandler);
            
            // 創建新的事件處理函數
            loginBtn._clickHandler = function(e) {
                console.log('登入按鈕被點擊');
                e.preventDefault();
                e.stopPropagation();
                handleLogin();
            };
            
            // 添加事件監聽器
            loginBtn.addEventListener('click', loginBtn._clickHandler);
            loginBtn.setAttribute('data-has-listener', 'true');
            console.log('登入按鈕事件已設定');
            
            // 測試按鈕是否可點擊
            loginBtn.style.cursor = 'pointer';
            console.log('登入按鈕樣式已設定');
            
        } catch (error) {
            console.error('設定登入按鈕事件時發生錯誤:', error);
        }
    } else {
        console.error('找不到登入按鈕');
        // 嘗試延遲查找
        setTimeout(() => {
            const delayedLoginBtn = document.getElementById('loginBtn');
            console.log('延遲查找登入按鈕:', delayedLoginBtn);
            if (delayedLoginBtn) {
                console.log('延遲找到登入按鈕，重新設定事件');
                setupEventListeners();
            }
        }, 1000);
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

    // 員工資料編輯按鈕
    const employeeEditBtn = document.getElementById('employeeEditBtn');
    console.log('尋找員工資料編輯按鈕:', employeeEditBtn);
    if (employeeEditBtn) {
        try {
            // 移除舊的事件監聽器（如果有的話）
            employeeEditBtn.removeEventListener('click', employeeEditBtn._clickHandler);
            
            // 創建新的事件處理函數
            employeeEditBtn._clickHandler = function(e) {
                console.log('員工資料編輯按鈕被點擊');
                e.preventDefault();
                e.stopPropagation();
                
                try {
                    if (typeof showAdminAuth === 'function') {
                        showAdminAuth();
                    } else {
                        console.error('showAdminAuth 函數未定義');
                        showMessage('系統錯誤：showAdminAuth 函數未定義');
                    }
                } catch (error) {
                    console.error('執行 showAdminAuth 時發生錯誤:', error);
                    showMessage('系統錯誤：' + error.message);
                }
            };
            
            employeeEditBtn.addEventListener('click', employeeEditBtn._clickHandler);
            employeeEditBtn.setAttribute('data-has-listener', 'true');
            console.log('員工資料編輯按鈕事件已設定');
        } catch (error) {
            console.error('設定員工資料編輯按鈕事件時發生錯誤:', error);
        }
    } else {
        console.error('找不到員工資料編輯按鈕');
    }

    // 管理員驗證按鈕
    const adminAuthBtn = document.getElementById('adminAuthBtn');
    const backToLoginBtn = document.getElementById('backToLoginBtn');
    
    console.log('尋找管理員驗證按鈕:', adminAuthBtn);
    if (adminAuthBtn) {
        try {
            adminAuthBtn.addEventListener('click', function(e) {
                console.log('管理員驗證按鈕被點擊');
                e.preventDefault();
                e.stopPropagation();
                handleAdminAuth();
            });
            adminAuthBtn.setAttribute('data-has-listener', 'true');
            console.log('管理員驗證按鈕事件已設定');
        } catch (error) {
            console.error('設定管理員驗證按鈕事件時發生錯誤:', error);
        }
    } else {
        console.error('找不到管理員驗證按鈕');
    }
    
    console.log('尋找返回登入按鈕:', backToLoginBtn);
    if (backToLoginBtn) {
        try {
            backToLoginBtn.addEventListener('click', function(e) {
                console.log('返回登入按鈕被點擊');
                e.preventDefault();
                e.stopPropagation();
                showPage('loginPage');
            });
            backToLoginBtn.setAttribute('data-has-listener', 'true');
            console.log('返回登入按鈕事件已設定');
        } catch (error) {
            console.error('設定返回登入按鈕事件時發生錯誤:', error);
        }
    } else {
        console.error('找不到返回登入按鈕');
    }

    // 員工註冊相關按鈕
    const registerEmployeeBtn = document.getElementById('registerEmployeeBtn');
    const clearRegisterBtn = document.getElementById('clearRegisterBtn');
    const backToAdminBtn = document.getElementById('backToAdminBtn');
    const backToLoginFromRegisterBtn = document.getElementById('backToLoginFromRegisterBtn');
    
    if (registerEmployeeBtn) {
        registerEmployeeBtn.addEventListener('click', registerEmployee);
        console.log('註冊員工按鈕事件已設定');
    }
    
    if (clearRegisterBtn) {
        clearRegisterBtn.addEventListener('click', clearRegisterForm);
        console.log('清除註冊資料按鈕事件已設定');
    }
    
    if (backToAdminBtn) {
        backToAdminBtn.addEventListener('click', () => showPage('adminAuthPage'));
        console.log('返回管理員驗證按鈕事件已設定');
    }
    
    if (backToLoginFromRegisterBtn) {
        backToLoginFromRegisterBtn.addEventListener('click', () => showPage('loginPage'));
        console.log('返回登入頁面按鈕事件已設定');
    }
    
    // 員工清單相關按鈕
    const refreshEmployeeListBtn = document.getElementById('refreshEmployeeListBtn');
    const saveEmployeeStatusBtn = document.getElementById('saveEmployeeStatusBtn');
    const exportEmployeesBtn = document.getElementById('exportEmployeesBtn');
    const importEmployeesBtn = document.getElementById('importEmployeesBtn');
    const importEmployeesFile = document.getElementById('importEmployeesFile');
    
    if (refreshEmployeeListBtn) {
        refreshEmployeeListBtn.addEventListener('click', renderEmployeeList);
        console.log('重新整理員工清單按鈕事件已設定');
    }
    
    if (saveEmployeeStatusBtn) {
        saveEmployeeStatusBtn.addEventListener('click', saveAllEmployeeStatus);
        console.log('儲存員工狀態按鈕事件已設定');
    }
    
    if (exportEmployeesBtn) {
        exportEmployeesBtn.addEventListener('click', exportEmployees);
        console.log('匯出員工資料按鈕事件已設定');
    }
    
    if (importEmployeesBtn) {
        importEmployeesBtn.addEventListener('click', () => importEmployeesFile.click());
        console.log('匯入員工資料按鈕事件已設定');
    }
    
    if (importEmployeesFile) {
        importEmployeesFile.addEventListener('change', importEmployees);
        console.log('匯入員工資料檔案事件已設定');
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
    
    // 出貨表相關按鈕
    const addShippingBtn = document.getElementById('addShippingBtn');
    const clearShippingFormBtn = document.getElementById('clearShippingFormBtn');
    const refreshShippingListBtn = document.getElementById('refreshShippingListBtn');
    const exportShippingBtn = document.getElementById('exportShippingBtn');
    const clearAllShippingBtn = document.getElementById('clearAllShippingBtn');
    const backToFunctionFromShippingBtn = document.getElementById('backToFunctionFromShippingBtn');
    
    if (addShippingBtn) {
        addShippingBtn.addEventListener('click', addShippingRecord);
        console.log('新增出貨記錄按鈕事件已設定');
    }
    
    if (clearShippingFormBtn) {
        clearShippingFormBtn.addEventListener('click', clearShippingForm);
        console.log('清除出貨表單按鈕事件已設定');
    }
    
    if (refreshShippingListBtn) {
        refreshShippingListBtn.addEventListener('click', renderShippingList);
        console.log('重新整理出貨清單按鈕事件已設定');
    }
    
    if (exportShippingBtn) {
        exportShippingBtn.addEventListener('click', exportShippingRecords);
        console.log('匯出出貨記錄按鈕事件已設定');
    }
    
    if (clearAllShippingBtn) {
        clearAllShippingBtn.addEventListener('click', clearAllShippingRecords);
        console.log('清除所有出貨記錄按鈕事件已設定');
    }
    
    if (backToFunctionFromShippingBtn) {
        backToFunctionFromShippingBtn.addEventListener('click', () => {
            showPage('functionPage');
        });
        console.log('出貨表返回功能頁面按鈕事件已設定');
    }
    
    // 開箱明細相關按鈕
    const searchUnboxingPoBtn = document.getElementById('searchUnboxingPoBtn');
    const submitUnboxingBtn = document.getElementById('submitUnboxingBtn');
    const clearUnboxingFormBtn = document.getElementById('clearUnboxingFormBtn');
    const backToFunctionFromUnboxingBtn = document.getElementById('backToFunctionFromUnboxingBtn');
    
    if (searchUnboxingPoBtn) {
        searchUnboxingPoBtn.addEventListener('click', searchUnboxingPoNumber);
        console.log('查詢開箱採購單號按鈕事件已設定');
    }
    
    if (submitUnboxingBtn) {
        submitUnboxingBtn.addEventListener('click', submitUnboxingDetails);
        console.log('提交開箱明細按鈕事件已設定');
    }
    
    if (clearUnboxingFormBtn) {
        clearUnboxingFormBtn.addEventListener('click', clearUnboxingForm);
        console.log('清除開箱表單按鈕事件已設定');
    }
    
    if (backToFunctionFromUnboxingBtn) {
        backToFunctionFromUnboxingBtn.addEventListener('click', () => {
            showPage('functionPage');
        });
        console.log('開箱明細返回功能頁面按鈕事件已設定');
    }
    
    // 功能頁面導航按鈕事件監聽器
    const functionCards = document.querySelectorAll('.function-card');
    functionCards.forEach(card => {
        card.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            // 檢查是否為禁用狀態
            if (this.classList.contains('disabled')) {
                showMessage('此功能尚未開放');
                return;
            }
            
            // 根據卡片內容判斷要導航到哪個頁面
            const cardText = this.querySelector('h3').textContent;
            console.log('功能卡片被點擊:', cardText);
            
            switch (cardText) {
                case '點到貨':
                    navigateToReceiving();
                    break;
                case '匯入採購到貨':
                    navigateToImport();
                    break;
                case '出貨表':
                    navigateToShipping();
                    break;
                case '開箱明細':
                    navigateToUnboxing();
                    break;
                default:
                    showMessage('此功能尚未開放');
                    break;
            }
        });
    });
        console.log('功能頁面導航按鈕事件已設定');
    }
    
    // 開箱明細相關按鈕
    const searchUnboxingPoBtn = document.getElementById('searchUnboxingPoBtn');
    const submitUnboxingBtn = document.getElementById('submitUnboxingBtn');
    const clearUnboxingFormBtn = document.getElementById('clearUnboxingFormBtn');
    const backToFunctionFromUnboxingBtn = document.getElementById('backToFunctionFromUnboxingBtn');
    
    if (searchUnboxingPoBtn) {
        searchUnboxingPoBtn.addEventListener('click', searchUnboxingPoNumber);
        console.log('查詢開箱採購單號按鈕事件已設定');
    }
    
    if (submitUnboxingBtn) {
        submitUnboxingBtn.addEventListener('click', submitUnboxingDetails);
        console.log('提交開箱明細按鈕事件已設定');
    }
    
    if (clearUnboxingFormBtn) {
        clearUnboxingFormBtn.addEventListener('click', clearUnboxingForm);
        console.log('清除開箱明細表單按鈕事件已設定');
    }
    
    if (backToFunctionFromUnboxingBtn) {
        backToFunctionFromUnboxingBtn.addEventListener('click', () => showPage('functionPage'));
        console.log('開箱明細返回功能頁面按鈕事件已設定');
    }
    
    // 功能頁面導航按鈕事件監聽器
    const functionCards = document.querySelectorAll('.function-card');
    functionCards.forEach(card => {
        card.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            // 檢查是否為禁用狀態
            if (this.classList.contains('disabled')) {
                showMessage('此功能尚未開放');
                return;
            }
            
            // 根據卡片內容判斷要導航到哪個頁面
            const cardText = this.querySelector('h3').textContent;
            console.log('功能卡片被點擊:', cardText);
            
            switch (cardText) {
                case '點到貨':
                    navigateToReceiving();
                    break;
                case '匯入採購到貨':
                    navigateToImport();
                    break;
                case '出貨表':
                    navigateToShipping();
                    break;
                case '開箱明細':
                    navigateToUnboxing();
                    break;
                default:
                    showMessage('此功能尚未開放');
                    break;
            }
        });
    });
    console.log('功能頁面導航按鈕事件已設定');

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
    
    // 驗證員工編號是否存在
    if (!validateEmployeeId(employeeId)) {
        showMessage('員工編號不存在，請先註冊');
        return;
    }
    
    currentUser = employeeId;
    localStorage.setItem('currentUser', employeeId);
    
    showPage('functionPage');
    updateUserDisplay();
    
    // 清空登入欄位
    document.getElementById('employeeId').value = '';
    console.log('登入成功:', employeeId);
    showMessage('登入成功！');
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
        // 使用 Google Visualization API 查詢 po_header 工作表，獲取採購單號、廠商名稱和進貨總數
        const query = `SELECT A,C,T WHERE A CONTAINS '${poNumber}'`;
        const encodedQuery = encodeURIComponent(query);
        const queryUrl = `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/gviz/tq?tqx=out:json&sheet=po_header&tq=${encodedQuery}`;
        
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
                po_number: cells[0]?.v || '',      // A 欄位：採購單號
                supplier_name: cells[1]?.v || '',  // C 欄位：廠商名稱
                total_quantity: cells[2]?.v || 0   // T 欄位：進貨總數
            };
        });
        
        console.log('查詢結果:', results);
        return results;
        
    } catch (error) {
        console.error('查詢 po_header 工作表時發生錯誤:', error);
        throw error;
    }
}

// 查詢 po_header 工作表，獲取 T 欄位進貨總數
async function queryPurchaseDetailSheet(poNumber) {
    console.log('查詢 po_header 工作表進貨總數，採購單號:', poNumber);
    
    try {
        // 使用 Google Visualization API 查詢 po_header 工作表的 T 欄位（進貨總數）
        const query = `SELECT T WHERE A CONTAINS '${poNumber}'`;
        const encodedQuery = encodeURIComponent(query);
        const queryUrl = `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/gviz/tq?tqx=out:json&sheet=po_header&tq=${encodedQuery}`;
        
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
        
        if (!jsonData.table || !jsonData.table.rows || jsonData.table.rows.length === 0) {
            console.log('沒有找到符合的資料');
            return 0;
        }
        
        // 獲取 T 欄位的進貨總數
        const totalQuantity = jsonData.table.rows[0].c[0]?.v || 0;
        console.log('進貨總數:', totalQuantity);
        return totalQuantity;
        
    } catch (error) {
        console.error('查詢 po_header 工作表進貨總數時發生錯誤:', error);
        throw error;
    }
}

// 查詢廠商代碼
async function querySupplierCode(supplierName) {
    console.log('查詢廠商代碼，廠商名稱:', supplierName);
    
    try {
        // 使用 Google Visualization API 查詢 supplier_contacts 工作表
        // 先獲取所有資料，然後在 JavaScript 中進行過濾
        const query = `SELECT A,B`;
        const encodedQuery = encodeURIComponent(query);
        const queryUrl = `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/gviz/tq?tqx=out:json&sheet=supplier_contacts&tq=${encodedQuery}`;
        
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
            console.log('沒有找到資料');
            return '000'; // 預設代碼
        }
        
        // 在 JavaScript 中過濾廠商名稱
        for (let row of jsonData.table.rows) {
            const cells = row.c;
            const code = cells[0]?.v || '';
            const name = cells[1]?.v || '';
            
            if (name && name.includes(supplierName)) {
                console.log('找到廠商代碼:', code, '廠商名稱:', name);
                return code;
            }
        }
        
        console.log('沒有找到符合的廠商代碼');
        return '000'; // 預設代碼
        
    } catch (error) {
        console.error('查詢廠商代碼時發生錯誤:', error);
        return '000'; // 預設代碼
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

// 顯示管理員驗證頁面
function showAdminAuth() {
    console.log('顯示管理員驗證頁面');
    showPage('adminAuthPage');
    
    // 清空輸入欄位
    document.getElementById('adminUsername').value = '';
    document.getElementById('adminPassword').value = '';
}

// 處理管理員驗證
function handleAdminAuth() {
    console.log('處理管理員驗證');
    
    const username = document.getElementById('adminUsername').value.trim();
    const password = document.getElementById('adminPassword').value.trim();
    
    if (!username || !password) {
        showMessage('請輸入管理帳號和密碼');
        return;
    }
    
    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
        console.log('管理員驗證成功');
        showEmployeeRegister();
    } else {
        showMessage('管理帳號或密碼錯誤');
    }
}

// 顯示員工註冊頁面
function showEmployeeRegister() {
    console.log('顯示員工註冊頁面');
    
    // 載入已儲存的員工資料
    loadEmployees();
    
    // 生成下一個員工編號
    generateNextEmployeeId();
    
    // 清空註冊表單
    clearRegisterForm();
    
    // 渲染員工清單
    renderEmployeeList();
    
    showPage('employeeRegisterPage');
}

// 載入員工資料
function loadEmployees() {
    const savedEmployees = localStorage.getItem('employees');
    if (savedEmployees) {
        employees = JSON.parse(savedEmployees);
        
        // 為現有的員工資料添加狀態欄位（如果沒有）
        let hasChanges = false;
        employees.forEach(employee => {
            if (!employee.status) {
                employee.status = 'active'; // 預設為在職中
                hasChanges = true;
            }
        });
        
        // 如果有變更，重新儲存
        if (hasChanges) {
            localStorage.setItem('employees', JSON.stringify(employees));
            console.log('已為現有員工資料添加狀態欄位');
        }
        
        // 找出最大的員工編號並設定下一個編號
        if (employees.length > 0) {
            const maxId = Math.max(...employees.map(emp => {
                const idNumber = parseInt(emp.id.replace('GR', ''));
                return isNaN(idNumber) ? 0 : idNumber;
            }));
            employeeCounter = maxId + 1;
        } else {
            employeeCounter = 1;
        }
        console.log('載入員工資料:', employees, '下一個編號:', employeeCounter);
    }
}

// 生成下一個員工編號
function generateNextEmployeeId() {
    const nextId = `GR${String(employeeCounter).padStart(5, '0')}`;
    document.getElementById('generatedEmployeeId').textContent = nextId;
    console.log('生成員工編號:', nextId);
}

// 註冊員工
function registerEmployee() {
    console.log('註冊員工');
    
    const name = document.getElementById('employeeName').value.trim();
    const phone = document.getElementById('employeePhone').value.trim();
    const email = document.getElementById('employeeEmail').value.trim();
    const employeeId = document.getElementById('generatedEmployeeId').textContent;
    
    // 驗證輸入
    if (!name || !phone || !email) {
        showMessage('請填寫所有必填欄位');
        return;
    }
    
    // 驗證 Email 格式
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        showMessage('請輸入有效的 Email 格式');
        return;
    }
    
    // 驗證電話格式
    const phoneRegex = /^[\d\-\+\(\)\s]+$/;
    if (!phoneRegex.test(phone)) {
        showMessage('請輸入有效的電話號碼');
        return;
    }
    
    // 檢查 Email 是否已存在
    const existingEmployee = employees.find(emp => emp.email === email);
    if (existingEmployee) {
        showMessage('此 Email 已被註冊');
        return;
    }
    
    // 創建新員工資料
    const newEmployee = {
        id: employeeId,
        name: name,
        phone: phone,
        email: email,
        registerDate: new Date().toISOString().split('T')[0],
        status: 'active' // 預設為在職中
    };
    
    // 添加到員工陣列
    employees.push(newEmployee);
    
    // 儲存到 localStorage
    localStorage.setItem('employees', JSON.stringify(employees));
    
    // 更新計數器
    employeeCounter++;
    
    console.log('員工註冊成功:', newEmployee);
    showMessage(`員工註冊成功！員工編號：${employeeId}`);
    
    // 清空表單並生成下一個編號
    clearRegisterForm();
    generateNextEmployeeId();
    
    // 重新載入員工清單
    renderEmployeeList();
}

// 清除註冊表單
function clearRegisterForm() {
    document.getElementById('employeeName').value = '';
    document.getElementById('employeePhone').value = '';
    document.getElementById('employeeEmail').value = '';
    console.log('清除註冊表單');
}

// 驗證員工編號（修改原有的登入驗證）
function validateEmployeeId(employeeId) {
    // 載入員工資料
    loadEmployees();
    
    // 檢查員工編號是否存在且為在職狀態
    const employee = employees.find(emp => emp.id === employeeId && emp.status === 'active');
    if (employee) {
        console.log('員工驗證成功:', employee);
        return true;
    }
    
    console.log('員工編號不存在或已離職:', employeeId);
    return false;
}

// 渲染員工清單
function renderEmployeeList() {
    console.log('渲染員工清單');
    const tbody = document.getElementById('employeeListBody');
    if (!tbody) {
        console.error('找不到員工清單表格主體');
        return;
    }
    
    // 清空現有內容
    tbody.innerHTML = '';
    
    if (employees.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; color: #666;">尚無員工資料</td></tr>';
        return;
    }
    
    // 按註冊日期排序（最新的在前）
    const sortedEmployees = [...employees].sort((a, b) => new Date(b.registerDate) - new Date(a.registerDate));
    
    sortedEmployees.forEach((employee, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${employee.id}</td>
            <td>${employee.name}</td>
            <td>${employee.phone}</td>
            <td>${employee.email}</td>
            <td>${employee.registerDate}</td>
            <td>
                <select class="employee-status-select" data-employee-id="${employee.id}" onchange="updateEmployeeStatus('${employee.id}', this.value)">
                    <option value="active" ${employee.status === 'active' ? 'selected' : ''}>在職中</option>
                    <option value="inactive" ${employee.status === 'inactive' ? 'selected' : ''}>已離職</option>
                </select>
            </td>
        `;
        tbody.appendChild(row);
    });
    
    console.log('員工清單渲染完成，共', employees.length, '筆資料');
}

// 更新員工狀態
function updateEmployeeStatus(employeeId, newStatus) {
    console.log('更新員工狀態:', employeeId, newStatus);
    
    const employee = employees.find(emp => emp.id === employeeId);
    if (employee) {
        employee.status = newStatus;
        
        // 儲存到 localStorage
        localStorage.setItem('employees', JSON.stringify(employees));
        
        console.log('員工狀態已更新:', employee);
        showMessage(`員工 ${employee.name} 狀態已更新為 ${newStatus === 'active' ? '在職中' : '已離職'}`);
    }
}

// 儲存所有員工狀態變更
function saveAllEmployeeStatus() {
    console.log('儲存所有員工狀態變更');
    
    // 重新儲存到 localStorage
    localStorage.setItem('employees', JSON.stringify(employees));
    
    showMessage('所有員工狀態變更已儲存');
}

// 匯出員工資料
function exportEmployees() {
    console.log('匯出員工資料');
    
    if (employees.length === 0) {
        showMessage('尚無員工資料可匯出');
        return;
    }
    
    try {
        // 準備匯出資料
        const exportData = {
            version: '1.0',
            exportDate: new Date().toISOString(),
            employeeCounter: employeeCounter,
            employees: employees
        };
        
        // 轉換為 JSON 格式
        const jsonData = JSON.stringify(exportData, null, 2);
        
        // 建立並下載檔案
        const blob = new Blob([jsonData], { type: 'application/json' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        
        link.setAttribute('href', url);
        link.setAttribute('download', `員工資料備份_${new Date().toISOString().split('T')[0]}.json`);
        link.style.visibility = 'hidden';
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        console.log('員工資料匯出成功');
        showMessage(`成功匯出 ${employees.length} 筆員工資料`);
        
    } catch (error) {
        console.error('匯出員工資料時發生錯誤:', error);
        showMessage('匯出員工資料失敗：' + error.message);
    }
}

// 匯入員工資料
function importEmployees(event) {
    console.log('匯入員工資料');
    
    const file = event.target.files[0];
    if (!file) {
        console.log('沒有選擇檔案');
        return;
    }
    
    // 檢查檔案類型
    if (file.type !== 'application/json' && !file.name.endsWith('.json')) {
        showMessage('請選擇 JSON 格式的檔案');
        return;
    }
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const importData = JSON.parse(e.target.result);
            
            // 驗證資料格式
            if (!importData.employees || !Array.isArray(importData.employees)) {
                throw new Error('檔案格式不正確，缺少員工資料陣列');
            }
            
            // 確認是否要覆蓋現有資料
            if (employees.length > 0) {
                const confirmed = confirm(`目前有 ${employees.length} 筆員工資料，匯入將會覆蓋現有資料。\n\n確定要匯入 ${importData.employees.length} 筆員工資料嗎？`);
                if (!confirmed) {
                    console.log('用戶取消匯入');
                    return;
                }
            }
            
            // 匯入資料
            employees = importData.employees;
            employeeCounter = importData.employeeCounter || 1;
            
            // 儲存到 localStorage
            localStorage.setItem('employees', JSON.stringify(employees));
            
            // 重新渲染員工清單
            renderEmployeeList();
            
            console.log('員工資料匯入成功');
            showMessage(`成功匯入 ${employees.length} 筆員工資料`);
            
        } catch (error) {
            console.error('匯入員工資料時發生錯誤:', error);
            showMessage('匯入員工資料失敗：' + error.message);
        }
    };
    
    reader.readAsText(file);
    
    // 清空檔案輸入，允許重複選擇同一檔案
    event.target.value = '';
}

// 出貨表相關變數
let shippingRecords = [];

// 開箱明細相關變數
let unboxingRecords = [];
let currentUnboxingPoNumber = '';
let currentBatchNumber = '';
let currentSupplierCode = '000'; // 廠商代碼
let currentBatchCounter = 0; // 批號流水號計數器

// 匯入功能相關變數
let googleSheetsData = [];
let selectedItems = new Set();

// 導航到出貨表頁面
function navigateToShipping() {
    console.log('導航到出貨表頁面');
    loadShippingRecords();
    renderShippingList();
    
    // 自動填入登入的員工編號
    const shippingPersonInput = document.getElementById('shippingPerson');
    if (shippingPersonInput && currentUser) {
        shippingPersonInput.value = currentUser;
        console.log('自動填入出貨人員:', currentUser);
    }
    
    showPage('shippingPage');
}

// 導航到開箱明細頁面
function navigateToUnboxing() {
    console.log('導航到開箱明細頁面');
    // 延遲初始化，確保所有函數都已定義
    setTimeout(() => {
        if (typeof initializeUnboxingForm === 'function') {
            initializeUnboxingForm();
        } else {
            console.error('initializeUnboxingForm 函數未定義');
            showMessage('系統錯誤：開箱明細功能初始化失敗');
        }
    }, 100);
    showPage('unboxingPage');
}



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

// 出貨表相關函數

// 載入出貨記錄
function loadShippingRecords() {
    const savedRecords = localStorage.getItem('shippingRecords');
    if (savedRecords) {
        shippingRecords = JSON.parse(savedRecords);
        console.log('載入出貨記錄:', shippingRecords);
    } else {
        shippingRecords = [];
        console.log('初始化出貨記錄陣列');
    }
}

// 儲存出貨記錄
function saveShippingRecords() {
    localStorage.setItem('shippingRecords', JSON.stringify(shippingRecords));
    console.log('出貨記錄已儲存');
}

// 新增出貨記錄
function addShippingRecord() {
    console.log('新增出貨記錄');
    
    const shippingDate = document.getElementById('shippingDate').value;
    const shippingPrice = parseFloat(document.getElementById('shippingPrice').value);
    const paymentMethod = document.getElementById('paymentMethod').value;
    const orderNumber = document.getElementById('orderNumber').value.trim();
    const shippingTarget = document.getElementById('shippingTarget').value.trim();
    const shippingPerson = document.getElementById('shippingPerson').value.trim();
    const shippingNotes = document.getElementById('shippingNotes').value.trim();
    
    // 驗證必填欄位
    if (!shippingDate || !shippingPrice || !paymentMethod || !orderNumber || !shippingTarget || !shippingPerson) {
        showMessage('請填寫所有必填欄位');
        return;
    }
    
    // 驗證價格
    if (shippingPrice <= 0) {
        showMessage('出貨價格必須大於0');
        return;
    }
    
    // 檢查訂單編號是否重複
    const existingRecord = shippingRecords.find(record => record.orderNumber === orderNumber);
    if (existingRecord) {
        showMessage('訂單編號已存在，請使用不同的編號');
        return;
    }
    
    // 創建新出貨記錄
    const newRecord = {
        id: Date.now().toString(), // 使用時間戳作為唯一ID
        shippingDate: shippingDate,
        shippingPrice: shippingPrice,
        paymentMethod: paymentMethod,
        orderNumber: orderNumber,
        shippingTarget: shippingTarget,
        shippingPerson: shippingPerson,
        shippingNotes: shippingNotes,
        createDate: new Date().toISOString().split('T')[0]
    };
    
    // 添加到記錄陣列
    shippingRecords.push(newRecord);
    
    // 儲存到 localStorage
    saveShippingRecords();
    
    console.log('出貨記錄新增成功:', newRecord);
    showMessage(`出貨記錄新增成功！訂單編號：${orderNumber}`);
    
    // 清空表單並重新渲染清單
    clearShippingForm();
    renderShippingList();
}

// 清除出貨表單
function clearShippingForm() {
    document.getElementById('shippingDate').value = '';
    document.getElementById('shippingPrice').value = '';
    document.getElementById('paymentMethod').value = '';
    document.getElementById('orderNumber').value = '';
    document.getElementById('shippingTarget').value = '';
    document.getElementById('shippingNotes').value = '';
    
    // 設定今天的日期為預設值
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('shippingDate').value = today;
    
    // 保持出貨人員為登入的員工編號
    const shippingPersonInput = document.getElementById('shippingPerson');
    if (shippingPersonInput && currentUser) {
        shippingPersonInput.value = currentUser;
    }
    
    console.log('出貨表單已清除（保留出貨人員）');
}

// 渲染出貨清單
function renderShippingList() {
    console.log('渲染出貨清單');
    const tbody = document.getElementById('shippingListBody');
    if (!tbody) {
        console.error('找不到出貨清單表格主體');
        return;
    }
    
    // 清空現有內容
    tbody.innerHTML = '';
    
    if (shippingRecords.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" style="text-align: center; color: #666;">尚無出貨記錄</td></tr>';
        return;
    }
    
    // 按出庫日期排序（最新的在前）
    const sortedRecords = [...shippingRecords].sort((a, b) => new Date(b.shippingDate) - new Date(a.shippingDate));
    
    sortedRecords.forEach((record, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${record.shippingDate}</td>
            <td>$${record.shippingPrice.toLocaleString()}</td>
            <td>${record.paymentMethod}</td>
            <td>${record.orderNumber}</td>
            <td>${record.shippingTarget}</td>
            <td>${record.shippingPerson}</td>
            <td>${record.shippingNotes || '-'}</td>
            <td>
                <button class="shipping-action-btn shipping-edit-btn" onclick="editShippingRecord('${record.id}')">編輯</button>
                <button class="shipping-action-btn shipping-delete-btn" onclick="deleteShippingRecord('${record.id}')">刪除</button>
            </td>
        `;
        tbody.appendChild(row);
    });
    
    console.log('出貨清單渲染完成，共', shippingRecords.length, '筆記錄');
}

// 編輯出貨記錄
function editShippingRecord(recordId) {
    console.log('編輯出貨記錄:', recordId);
    
    const record = shippingRecords.find(r => r.id === recordId);
    if (!record) {
        showMessage('找不到要編輯的記錄');
        return;
    }
    
    // 填充表單
    document.getElementById('shippingDate').value = record.shippingDate;
    document.getElementById('shippingPrice').value = record.shippingPrice;
    document.getElementById('paymentMethod').value = record.paymentMethod;
    document.getElementById('orderNumber').value = record.orderNumber;
    document.getElementById('shippingTarget').value = record.shippingTarget;
    document.getElementById('shippingPerson').value = record.shippingPerson;
    document.getElementById('shippingNotes').value = record.shippingNotes;
    
    // 變更按鈕文字和功能
    const addBtn = document.getElementById('addShippingBtn');
    addBtn.textContent = '更新記錄';
    addBtn.onclick = () => updateShippingRecord(recordId);
    
    showMessage('請修改資料後點擊「更新記錄」');
}

// 更新出貨記錄
function updateShippingRecord(recordId) {
    console.log('更新出貨記錄:', recordId);
    
    const shippingDate = document.getElementById('shippingDate').value;
    const shippingPrice = parseFloat(document.getElementById('shippingPrice').value);
    const paymentMethod = document.getElementById('paymentMethod').value;
    const orderNumber = document.getElementById('orderNumber').value.trim();
    const shippingTarget = document.getElementById('shippingTarget').value.trim();
    const shippingPerson = document.getElementById('shippingPerson').value.trim();
    const shippingNotes = document.getElementById('shippingNotes').value.trim();
    
    // 驗證必填欄位
    if (!shippingDate || !shippingPrice || !paymentMethod || !orderNumber || !shippingTarget || !shippingPerson) {
        showMessage('請填寫所有必填欄位');
        return;
    }
    
    // 驗證價格
    if (shippingPrice <= 0) {
        showMessage('出貨價格必須大於0');
        return;
    }
    
    // 檢查訂單編號是否重複（排除自己）
    const existingRecord = shippingRecords.find(record => record.orderNumber === orderNumber && record.id !== recordId);
    if (existingRecord) {
        showMessage('訂單編號已存在，請使用不同的編號');
        return;
    }
    
    // 更新記錄
    const recordIndex = shippingRecords.findIndex(r => r.id === recordId);
    if (recordIndex !== -1) {
        shippingRecords[recordIndex] = {
            ...shippingRecords[recordIndex],
            shippingDate: shippingDate,
            shippingPrice: shippingPrice,
            paymentMethod: paymentMethod,
            orderNumber: orderNumber,
            shippingTarget: shippingTarget,
            shippingPerson: shippingPerson,
            shippingNotes: shippingNotes
        };
        
        // 儲存到 localStorage
        saveShippingRecords();
        
        console.log('出貨記錄更新成功');
        showMessage(`出貨記錄更新成功！訂單編號：${orderNumber}`);
        
        // 重置表單並重新渲染清單
        clearShippingForm();
        renderShippingList();
        
        // 恢復按鈕
        const addBtn = document.getElementById('addShippingBtn');
        addBtn.textContent = '新增出貨記錄';
        addBtn.onclick = addShippingRecord;
    }
}

// 刪除出貨記錄
function deleteShippingRecord(recordId) {
    console.log('刪除出貨記錄:', recordId);
    
    if (confirm('確定要刪除這筆出貨記錄嗎？此操作無法復原。')) {
        const recordIndex = shippingRecords.findIndex(r => r.id === recordId);
        if (recordIndex !== -1) {
            const deletedRecord = shippingRecords.splice(recordIndex, 1)[0];
            
            // 儲存到 localStorage
            saveShippingRecords();
            
            console.log('出貨記錄刪除成功:', deletedRecord);
            showMessage(`出貨記錄已刪除！訂單編號：${deletedRecord.orderNumber}`);
            
            // 重新渲染清單
            renderShippingList();
        }
    }
}

// 匯出出貨記錄為Excel
function exportShippingRecords() {
    console.log('匯出出貨記錄');
    
    if (shippingRecords.length === 0) {
        showMessage('尚無出貨記錄可匯出');
        return;
    }
    
    // 準備CSV資料
    const headers = ['出庫日期', '出貨價格', '付款方式', '訂單編號', '出貨對象', '出貨人員', '備註', '建立日期'];
    const csvData = [headers];
    
    // 按出庫日期排序
    const sortedRecords = [...shippingRecords].sort((a, b) => new Date(a.shippingDate) - new Date(b.shippingDate));
    
    sortedRecords.forEach(record => {
        csvData.push([
            record.shippingDate,
            record.shippingPrice,
            record.paymentMethod,
            record.orderNumber,
            record.shippingTarget,
            record.shippingPerson,
            record.shippingNotes || '',
            record.createDate
        ]);
    });
    
    // 轉換為CSV格式
    const csvContent = csvData.map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
    
    // 建立並下載檔案
    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `出貨記錄_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    console.log('出貨記錄匯出完成');
    showMessage('出貨記錄已匯出為Excel檔案');
}

// 清除所有出貨記錄
function clearAllShippingRecords() {
    console.log('清除所有出貨記錄');
    
    if (shippingRecords.length === 0) {
        showMessage('尚無出貨記錄可清除');
        return;
    }
    
    if (confirm(`確定要清除所有 ${shippingRecords.length} 筆出貨記錄嗎？此操作無法復原。`)) {
        shippingRecords = [];
        saveShippingRecords();
        renderShippingList();
        
        console.log('所有出貨記錄已清除');
        showMessage('所有出貨記錄已清除');
    }
}

// 開箱明細相關函數

// 初始化開箱明細表單
function initializeUnboxingForm() {
    console.log('初始化開箱明細表單');
    
    // 設定開箱人員（登入員工編號）
    const unboxingPersonSpan = document.getElementById('unboxingPerson');
    if (unboxingPersonSpan && currentUser) {
        unboxingPersonSpan.textContent = currentUser;
    }
    
    // 設定開箱日期（今天）
    const unboxingDateSpan = document.getElementById('unboxingDate');
    if (unboxingDateSpan) {
        const today = new Date().toISOString().split('T')[0];
        unboxingDateSpan.textContent = today;
    }
    
    // 生成批號匹配（流水號）
    generateBatchNumber();
    
    // 生成20個商品項目
    generateUnboxingItems();
    
    console.log('開箱明細表單初始化完成');
}

// 生成批號匹配
function generateBatchNumber() {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);
    currentBatchNumber = `B${timestamp}${random}`;
    
    console.log('生成批號匹配:', currentBatchNumber);
}

// 生成20個商品項目
function generateUnboxingItems() {
    console.log('生成20個商品項目');
    const tbody = document.getElementById('unboxingItemsBody');
    if (!tbody) {
        console.error('找不到開箱項目表格主體');
        return;
    }
    
    // 清空現有內容
    tbody.innerHTML = '';
    
    // 生成20個商品項目
    for (let i = 1; i <= 20; i++) {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${i}</td>
            <td>
                <select class="product-category-select" data-index="${i}">
                    <option value="">請選擇分類</option>
                    <option value="手機">手機</option>
                    <option value="平板">平板</option>
                    <option value="筆電">筆電</option>
                    <option value="手錶">手錶</option>
                </select>
            </td>
            <td>
                <input type="text" class="product-serial-input" data-index="${i}" placeholder="請輸入商品序號" maxlength="50">
            </td>
            <td>
                <span class="item-batch-number" data-index="${i}">-</span>
            </td>
        `;
        tbody.appendChild(row);
    }
    
    // 為商品序號輸入框添加事件監聽器
    setupSerialInputListeners();
    
    console.log('20個商品項目生成完成');
}

// 為每個項目生成獨立的批號
function generateItemBatchNumber(itemIndex) {
    // 使用廠商代碼 + 6位數字流水號
    currentBatchCounter++;
    const sequenceNumber = currentBatchCounter.toString().padStart(6, '0');
    return `${currentSupplierCode}${sequenceNumber}`;
}

// 設置商品序號輸入框的事件監聽器
function setupSerialInputListeners() {
    const serialInputs = document.querySelectorAll('.product-serial-input');
    
    serialInputs.forEach(input => {
        input.addEventListener('input', function() {
            const index = this.getAttribute('data-index');
            const serialValue = this.value.trim();
            const batchNumberSpan = document.querySelector(`.item-batch-number[data-index="${index}"]`);
            
            if (serialValue) {
                // 有商品序號時，產生批號
                const itemBatchNumber = generateItemBatchNumber(parseInt(index));
                batchNumberSpan.textContent = itemBatchNumber;
                batchNumberSpan.style.color = '#007bff';
            } else {
                // 沒有商品序號時，清空批號
                batchNumberSpan.textContent = '-';
                batchNumberSpan.style.color = '#6c757d';
            }
        });
    });
}

// 查詢開箱採購單號
async function searchUnboxingPoNumber() {
    console.log('查詢開箱採購單號');
    
    const poNumber = document.getElementById('unboxingPoNumber').value.trim();
    
    if (!poNumber) {
        showMessage('請輸入採購單號');
        return;
    }
    
    showLoading(true);
    
    try {
        // 使用與點到貨相同的查詢邏輯
        const poHeaderData = await queryPoHeaderSheet(poNumber);
        
        if (poHeaderData.length > 0) {
            currentUnboxingPoNumber = poNumber;
            
            // 獲取廠商資訊
            const supplierName = poHeaderData[0].supplier_name;
            const totalQuantity = poHeaderData[0].total_quantity;
            
            console.log('獲取到的廠商資訊:', {
                supplierName: supplierName,
                totalQuantity: totalQuantity,
                poHeaderData: poHeaderData[0]
            });
            
            // 更新採購單號顯示
            const currentPoNumberSpan = document.getElementById('currentPoNumber');
            if (currentPoNumberSpan) {
                currentPoNumberSpan.textContent = poNumber;
                console.log('更新採購單號顯示:', poNumber);
            }
            
            // 更新進貨廠商顯示
            const supplierNameSpan = document.getElementById('supplierName');
            console.log('找到 supplierName 元素:', supplierNameSpan);
            if (supplierNameSpan) {
                supplierNameSpan.textContent = supplierName || '-';
                console.log('更新進貨廠商顯示:', supplierName || '-');
            } else {
                console.error('找不到 supplierName 元素');
            }
            
            // 更新需開箱數量顯示
            const requiredCountSpan = document.getElementById('requiredUnboxingCount');
            if (requiredCountSpan) {
                requiredCountSpan.textContent = totalQuantity || 0;
                console.log('更新需開箱數量顯示:', totalQuantity || 0);
            }
            
            // 查詢廠商代碼
            try {
                currentSupplierCode = await querySupplierCode(supplierName);
                console.log('廠商代碼查詢成功:', currentSupplierCode);
                
                // 重置批號計數器
                currentBatchCounter = 0;
                
            } catch (supplierError) {
                console.error('查詢廠商代碼時發生錯誤:', supplierError);
                currentSupplierCode = '000'; // 使用預設代碼
                currentBatchCounter = 0;
            }
            
            showMessage(`採購單號 ${poNumber} 查詢成功，廠商：${supplierName}，需開箱數量：${totalQuantity}`);
            console.log('開箱採購單號查詢成功:', poNumber);
        } else {
            showMessage('無此採購單號');
        }
        
    } catch (error) {
        console.error('查詢開箱採購單號時發生錯誤:', error);
        showMessage('查詢時發生錯誤，請稍後再試');
    } finally {
        showLoading(false);
    }
}

// 提交開箱明細
async function submitUnboxingDetails() {
    console.log('提交開箱明細');
    
    // 驗證採購單號
    if (!currentUnboxingPoNumber) {
        showMessage('請先查詢採購單號');
        return;
    }
    
    // 收集商品資料
    const items = [];
    let hasData = false;
    
    for (let i = 1; i <= 20; i++) {
        const categorySelect = document.querySelector(`.product-category-select[data-index="${i}"]`);
        const serialInput = document.querySelector(`.product-serial-input[data-index="${i}"]`);
        const batchNumberSpan = document.querySelector(`.item-batch-number[data-index="${i}"]`);
        
        if (categorySelect && serialInput && batchNumberSpan) {
            const category = categorySelect.value;
            const serial = serialInput.value.trim();
            const itemBatchNumber = batchNumberSpan.textContent;
            
            // 只有當有商品序號時才收集資料
            if (serial) {
                if (category) {
                    items.push({
                        index: i,
                        category: category,
                        serial: serial,
                        itemBatchNumber: itemBatchNumber !== '-' ? itemBatchNumber : generateItemBatchNumber(i)
                    });
                    hasData = true;
                } else {
                    showMessage(`項目 ${i} 請選擇商品分類`);
                    return;
                }
            }
        }
    }
    
    if (!hasData) {
        showMessage('請至少填寫一項商品資料');
        return;
    }
    
    // 創建開箱記錄
    const unboxingRecord = {
        id: Date.now().toString(),
        poNumber: currentUnboxingPoNumber,
        unboxingPerson: currentUser,
        unboxingDate: new Date().toISOString().split('T')[0],
        batchNumber: currentBatchNumber,
        items: items,
        createDate: new Date().toISOString().split('T')[0]
    };
    
    // 添加到記錄陣列
    unboxingRecords.push(unboxingRecord);
    
    // 儲存到 localStorage
    saveUnboxingRecords();
    
    // 準備寫入 Google Sheets 的資料
    const googleSheetsData = {
        type: 'unboxing',
        poNumber: currentUnboxingPoNumber,
        unboxingPerson: currentUser,
        unboxingDate: new Date().toISOString().split('T')[0],
        items: items
    };
    
    // 嘗試寫入 Google Sheets
    try {
        await writeToGoogleSheet(googleSheetsData, '開箱明細');
        console.log('開箱明細提交成功並已寫入 Google Sheets:', unboxingRecord);
        showMessage(`開箱明細提交成功！共 ${items.length} 項商品，已寫入 Google Sheets`);
    } catch (error) {
        console.log('開箱明細提交成功，但寫入 Google Sheets 失敗:', unboxingRecord);
        showMessage(`開箱明細提交成功！共 ${items.length} 項商品（Google Sheets 寫入失敗，請稍後重試）`);
    }
    
    // 清空表單並重新初始化
    clearUnboxingForm();
    initializeUnboxingForm();
}

// 清除開箱明細表單
function clearUnboxingForm() {
    console.log('清除開箱明細表單');
    
    // 清空採購單號
    document.getElementById('unboxingPoNumber').value = '';
    document.getElementById('currentPoNumber').textContent = '-';
    currentUnboxingPoNumber = '';
    
    // 清空進貨廠商
    const supplierNameSpan = document.getElementById('supplierName');
    if (supplierNameSpan) {
        supplierNameSpan.textContent = '-';
    }
    
    // 清空需開箱數量
    const requiredCountSpan = document.getElementById('requiredUnboxingCount');
    if (requiredCountSpan) {
        requiredCountSpan.textContent = '-';
    }
    
    // 重置廠商代碼和批號計數器
    currentSupplierCode = '000';
    currentBatchCounter = 0;
    
    // 清空商品資料
    const categorySelects = document.querySelectorAll('.product-category-select');
    const serialInputs = document.querySelectorAll('.product-serial-input');
    
    categorySelects.forEach(select => {
        select.value = '';
    });
    
    serialInputs.forEach(input => {
        input.value = '';
    });
    
    // 清空批號顯示
    const batchNumberSpans = document.querySelectorAll('.item-batch-number');
    batchNumberSpans.forEach(span => {
        span.textContent = '-';
        span.style.color = '#6c757d';
    });
    
    console.log('開箱明細表單已清除');
}

// 儲存開箱記錄
function saveUnboxingRecords() {
    localStorage.setItem('unboxingRecords', JSON.stringify(unboxingRecords));
    console.log('開箱記錄已儲存');
}

// 載入開箱記錄
function loadUnboxingRecords() {
    const savedRecords = localStorage.getItem('unboxingRecords');
    if (savedRecords) {
        unboxingRecords = JSON.parse(savedRecords);
        console.log('載入開箱記錄:', unboxingRecords);
    } else {
        unboxingRecords = [];
        console.log('初始化開箱記錄陣列');
    }
}

// 寫入資料到 Google Sheets
async function writeToGoogleSheet(data, sheetName = '開箱明細') {
    console.log('準備寫入 Google Sheets:', data);
    console.log('目標工作表:', sheetName);
    
    try {
        // 檢查是否有 Google Sheets API 權限
        if (!window.gapi || !window.gapi.auth2) {
            throw new Error('Google Sheets API 未初始化');
        }
        
        // 檢查用戶是否已登入
        const authInstance = window.gapi.auth2.getAuthInstance();
        if (!authInstance.isSignedIn.get()) {
            throw new Error('請先登入 Google 帳戶');
        }
        
        // 準備要寫入的資料
        const values = [];
        
        // 如果是開箱明細資料
        if (data.type === 'unboxing') {
            const unboxingData = data.items;
            unboxingData.forEach(item => {
                values.push([
                    data.poNumber,           // 採購單號
                    item.category,           // 商品分類
                    item.serial,             // 商品序號
                    item.itemBatchNumber,    // 批號
                    data.unboxingPerson,     // 開箱人員
                    data.unboxingDate,       // 開箱日期
                    new Date().toISOString() // 建立時間
                ]);
            });
        }
        // 如果是點到貨資料
        else if (data.type === 'receiving') {
            data.serialNumbers.forEach(serial => {
                values.push([
                    data.poNumber,           // 採購單號
                    '',                      // 商品分類（留空）
                    serial,                  // 商品序號
                    data.receivingPerson,    // 到貨人員
                    data.receivingDate,      // 到貨日期
                    new Date().toISOString() // 建立時間
                ]);
            });
        }
        
        // 使用 Google Sheets API 寫入資料
        const response = await gapi.client.sheets.spreadsheets.values.append({
            spreadsheetId: SPREADSHEET_ID,
            range: `${sheetName}!A:G`,
            valueInputOption: 'RAW',
            insertDataOption: 'INSERT_ROWS',
            resource: {
                values: values
            }
        });
        
        console.log('成功寫入 Google Sheets:', response);
        showMessage(`成功寫入 ${values.length} 筆資料到 ${sheetName} 工作表`);
        
        return response;
        
    } catch (error) {
        console.error('寫入 Google Sheets 時發生錯誤:', error);
        
        if (error.message.includes('Google Sheets API 未初始化')) {
            showMessage('請先初始化 Google Sheets API');
        } else if (error.message.includes('請先登入 Google 帳戶')) {
            showMessage('請先登入 Google 帳戶');
        } else {
            showMessage('寫入 Google Sheets 失敗，請檢查權限設定');
        }
        
        throw error;
    }
}

// 初始化 Google Sheets API
async function initializeGoogleSheetsAPI() {
    console.log('初始化 Google Sheets API');
    
    try {
        // 載入 Google API 客戶端
        await new Promise((resolve, reject) => {
            gapi.load('client:auth2', {
                callback: resolve,
                onerror: reject
            });
        });
        
        // 初始化 API 客戶端
        await gapi.client.init({
            apiKey: GOOGLE_SHEETS_CONFIG.API_KEY,
            clientId: GOOGLE_SHEETS_CONFIG.CLIENT_ID,
            discoveryDocs: ['https://sheets.googleapis.com/$discovery/rest?version=v4'],
            scope: GOOGLE_SHEETS_CONFIG.SCOPES.join(' ')
        });
        
        console.log('Google Sheets API 初始化成功');
        
    } catch (error) {
        console.error('初始化 Google Sheets API 失敗:', error);
        throw error;
    }
}

 