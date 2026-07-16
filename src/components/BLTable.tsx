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
  const [sortKey, setSortKey] = useState('')
  const [sortDir, setSortDir] = useState<'asc' | 'desc' | null>(null)

  const displayCols = ['Número de BL', 'Bultos', 'Peso Kg', 'Nombre y Apellidos del Destinatario', 'Provincia', 'Municipio', 'Descripcion de las Mercancias']
  const availableCols = displayCols.filter((c) => headers.includes(c))

  const filtered = useMemo(() => {
    let result = rows
    if (search) {
      const q = search.toLowerCase()
      result = result.filter((r) =>
        Object.values(r).some((v) => v.toLowerCase().includes(q))
      )
    }
    if (sortKey && sortDir) {
      result = [...result].sort((a, b) => {
        const av = a[sortKey] || ''
        const bv = b[sortKey] || ''
        const cmp = av.localeCompare(bv, 'es', { numeric: true, sensitivity: 'base' })
        return sortDir === 'asc' ? cmp : -cmp
      })
    }
    return result
  }, [rows, search, sortKey, sortDir])

  const handleSort = (col: string) => {
    if (sortKey === col) {
      if (sortDir === 'asc') setSortDir('desc')
      else if (sortDir === 'desc') { setSortDir(null); setSortKey('') }
      else setSortDir('asc')
    } else {
      setSortKey(col)
      setSortDir('asc')
    }
  }

  return (
    <div>
      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="🔍 Buscar por BL, destinatario o provincia…"
        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm mb-3 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
      />
      <div className="overflow-x-auto overflow-y-auto max-h-[480px] rounded-lg border border-gray-200">
        <table className="w-full text-sm">
          <thead className="sticky top-0">
            <tr className="bg-smoke-100 text-left">
              {availableCols.map((c) => (
                <th
                  key={c}
                  onClick={() => handleSort(c)}
                  className="px-3 py-2 text-xs font-semibold text-gray-600 whitespace-nowrap cursor-pointer select-none hover:text-brand-600 transition-colors"
                >
                  {c}
                  {sortKey === c && sortDir && (
                    <span className="ml-1 text-brand-600">{sortDir === 'asc' ? '▲' : '▼'}</span>
                  )}
                </th>
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
