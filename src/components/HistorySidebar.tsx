import type { HistoryEntry } from '../types'

interface HistorySidebarProps {
  open: boolean
  entries: HistoryEntry[]
  onSelect: (entry: HistoryEntry) => void
  onDelete: (id: string) => void
  onClear: () => void
  onClose: () => void
}

export default function HistorySidebar({ open, entries, onSelect, onDelete, onClear, onClose }: HistorySidebarProps) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-20 flex">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="relative ml-auto w-80 max-w-[85vw] bg-white h-full shadow-xl overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between">
          <h2 className="font-semibold text-gray-900">📋 Historial</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg">
            <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {entries.length > 0 && (
          <div className="p-4 pb-0">
            <button onClick={onClear} className="w-full px-3 py-2 text-xs font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors">
              Borrar historial
            </button>
          </div>
        )}

        <div className="px-4 pb-4 space-y-2">
          {entries.length === 0 && (
            <p className="text-sm text-gray-400 text-center py-8">Sin sesiones guardadas</p>
          )}
          {entries.map((entry) => (
            <div key={entry.id} className="border border-gray-200 rounded-xl p-3 hover:border-blue-300 transition-colors cursor-pointer" onClick={() => onSelect(entry)}>
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{entry.manifestFile}</p>
                  <p className="text-xs text-gray-500">{new Date(entry.date).toLocaleDateString('es-CU', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-bold text-emerald-600">{entry.cobertura}%</p>
                  <p className="text-xs text-gray-400">{entry.contados}/{entry.totalBL}</p>
                </div>
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); onDelete(entry.id) }}
                className="mt-2 text-xs text-red-500 hover:text-red-700"
              >
                Eliminar
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
