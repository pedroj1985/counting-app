import { useState, useCallback } from 'react'
import type { ManifestMeta, ManifestRow, ConteoData, HistoryEntry } from './types'
import { normalizeBL } from './utils/normalizer'
import { compareBLs } from './utils/comparator'
import { useHistory } from './hooks/useHistory'
import Header from './components/Header'
import HistorySidebar from './components/HistorySidebar'
import ManifestAccordion from './components/ManifestAccordion'
import ConteoAccordion from './components/ConteoAccordion'
import DashboardAccordion from './components/DashboardAccordion'

export default function App() {
  const [historyOpen, setHistoryOpen] = useState(false)

  const [manifestMeta, setManifestMeta] = useState<ManifestMeta | null>(null)
  const [manifestHeaders, setManifestHeaders] = useState<string[]>([])
  const [manifestRows, setManifestRows] = useState<ManifestRow[]>([])
  const [manifestBLs, setManifestBLs] = useState<Set<string>>(new Set())

  const [conteo1, setConteo1] = useState<ConteoData | null>(null)
  const [conteo2, setConteo2] = useState<ConteoData | null>(null)

  const { entries, add, remove, clear, exportJSON, importJSON } = useHistory()

  const hasManifest = manifestRows.length > 0
  const hasConteo = conteo1 !== null || conteo2 !== null

  const handleManifest = useCallback((meta: ManifestMeta, headers: string[], rows: ManifestRow[], bls: Set<string>) => {
    setManifestMeta(meta)
    setManifestHeaders(headers)
    setManifestRows(rows)
    setManifestBLs(bls)
  }, [])

  const handleConteo = useCallback((c1: ConteoData | null, c2: ConteoData | null) => {
    setConteo1(c1)
    setConteo2(c2)
  }, [])

  const handleSaveToHistory = useCallback(() => {
    if (!hasManifest || !hasConteo) return

    const allConteo = new Set([
      ...(conteo1?.normalized || []),
      ...(conteo2?.normalized || []),
    ])
    const comparison = compareBLs(manifestBLs, allConteo)

    const entry: HistoryEntry = {
      id: crypto.randomUUID(),
      date: new Date().toISOString(),
      manifestFile: manifestMeta?.mbl || manifestMeta?.container || 'Manifiesto',
      totalBL: comparison.totalBL,
      contados: comparison.contados.length,
      cobertura: comparison.cobertura,
      meta: manifestMeta || {},
      manifestRows,
      manifestHeaders,
      conteo1Entries: conteo1?.raw || [],
      conteo2Entries: conteo2?.raw || [],
      comparison,
    }
    add(entry)
  }, [hasManifest, hasConteo, manifestMeta, manifestRows, manifestHeaders, conteo1, conteo2, manifestBLs, add])

  const handleHistorySelect = useCallback((entry: HistoryEntry) => {
    setManifestMeta(entry.meta)
    setManifestHeaders(entry.manifestHeaders)
    setManifestRows(entry.manifestRows)
    setManifestBLs(new Set(entry.manifestRows.map((r) => normalizeBL(r['Número de BL'] || '')).filter((b): b is string => b !== null)))
    setConteo1(entry.conteo1Entries.length > 0 ? { raw: entry.conteo1Entries, normalized: entry.comparison.contados.concat(entry.comparison.extranos).filter(b => entry.conteo1Entries.some(c => normalizeBL(c) === b)) } : null)
    setConteo2(entry.conteo2Entries.length > 0 ? { raw: entry.conteo2Entries, normalized: [] } : null)
    setHistoryOpen(false)
  }, [])

  return (
    <div className="min-h-screen bg-gray-50">
      <Header onToggleHistory={() => setHistoryOpen(!historyOpen)} historyCount={entries.length} />

      <HistorySidebar
        open={historyOpen}
        entries={entries}
        onSelect={handleHistorySelect}
        onDelete={remove}
        onClear={clear}
        onExport={exportJSON}
        onImport={importJSON}
        onClose={() => setHistoryOpen(false)}
      />

      <main className="max-w-2xl mx-auto px-4 py-4 space-y-3">
        <ManifestAccordion onData={handleManifest} />

        <ConteoAccordion onData={handleConteo} />

        <DashboardAccordion manifestRows={manifestRows} conteo1={conteo1} conteo2={conteo2} />

        {hasManifest && hasConteo && (
          <button
            onClick={handleSaveToHistory}
            className="w-full py-3 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 active:bg-blue-800 transition-colors text-sm"
          >
            💾 Guardar sesión en historial
          </button>
        )}
      </main>

      <footer className="text-center py-4 text-xs text-gray-400">
        counting-app · Procesamiento de Manifiesto vs Conteo de Bultos
      </footer>
    </div>
  )
}
