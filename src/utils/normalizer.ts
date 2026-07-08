export function normalizeBL(raw: string): string | null {
  const s = raw.trim()
  if (!s) return null
  const upper = s.toUpperCase().replace(/\s+/g, ' ')

  const m = upper.match(/^(CPK)[=\s-]?\s*([A-Z0-9]+)/)
  if (m) return `${m[1]}-${m[2]}`

  const k = upper.match(/^(K)[=\s-]?\s*([A-Z0-9]+)/)
  if (k) return `${k[1]}-${k[2]}`

  const g = upper.match(/^([A-Z]+)[=\s-]?\s*(\d+)/)
  if (g) return `${g[1]}-${g[2]}`

  return s
}
