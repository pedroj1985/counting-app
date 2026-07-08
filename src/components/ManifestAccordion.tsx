import { useState } from 'react'
import type { ManifestMeta, ManifestRow } from '../types'
import { parseManifest } from '../utils/parser'
import FileUploader from './FileUploader'
import BLTable from './BLTable'

interface ManifestAccordionProps {
  onData: (meta: ManifestMeta, headers: string[], rows: ManifestRow[], manifestBLs: Set<string>) => void
  initialMeta?: ManifestMeta
  initialHeaders?: string[]
  initialRows?: ManifestRow[]
}

export default function ManifestAccordion({ onData, initialMeta, initialHeaders, initialRows }: ManifestAccordionProps) {
  const [loading, setLoading] = useState(false)
  const [meta, setMeta] = useState<ManifestMeta | null>(initialMeta || null)
  const [headers, setHeaders] = useState<string[]>(initialHeaders || [])
  const [rows, setRows] = useState<ManifestRow[]>(initialRows || [])
  const [showTable, setShowTable] = useState(false)

  const handleFile = async (file: File) => {
    setLoading(true)
    try {
      const result = await parseManifest(file)
      setMeta(result.meta)
      setHeaders(result.headers)
      setRows(result.rows)
      const bls = new Set(
        result.rows
          .map((r) => r['Número de BL'] || '')
          .filter(Boolean)
      )
      onData(result.meta, result.headers, result.rows, bls)
    } catch (err) {
      alert('Error al leer el manifiesto')
    } finally {
      setLoading(false)
    }
  }

  return (
    <details className="group border border-gray-200 rounded-xl overflow-hidden bg-white" open>
      <summary className="flex items-center justify-between px-4 py-3 cursor-pointer list-none hover:bg-gray-50 transition-colors">
        <span className="font-semibold text-gray-900 text-sm">1. Manifiesto</span>
        <svg className="w-4 h-4 text-gray-400 group-open:rotate-180 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </summary>
      <div className="px-4 pb-4 space-y-3">
        <FileUploader
          label="Subir archivo del Manifiesto (.xls/.xlsx)"
          accept=".xls,.xlsx"
          onFile={handleFile}
          loading={loading}
        />
        <p className="text-xs text-gray-400">Ej: Manifiesto CMCU 4958559.xls</p>

        {meta && (
          <div className="grid grid-cols-4 gap-2">
            {[
              ['MBL', meta.mbl || meta.container || '—'],
              ['Envíos', meta.envios || rows.length],
              ['Bultos', meta.bultos || '—'],
              ['Peso kg', meta.peso ? meta.peso.toLocaleString('es-CU', { minimumFractionDigits: 2 }) : '—'],
            ].map(([label, value]) => (
              <div key={label as string} className="bg-gray-50 rounded-lg p-2 text-center">
                <div className="text-xs text-gray-500">{label}</div>
                <div className="text-sm font-bold text-gray-900 truncate">{String(value)}</div>
              </div>
            ))}
          </div>
        )}

        {rows.length > 0 && (
          <div>
            <button
              onClick={() => setShowTable(!showTable)}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50 active:bg-gray-100 transition-colors"
            >
              <svg className={`w-4 h-4 transition-transform ${showTable ? 'rotate-90' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
              {showTable ? 'Ocultar filas del manifiesto' : `Ver detalle de filas (${rows.length} registros)`}
            </button>
            {showTable && <div className="mt-3"><BLTable rows={rows} headers={headers} /></div>}
          </div>
        )}
      </div>
    </details>
  )
}
