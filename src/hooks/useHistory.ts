import { useState, useCallback } from 'react'
import type { HistoryEntry } from '../types'
import { getHistory, saveToHistory, deleteFromHistory, clearHistory as clearStorage, exportHistory, importHistory } from '../utils/history'

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

  const exportJSON = useCallback(() => {
    exportHistory()
  }, [])

  const importJSON = useCallback(async (file: File) => {
    const merged = await importHistory(file)
    setEntries(merged)
  }, [])

  return { entries, add, remove, clear, exportJSON, importJSON }
}
