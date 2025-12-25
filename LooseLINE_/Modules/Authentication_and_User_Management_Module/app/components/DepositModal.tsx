'use client';

import { useState, useEffect } from 'react';

interface DepositModalProps {
    isOpen: boolean;
    onClose: () => void;
    currentBalance: number;
    onSuccess?: (newBalance: number) => void;
}

const quickAmounts = [100, 250, 500, 1000];

export function DepositModal({ isOpen, onClose, currentBalance, onSuccess }: DepositModalProps) {
    const [amount, setAmount] = useState<string>('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!isOpen) {
            setAmount('');
            setError(null);
        }
    }, [isOpen]);

    const formatCurrency = (value: number) => {
        return `$${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    };

    const numericAmount = parseFloat(amount) || 0;
    const newBalance = currentBalance + numericAmount;

    const handleDeposit = async () => {
        if (numericAmount < 1) {
            setError('Минимальная сумма $1.00');
            return;
        }
        if (numericAmount > 100000) {
            setError('Максимальная сумма $100,000.00');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const response = await fetch('/api/wallet/deposit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ amount: numericAmount }),
            });

            if (response.ok) {
                const data = await response.json();
                onSuccess?.(data.new_balance || newBalance);
                onClose();
            } else {
                const data = await response.json();
                setError(data.error || 'Ошибка пополнения');
            }
        } catch (e) {
            setError('Ошибка соединения');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
        }}>
            {/* Overlay */}
            <div
                onClick={onClose}
                style={{
                    position: 'absolute',
                    inset: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.6)',
                    backdropFilter: 'blur(4px)'
                }}
            />

            {/* Modal */}
            <div style={{
                position: 'relative',
                width: '100%',
                maxWidth: '440px',
                margin: '0 16px',
                backgroundColor: '#1e293b',
                borderRadius: '16px',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                overflow: 'hidden'
            }}>
                {/* Header */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '20px 24px',
                    borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span style={{ fontSize: '24px' }}>💳</span>
                        <div>
                            <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 600, color: '#ffffff' }}>
                                Пополнить баланс
                            </h2>
                            <p style={{ margin: 0, fontSize: '13px', color: 'rgba(255, 255, 255, 0.5)' }}>
                                Мгновенное пополнение
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        style={{
                            width: '32px',
                            height: '32px',
                            border: 'none',
                            background: 'rgba(255, 255, 255, 0.1)',
                            borderRadius: '8px',
                            color: '#94a3b8',
                            fontSize: '18px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}
                    >
                        ×
                    </button>
                </div>

                {/* Body */}
                <div style={{ padding: '24px' }}>
                    {/* Current Balance */}
                    <div style={{
                        padding: '16px',
                        backgroundColor: 'rgba(39, 174, 96, 0.1)',
                        borderRadius: '12px',
                        marginBottom: '20px',
                        textAlign: 'center'
                    }}>
                        <div style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.6)', marginBottom: '4px' }}>
                            Текущий баланс
                        </div>
                        <div style={{
                            fontFamily: "'JetBrains Mono', monospace",
                            fontSize: '24px',
                            fontWeight: 700,
                            color: '#27ae60'
                        }}>
                            {formatCurrency(currentBalance)}
                        </div>
                    </div>

                    {/* Quick Amounts */}
                    <div style={{ marginBottom: '16px' }}>
                        <label style={{
                            display: 'block',
                            fontSize: '13px',
                            fontWeight: 500,
                            color: 'rgba(255, 255, 255, 0.7)',
                            marginBottom: '8px'
                        }}>
                            Быстрый выбор
                        </label>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
                            {quickAmounts.map((qa) => (
                                <button
                                    key={qa}
                                    onClick={() => setAmount(qa.toString())}
                                    style={{
                                        padding: '12px 8px',
                                        backgroundColor: numericAmount === qa ? '#27ae60' : '#2c3e50',
                                        color: numericAmount === qa ? '#ffffff' : 'rgba(255, 255, 255, 0.8)',
                                        border: '1px solid',
                                        borderColor: numericAmount === qa ? '#27ae60' : 'rgba(255, 255, 255, 0.1)',
                                        borderRadius: '8px',
                                        cursor: 'pointer',
                                        fontWeight: 600,
                                        fontSize: '14px',
                                        transition: 'all 0.15s'
                                    }}
                                >
                                    ${qa}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Amount Input */}
                    <div style={{ marginBottom: '16px' }}>
                        <label style={{
                            display: 'block',
                            fontSize: '13px',
                            fontWeight: 500,
                            color: 'rgba(255, 255, 255, 0.7)',
                            marginBottom: '8px'
                        }}>
                            Сумма пополнения
                        </label>
                        <div style={{ position: 'relative' }}>
                            <span style={{
                                position: 'absolute',
                                left: '16px',
                                top: '50%',
                                transform: 'translateY(-50%)',
                                color: 'rgba(255, 255, 255, 0.5)',
                                fontSize: '16px',
                                fontWeight: 600
                            }}>$</span>
                            <input
                                type="number"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                placeholder="0.00"
                                min="1"
                                max="100000"
                                style={{
                                    width: '100%',
                                    padding: '14px 16px 14px 36px',
                                    backgroundColor: '#2c3e50',
                                    border: '1px solid rgba(255, 255, 255, 0.15)',
                                    borderRadius: '10px',
                                    color: '#ffffff',
                                    fontSize: '16px',
                                    fontFamily: "'JetBrains Mono', monospace",
                                    outline: 'none',
                                    boxSizing: 'border-box'
                                }}
                            />
                        </div>
                        <div style={{
                            fontSize: '11px',
                            color: 'rgba(255, 255, 255, 0.4)',
                            marginTop: '6px'
                        }}>
                            Мин. $1.00 • Макс. $100,000.00
                        </div>
                    </div>

                    {/* Preview */}
                    {numericAmount > 0 && (
                        <div style={{
                            padding: '12px 16px',
                            backgroundColor: 'rgba(255, 255, 255, 0.05)',
                            borderRadius: '10px',
                            marginBottom: '16px'
                        }}>
                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                marginBottom: '8px',
                                fontSize: '13px'
                            }}>
                                <span style={{ color: 'rgba(255, 255, 255, 0.6)' }}>Сумма пополнения</span>
                                <span style={{ color: '#ffffff', fontWeight: 500 }}>{formatCurrency(numericAmount)}</span>
                            </div>
                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                fontSize: '14px'
                            }}>
                                <span style={{ color: 'rgba(255, 255, 255, 0.6)' }}>Баланс после</span>
                                <span style={{ color: '#27ae60', fontWeight: 700 }}>{formatCurrency(newBalance)}</span>
                            </div>
                        </div>
                    )}

                    {/* Error */}
                    {error && (
                        <div style={{
                            padding: '12px',
                            backgroundColor: 'rgba(239, 68, 68, 0.1)',
                            border: '1px solid rgba(239, 68, 68, 0.3)',
                            borderRadius: '8px',
                            color: '#ef4444',
                            fontSize: '13px',
                            marginBottom: '16px'
                        }}>
                            {error}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div style={{
                    display: 'flex',
                    gap: '12px',
                    padding: '16px 24px',
                    borderTop: '1px solid rgba(255, 255, 255, 0.1)'
                }}>
                    <button
                        onClick={onClose}
                        style={{
                            flex: 1,
                            padding: '14px',
                            backgroundColor: '#2c3e50',
                            border: '1px solid rgba(255, 255, 255, 0.15)',
                            borderRadius: '10px',
                            color: '#ffffff',
                            fontSize: '14px',
                            fontWeight: 600,
                            cursor: 'pointer'
                        }}
                    >
                        Отмена
                    </button>
                    <button
                        onClick={handleDeposit}
                        disabled={loading || numericAmount < 1}
                        style={{
                            flex: 1,
                            padding: '14px',
                            backgroundColor: loading || numericAmount < 1 ? '#1e4931' : '#27ae60',
                            border: 'none',
                            borderRadius: '10px',
                            color: '#ffffff',
                            fontSize: '14px',
                            fontWeight: 600,
                            cursor: loading || numericAmount < 1 ? 'not-allowed' : 'pointer',
                            opacity: loading || numericAmount < 1 ? 0.6 : 1
                        }}
                    >
                        {loading ? 'Обработка...' : '✓ Пополнить'}
                    </button>
                </div>
            </div>
        </div>
    );
}
