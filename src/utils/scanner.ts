export interface ScannedBL {
  bl: string
  count: number
  totalBultos: number
}

export interface ScanStats {
  totalBultos: number
  scannedBultos: number
  faltantes: number
  completados: number
  parciales: number
  sinEscanear: number
  pct: number
}

export function buildManifestBLMap(rows: { 'Número de BL'?: string; 'Bultos'?: string }[]): Map<string, number> {
  const map = new Map<string, number>()
  for (const r of rows) {
    const bl = (r['Número de BL'] || '').trim()
    const bultos = parseInt(r['Bultos'] || '1', 10)
    if (bl) {
      map.set(bl, (map.get(bl) || 0) + bultos)
    }
  }
  return map
}

export function processScan(
  current: Map<string, number>,
  scannedBL: string,
  manifestBLs: Set<string>,
  manifestBultos: Map<string, number>,
): { updated: Map<string, number>; alert: string | null } {
  const norm = scannedBL.trim().toUpperCase()

  if (!manifestBLs.has(norm)) {
    return { updated: current, alert: `⚠️ "${norm}" no está en el manifiesto` }
  }

  const currentCount = current.get(norm) || 0
  const totalBultos = manifestBultos.get(norm) || 1

  if (currentCount >= totalBultos) {
    return { updated: current, alert: `⚠️ ${norm} ya tiene sus ${totalBultos} bultos escaneados` }
  }

  const updated = new Map(current)
  updated.set(norm, currentCount + 1)
  return { updated, alert: null }
}

export function computeStats(
  scanned: Map<string, number>,
  manifestBLs: Set<string>,
  manifestBultos: Map<string, number>,
): ScanStats {
  let totalBultos = 0
  let scannedBultos = 0
  let completados = 0
  let parciales = 0
  let sinEscanear = 0

  for (const bl of manifestBLs) {
    const total = manifestBultos.get(bl) || 1
    const scannedCount = scanned.get(bl) || 0
    totalBultos += total
    scannedBultos += scannedCount
    if (scannedCount >= total) {
      completados++
    } else if (scannedCount > 0) {
      parciales++
    } else {
      sinEscanear++
    }
  }

  const faltantes = totalBultos - scannedBultos
  const pct = totalBultos > 0 ? Math.round((scannedBultos / totalBultos) * 1000) / 10 : 0

  return { totalBultos, scannedBultos, faltantes, completados, parciales, sinEscanear, pct }
}
