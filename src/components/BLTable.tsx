import type { ManifestRow } from '../types'
import { useMemo, useState } from 'react'

interface BLTableProps {
  rows: ManifestRow[]
  headers: string[]
  _manifestBLs?: Set<string>
  _conteoBLs?: Set<string>
}

export default function BLTable({ rows, headers }: BLTableProps) {
  const [search, setSearch] = useState('')

  const displayCols = ['Número de BL', 'Bultos', 'Peso Kg', 'Nombre y Apellidos del Destinatario', 'Provincia', 'Municipio', 'Descripcion de las Mercancias']
  const availableCols = displayCols.filter((c) => headers.includes(c))

  const filtered = useMemo(() => {
    if (!search) return rows
    const q = search.toLowerCase()
    return rows.filter((r) =>
      Object.values(r).some((v) => v.toLowerCase().includes(q))
    )
  }, [rows, search])

  return (
    <div>
      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="🔍 Buscar por BL, destinatario o provincia…"
        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm mb-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      />
      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 text-left">
              {availableCols.map((c) => (
                <th key={c} className="px-3 py-2 text-xs font-semibold text-gray-600 whitespace-nowrap">{c}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((row, i) => (
              <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}>
                {availableCols.map((c) => (
                  <td key={c} className="px-3 py-2 text-gray-700 whitespace-nowrap max-w-[200px] truncate">{row[c] || '—'}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-gray-400 mt-1">{filtered.length} de {rows.length} registros</p>
    </div>
  )
}
