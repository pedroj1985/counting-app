interface KPICardsProps {
  totalBL: number
  contados: number
  cobertura: number
}

export default function KPICards({ totalBL, contados, cobertura }: KPICardsProps) {
  const color = cobertura >= 80 ? 'good' : cobertura >= 50 ? 'warn' : 'bad'

  const card = (value: string | number, label: string, border: string) => (
    <div className={`bg-white rounded-xl border border-gray-200 p-3 text-center shadow-sm ${border}`}>
      <div className="text-2xl font-bold text-gray-900">{value}</div>
      <div className="text-xs text-gray-500 mt-0.5">{label}</div>
    </div>
  )

  return (
    <div className="grid grid-cols-3 gap-3 mb-4">
      {card(totalBL, 'Total BL en Manifiesto', 'border-t-4 border-t-blue-600')}
      {card(contados, 'BL Contados', `border-t-4 ${color === 'good' ? 'border-t-emerald-500' : color === 'warn' ? 'border-t-amber-500' : 'border-t-red-500'}`)}
      {card(`${cobertura}%`, 'Cobertura', `border-t-4 ${color === 'good' ? 'border-t-emerald-500' : color === 'warn' ? 'border-t-amber-500' : 'border-t-red-500'}`)}
    </div>
  )
}
