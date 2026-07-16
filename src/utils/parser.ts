import * as XLSX from 'xlsx'
import type { ManifestMeta, ManifestRow, ConteoData } from '../types'
import { normalizeBL } from './normalizer'

const BL_KEYWORDS = ['HBL', 'NÚMERO DE BL', 'NÚMERO BL', 'BL NÚMERO', 'MBL', 'MAWB', 'BILL OF LADING']
const BULTOS_KEYWORDS = ['BULTOS', 'CANT']

const COL_ALIASES: Record<string, string> = {
  'HBL NÚMERO': 'Número de BL',
  'NÚMERO DE BL': 'Número de BL',
  'NÚMERO BL': 'Número de BL',
  'Nº BL': 'Número de BL',
  'NO. BL': 'Número de BL',
  'BL NÚMERO': 'Número de BL',
  'BILL OF LADING': 'Número de BL',
  'BULTOS (CANT.)': 'Bultos',
  'CANT. BULTOS': 'Bultos',
  'CANTIDAD BULTOS': 'Bultos',
  'CANT': 'Bultos',
  'PESO (KG)': 'Peso Kg',
  'PESO KG': 'Peso Kg',
  'NOMBRE Y APELLIDOS DEL DESTINATARIO:': 'Nombre y Apellidos del Destinatario',
  'NOMBRE Y APELLIDOS DEL DESTINATARIO': 'Nombre y Apellidos del Destinatario',
  'NOMBRE DEL DESTINATARIO:': 'Nombre y Apellidos del Destinatario',
}

function findHeaderRow(rows: string[][], max = 25): number {
  for (let i = 0; i < Math.min(rows.length, max); i++) {
    const cells = rows[i].map((c) => String(c).trim().toUpperCase())
    const hasBL = cells.some((c) => BL_KEYWORDS.some((k) => c.includes(k)))
    const hasBultos = cells.some((c) => BULTOS_KEYWORDS.some((k) => c.includes(k)))
    if (hasBL && hasBultos) return i
  }
  return 11
}

function aliasCol(name: string): string {
  const key = name.trim().toUpperCase()
  return COL_ALIASES[key] || name.trim()
}

export function parseManifest(file: File): Promise<{ meta: ManifestMeta; headers: string[]; rows: ManifestRow[] }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target!.result as ArrayBuffer)
        const wb = XLSX.read(data, { type: 'array' })
        const ws = wb.Sheets[wb.SheetNames[0]]
        const rows: string[][] = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' })

        const headerIdx = findHeaderRow(rows)
        const meta: ManifestMeta = {}
        for (const r of rows.slice(0, headerIdx)) {
          const label = String(r[0] || '').trim()
          const value = String(r[1] || '').trim()
          if (/MBL|MAWB|AWB/.test(label)) meta.mbl = value
          else if (/Contenedor|Container/.test(label)) meta.container = value
          else if (/Cantidad de Env/.test(label)) meta.envios = parseFloat(value)
          else if (/Cantidad de Bultos/.test(label)) meta.bultos = parseFloat(value)
          else if (/Peso|Peso kg/i.test(label)) meta.peso = parseFloat(value)
          else if (/Fecha/.test(label)) meta.fecha = value
          else if (/Agencia|Origen/.test(label)) meta.agencia = value
        }

        const rawHeaders = rows[headerIdx]?.map((h: string) => String(h).trim()) || []
        const headers = rawHeaders.map(aliasCol)
        const dataRows = rows.slice(headerIdx + 1).filter((r: string[]) => {
          const bl = String(r[0] || '').trim().toUpperCase()
          return bl !== '' && !/^TOTAL$|^SUBTOTAL$|^GRAND TOTAL/.test(bl)
        })

        const resultRows: ManifestRow[] = dataRows.map((r: string[]) => {
          const row: ManifestRow = {}
          headers.forEach((h: string, i: number) => {
            row[h] = String(r[i] || '').trim()
          })
          return row
        })

        resolve({ meta, headers, rows: resultRows })
      } catch (err) {
        reject(err)
      }
    }
    reader.onerror = () => reject(reader.error)
    reader.readAsArrayBuffer(file)
  })
}

export function parseConteo(file: File): Promise<ConteoData> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target!.result as ArrayBuffer)
        const wb = XLSX.read(data, { type: 'array' })
        const ws = wb.Sheets[wb.SheetNames[0]]
        const rows: string[][] = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' })

        const raw: string[] = []
        for (const r of rows) {
          const v = String(r[0] || '').trim()
          if (v && v !== 'None') raw.push(v)
        }

        const normalized = raw.map(normalizeBL).filter((n): n is string => n !== null)
        resolve({ raw, normalized, fileName: file.name })
      } catch (err) {
        reject(err)
      }
    }
    reader.onerror = () => reject(reader.error)
    reader.readAsArrayBuffer(file)
  })
}
