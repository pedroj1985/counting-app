import type { HistoryEntry } from '../types'

const STORAGE_KEY = 'counting-tool-history'
const MAX_ENTRIES = 10

export function getHistory(): HistoryEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function saveToHistory(entry: HistoryEntry): void {
  const history = getHistory()
  history.unshift(entry)
  if (history.length > MAX_ENTRIES) {
    history.pop()
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(history))
}

export function deleteFromHistory(id: string): void {
  const history = getHistory().filter((e) => e.id !== id)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(history))
}

export function clearHistory(): void {
  localStorage.removeItem(STORAGE_KEY)
}

export function exportHistory(): void {
  const history = getHistory()
  const blob = new Blob([JSON.stringify(history, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `counting-tool-history-${new Date().toISOString().slice(0, 10)}.json`
  a.click()
  URL.revokeObjectURL(url)
}

export function importHistory(file: File): Promise<HistoryEntry[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target!.result as string)
        if (Array.isArray(data)) {
          const merged = [...data, ...getHistory()]
            .filter((e, i, arr) => arr.findIndex((x) => x.id === e.id) === i)
            .slice(0, MAX_ENTRIES)
          localStorage.setItem(STORAGE_KEY, JSON.stringify(merged))
          resolve(merged)
        } else {
          reject(new Error('Formato inválido'))
        }
      } catch (err) {
        reject(err)
      }
    }
    reader.onerror = () => reject(reader.error)
    reader.readAsText(file)
  })
}
