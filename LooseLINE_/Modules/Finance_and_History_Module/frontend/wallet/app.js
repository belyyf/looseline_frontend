/**
 * LOOSELINE Wallet - Single Page Application
 */

const CONFIG = {
    API_BASE: '/api/wallet',
    USER_ID: 'demo_user',
    STRIPE_PK: 'pk_test_51SfHfmJS4YJYpFPxgjYSZNWvvSgamosoQWC0ysvtd4kJmAkbzbYADOUTSK0of0aTuWrVoJevg6oa3CxeHKjmnxng00q2j5jG2r'
};

let state = {
    balance: 5000.00,
    availableBalance: 4750.00,
    lockedBalance: 250.00,
    totalDeposited: 10000.00,
    totalWithdrawn: 5000.00,
    netProfit: 2180.00,
    winRate: 64,
    roi: 87.2,
    totalBets: 25,
    transactions: [],
    paymentMethods: [],
    withdrawalMethods: [],
    historyPage: 1,
    historyPerPage: 10,
    sortField: 'date',
    sortOrder: 'desc',
    selectedPaymentMethod: 'new'
};

let stripe, cardElement, balanceChart;

// === AUTH CHECK ===
async function checkAuth() {
    try {
        const response = await fetch('/api/auth/get-session', {
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' }
        });

        if (!response.ok) {
            console.log('Auth check failed, redirecting to login');
            window.location.href = '/login';
            return null;
        }

        const data = await response.json();
        const user = data.session?.user || data.user || data;

        if (!user?.email && !user?.id) {
            console.log('No user session, redirecting to login');
            window.location.href = '/login';
            return null;
        }

        console.log('User authenticated:', user.email || user.name);
        return user;
    } catch (e) {
        console.error('Auth check error, redirecting to login:', e);
        window.location.href = '/login';
        return null;
    }
}

// === API HELPERS ===
async function apiRequest(endpoint, options = {}) {
    const url = `${CONFIG.API_BASE}${endpoint}`;
    const defaultOptions = {
        headers: {
            'Content-Type': 'application/json',
            'X-User-ID': CONFIG.USER_ID
        },
        credentials: 'include'
    };

    const config = {
        ...defaultOptions,
        ...options,
        headers: {
            ...defaultOptions.headers,
            ...(options.headers || {})
        }
    };

    if (options.body && typeof options.body === 'object') {
        config.body = JSON.stringify(options.body);
    }

    try {
        const response = await fetch(url, config);
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.detail || data.error || 'Ошибка запроса');
        }

        return data;
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
}

// === INIT ===
document.addEventListener('DOMContentLoaded', async () => {
    // Check auth first
    const user = await checkAuth();
    if (!user) return; // Redirect will happen

    // Store user in state
    state.user = user;
    CONFIG.USER_ID = user.id || 'demo_user';

    // Initialize the shared header component
    if (typeof LooselineHeader !== 'undefined') {
        await LooselineHeader.init({
            activePage: 'wallet',
            user: user,
            onDeposit: () => openModal('depositModal'),
            onWithdraw: () => openModal('withdrawModal'),
            onLogout: handleLogout
        });
    }

    initStripe();
    await loadData();
    updateDisplays();
    renderHistory();
    renderPaymentMethods();
    initChart();
    setDefaultDates();

    // === HASH NAVIGATION ===
    function handleHashNavigation() {
        const hash = window.location.hash;
        // Close all modals first to ensure clean state
        document.querySelectorAll('.modal.open').forEach(m => m.classList.remove('open'));

        if (hash === '#deposit') {
            openModal('depositModal');
        } else if (hash === '#withdraw') {
            openModal('withdrawModal');
        }
    }

    // Check hash on load
    handleHashNavigation();

    // Listen for hash changes
    window.addEventListener('hashchange', handleHashNavigation);
});

// Update UI with user info
function updateUserUI(user) {
    const userName = user.name || user.email?.split('@')[0] || 'Пользователь';

    // Add user badge to header if not exists
    const nav = document.querySelector('.nav');
    if (nav && !document.getElementById('userBadge')) {
        const userBadge = document.createElement('div');
        userBadge.id = 'userBadge';
        userBadge.style.cssText = 'display:flex;align-items:center;gap:12px;margin-left:auto;';
        userBadge.innerHTML = `
            <span style="padding:6px 12px;color:white;font-weight:500;">${userName}</span>
            <button onclick="handleLogout()" style="padding:6px 20px;background:#ef4444;color:white;border:none;border-radius:6px;cursor:pointer;font-weight:500;">Выйти</button>
        `;
        nav.parentElement.appendChild(userBadge);
    }
}

async function handleLogout() {
    try {
        await fetch('/api/auth/sign-out', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({}),
            credentials: 'include'
        });
    } catch (e) {
        console.error('Logout failed', e);
    }
    window.location.replace('/login');
}

function initStripe() {
    if (!CONFIG.STRIPE_PK) {
        console.warn('Stripe publishable key not configured');
        return;
    }

    try {
        stripe = Stripe(CONFIG.STRIPE_PK);
        const elements = stripe.elements({
            appearance: {
                theme: 'night',
                variables: {
                    colorPrimary: '#27ae60',
                    colorBackground: '#2c3e50',
                    colorText: '#ffffff',
                    colorDanger: '#ef4444',
                    colorIcon: '#ffffff',
                    colorIconCard: '#ffffff',
                    colorIconCardBrand: '#ffffff',
                    fontFamily: 'Inter, system-ui, sans-serif',
                    spacingUnit: '4px',
                    borderRadius: '8px'
                },
                rules: {
                    '.Input': {
                        color: '#ffffff',
                        backgroundColor: '#2c3e50',
                        border: '2px solid rgba(255, 255, 255, 0.3)',
                        boxShadow: 'none'
                    },
                    '.Input:focus': {
                        borderColor: '#27ae60',
                        boxShadow: '0 0 0 3px rgba(39, 174, 96, 0.2)',
                        color: '#ffffff',
                        backgroundColor: '#34495e'
                    },
                    '.Input::placeholder': {
                        color: '#9ca3af',
                        opacity: 1
                    },
                    '.Input--invalid': {
                        color: '#ef4444',
                        borderColor: '#ef4444',
                        backgroundColor: '#2c3e50'
                    },
                    '.Label': {
                        color: '#ffffff'
                    }
                }
            }
        });

        const cardElementContainer = document.getElementById('card-element');
        if (!cardElementContainer) {
            console.warn('Card element container not found');
            return;
        }

        cardElement = elements.create('card', {
            hidePostalCode: true,
            style: {
                base: {
                    fontSize: '16px',
                    color: '#ffffff',
                    fontFamily: 'Inter, system-ui, sans-serif',
                    backgroundColor: '#2c3e50',
                    '::placeholder': {
                        color: '#9ca3af',
                        opacity: 1
                    },
                    '::selection': {
                        backgroundColor: '#27ae60',
                        color: '#ffffff'
                    }
                },
                invalid: {
                    color: '#ef4444',
                    iconColor: '#ef4444',
                    '::placeholder': {
                        color: '#ef4444',
                        opacity: 1
                    }
                },
                empty: {
                    color: '#ffffff',
                    '::placeholder': {
                        color: '#9ca3af',
                        opacity: 1
                    }
                },
                complete: {
                    color: '#ffffff'
                }
            }
        });

        cardElement.mount('#card-element');
        cardElement.on('change', (e) => {
            const errorElement = document.getElementById('card-errors');
            if (errorElement) {
                if (e.error) {
                    console.error('Stripe card error:', e.error);
                    // Показываем ошибку только если это не ошибка пустого поля
                    if (e.error.type !== 'validation_error' || e.error.code !== 'incomplete_number') {
                        errorElement.textContent = e.error.message;
                    } else {
                        errorElement.textContent = '';
                    }
                } else {
                    errorElement.textContent = '';
                }
            }

            // Show "Add Card" button when card is complete
            const addCardBtn = document.getElementById('addCardBtn');
            if (addCardBtn) {
                // Показываем кнопку если карта заполнена и нет критических ошибок
                if (e.complete && !e.error) {
                    addCardBtn.style.display = 'block';
                } else if (e.complete && e.error && e.error.type === 'card_error' && e.error.code === 'card_declined') {
                    // Даже если карта отклонена, но заполнена, показываем кнопку
                    // (пользователь может попробовать другую карту)
                    addCardBtn.style.display = 'block';
                } else {
                    addCardBtn.style.display = 'none';
                }
            }
        });
    } catch (e) {
        console.error('Stripe initialization error:', e);
    }
}

// === DATA LOADING ===
async function loadData() {
    try {
        // Load balance
        const balanceData = await apiRequest('/balance');
        if (balanceData.success) {
            state.balance = balanceData.data.balance || 0;
            state.availableBalance = balanceData.data.available_balance || 0;
            state.lockedBalance = balanceData.data.locked_balance || 0;
            state.totalDeposited = balanceData.data.total_deposited || 0;
            state.totalWithdrawn = balanceData.data.total_withdrawn || 0;
            state.netProfit = balanceData.data.net_profit || 0;
            state.winRate = balanceData.data.win_rate || 0;
            state.roi = balanceData.data.roi || 0;
            state.totalBets = balanceData.data.total_bets || 0;
        }

        // Load history
        const historyData = await apiRequest('/history?limit=100');
        if (historyData.success) {
            state.transactions = historyData.data.transactions || [];
        }

        // Load payment methods
        const paymentMethodsData = await apiRequest('/payment-methods');
        if (paymentMethodsData.success) {
            state.paymentMethods = paymentMethodsData.data.payment_methods || [];
        }

        // Load withdrawal methods
        try {
            const withdrawalMethodsData = await apiRequest('/withdrawal-methods');
            if (withdrawalMethodsData.success) {
                state.withdrawalMethods = withdrawalMethodsData.data.withdrawal_methods || [];
            }
        } catch (e) {
            console.warn('Could not load withdrawal methods:', e);
            state.withdrawalMethods = [];
        }
    } catch (error) {
        console.error('Error loading data:', error);
        // Fallback to demo data if API fails
        loadDemoData();
    }
}

function loadDemoData() {
    state.transactions = [
        { id: 1, type: 'deposit', amount: 500, status: 'completed', created_at: new Date().toISOString(), description: 'Пополнение баланса' },
        { id: 2, type: 'win', amount: 185, status: 'completed', created_at: new Date(Date.now() - 86400000).toISOString(), description: 'Выигрыш: Реал - Барселона' },
        { id: 3, type: 'bet', amount: 100, status: 'completed', created_at: new Date(Date.now() - 86400000).toISOString(), description: 'Ставка: Реал - Барселона' },
        { id: 4, type: 'deposit', amount: 1000, status: 'completed', created_at: new Date(Date.now() - 172800000).toISOString(), description: 'Пополнение баланса' },
        { id: 5, type: 'loss', amount: 50, status: 'completed', created_at: new Date(Date.now() - 259200000).toISOString(), description: 'Проигрыш: ПСЖ - Лион' },
        { id: 6, type: 'withdrawal', amount: 2000, status: 'pending', created_at: new Date(Date.now() - 345600000).toISOString(), description: 'Вывод на Chase Bank' },
        { id: 7, type: 'win', amount: 320, status: 'completed', created_at: new Date(Date.now() - 432000000).toISOString(), description: 'Выигрыш: Ман Сити - Ливерпуль' },
    ];

    state.paymentMethods = [
        { id: 'pm_1', brand: 'Visa', last4: '4242', is_default: true },
        { id: 'pm_2', brand: 'Mastercard', last4: '5555', is_default: false }
    ];

    state.withdrawalMethods = [
        { id: 1, name: 'Chase Bank', last4: '7890' },
        { id: 2, name: 'Bank of America', last4: '1234' }
    ];
}

// === DISPLAYS ===
function updateDisplays() {
    // Update the shared header balance
    if (typeof LooselineHeader !== 'undefined') {
        LooselineHeader.setBalance({
            total: state.balance,
            available: state.availableBalance,
            inBets: state.lockedBalance
        });
    }

    // Update page-specific displays
    const totalDeposited = document.getElementById('totalDeposited');
    const totalWithdrawn = document.getElementById('totalWithdrawn');
    const netProfit = document.getElementById('netProfit');
    const profitPercent = document.getElementById('profitPercent');
    const winRate = document.getElementById('winRate');
    const winRateBar = document.getElementById('winRateBar');
    const roi = document.getElementById('roi');
    const roiBar = document.getElementById('roiBar');
    const totalBets = document.getElementById('totalBets');
    const withdrawAvailable = document.getElementById('withdrawAvailable');

    if (totalDeposited) totalDeposited.textContent = formatCurrency(state.totalDeposited);
    if (totalWithdrawn) totalWithdrawn.textContent = formatCurrency(state.totalWithdrawn);
    if (netProfit) netProfit.textContent = (state.netProfit >= 0 ? '+' : '') + formatCurrency(state.netProfit);
    if (profitPercent) profitPercent.textContent = `+${state.roi}%`;
    if (winRate) winRate.textContent = `${state.winRate}%`;
    if (winRateBar) winRateBar.style.width = `${state.winRate}%`;
    if (roi) roi.textContent = `${state.roi}%`;
    if (roiBar) roiBar.style.width = `${Math.min(100, state.roi)}%`;
    if (totalBets) totalBets.textContent = state.totalBets;
    if (withdrawAvailable) withdrawAvailable.textContent = formatCurrency(state.availableBalance);

    // Update deposit modal if open
    const depositCurrentBalance = document.getElementById('depositCurrentBalance');
    if (depositCurrentBalance) {
        depositCurrentBalance.textContent = formatCurrency(state.balance);
        updateDepositPreview();
    }
}

// === SCROLL TO SECTION ===
function scrollToSection(id) {
    if (typeof LooselineHeader !== 'undefined') {
        LooselineHeader.closeDropdown();
    }
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
}

// === HISTORY ===
function renderHistory() {
    const filter = document.getElementById('historyFilter')?.value || 'all';
    let filtered = filter === 'all' ? [...state.transactions] : state.transactions.filter(t => t.type === filter);

    filtered.sort((a, b) => {
        let aVal = state.sortField === 'date' ? new Date(a.created_at) : a.amount;
        let bVal = state.sortField === 'date' ? new Date(b.created_at) : b.amount;
        return state.sortOrder === 'desc' ? bVal - aVal : aVal - bVal;
    });

    const total = filtered.length;
    const pages = Math.ceil(total / state.historyPerPage) || 1;
    const start = (state.historyPage - 1) * state.historyPerPage;
    const pageData = filtered.slice(start, start + state.historyPerPage);

    document.getElementById('paginationInfo').textContent = `${state.historyPage} / ${pages}`;

    const tbody = document.getElementById('historyTableBody');
    if (pageData.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;padding:40px;color:#95a5a6;">Нет данных</td></tr>';
        return;
    }

    const typeNames = { deposit: 'Депозит', withdrawal: 'Вывод', bet: 'Ставка', win: 'Выигрыш', loss: 'Проигрыш' };
    const statusNames = { completed: 'Выполнено', pending: 'В обработке', failed: 'Ошибка' };

    tbody.innerHTML = pageData.map(tx => {
        const isPositive = ['deposit', 'win'].includes(tx.type);
        return `
            <tr>
                <td>${formatDate(tx.created_at)}</td>
                <td>${typeNames[tx.type] || tx.type}</td>
                <td>${tx.description}</td>
                <td class="${isPositive ? 'positive' : 'negative'}" style="font-family:var(--font-family-mono);">
                    ${isPositive ? '+' : '-'}${formatCurrency(tx.amount)}
                </td>
                <td><span class="status-badge ${tx.status}">${statusNames[tx.status]}</span></td>
            </tr>
        `;
    }).join('');
}

function filterHistory() { state.historyPage = 1; renderHistory(); }

function sortHistory(field) {
    if (state.sortField === field) {
        state.sortOrder = state.sortOrder === 'desc' ? 'asc' : 'desc';
    } else {
        state.sortField = field;
        state.sortOrder = 'desc';
    }
    renderHistory();
}

function changePage(dir) {
    const filter = document.getElementById('historyFilter')?.value || 'all';
    const filtered = filter === 'all' ? state.transactions : state.transactions.filter(t => t.type === filter);
    const pages = Math.ceil(filtered.length / state.historyPerPage) || 1;

    state.historyPage = Math.max(1, Math.min(pages, state.historyPage + dir));
    renderHistory();
}

// === PAYMENT METHODS ===
function renderPaymentMethods() {
    // Deposit modal
    const depositList = document.getElementById('depositPaymentMethods');
    depositList.innerHTML = `
        <div class="payment-method-item ${state.selectedPaymentMethod === 'new' ? 'selected' : ''}" onclick="selectPaymentMethod('new', this)">
            <span class="method-icon">💳</span>
            <div class="method-details">
                <div class="method-name">Новая карта</div>
                <div class="method-number">Visa, Mastercard, Amex</div>
            </div>
        </div>
        ${state.paymentMethods.map(pm => `
            <div class="payment-method-item ${state.selectedPaymentMethod === pm.id ? 'selected' : ''}" onclick="selectPaymentMethod('${pm.id}', this)">
                <span class="method-icon">${pm.brand === 'Visa' ? '💳' : pm.brand === 'Mastercard' ? '💳' : '💳'}</span>
                <div class="method-details">
                    <div class="method-name">${pm.brand}</div>
                    <div class="method-number">**** ${pm.last4}</div>
                </div>
                ${pm.is_default ? '<span class="method-badge">По умолчанию</span>' : ''}
            </div>
        `).join('')}
    `;

    // Withdrawal modal
    const withdrawList = document.getElementById('withdrawalMethods');
    withdrawList.innerHTML = state.withdrawalMethods.map((m, i) => `
        <div class="withdrawal-method-item ${i === 0 ? 'selected' : ''}" onclick="selectWithdrawMethod(this)">
            <span class="method-icon">B</span>
            <div class="method-details">
                <div class="method-name">${m.name}</div>
                <div class="method-number">**** ${m.last4}</div>
            </div>
        </div>
    `).join('');

    // Cards grid
    const cardsGrid = document.getElementById('paymentMethodsList');
    cardsGrid.innerHTML = state.paymentMethods.map((pm, i) => `
        <div class="card-item ${i === 0 ? 'primary' : ''}">
            <div class="card-brand">${pm.brand}</div>
            <div class="card-number">**** **** **** ${pm.last4}</div>
            <div class="card-footer">
                <span>CARD HOLDER</span>
                <span>12/25</span>
            </div>
        </div>
    `).join('');

    // Show/hide stripe form
    document.getElementById('stripeCardContainer').style.display = state.selectedPaymentMethod === 'new' ? 'block' : 'none';
}

function selectPaymentMethod(id, el) {
    state.selectedPaymentMethod = id;
    document.querySelectorAll('.payment-method-item').forEach(e => e.classList.remove('selected'));
    el.classList.add('selected');
    document.getElementById('stripeCardContainer').style.display = id === 'new' ? 'block' : 'none';
}

function selectWithdrawMethod(el) {
    document.querySelectorAll('.withdrawal-method-item').forEach(e => e.classList.remove('selected'));
    el.classList.add('selected');
}

function addPaymentMethod() {
    openModal('depositModal');
    selectPaymentMethod('new', document.querySelector('.payment-method-item'));
}

// === DEPOSIT ===
function setDepositAmount(amount) {
    const input = document.getElementById('depositAmount');
    input.value = amount;
    input.dispatchEvent(new Event('input', { bubbles: true }));
    updateDepositPreview();
    document.querySelectorAll('.quick-amount').forEach(b => {
        const btnAmount = parseFloat(b.querySelector('.quick-amount-value')?.textContent.replace(/[^0-9.]/g, '') || 0);
        b.classList.toggle('selected', btnAmount === amount);
    });
}

function updateDepositPreview() {
    const amountInput = document.getElementById('depositAmount');
    if (!amountInput) return;

    const amount = parseFloat(amountInput.value || 0);
    const currentBalance = state.balance || 0;
    const newBalance = currentBalance + (isNaN(amount) ? 0 : amount);

    const previewAmount = document.getElementById('depositPreviewAmount');
    const previewTotal = document.getElementById('depositPreviewTotal');
    const currentBalanceEl = document.getElementById('depositCurrentBalance');

    if (previewAmount) {
        previewAmount.textContent = formatCurrency(isNaN(amount) ? 0 : amount);
    }
    if (previewTotal) {
        previewTotal.textContent = formatCurrency(newBalance);
    }
    if (currentBalanceEl) {
        currentBalanceEl.textContent = formatCurrency(currentBalance);
    }
}

// === ADD CARD ONLY ===
async function addCardOnly() {
    if (!cardElement) {
        showToast('Поле карты не инициализировано', 'error');
        return;
    }

    if (!stripe) {
        showToast('Stripe не инициализирован', 'error');
        return;
    }

    try {
        // Create payment method from card element
        const { paymentMethod, error } = await stripe.createPaymentMethod({
            type: 'card',
            card: cardElement,
        });

        if (error) {
            console.error('Stripe createPaymentMethod error:', error);
            // Более детальные сообщения об ошибках
            let errorMessage = error.message;
            if (error.type === 'card_error') {
                if (error.code === 'card_declined') {
                    errorMessage = 'Карта отклонена. Попробуйте другую карту.';
                } else if (error.code === 'expired_card') {
                    errorMessage = 'Срок действия карты истёк.';
                } else if (error.code === 'incorrect_cvc') {
                    errorMessage = 'Неверный CVC код.';
                } else if (error.code === 'incorrect_number') {
                    errorMessage = 'Неверный номер карты.';
                } else if (error.code === 'invalid_number') {
                    errorMessage = 'Недопустимый номер карты.';
                }
            }
            showToast(errorMessage, 'error');
            return;
        }

        // Save payment method to backend
        const saveCardResponse = await apiRequest('/payment-methods', {
            method: 'POST',
            body: {
                payment_method_id: paymentMethod.id,
                is_default: state.paymentMethods.length === 0
            }
        });

        if (saveCardResponse.success) {
            // Reload payment methods
            const paymentMethodsData = await apiRequest('/payment-methods');
            if (paymentMethodsData.success) {
                state.paymentMethods = paymentMethodsData.data.payment_methods || [];
                renderPaymentMethods();
            }

            // Clear card element
            cardElement.clear();
            document.getElementById('addCardBtn').style.display = 'none';

            showSuccess('Карта добавлена', 'Карта успешно сохранена для будущих платежей');
        } else {
            showToast('Ошибка при сохранении карты', 'error');
        }
    } catch (error) {
        console.error('Add card error:', error);
        showToast('Ошибка при добавлении карты: ' + error.message, 'error');
    }
}

async function processDeposit() {
    const amount = parseFloat(document.getElementById('depositAmount').value);
    if (!amount || amount < 1) { showToast('Введите сумму', 'error'); return; }
    if (amount > 100000) { showToast('Максимальная сумма $100,000', 'error'); return; }

    // If new card is selected, create payment method first
    if (state.selectedPaymentMethod === 'new' && cardElement) {
        if (!stripe) {
            showToast('Stripe не инициализирован', 'error');
            return;
        }

        try {
            const { paymentMethod, error } = await stripe.createPaymentMethod({
                type: 'card',
                card: cardElement,
            });

            if (error) {
                console.error('Stripe createPaymentMethod error:', error);
                // Более детальные сообщения об ошибках
                let errorMessage = error.message;
                if (error.type === 'card_error') {
                    if (error.code === 'card_declined') {
                        errorMessage = 'Карта отклонена. Попробуйте другую карту.';
                    } else if (error.code === 'expired_card') {
                        errorMessage = 'Срок действия карты истёк.';
                    } else if (error.code === 'incorrect_cvc') {
                        errorMessage = 'Неверный CVC код.';
                    } else if (error.code === 'incorrect_number') {
                        errorMessage = 'Неверный номер карты.';
                    } else if (error.code === 'invalid_number') {
                        errorMessage = 'Недопустимый номер карты.';
                    }
                }
                showToast(errorMessage, 'error');
                return;
            }

            // Save card if checkbox is checked
            const saveCard = document.getElementById('saveCard')?.checked;
            if (saveCard) {
                await apiRequest('/payment-methods', {
                    method: 'POST',
                    body: {
                        payment_method_id: paymentMethod.id,
                        is_default: false
                    }
                });
            }

            // Use payment method for deposit
            const depositResponse = await apiRequest('/deposit', {
                method: 'POST',
                body: {
                    amount: amount,
                    payment_method_id: paymentMethod.id
                }
            });

            if (depositResponse.success) {
                await loadData();
                updateDisplays();
                renderHistory();
                closeModal('depositModal');
                showSuccess('Успешно', `Зачислено ${formatCurrency(amount)}`);
            } else {
                showToast('Ошибка при пополнении', 'error');
            }
        } catch (error) {
            console.error('Deposit error:', error);
            showToast('Ошибка при пополнении: ' + error.message, 'error');
        }
    } else {
        // Use saved payment method
        const depositResponse = await apiRequest('/deposit-saved', {
            method: 'POST',
            body: {
                amount: amount,
                payment_method_id: state.selectedPaymentMethod
            }
        });

        if (depositResponse.success) {
            await loadData();
            updateDisplays();
            renderHistory();
            closeModal('depositModal');
            showSuccess('Успешно', `Зачислено ${formatCurrency(amount)}`);
        } else {
            showToast('Ошибка при пополнении', 'error');
        }
    }
}

// === WITHDRAW ===
async function processWithdraw() {
    const amount = parseFloat(document.getElementById('withdrawAmount').value);
    if (!amount || amount < 10) { showToast('Минимум $10', 'error'); return; }
    if (amount > state.availableBalance) { showToast('Недостаточно средств', 'error'); return; }

    state.balance -= amount;
    state.availableBalance -= amount;
    state.totalWithdrawn += amount;
    state.transactions.unshift({
        id: Date.now(), type: 'withdrawal', amount, status: 'pending',
        created_at: new Date().toISOString(), description: 'Вывод средств'
    });

    updateDisplays();
    renderHistory();
    closeModal('withdrawModal');
    showSuccess('Заявка принята', `Вывод ${formatCurrency(amount)} обрабатывается`);
}

// === EXPORT ===
function setDefaultDates() {
    const today = new Date();
    const monthAgo = new Date();
    monthAgo.setMonth(monthAgo.getMonth() - 1);
    document.getElementById('exportDateFrom').value = monthAgo.toISOString().split('T')[0];
    document.getElementById('exportDateTo').value = today.toISOString().split('T')[0];
}

async function exportReport() {
    const format = document.querySelector('input[name="format"]:checked')?.value || 'csv';

    try {
        const dateFrom = document.getElementById('exportDateFrom')?.value || '';
        const dateTo = document.getElementById('exportDateTo')?.value || '';

        showToast('Генерация отчета...', 'info');

        // Use POST method for better compatibility
        const exportData = {
            format: format,
            include_bets: true,
            include_transactions: true,
            include_statistics: true
        };

        if (dateFrom) exportData.date_from = dateFrom;
        if (dateTo) exportData.date_to = dateTo;

        const response = await apiRequest('/export', {
            method: 'POST',
            body: exportData
        });

        console.log('Export response:', response);

        // Check different response structures
        const report = response.report || response.data || response;
        const downloadUrl = report.download_url;
        const filename = report.filename || `report_${Date.now()}.${format}`;

        if (response.success && downloadUrl) {
            // Try to download via URL
            if (downloadUrl.startsWith('http://') || downloadUrl.startsWith('https://')) {
                window.open(downloadUrl, '_blank');
            } else {
                // Relative URL - construct full URL
                const fullUrl = downloadUrl.startsWith('/')
                    ? `${window.location.origin}${downloadUrl}`
                    : `${CONFIG.API_BASE.replace('/api/wallet', '')}${downloadUrl}`;
                window.open(fullUrl, '_blank');
            }
            showToast(`Отчет ${format.toUpperCase()} скачивается...`, 'success');
        } else if (report.content) {
            // Direct content download
            const mimeType = format === 'pdf' ? 'application/pdf' : 'text/csv';
            const blob = new Blob([report.content], { type: mimeType });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
            showToast(`Отчет ${format.toUpperCase()} скачивается...`, 'success');
        } else {
            // Try to fetch file directly from API using GET
            const params = new URLSearchParams({
                format: format,
                include_bets: 'true',
                include_transactions: 'true',
                include_statistics: 'true'
            });
            if (dateFrom) params.append('date_from', dateFrom);
            if (dateTo) params.append('date_to', dateTo);

            const fileUrl = `${CONFIG.API_BASE}/export?${params.toString()}`;

            try {
                const fileResponse = await fetch(fileUrl, {
                    method: 'GET',
                    headers: {
                        'X-User-ID': CONFIG.USER_ID,
                        'Accept': format === 'pdf' ? 'application/pdf' : 'text/csv'
                    }
                });

                if (fileResponse.ok) {
                    const blob = await fileResponse.blob();
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = filename;
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    window.URL.revokeObjectURL(url);
                    showToast(`Отчет ${format.toUpperCase()} скачивается...`, 'success');
                } else {
                    const errorText = await fileResponse.text();
                    console.error('Export error response:', errorText);
                    showToast('Ошибка при экспорте отчета: ' + (fileResponse.statusText || 'Неизвестная ошибка'), 'error');
                }
            } catch (fetchError) {
                console.error('Export fetch error:', fetchError);
                showToast('Ошибка при экспорте отчета: ' + fetchError.message, 'error');
            }
        }
    } catch (error) {
        console.error('Export error:', error);
        showToast('Ошибка при экспорте отчета: ' + (error.message || 'Неизвестная ошибка'), 'error');
    }

    closeModal('exportModal');
}

// === CHART ===
function initChart() {
    const ctx = document.getElementById('balanceChart');
    if (!ctx) return;

    const labels = [];
    const data = [];
    let balance = state.balance - 1500;

    for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        labels.push(d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' }));
        balance += (Math.random() - 0.3) * 300;
        data.push(Math.max(100, balance).toFixed(0));
    }
    data[data.length - 1] = state.balance;

    balanceChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels,
            datasets: [{
                data,
                borderColor: '#27ae60',
                backgroundColor: 'rgba(39,174,96,0.1)',
                fill: true,
                tension: 0.4,
                pointRadius: 4,
                pointBackgroundColor: '#27ae60'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                x: { grid: { display: false } },
                y: { ticks: { callback: v => '$' + v } }
            }
        }
    });
}

function setChartPeriod(days, btn) {
    document.querySelectorAll('.section-actions .btn-text').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    // Update chart with new data
    const labels = [];
    const data = [];
    let balance = state.balance - 1500;

    for (let i = days - 1; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        labels.push(d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' }));
        balance += (Math.random() - 0.3) * 300;
        data.push(Math.max(100, balance).toFixed(0));
    }
    data[data.length - 1] = state.balance;

    balanceChart.data.labels = labels;
    balanceChart.data.datasets[0].data = data;
    balanceChart.update();
}

// === MODALS ===
function openModal(id) {
    document.querySelector('.balance-dropdown')?.classList.remove('open');
    document.getElementById(id)?.classList.add('open');

    // Initialize deposit modal
    if (id === 'depositModal') {
        updateDepositPreview();
        const depositInput = document.getElementById('depositAmount');
        if (depositInput) {
            depositInput.addEventListener('input', updateDepositPreview);
            depositInput.addEventListener('change', updateDepositPreview);
        }
    }
}

function closeModal(id) {
    document.getElementById(id)?.classList.remove('open');
}

function showSuccess(title, message) {
    document.getElementById('successTitle').textContent = title;
    document.getElementById('successMessage').textContent = message;
    openModal('successModal');
}

function showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    container.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}

// === UTILS ===
function formatCurrency(n) {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n);
}

function formatDate(s) {
    if (!s) return '-';
    const d = new Date(s);
    return d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
}

// ESC to close
document.addEventListener('keydown', e => {
    if (e.key === 'Escape') document.querySelectorAll('.modal.open').forEach(m => m.classList.remove('open'));
});
