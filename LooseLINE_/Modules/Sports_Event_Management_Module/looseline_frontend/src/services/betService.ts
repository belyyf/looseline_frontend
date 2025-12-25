// Сервис для работы со ставками

/**
 * Расчет потенциального выигрыша
 */
export function calculatePotentialWin(amount: number, coefficient: number): { payout: number; profit: number } {
    const safeAmount = Number.isFinite(amount) ? amount : 0;
    const safeCoeff = Number.isFinite(coefficient) ? coefficient : 0;

    const payout = +(safeAmount * safeCoeff).toFixed(2);
    const profit = +(payout - safeAmount).toFixed(2);

    return {
        payout: payout > 0 ? payout : 0,
        profit: profit > 0 ? profit : 0,
    };
}

const API_URL = import.meta.env.VITE_API_URL || '/api';

export interface PlaceBetPayload {
    eventId: string | number;
    outcome: 'HOME' | 'DRAW' | 'AWAY';
    coefficient: number;
    amount: number;
    eventName?: string;
    userId: string;
}

/**
 * Размещение ставки через backend API
 */
export async function placeBet(payload: PlaceBetPayload): Promise<{ betId: string }> {
    const body = {
        user_id: payload.userId,
        event_id: Number(payload.eventId),
        odds_id: 1,
        bet_type: payload.outcome === 'HOME' ? '1' : payload.outcome === 'DRAW' ? 'X' : '2',
        bet_amount: payload.amount,
        coefficient: payload.coefficient,
        event_name: payload.eventName,
    };

    const res = await fetch(`${API_URL}/bets`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
    });

    if (!res.ok) {
        console.error('Failed to place bet', await res.text());
        throw new Error('Не удалось разместить ставку');
    }

    const data = await res.json();
    return { betId: String(data.bet_id) };
}

export async function getUserBalance(userId: string): Promise<number> {
    const res = await fetch(`${API_URL}/bets/balance/${userId}`);
    if (!res.ok) {
        throw new Error('Failed to fetch balance');
    }
    const data = await res.json();
    return Number(data.balance);
}

