import { createContext, useContext, useMemo, useState } from 'react'
import { calculatePotentialWin } from '../services/betService'

const BetSlipContext = createContext(null)

const INITIAL_SELECTION = {
  eventId: null,
  eventName: null,
  outcome: null, // 'HOME' | 'DRAW' | 'AWAY'
  coefficient: null,
  amount: 0,
}

export function BetSlipProvider({ children }) {
  const [selection, setSelection] = useState(INITIAL_SELECTION)
  const [isConfirmOpen, setIsConfirmOpen] = useState(false)
  const [lastBetResult, setLastBetResult] = useState(null)

  const potential = useMemo(() => {
    if (!selection.coefficient || !selection.amount) {
      return { payout: 0, profit: 0 }
    }
    return calculatePotentialWin(selection.amount, selection.coefficient)
  }, [selection.amount, selection.coefficient])

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
    [selection, isConfirmOpen, lastBetResult, potential],
  )

  return <BetSlipContext.Provider value={value}>{children}</BetSlipContext.Provider>
}

export function useBetSlipContext() {
  const ctx = useContext(BetSlipContext)
  if (!ctx) {
    throw new Error('useBetSlipContext must be used inside BetSlipProvider')
  }
  return ctx
}


