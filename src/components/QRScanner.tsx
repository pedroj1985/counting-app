import { useEffect, useRef, useCallback } from 'react'

interface QRScannerProps {
  onScan: (text: string) => void
  onError?: (err: string) => void
}

export default function QRScanner({ onScan, onError }: QRScannerProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const scannerRef = useRef<any>(null)

  const stop = useCallback(async () => {
    if (scannerRef.current) {
      try {
        await scannerRef.current.stop()
      } catch {}
      scannerRef.current = null
    }
  }, [])

  useEffect(() => {
    let cancelled = false

    const start = async () => {
      try {
        const { Html5Qrcode } = await import('html5-qrcode')
        if (cancelled) return

        const el = containerRef.current
        if (!el) return

        const scanner = new Html5Qrcode('qr-scanner-v')
        scannerRef.current = scanner

        await scanner.start(
          { facingMode: 'environment' },
          {
            fps: 10,
            qrbox: { width: 250, height: 250 },
          },
          (decodedText) => {
            onScan(decodedText)
          },
          () => {},
        )
      } catch (err: any) {
        if (!cancelled) {
          onError?.(err?.message || 'Error al iniciar cámara')
        }
      }
    }

    start()

    return () => {
      cancelled = true
      stop()
    }
  }, [onScan, onError, stop])

  return (
    <div
      id="qr-scanner-v"
      ref={containerRef}
      className="w-full overflow-hidden rounded-xl bg-gray-100"
      style={{ minHeight: 220 }}
    />
  )
}
