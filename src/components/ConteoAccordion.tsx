import { useState } from 'react'
import type { ConteoData } from '../types'
import { parseConteo } from '../utils/parser'
import FileUploader from './FileUploader'

interface ConteoAccordionProps {
  onData: (conteo1: ConteoData | null, conteo2: ConteoData | null) => void
  initialConteo1?: ConteoData | null
  initialConteo2?: ConteoData | null
}

export default function ConteoAccordion({ onData, initialConteo1, initialConteo2 }: ConteoAccordionProps) {
  const [c1, setC1] = useState<ConteoData | null>(initialConteo1 || null)
  const [c2, setC2] = useState<ConteoData | null>(initialConteo2 || null)
  const [loading1, setLoading1] = useState(false)
  const [loading2, setLoading2] = useState(false)

  const handleFile1 = async (file: File) => {
    setLoading1(true)
    try {
      const data = await parseConteo(file)
      setC1(data)
      onData(data, c2)
    } catch { alert('Error al leer Conteo 1') }
    finally { setLoading1(false) }
  }

  const handleFile2 = async (file: File) => {
    setLoading2(true)
    try {
      const data = await parseConteo(file)
      setC2(data)
      onData(c1, data)
    } catch { alert('Error al leer Conteo 2') }
    finally { setLoading2(false) }
  }

  const totalUnion = new Set([
    ...(c1?.normalized || []),
    ...(c2?.normalized || []),
  ])

  return (
    <details className="group border border-gray-200 rounded-xl overflow-hidden bg-white">
      <summary className="flex items-center justify-between px-4 py-3 cursor-pointer list-none hover:bg-gray-50 transition-colors">
        <span className="font-semibold text-gray-900 text-sm">2. Conteos</span>
        <svg className="w-4 h-4 text-gray-400 group-open:rotate-180 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </summary>
      <div className="px-4 pb-4 space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <p className="text-xs font-medium text-gray-500 mb-1">Conteo 1</p>
            <FileUploader label="Conteo 1 (.xls/.xlsx)" accept=".xls,.xlsx" onFile={handleFile1} loading={loading1} />
            {c1 && <p className="text-xs text-gray-500 mt-1">{c1.raw.length} entradas</p>}
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500 mb-1">Conteo 2</p>
            <FileUploader label="Conteo 2 (.xls/.xlsx)" accept=".xls,.xlsx" onFile={handleFile2} loading={loading2} />
            {c2 && <p className="text-xs text-gray-500 mt-1">{c2.raw.length} entradas</p>}
          </div>
        </div>
        {(c1 || c2) && (
          <div className="bg-blue-50 text-blue-800 text-sm rounded-lg px-3 py-2">
            🧮 <strong>Total combinado</strong> (únicos): {totalUnion.size} BLs
          </div>
        )}
      </div>
    </details>
  )
}
