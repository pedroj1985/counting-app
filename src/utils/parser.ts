import * as XLSX from 'xlsx'
import type { ManifestMeta, ManifestRow, ConteoData } from '../types'
import { normalizeBL } from './normalizer'

export function parseManifest(file: File): Promise<{ meta: ManifestMeta; headers: string[]; rows: ManifestRow[] }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target!.result as ArrayBuffer)
        const wb = XLSX.read(data, { type: 'array' })
        const ws = wb.Sheets[wb.SheetNames[0]]
        const rows: string[][] = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' })

        const meta: ManifestMeta = {}
        for (const r of rows.slice(0, 11)) {
          const label = String(r[0] || '').trim()
          const value = String(r[1] || '').trim()
          if (/MBL|MAWB/.test(label)) meta.mbl = value
          else if (/Contenedor|Container/.test(label)) meta.container = value
          else if (/Cantidad de Env/.test(label)) meta.envios = parseFloat(value)
          else if (/Cantidad de Bultos/.test(label)) meta.bultos = parseFloat(value)
          else if (/Peso/.test(label)) meta.peso = parseFloat(value)
          else if (/Fecha/.test(label)) meta.fecha = value
          else if (/Agencia|Origen/.test(label)) meta.agencia = value
        }

        const headerRow = rows[11]?.map((h: string) => String(h).trim()) || []
        const dataRows = rows.slice(12).filter((r: string[]) => {
          const bl = String(r[0] || '').trim().toUpperCase()
          return bl !== '' && bl !== 'TOTAL'
        })

        const resultRows: ManifestRow[] = dataRows.map((r: string[]) => {
          const row: ManifestRow = {}
          headerRow.forEach((h: string, i: number) => {
            row[h] = String(r[i] || '').trim()
          })
          return row
        })

        resolve({ meta, headers: headerRow, rows: resultRows })
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
        resolve({ raw, normalized })
      } catch (err) {
        reject(err)
      }
    }
    reader.onerror = () => reject(reader.error)
    reader.readAsArrayBuffer(file)
  })
}
