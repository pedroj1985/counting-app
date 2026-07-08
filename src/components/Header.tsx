interface HeaderProps {
  onToggleHistory: () => void
  historyCount: number
}

export default function Header({ onToggleHistory, historyCount }: HeaderProps) {
  return (
    <header className="border-b border-gray-200 bg-white sticky top-0 z-10">
      <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">📦 counting-app</h1>
          <p className="text-xs text-gray-500">Comparación de Manifiesto vs Conteo de Bultos</p>
        </div>
        <button
          onClick={onToggleHistory}
          className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors"
          title="Historial"
        >
          <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {historyCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium">
              {historyCount}
            </span>
          )}
        </button>
      </div>
    </header>
  )
}
