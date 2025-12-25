import { useState, useEffect } from 'react';
import BetTypeSelector from './BetTypeSelector';
import BetAmountInput from './BetAmountInput';
import BetSubmitButton from './BetSubmitButton';
import { useBetSlip } from '../hooks/useBetSlip';
import { calculatePotentialWin, getUserBalance } from '../services/betService';

// Mock user balance replaced by API call
// const USER_BALANCE = 1000;

export default function BetSlipPanel() {
    const { selection, setSelection } = useBetSlip();
    const [balance, setBalance] = useState(0);
    const [error, setError] = useState('');

    useEffect(() => {
        getUserBalance('user_123')
            .then(setBalance)
            .catch(err => console.error('Failed to load balance', err));
    }, []);

    // Calculate potential win
    const potentialWin = calculatePotentialWin(
        selection.amount || 0,
        selection.coefficient || 0
    );

    // Check if bet amount exceeds balance
    const validateBetAmount = (amount: number) => {
        if (amount > balance) {
            setError(`Недостаточно средств. Ваш баланс: ${balance} руб.`);
            return false;
        }
        setError('');
        return true;
    };

    // Handle amount change with validation
    const handleAmountChange = (amount: number) => {
        if (validateBetAmount(amount)) {
            setSelection(prev => ({
                ...prev,
                amount
            }));
        }
    };

    // Show win/loss status
    const renderStatusMessage = () => {
        if (!selection.amount || !selection.coefficient) return null;

        return (
            <div className="mt-4 p-3 rounded-md bg-gray-100 dark:bg-gray-800">
                <p className="text-sm font-medium">
                    {potentialWin.profit > 0
                        ? `Потенциальный выигрыш: +${potentialWin.profit.toFixed(2)} руб.`
                        : 'Введите сумму ставки'}
                </p>
                {selection.amount > 0 && (
                    <p className="text-xs mt-1 text-gray-500 dark:text-gray-400">
                        {`При выигрыше получите: ${potentialWin.payout.toFixed(2)} руб.`}
                    </p>
                )}
            </div>
        );
    };

    const renderResultTime = () => {
        if (!selection.eventDate) return null;
        return (
            <div className="mt-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded text-sm text-blue-700 dark:text-blue-300">
                ⌛ Результат ожидается: {selection.eventDate}
            </div>
        );
    };

    return (
        <div className="bet-slip-panel p-4 bg-white dark:bg-gray-900 rounded-lg shadow-md w-full max-w-md mx-auto">
            <h3 className="text-xl font-bold mb-4">Мой купон</h3>

            {selection.eventName ? (
                <>
                    <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-md">
                        <p className="font-medium">{selection.eventName}</p>
                        {selection.outcome && (
                            <p className="text-sm text-gray-600 dark:text-gray-300">
                                Ставка: {selection.outcome === 'HOME' ? 'П1' : selection.outcome === 'AWAY' ? 'П2' : 'X'}
                                {selection.coefficient && ` (${selection.coefficient.toFixed(2)})`}
                            </p>
                        )}
                    </div>

                    <BetTypeSelector />

                    <div className="mt-4">
                        <BetAmountInput
                            amount={selection.amount}
                            onChange={handleAmountChange}
                            maxAmount={balance}
                        />
                        {error && (
                            <p className="text-red-500 text-sm mt-1">{error}</p>
                        )}
                    </div>

                    {renderStatusMessage()}
                    {renderResultTime()}

                    <div className="mt-4">
                        <BetSubmitButton />
                    </div>
                </>
            ) : (
                <p className="text-gray-500 dark:text-gray-400">
                    Сначала выберите событие из списка слева.
                </p>
            )}
        </div>
    );
}
