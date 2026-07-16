import { useMemo, useState } from 'react'
import type { ConteoData } from '../types'

interface ConteoRow {
  bl: string
  origen: string
  fileName: string
  status: 'Contado' | 'Extraño'
}

interface ConteoTableProps {
  conteos: ConteoData[]
  manifestBLs: Set<string>
}

type FilterType = 'all' | 'contados' | 'extranos'

export default function ConteoTable({ conteos, manifestBLs }: ConteoTableProps) {
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<FilterType>('all')
  const [sortKey, setSortKey] = useState('')
  const [sortDir, setSortDir] = useState<'asc' | 'desc' | null>(null)

  const rows = useMemo<ConteoRow[]>(() => {
    const blMap = new Map<string, ConteoRow>()
    conteos.forEach((c, i) => {
      const label = `Conteo ${i + 1}`
      c.normalized.forEach((bl) => {
        if (blMap.has(bl)) {
          const existing = blMap.get(bl)!
          if (!existing.origen.includes(label)) {
            existing.origen += `, ${label}`
          }
        } else {
          blMap.set(bl, {
            bl,
            origen: label,
            fileName: c.fileName || '—',
            status: manifestBLs.has(bl) ? 'Contado' : 'Extraño',
          })
        }
      })
    })
    return [...blMap.values()].sort((a, b) => a.bl.localeCompare(b.bl))
  }, [conteos, manifestBLs])

  const filtered = useMemo(() => {
    let result = rows
    if (filter === 'contados') result = result.filter((r) => r.status === 'Contado')
    else if (filter === 'extranos') result = result.filter((r) => r.status === 'Extraño')
    if (search) {
      const q = search.toLowerCase()
      result = result.filter((r) => r.bl.toLowerCase().includes(q) || r.origen.toLowerCase().includes(q) || r.fileName.toLowerCase().includes(q))
    }
    if (sortKey && sortDir) {
      result = [...result].sort((a, b) => {
        const av = a[sortKey as keyof ConteoRow] || ''
        const bv = b[sortKey as keyof ConteoRow] || ''
        const cmp = av.localeCompare(bv, 'es', { numeric: true, sensitivity: 'base' })
        return sortDir === 'asc' ? cmp : -cmp
      })
    }
    return result
  }, [rows, search, filter, sortKey, sortDir])

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

  const filters: [FilterType, string][] = [
    ['all', `Todos (${rows.length})`],
    ['contados', `Contados (${rows.filter((r) => r.status === 'Contado').length})`],
    ['extranos', `Extraños (${rows.filter((r) => r.status === 'Extraño').length})`],
  ]

  const columns: { key: string; label: string }[] = [
    { key: 'bl', label: 'BL' },
    { key: 'origen', label: 'Origen' },
    { key: 'fileName', label: 'Archivo' },
    { key: 'status', label: 'Estado' },
  ]

  return (
    <div>
      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="🔍 Buscar por BL, origen o archivo…"
        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm mb-3 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
      />
      <div className="flex gap-1 mb-3">
        {filters.map(([key, label]) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              filter === key
                ? 'bg-brand-100 text-brand-700'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {label}
          </button>
        ))}
      </div>
      <div className="overflow-x-auto rounded-lg border border-gray-200 max-h-80 overflow-y-auto">
        <table className="w-full text-sm">
          <thead className="sticky top-0 bg-gray-50">
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  onClick={() => handleSort(col.key)}
                  className="px-3 py-2 text-xs font-semibold text-gray-600 text-left whitespace-nowrap cursor-pointer select-none hover:text-brand-600 transition-colors"
                >
                  {col.label}
                  {sortKey === col.key && sortDir && (
                    <span className="ml-1 text-brand-600">{sortDir === 'asc' ? '▲' : '▼'}</span>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((row) => (
              <tr key={row.bl} className="border-b border-gray-100">
                <td className="px-3 py-2 text-gray-700 font-mono text-xs">{row.bl}</td>
                <td className="px-3 py-2 text-gray-600 text-xs">{row.origen}</td>
                <td className="px-3 py-2 text-gray-500 text-xs max-w-[200px] truncate">{row.fileName}</td>
                <td className="px-3 py-2">
                  <span
                    className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
                      row.status === 'Contado' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {row.status === 'Contado' ? '✅ Contado' : '⚠️ Extraño'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-gray-400 mt-1">{filtered.length} de {rows.length} registros</p>
    </div>
  )
}
