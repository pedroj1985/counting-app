import { useState, useMemo, useCallback } from 'react'
import type { ManifestRow } from '../types'
import { normalizeBL } from '../utils/normalizer'
import {
  buildManifestBLMap,
  processScan,
  computeStats,
  type ScannedBL,
  type ScanStats,
} from '../utils/scanner'
import QRScanner from './QRScanner'
import { playSuccess, playError } from '../utils/sounds'

const STORAGE_KEY = 'counting-app-scanned'

interface LiveScannerAccordionProps {
  manifestRows: ManifestRow[]
  onExportConteo: (bls: string[]) => void
}

interface Toast {
  id: number
  message: string
  type: 'success' | 'warning'
}

let toastId = 0

function loadScanned(): Map<string, number> {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY)
    if (raw) {
      const arr: [string, number][] = JSON.parse(raw)
      return new Map(arr)
    }
  } catch {}
  return new Map()
}

function saveScanned(map: Map<string, number>) {
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(map.entries())))
}

export default function LiveScannerAccordion({ manifestRows, onExportConteo }: LiveScannerAccordionProps) {
  const [cameraActive, setCameraActive] = useState(false)
  const [scanned, setScanned] = useState<Map<string, number>>(() => loadScanned())
  const [toasts, setToasts] = useState<Toast[]>([])
  const [detailOpen, setDetailOpen] = useState(false)
  const [exported, setExported] = useState(false)

  const manifestBLs = useMemo(() => {
    const s = new Set<string>()
    for (const r of manifestRows) {
      const bl = normalizeBL(r['Número de BL'] || '')
      if (bl) s.add(bl)
    }
    return s
  }, [manifestRows])

  const manifestBultos = useMemo(() => buildManifestBLMap(manifestRows), [manifestRows])

  const stats: ScanStats | null = useMemo(() => {
    if (manifestBLs.size === 0) return null
    return computeStats(scanned, manifestBLs, manifestBultos)
  }, [scanned, manifestBLs, manifestBultos])

  const scannedList = useMemo(() => {
    const list: ScannedBL[] = []
    for (const bl of manifestBLs) {
      const count = scanned.get(bl) || 0
      if (count > 0) {
        list.push({ bl, count, totalBultos: manifestBultos.get(bl) || 1 })
      }
    }
    for (const [bl, count] of scanned) {
      if (!manifestBLs.has(bl)) {
        list.push({ bl, count, totalBultos: count })
      }
    }
    return list.sort((a, b) => a.bl.localeCompare(b.bl))
  }, [scanned, manifestBLs, manifestBultos])

  const pushToast = useCallback((message: string, type: 'success' | 'warning') => {
    const id = ++toastId
    setToasts((prev) => [prev, { id, message, type }].flat())
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 2500)
  }, [])

  const handleScan = useCallback((text: string) => {
    const norm = text.trim().toUpperCase()

    setScanned((prev) => {
      const { updated } = processScan(prev, norm, manifestBLs, manifestBultos)
      saveScanned(updated)
      return updated
    })

    const { updated, alert } = processScan(scanned, norm, manifestBLs, manifestBultos)
    if (alert) {
      playError()
      pushToast(alert.replace('⚠️ ', ''), 'warning')
    } else {
      playSuccess()
      const count = updated.get(norm) || 1
      const total = manifestBultos.get(norm) || 1
      pushToast(`${norm} ${count}/${total}`, 'success')
    }
  }, [scanned, manifestBLs, manifestBultos, pushToast])

  const handleClear = useCallback(() => {
    setScanned(new Map())
    setToasts([])
    setExported(false)
    sessionStorage.removeItem(STORAGE_KEY)
  }, [])

  const handleExport = useCallback(() => {
    const bls: string[] = []
    for (const bl of manifestBLs) {
      const count = scanned.get(bl) || 0
      for (let i = 0; i < count; i++) {
        bls.push(bl)
      }
    }
    for (const [bl, count] of scanned) {
      if (!manifestBLs.has(bl)) {
        for (let i = 0; i < count; i++) {
          bls.push(bl)
        }
      }
    }
    onExportConteo(bls)
    setExported(true)
    setTimeout(() => setExported(false), 3000)
  }, [scanned, manifestBLs, onExportConteo])

  const isDisabled = manifestRows.length === 0

  return (
    <details className={`group shadow-card rounded-xl overflow-hidden bg-white ${isDisabled ? 'opacity-50' : ''}`}>
      <summary className="flex items-center justify-between px-4 py-3 cursor-pointer list-none hover:bg-gray-50 transition-colors">
        <span className="font-semibold text-gray-900 text-sm">3. Escaneo QR</span>
        <svg className="w-4 h-4 text-gray-400 group-open:rotate-180 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </summary>
      <div className="px-4 pb-4 space-y-3">
        {isDisabled ? (
          <p className="text-sm text-gray-400 text-center py-4">Carga primero el Manifiesto en la sección 1</p>
        ) : (
          <>
            <div className="flex gap-2">
              <button
                onClick={() => setCameraActive(!cameraActive)}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium transition-colors ${
                  cameraActive
                    ? 'bg-red-50 text-red-700 border border-red-200 hover:bg-red-100'
                    : 'bg-brand-600 text-white hover:bg-brand-700 active:bg-brand-800'
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {cameraActive ? 'Detener cámara' : 'Comenzar escaneo'}
              </button>
            </div>

            <div className="relative">
              <QRScanner active={cameraActive} onScan={handleScan} onError={(e) => pushToast(e, 'warning')} />
              {toasts.length > 0 && (
                <div className="absolute top-2 left-2 right-2 space-y-1 pointer-events-none z-10">
                  {toasts.map((t) => (
                    <div
                      key={t.id}
                      className={`px-3 py-2 rounded-lg text-sm font-medium text-center shadow-lg ${
                        t.type === 'success'
                          ? 'bg-emerald-600 text-white'
                          : 'bg-amber-500 text-white'
                      }`}
                    >
                      {t.type === 'success' ? '✅ ' : '⚠️ '}{t.message}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {cameraActive && (
              <p className="text-xs text-gray-400 text-center -mt-2">Apunta la cámara al código QR del paquete</p>
            )}

            {stats && (
              <>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    ['📦 Total Bultos', stats.totalBultos],
                    ['✅ Escaneados', stats.scannedBultos],
                    ['❌ Faltantes', stats.faltantes],
                  ].map(([label, value]) => (
                    <div key={label as string} className="bg-gray-50 rounded-lg p-2 text-center">
                      <div className="text-xs text-gray-500">{label}</div>
                      <div className="text-lg font-bold text-gray-900">{value}</div>
                    </div>
                  ))}
                </div>

                <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      stats.pct >= 80 ? 'bg-emerald-500' : stats.pct >= 50 ? 'bg-amber-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${Math.min(stats.pct, 100)}%` }}
                  />
                </div>
                <p className="text-xs text-gray-500 text-center -mt-1">{stats.pct}% completado</p>

                <div className="flex items-center gap-3 text-xs text-gray-500 justify-center">
                  <span>✅ {stats.completados} completos</span>
                  {stats.parciales > 0 && <span>🔄 {stats.parciales} parciales</span>}
                  <span>⬜ {stats.sinEscanear} sin escanear</span>
                </div>
              </>
            )}

            {scannedList.length > 0 && (
              <div>
                <button
                  onClick={() => setDetailOpen(!detailOpen)}
                  className="w-full flex items-center justify-between px-3 py-2 bg-smoke-100 rounded-lg text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  <span>📋 BLs escaneados ({scannedList.length})</span>
                  <svg className={`w-4 h-4 transition-transform ${detailOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {detailOpen && (
                  <div className="mt-2 max-h-48 overflow-y-auto border border-gray-200 rounded-lg divide-y divide-gray-100">
                    {scannedList.map((s) => (
                      <div key={s.bl} className="flex items-center justify-between px-3 py-2 text-sm">
                        <span className="font-mono text-xs">{s.bl}</span>
                        <span className={`text-xs font-medium ${
                          s.count >= s.totalBultos
                            ? 'text-emerald-600'
                            : 'text-amber-600'
                        }`}>
                          {s.count}/{s.totalBultos}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div className="grid grid-cols-2 gap-2">
              {scannedList.length > 0 && (
                <button
                  onClick={handleExport}
                  className={`py-2.5 rounded-xl text-sm font-medium transition-colors ${
                    exported
                      ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {exported ? '✅ Agregado a Conteos' : '📥 Agregar a Conteos'}
                </button>
              )}
              {scannedList.length > 0 && (
                <button
                  onClick={handleClear}
                  className="py-2.5 rounded-xl text-sm font-medium bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                >
                  🗑️ Reiniciar escaneo
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </details>
  )
}
