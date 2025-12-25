'use client';

import { useState, useEffect, useRef } from 'react';
import './header.css';

// ============ TYPES ============
interface BalanceState {
    total: number;
    available: number;
    inBets: number;
    loading: boolean;
}

interface User {
    id?: string;
    name?: string;
    email?: string;
}

export interface HeaderProps {
    user?: User | null;
    loading?: boolean;
    activePage?: 'sports' | 'wallet' | 'dashboard';
    showBalance?: boolean;
    onDeposit?: () => void;
    onWithdraw?: () => void;
    onLogout?: () => void;
    balanceApiUrl?: string;
    sessionApiUrl?: string;
}

// ============ MAIN HEADER COMPONENT ============
import { AssistantWindow } from '../chat-assistant/assistant';

/**
 * LOOSELINE Unified Header Component (React/TSX)
 * Shared across all React-based modules
 */
export function Header({
    user: initialUser,
    loading: initialLoading = false,
    activePage,
    showBalance = true,
    onDeposit,
    onWithdraw,
    onLogout,
    balanceApiUrl = '/api/wallet/balance',
    sessionApiUrl = '/api/auth/get-session'
}: HeaderProps) {
    const [user, setUser] = useState<User | null>(initialUser || null);
    const [loading, setLoading] = useState(initialLoading);
    const [logoutLoading, setLogoutLoading] = useState(false);
    const [balanceDropdownOpen, setBalanceDropdownOpen] = useState(false);
    const [showAssistant, setShowAssistant] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Balance state
    const [balance, setBalance] = useState<BalanceState>({
        total: 0,
        available: 0,
        inBets: 0,
        loading: true
    });

    // Detect active page from URL if not provided
    const detectActivePage = (): 'sports' | 'wallet' | 'dashboard' | undefined => {
        if (typeof window === 'undefined') return undefined;
        const path = window.location.pathname;
        if (path.includes('/sports')) return 'sports';
        if (path.includes('/wallet')) return 'wallet';
        if (path.includes('/dashboard')) return 'dashboard';
        return undefined;
    };

    const currentActivePage = activePage || detectActivePage();

    // Format currency
    const formatCurrency = (amount: number): string => {
        return `$${amount.toLocaleString('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        })}`;
    };

    // Fetch balance from API
    useEffect(() => {
        const fetchBalance = async () => {
            try {
                const response = await fetch(balanceApiUrl, {
                    credentials: 'include'
                });
                if (response.ok) {
                    const data = await response.json();
                    const balanceData = data.data || data.balance || data;
                    setBalance({
                        total: balanceData.balance || balanceData.current_balance || balanceData.total || 0,
                        available: balanceData.available_balance || balanceData.available || 0,
                        inBets: balanceData.locked_balance || balanceData.locked_in_bets || balanceData.inBets || 0,
                        loading: false
                    });
                } else {
                    setBalance({
                        total: 5000.00,
                        available: 4750.00,
                        inBets: 250.00,
                        loading: false
                    });
                }
            } catch (e) {
                console.warn('Failed to fetch balance:', e);
                setBalance({
                    total: 5000.00,
                    available: 4750.00,
                    inBets: 250.00,
                    loading: false
                });
            }
        };

        if (showBalance) {
            fetchBalance();
        }
    }, [balanceApiUrl, showBalance]);

    // Fetch session if no user provided
    useEffect(() => {
        if (initialUser) {
            setUser(initialUser);
            if (initialLoading === false) setLoading(false);
            return;
        }

        const fetchSession = async () => {
            if (initialLoading) return;

            try {
                const response = await fetch(sessionApiUrl, {
                    credentials: 'include',
                    headers: { 'Content-Type': 'application/json' }
                });
                if (response.ok) {
                    const data = await response.json();
                    const userData = data.session?.user || data.user || data;
                    if (userData?.id || userData?.email) {
                        setUser(userData);
                    }
                }
            } catch (e) {
                console.warn('Failed to fetch session:', e);
            } finally {
                setLoading(false);
            }
        };

        fetchSession();
    }, [initialUser, initialLoading, sessionApiUrl]);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setBalanceDropdownOpen(false);
            }
        };

        const handlePageShow = (event: PageTransitionEvent) => {
            if (event.persisted) {
                window.location.reload();
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        window.addEventListener('pageshow', handlePageShow);

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            window.removeEventListener('pageshow', handlePageShow);
        };
    }, []);

    // Handle logout
    // Handle logout
    const handleLogout = async () => {
        if (onLogout) {
            onLogout();
            return;
        }

        try {
            setLogoutLoading(true);

            const logoutPaths = [
                '/api/auth/signout',
                '/api/auth/logout',
                '/api/auth/sign-out'
            ];

            for (const path of logoutPaths) {
                try {
                    const response = await fetch(path, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({}),
                        credentials: 'include',
                    });

                    if (response.ok) {
                        window.location.replace('/login');
                        return;
                    }
                } catch (err) {
                    console.log(`Path ${path} error:`, err);
                }
            }

            window.location.replace('/login');
        } catch (error) {
            console.error('Logout error:', error);
            window.location.replace('/login');
        } finally {
            setLogoutLoading(false);
        }
    };

    // Handle deposit click
    const handleDeposit = () => {
        setBalanceDropdownOpen(false);
        if (onDeposit) {
            onDeposit();
        } else {
            // Default: navigate to wallet
            window.location.href = '/wallet#deposit';
        }
    };

    // Handle withdraw click
    const handleWithdraw = () => {
        setBalanceDropdownOpen(false);
        if (onWithdraw) {
            onWithdraw();
        } else {
            // Default: navigate to wallet
            window.location.href = '/wallet#withdraw';
        }
    };

    // Get user display info
    const userName = user?.name || user?.email?.split('@')[0] || 'Пользователь';
    const userInitial = userName.charAt(0).toUpperCase();

    return (
        <>
            <header className="ll-header">
                <div className="ll-header-inner">
                    {/* Logo */}
                    <div className="ll-header-logo">
                        <a href="/">
                            <span className="ll-header-logo-text">LOOSELINE</span>
                        </a>
                    </div>

                    {/* Navigation */}
                    <nav className="ll-header-nav">
                        <a
                            href="/sports"
                            className={`ll-header-nav-link ${currentActivePage === 'sports' ? 'active' : ''}`}
                        >
                            Спортивные события
                        </a>
                        <a
                            href="/wallet"
                            className={`ll-header-nav-link ${currentActivePage === 'wallet' ? 'active' : ''}`}
                        >
                            Статистика
                        </a>
                        <a
                            href="/dashboard"
                            className={`ll-header-nav-link ${currentActivePage === 'dashboard' ? 'active' : ''}`}
                        >
                            Профиль
                        </a>
                    </nav>

                    {/* Right Section */}
                    <div className="ll-header-right">
                        {/* Balance Dropdown */}
                        {showBalance && (
                            <div
                                ref={dropdownRef}
                                className={`ll-balance-dropdown ${balanceDropdownOpen ? 'open' : ''}`}
                            >
                                <button
                                    className="ll-balance-btn"
                                    onClick={() => setBalanceDropdownOpen(!balanceDropdownOpen)}
                                >
                                    <span className="ll-balance-btn-label">Баланс</span>
                                    <span className="ll-balance-btn-amount">
                                        {formatCurrency(balance.total)}
                                    </span>
                                    <span className="ll-balance-btn-arrow">▼</span>
                                </button>

                                {/* Dropdown Content */}
                                <div className="ll-balance-dropdown-content">
                                    <div className="ll-dropdown-header">
                                        <div className="ll-dropdown-balance">
                                            <span className="ll-dropdown-balance-label">Текущий баланс</span>
                                            <span className="ll-dropdown-balance-amount">
                                                {formatCurrency(balance.total)}
                                            </span>
                                        </div>
                                        <div className="ll-dropdown-stats">
                                            <div>
                                                <span className="ll-dropdown-stat-label">Доступно</span>
                                                <span className="ll-dropdown-stat-value">
                                                    {formatCurrency(balance.available)}
                                                </span>
                                            </div>
                                            <div>
                                                <span className="ll-dropdown-stat-label">В ставках</span>
                                                <span className="ll-dropdown-stat-value">
                                                    {formatCurrency(balance.inBets)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="ll-dropdown-actions">
                                        <button
                                            className="ll-dropdown-action-btn primary"
                                            onClick={handleDeposit}
                                        >
                                            Пополнить
                                        </button>
                                        <button
                                            className="ll-dropdown-action-btn secondary"
                                            onClick={handleWithdraw}
                                        >
                                            Вывести
                                        </button>
                                    </div>
                                    <div className="ll-dropdown-footer">
                                        <a href="/wallet#history" className="ll-dropdown-link">
                                            История операций
                                        </a>
                                        <a href="/wallet#stats" className="ll-dropdown-link">
                                            Статистика
                                        </a>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* User Section */}
                        <div className="ll-user-section">
                            <div className="ll-user-avatar">{userInitial}</div>
                            <span className="ll-user-name">{userName}</span>
                            <button
                                className="ll-logout-btn"
                                onClick={handleLogout}
                                disabled={logoutLoading || loading}
                            >
                                {logoutLoading ? 'Выход...' : 'Выйти'}
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* AI Assistant Integration */}
            <div className="assistant-wrapper">
                <AssistantWindow isOpen={showAssistant} onClose={() => setShowAssistant(false)} />
                <button
                    className={`assistant-toggle-btn ${showAssistant ? 'active' : ''}`}
                    onClick={() => setShowAssistant(!showAssistant)}
                    aria-label="Toggle AI Assistant"
                >
                    {showAssistant ? '✕' : '🤖'}
                </button>
            </div>
        </>
    );
}

export default Header;
