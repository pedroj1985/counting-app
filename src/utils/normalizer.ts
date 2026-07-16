const PREFIX_MAP: Record<string, string> = {
  'K': 'CPK',
  'PK': 'CPK',
  'CPK': 'CPK',
  'MAYA': 'MAYA',
  'CMCU': 'CMCU',
  'SEGU': 'SEGU',
  'CPKA': 'CPKA',
}

const DIGIT_LENGTH: Record<string, number> = {
  'CPK': 7,
  'MAYA': 7,
  'CMCU': 11,
  'SEGU': 7,
  'CPKA': 7,
}

export function normalizeBL(raw: string): string | null {
  const s = raw.trim()
  if (!s) return null
  const upper = s.toUpperCase()

  const numbers = upper.match(/(\d+)/g)
  if (!numbers) return null

  const joinedNumbers = numbers.join('')
  const prefixMatch = upper.match(/^([A-Z]+)/)

  const prefix = prefixMatch
    ? (PREFIX_MAP[prefixMatch[1]] || prefixMatch[1])
    : 'CPK'

  const expectedLen = DIGIT_LENGTH[prefix] || joinedNumbers.length
  const padded = joinedNumbers.padStart(expectedLen, '0')
  return `${prefix}-${padded}`
}
