import { useState, useCallback } from 'react'
import type { HistoryEntry } from '../types'
import { getHistory, saveToHistory, deleteFromHistory, clearHistory as clearStorage } from '../utils/history'

export function useHistory() {
  const [entries, setEntries] = useState<HistoryEntry[]>(() => getHistory())

  const add = useCallback((entry: HistoryEntry) => {
    saveToHistory(entry)
    setEntries(getHistory())
  }, [])

  const remove = useCallback((id: string) => {
    deleteFromHistory(id)
    setEntries(getHistory())
  }, [])

  const clear = useCallback(() => {
    clearStorage()
    setEntries([])
  }, [])

  return { entries, add, remove, clear }
}
