export function normalizeBL(raw: string): string | null {
  const s = raw.trim()
  if (!s) return null
  const upper = s.toUpperCase().replace(/\s+/g, ' ')

  const g = upper.match(/^([A-Z]+)[=\s-]?\s*(\d+)/)
  if (g) return `${g[1]}-${g[2]}`

  return s
}
