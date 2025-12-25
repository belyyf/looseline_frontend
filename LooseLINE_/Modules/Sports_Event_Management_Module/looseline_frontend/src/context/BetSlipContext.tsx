import { createContext, useContext, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { calculatePotentialWin } from '../services/betService';

export type Outcome = 'HOME' | 'DRAW' | 'AWAY' | null;

export interface BetSelection {
    eventId: number | null;
    eventName: string | null;
    eventDate: string | null;
    outcome: Outcome;
    coefficient: number | null;
    amount: number;
    coefficients: {
        HOME: number;
        DRAW: number;
        AWAY: number;
    } | null;
}

export interface BetResult {
    status: 'success' | 'error';
    betId?: string;
    message?: string;
}

interface BetSlipContextValue {
    selection: BetSelection;
    setSelection: React.Dispatch<React.SetStateAction<BetSelection>>;
    resetSelection: () => void;
    isConfirmOpen: boolean;
    setIsConfirmOpen: (open: boolean) => void;
    lastBetResult: BetResult | null;
    setLastBetResult: (result: BetResult | null) => void;
    potential: { payout: number; profit: number };
}

const INITIAL_SELECTION: BetSelection = {
    eventId: null,
    eventName: null,
    eventDate: null,
    outcome: null,
    coefficient: null,
    amount: 0,
    coefficients: null,
};

const BetSlipContext = createContext<BetSlipContextValue | null>(null);

export function BetSlipProvider({ children }: { children: ReactNode }) {
    const [selection, setSelection] = useState<BetSelection>(INITIAL_SELECTION);
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [lastBetResult, setLastBetResult] = useState<BetResult | null>(null);

    const potential = useMemo(() => {
        if (!selection.coefficient || !selection.amount) {
            return { payout: 0, profit: 0 };
        }
        return calculatePotentialWin(selection.amount, selection.coefficient);
    }, [selection.amount, selection.coefficient]);

    const value = useMemo(
        () => ({
            selection,
            setSelection,
            resetSelection: () => setSelection(INITIAL_SELECTION),
            isConfirmOpen,
            setIsConfirmOpen,
            lastBetResult,
            setLastBetResult,
            potential,
        }),
        [selection, isConfirmOpen, lastBetResult, potential]
    );

    return <BetSlipContext.Provider value={value}>{children}</BetSlipContext.Provider>;
}

export function useBetSlipContext(): BetSlipContextValue {
    const ctx = useContext(BetSlipContext);
    if (!ctx) {
        throw new Error('useBetSlipContext must be used inside BetSlipProvider');
    }
    return ctx;
}
