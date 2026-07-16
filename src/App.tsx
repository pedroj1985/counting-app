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

  const [conteos, setConteos] = useState<ConteoData[]>([])

  const { entries, add, remove, clear } = useHistory()

  const hasManifest = manifestRows.length > 0
  const hasConteo = conteos.some((c) => c.raw.length > 0)

  const handleManifest = useCallback((meta: ManifestMeta, headers: string[], rows: ManifestRow[], bls: Set<string>) => {
    setManifestMeta(meta)
    setManifestHeaders(headers)
    setManifestRows(rows)
    setManifestBLs(bls)
  }, [])

  const handleConteo = useCallback((updated: ConteoData[]) => {
    setConteos(updated)
  }, [])

  const handleSaveToHistory = useCallback(() => {
    if (!hasManifest || !hasConteo) return

    const allConteo = new Set(conteos.flatMap((c) => c.normalized))
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
      conteosEntries: conteos.map((c) => c.raw),
      comparison,
    }
    add(entry)
  }, [hasManifest, hasConteo, manifestMeta, manifestRows, manifestHeaders, conteos, manifestBLs, add])

  const handleHistorySelect = useCallback((entry: HistoryEntry) => {
    setManifestMeta(entry.meta)
    setManifestHeaders(entry.manifestHeaders)
    setManifestRows(entry.manifestRows)
    setManifestBLs(new Set(entry.manifestRows.map((r) => normalizeBL(r['Número de BL'] || '')).filter((b): b is string => b !== null)))
    const restored = entry.conteosEntries.map((raw) => ({
      raw,
      normalized: raw.map(normalizeBL).filter((b): b is string => b !== null),
    }))
    setConteos(restored)
    setHistoryOpen(false)
  }, [])

  return (
    <div className="min-h-screen bg-smoke-100">
      <Header onToggleHistory={() => setHistoryOpen(!historyOpen)} historyCount={entries.length} />

      <HistorySidebar
        open={historyOpen}
        entries={entries}
        onSelect={handleHistorySelect}
        onDelete={remove}
        onClear={clear}
        onClose={() => setHistoryOpen(false)}
      />

      <main className="max-w-2xl mx-auto px-4 py-4 space-y-3">
        <ManifestAccordion onData={handleManifest} />

        <ConteoAccordion onData={handleConteo} />

        <DashboardAccordion manifestRows={manifestRows} conteos={conteos} open={hasConteo} />

        {hasManifest && hasConteo && (
          <button
            onClick={handleSaveToHistory}
            className="w-full py-3 bg-brand-600 text-white font-medium rounded-xl shadow-sm hover:bg-brand-700 active:bg-brand-800 transition-all text-sm"
          >
            💾 Guardar sesión en historial
          </button>
        )}
      </main>

      <footer className="text-center py-4 text-xs text-gray-400">
        Herramienta de Conteo v{__APP_VERSION__} · Procesamiento de Manifiesto vs Conteo de Bultos
      </footer>
    </div>
  )
}
