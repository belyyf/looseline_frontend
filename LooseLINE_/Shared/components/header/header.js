/**
 * LOOSELINE Unified Header Component
 * Vanilla JS implementation for use across all modules
 * 
 * Usage:
 *   <div id="ll-header"></div>
 *   <script src="/shared/components/header/header.js"></script>
 *   <script>
 *     LooselineHeader.init({
 *       activePage: 'wallet', // 'sports' | 'wallet' | 'dashboard'
 *       showBalance: true,
 *       onDeposit: () => openModal('depositModal'),
 *       onWithdraw: () => openModal('withdrawModal')
 *     });
 *   </script>
 */

const LooselineHeader = (function () {
    'use strict';

    // Default configuration
    const defaultConfig = {
        containerId: 'll-header',
        activePage: null, // Will be detected from URL if not set
        showBalance: true,
        balance: {
            total: 0,
            available: 0,
            inBets: 0
        },
        user: null,
        onDeposit: null,
        onWithdraw: null,
        onLogout: null,
        balanceApiUrl: '/api/wallet/balance',
        sessionApiUrl: '/api/auth/get-session'
    };

    let config = { ...defaultConfig };
    let state = {
        dropdownOpen: false,
        user: null,
        balance: { total: 0, available: 0, inBets: 0 },
        loading: true
    };

    // Utility: Format currency
    function formatCurrency(amount) {
        return `$${Number(amount || 0).toLocaleString('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        })}`;
    }

    // Detect active page from URL
    function detectActivePage() {
        const path = window.location.pathname;
        if (path.includes('/sports')) return 'sports';
        if (path.includes('/wallet')) return 'wallet';
        if (path.includes('/dashboard')) return 'dashboard';
        return null;
    }

    // Fetch balance from API
    async function fetchBalance() {
        try {
            const response = await fetch(config.balanceApiUrl, {
                credentials: 'include'
            });
            if (response.ok) {
                const data = await response.json();
                const balanceData = data.data || data.balance || data;
                state.balance = {
                    total: balanceData.balance || balanceData.current_balance || balanceData.total || 0,
                    available: balanceData.available_balance || balanceData.available || 0,
                    inBets: balanceData.locked_balance || balanceData.locked_in_bets || balanceData.inBets || 0
                };
                updateBalanceDisplay();
            }
        } catch (e) {
            console.warn('Failed to fetch balance:', e);
        }
    }

    // Fetch user session
    async function fetchSession() {
        try {
            const response = await fetch(config.sessionApiUrl, {
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' }
            });
            if (response.ok) {
                const data = await response.json();
                const user = data.session?.user || data.user || data;
                if (user?.email || user?.id || user?.name) {
                    state.user = user;
                    updateUserDisplay();
                }
            }
        } catch (e) {
            console.warn('Failed to fetch session:', e);
        }
        state.loading = false;
    }

    // Handle logout
    async function handleLogout() {
        if (config.onLogout) {
            config.onLogout();
            return;
        }

        try {
            await fetch('/api/auth/sign-out', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({}),
                credentials: 'include'
            });
        } catch (e) {
            console.warn('Logout error:', e);
        }
        window.location.replace('/login');
    }

    // Toggle dropdown
    function toggleDropdown() {
        state.dropdownOpen = !state.dropdownOpen;
        const dropdown = document.querySelector('.ll-balance-dropdown');
        if (dropdown) {
            dropdown.classList.toggle('open', state.dropdownOpen);
        }
    }

    // Close dropdown
    function closeDropdown() {
        state.dropdownOpen = false;
        const dropdown = document.querySelector('.ll-balance-dropdown');
        if (dropdown) {
            dropdown.classList.remove('open');
        }
    }

    // Handle bfcache (Back-Forward Cache)
    window.addEventListener('pageshow', (event) => {
        if (event.persisted) {
            window.location.reload();
        }
    });

    // Update balance display
    function updateBalanceDisplay() {
        const headerBalance = document.getElementById('ll-header-balance');
        const dropdownBalance = document.getElementById('ll-dropdown-balance');
        const availableBalance = document.getElementById('ll-available-balance');
        const lockedBalance = document.getElementById('ll-locked-balance');

        if (headerBalance) headerBalance.textContent = formatCurrency(state.balance.total);
        if (dropdownBalance) dropdownBalance.textContent = formatCurrency(state.balance.total);
        if (availableBalance) availableBalance.textContent = formatCurrency(state.balance.available);
        if (lockedBalance) lockedBalance.textContent = formatCurrency(state.balance.inBets);
    }

    // Update user display
    function updateUserDisplay() {
        const userAvatar = document.getElementById('ll-user-avatar');
        const userName = document.getElementById('ll-user-name');

        if (state.user) {
            const name = state.user.name || state.user.email?.split('@')[0] || 'User';
            const initial = name.charAt(0).toUpperCase();

            if (userAvatar) userAvatar.textContent = initial;
            if (userName) userName.textContent = name;
        }
    }

    // Handle deposit click
    function handleDeposit() {
        closeDropdown();
        if (config.onDeposit) {
            config.onDeposit();
        } else {
            // Default: navigate to wallet
            window.location.href = '/wallet#deposit';
        }
    }

    // Handle withdraw click
    function handleWithdraw() {
        closeDropdown();
        if (config.onWithdraw) {
            config.onWithdraw();
        } else {
            // Default: navigate to wallet
            window.location.href = '/wallet#withdraw';
        }
    }

    // Render the header HTML
    function render() {
        const container = document.getElementById(config.containerId);
        if (!container) {
            console.error(`LooselineHeader: Container #${config.containerId} not found`);
            return;
        }

        const activePage = config.activePage || detectActivePage();

        const html = `
            <header class="ll-header">
                <div class="ll-header-inner">
                    <!-- Logo -->
                    <div class="ll-header-logo">
                        <a href="/">
                            <span class="ll-header-logo-text">LOOSELINE</span>
                        </a>
                    </div>

                    <!-- Navigation -->
                    <nav class="ll-header-nav">
                        <a href="/sports" class="ll-header-nav-link ${activePage === 'sports' ? 'active' : ''}">
                            Спортивные события
                        </a>
                        <a href="/wallet" class="ll-header-nav-link ${activePage === 'wallet' ? 'active' : ''}">
                            Статистика
                        </a>
                        <a href="/dashboard" class="ll-header-nav-link ${activePage === 'dashboard' ? 'active' : ''}">
                            Профиль
                        </a>
                    </nav>

                    <!-- Right Section -->
                    <div class="ll-header-right">
                        ${config.showBalance ? `
                        <!-- Balance Dropdown -->
                        <div class="ll-balance-dropdown">
                            <button class="ll-balance-btn" id="ll-balance-btn">
                                <span class="ll-balance-btn-label">Баланс</span>
                                <span class="ll-balance-btn-amount" id="ll-header-balance">${formatCurrency(state.balance.total)}</span>
                                <span class="ll-balance-btn-arrow">▼</span>
                            </button>

                            <div class="ll-balance-dropdown-content">
                                <div class="ll-dropdown-header">
                                    <div class="ll-dropdown-balance">
                                        <span class="ll-dropdown-balance-label">Текущий баланс</span>
                                        <span class="ll-dropdown-balance-amount" id="ll-dropdown-balance">${formatCurrency(state.balance.total)}</span>
                                    </div>
                                    <div class="ll-dropdown-stats">
                                        <div>
                                            <span class="ll-dropdown-stat-label">Доступно</span>
                                            <span class="ll-dropdown-stat-value" id="ll-available-balance">${formatCurrency(state.balance.available)}</span>
                                        </div>
                                        <div>
                                            <span class="ll-dropdown-stat-label">В ставках</span>
                                            <span class="ll-dropdown-stat-value" id="ll-locked-balance">${formatCurrency(state.balance.inBets)}</span>
                                        </div>
                                    </div>
                                </div>
                                <div class="ll-dropdown-actions">
                                    <button class="ll-dropdown-action-btn primary" id="ll-deposit-btn">Пополнить</button>
                                    <button class="ll-dropdown-action-btn secondary" id="ll-withdraw-btn">Вывести</button>
                                </div>
                                <div class="ll-dropdown-footer">
                                    <a href="/wallet#history" class="ll-dropdown-link">История операций</a>
                                    <a href="/wallet#stats" class="ll-dropdown-link">Статистика</a>
                                </div>
                            </div>
                        </div>
                        ` : ''}

                        <!-- User Section -->
                        <div class="ll-user-section">
                            <div class="ll-user-avatar" id="ll-user-avatar">U</div>
                            <span class="ll-user-name" id="ll-user-name">Пользователь</span>
                            <button class="ll-logout-btn" id="ll-logout-btn">Выйти</button>
                        </div>
                        </div>
                    </div>
                </div>
            </header>

            <!-- AI Assistant Integration (React Bundle) -->
            <div id="ll-assistant-root"></div>
        `;

        container.innerHTML = html;

        // Inject Assistant Bundle CSS
        if (!document.querySelector('link[href*="shared.css"]')) {
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = '/shared/components/chat-assistant/dist/shared.css';
            document.head.appendChild(link);
        }

        // Inject React Bundle Script
        if (!document.querySelector('script[src*="assistant.bundle.umd.js"]')) {
            const script = document.createElement('script');
            script.src = '/shared/components/chat-assistant/dist/assistant.bundle.umd.js';
            script.async = true;
            document.head.appendChild(script);
        }

        bindEvents();
    }

    // --- Events Bindings ---
    function bindEvents() {
        const balanceBtn = document.getElementById('ll-balance-btn');
        if (balanceBtn) {
            balanceBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                toggleDropdown();
            });
        }
        const depositBtn = document.getElementById('ll-deposit-btn');
        if (depositBtn) depositBtn.addEventListener('click', handleDeposit);
        const withdrawBtn = document.getElementById('ll-withdraw-btn');
        if (withdrawBtn) withdrawBtn.addEventListener('click', handleWithdraw);
        const logoutBtn = document.getElementById('ll-logout-btn');
        if (logoutBtn) logoutBtn.addEventListener('click', handleLogout);

        document.addEventListener('click', (e) => {
            if (!e.target.closest('.ll-balance-dropdown')) closeDropdown();
        });
    }

    // Initialize the header
    async function init(options = {}) {
        config = { ...defaultConfig, ...options };

        if (options.balance) {
            state.balance = { ...state.balance, ...options.balance };
        }

        if (options.user) {
            state.user = options.user;
        }

        render();

        await Promise.all([
            fetchBalance(),
            fetchSession()
        ]);
    }

    function setBalance(balance) {
        state.balance = { ...state.balance, ...balance };
        updateBalanceDisplay();
    }

    function setUser(user) {
        state.user = user;
        updateUserDisplay();
    }

    // Public API
    return {
        init,
        setBalance,
        setUser,
        formatCurrency,
        closeDropdown
    };
})();

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = LooselineHeader;
}
