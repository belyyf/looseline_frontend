interface BetAmountInputProps {
    amount: number;
    onChange: (amount: number) => void;
    maxAmount?: number;
}

export default function BetAmountInput({ amount, onChange, maxAmount }: BetAmountInputProps) {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = parseFloat(e.target.value) || 0;
        
        // Validate against max amount if provided
        if (maxAmount && value > maxAmount) {
            // Optionally set to max amount instead of blocking
            // onChange(maxAmount);
            // return;
            
            // Or just set the value and let parent handle the validation
            onChange(value);
            return;
        }
        
        onChange(value);
    };

    return (
        <div className="w-full">
            <label htmlFor="bet-amount" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Сумма ставки
            </label>
            <div className="relative rounded-md shadow-sm">
                <input
                    id="bet-amount"
                    type="number"
                    min={0}
                    step={10}
                    value={amount || ''}
                    onChange={handleChange}
                    className="block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-3 border bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    placeholder="100"
                    aria-describedby="amount-currency"
                    style={{
                        fontSize: '1.25rem',
                        fontWeight: 700,
                        fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
                        color: '#000000'
                    }}
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 dark:text-gray-400 text-xl font-bold" id="amount-currency">
                        ₽
                    </span>
                </div>
            </div>
            {maxAmount && (
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 font-medium">
                    Доступно: {maxAmount} ₽
                </p>
            )}
        </div>
    );
}
