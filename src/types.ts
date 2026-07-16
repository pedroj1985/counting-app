export interface ManifestMeta {
  mbl?: string
  container?: string
  envios?: number
  bultos?: number
  peso?: number
  fecha?: string
  agencia?: string
}

export interface ManifestRow {
  [key: string]: string
}

export interface Comparison {
  contados: string[]
  faltantes: string[]
  extranos: string[]
  totalBL: number
  cobertura: number
}

export interface HistoryEntry {
  id: string
  date: string
  manifestFile: string
  totalBL: number
  contados: number
  cobertura: number
  meta: ManifestMeta
  manifestRows: ManifestRow[]
  manifestHeaders: string[]
  conteosEntries: string[][]
  comparison: Comparison
}

export interface ConteoData {
  raw: string[]
  normalized: string[]
  fileName?: string
}
