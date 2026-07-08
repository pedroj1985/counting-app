interface WarningsProps {
  faltantes: string[]
  extranos: string[]
  contadosCount: number
}

function Tag({ label, cls }: { label: string; cls: string }) {
  return (
    <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold ${cls}`}>
      {label}
    </span>
  )
}

export default function Warnings({ faltantes, extranos, contadosCount }: WarningsProps) {
  return (
    <div className="space-y-3 mt-4">
      <div className="flex items-center gap-4 text-sm text-gray-700">
        <span><Tag label={`✅ ${contadosCount} contados`} cls="bg-emerald-100 text-emerald-800" /></span>
        <span><Tag label={`❌ ${faltantes.length} faltantes`} cls="bg-red-100 text-red-800" /></span>
        {extranos.length > 0 && (
          <span><Tag label={`⚠️ ${extranos.length} extraños`} cls="bg-amber-100 text-amber-800" /></span>
        )}
      </div>

      <details className="group">
        <summary className="text-sm font-medium text-red-700 cursor-pointer list-none flex items-center gap-1">
          <span className="group-open:rotate-90 transition-transform">▶</span>
          ❌ {faltantes.length} BL faltantes por contar
        </summary>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {faltantes.map((bl) => (
            <span key={bl} className="inline-block px-2 py-0.5 bg-red-100 text-red-800 rounded text-xs font-medium">{bl}</span>
          ))}
        </div>
      </details>

      {extranos.length > 0 && (
        <details className="group">
          <summary className="text-sm font-medium text-amber-700 cursor-pointer list-none flex items-center gap-1">
            <span className="group-open:rotate-90 transition-transform">▶</span>
            ⚠️ {extranos.length} BL extraños no encontrados en manifiesto
          </summary>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {extranos.map((bl) => (
              <span key={bl} className="inline-block px-2 py-0.5 bg-amber-100 text-amber-800 rounded text-xs font-medium">{bl}</span>
            ))}
          </div>
        </details>
      )}
    </div>
  )
}
