import { useState } from 'react'
import type { ConteoData } from '../types'
import { parseConteo } from '../utils/parser'
import FileUploader from './FileUploader'

const MAX_CONTEOS = 5

interface ConteoAccordionProps {
  onData: (conteos: ConteoData[]) => void
  initialConteos?: ConteoData[]
}

export default function ConteoAccordion({ onData, initialConteos }: ConteoAccordionProps) {
  const [conteos, setConteos] = useState<ConteoData[]>(initialConteos || [])
  const [loading, setLoading] = useState<number | null>(null)

  const emit = (updated: ConteoData[]) => {
    setConteos(updated)
    onData(updated)
  }

  const handleFile = async (file: File, idx: number) => {
    setLoading(idx)
    try {
      const data = await parseConteo(file)
      const updated = [...conteos]
      updated[idx] = data
      emit(updated)
    } catch {
      alert(`Error al leer Conteo ${idx + 1}`)
    } finally {
      setLoading(null)
    }
  }

  const addSlot = () => {
    if (conteos.length >= MAX_CONTEOS) return
    emit([...conteos, { raw: [], normalized: [] }])
  }

  const removeSlot = (idx: number) => {
    if (conteos.length <= 1) return
    const updated = conteos.filter((_, i) => i !== idx)
    emit(updated)
  }

  const totalUnion = new Set(conteos.flatMap((c) => c.normalized))

  return (
    <details className="group border border-gray-200 rounded-xl overflow-hidden bg-white">
      <summary className="flex items-center justify-between px-4 py-3 cursor-pointer list-none hover:bg-gray-50 transition-colors">
        <span className="font-semibold text-gray-900 text-sm">2. Conteos</span>
        <svg className="w-4 h-4 text-gray-400 group-open:rotate-180 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </summary>
      <div className="px-4 pb-4 space-y-3">
        {conteos.length === 0 && (
          <div>
            <FileUploader
              label="Conteo 1 (.xls/.xlsx)"
              accept=".xls,.xlsx"
              onFile={(f) => handleFile(f, 0)}
              loading={loading === 0}
            />
          </div>
        )}

        {conteos.map((c, idx) => (
          <div key={idx} className="border border-gray-100 rounded-xl p-3 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Conteo {idx + 1}</span>
              {conteos.length > 1 && (
                <button
                  onClick={() => removeSlot(idx)}
                  className="p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
            <FileUploader
              label={`Conteo ${idx + 1} (.xls/.xlsx)`}
              accept=".xls,.xlsx"
              onFile={(f) => handleFile(f, idx)}
              loading={loading === idx}
            />
            {c.raw.length > 0 && (
              <p className="text-xs text-gray-500">{c.raw.length} entradas</p>
            )}
          </div>
        ))}

        {conteos.length < MAX_CONTEOS && conteos.length > 0 && (
          <button
            onClick={addSlot}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 border-2 border-dashed border-gray-300 rounded-xl text-sm text-gray-500 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Agregar otro conteo
          </button>
        )}

        {totalUnion.size > 0 && (
          <div className="bg-blue-50 text-blue-800 text-sm rounded-lg px-3 py-2">
            🧮 <strong>Total combinado</strong> (únicos): {totalUnion.size} BLs
          </div>
        )}
      </div>
    </details>
  )
}
