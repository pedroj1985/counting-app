import { useMemo } from 'react'
import type { ManifestRow, ConteoData } from '../types'
import { normalizeBL } from '../utils/normalizer'
import { compareBLs } from '../utils/comparator'
import KPICards from './KPICards'
import Warnings from './Warnings'
import ConteoTable from './ConteoTable'

interface DashboardAccordionProps {
  manifestRows: ManifestRow[]
  conteos: ConteoData[]
  open?: boolean
}

export default function DashboardAccordion({ manifestRows, conteos, open }: DashboardAccordionProps) {
  const conteosConDatos = conteos.filter((c) => c.raw.length > 0)

  const { comparison, manifestBLs } = useMemo(() => {
    if (manifestRows.length === 0) return { comparison: null, manifestBLs: new Set<string>() }
    const mBLs = new Set(
      manifestRows
        .map((r) => normalizeBL(r['Número de BL'] || ''))
        .filter((b): b is string => b !== null)
    )
    const conteoBLs = new Set(conteosConDatos.flatMap((c) => c.normalized))
    if (conteoBLs.size === 0) return { comparison: null, manifestBLs: mBLs }
    return { comparison: compareBLs(mBLs, conteoBLs), manifestBLs: mBLs }
  }, [manifestRows, conteosConDatos])

  const isDisabled = manifestRows.length === 0 || conteosConDatos.length === 0

  return (
    <details open={open} className={`group shadow-card rounded-xl overflow-hidden bg-white ${isDisabled ? 'opacity-50' : ''}`}>
      <summary className="flex items-center justify-between px-4 py-3 cursor-pointer list-none hover:bg-gray-50 transition-colors">
        <span className="font-semibold text-gray-900 text-sm">3. Dashboard</span>
        <svg className="w-4 h-4 text-gray-400 group-open:rotate-180 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </summary>
      <div className="px-4 pb-4">
        {isDisabled && (
          <p className="text-sm text-gray-400 text-center py-4">Carga el Manifiesto y al menos un Conteo para ver el Dashboard</p>
        )}

        {comparison && (
          <div className="space-y-4">
            <KPICards totalBL={comparison.totalBL} contados={comparison.contados.length} cobertura={comparison.cobertura} />

            <Warnings
              faltantes={comparison.faltantes}
              extranos={comparison.extranos}
              contadosCount={comparison.contados.length}
            />

            <details className="group">
              <summary className="text-sm font-medium text-gray-700 cursor-pointer list-none flex items-center gap-1">
                <span className="group-open:rotate-90 transition-transform">▶</span>
                📋 Detalle completo por BL ({comparison.contados.length + comparison.faltantes.length + comparison.extranos.length} registros)
              </summary>
              <div className="mt-2 overflow-x-auto rounded-lg border border-gray-200 max-h-80 overflow-y-auto">
                <table className="w-full text-sm">
                  <thead className="sticky top-0 bg-gray-50">
                    <tr>
                      <th className="px-3 py-2 text-xs font-semibold text-gray-600 text-left">BL</th>
                      <th className="px-3 py-2 text-xs font-semibold text-gray-600 text-left">Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[...comparison.contados, ...comparison.faltantes, ...comparison.extranos].map((bl) => {
                      const isContado = comparison.contados.includes(bl)
                      const isExtrano = comparison.extranos.includes(bl)
                      const tag = isContado
                        ? 'bg-emerald-100 text-emerald-800'
                        : isExtrano
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-red-100 text-red-800'
                      const label = isContado ? '✅ Contado' : isExtrano ? '⚠️ Extraño' : '❌ Faltante'
                      return (
                        <tr key={bl} className="border-b border-gray-100">
                          <td className="px-3 py-2 text-gray-700 font-mono text-xs">{bl}</td>
                          <td className="px-3 py-2">
                            <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${tag}`}>{label}</span>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </details>

            <details open className="group">
              <summary className="text-sm font-medium text-gray-700 cursor-pointer list-none flex items-center gap-1">
                <span className="group-open:rotate-90 transition-transform">▶</span>
                📦 Listado de Conteo ({new Set(conteosConDatos.flatMap((c) => c.normalized)).size} BLs)
              </summary>
              <div className="mt-2">
                <ConteoTable conteos={conteosConDatos} manifestBLs={manifestBLs} />
              </div>
            </details>

            <div className="grid grid-cols-4 gap-2">
              {[
                ...conteosConDatos.map((c, i) => [`Conteo ${i + 1}`, c.normalized.length] as const),
                ['Combinados', new Set(conteosConDatos.flatMap((c) => c.normalized)).size] as const,
                ['Matcheados', comparison.contados.length] as const,
              ].map(([label, value]) => (
                <div key={label as string} className="bg-gray-50 rounded-lg p-2 text-center">
                  <div className="text-xs text-gray-500">{label}</div>
                  <div className="text-sm font-bold text-gray-900">{value}</div>
                </div>
              ))}
            </div>

            {conteosConDatos.length >= 2 && (
              <div className="space-y-1">
                <p className="text-xs font-medium text-gray-500">Intersección entre conteos</p>
                <div className="grid grid-cols-3 gap-2">
                  {conteosConDatos.map((c, i) => (
                    <div key={i} className="bg-gray-50 rounded-lg p-2 text-center">
                      <div className="text-xs text-gray-500">
                        Solo en Conteo {i + 1}
                      </div>
                      <div className="text-sm font-bold text-gray-900">
                        {c.normalized.filter((b) => !conteosConDatos.some((oc, j) => j !== i && oc.normalized.includes(b))).length}
                      </div>
                    </div>
                  ))}
                  <div className="bg-gray-50 rounded-lg p-2 text-center">
                    <div className="text-xs text-gray-500">En todos</div>
                    <div className="text-sm font-bold text-gray-900">
                      {conteosConDatos.reduce((acc, c) => acc.filter((b) => c.normalized.includes(b)), [...conteosConDatos[0].normalized]).length}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </details>
  )
}
