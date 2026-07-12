import { useRef, useState } from 'react'

interface FileUploaderProps {
  label: string
  accept: string
  onFile: (file: File) => void
  loading?: boolean
}

export default function FileUploader({ label, accept, onFile, loading }: FileUploaderProps) {
  const [fileName, setFileName] = useState('')
  const ref = useRef<HTMLInputElement>(null)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setFileName(file.name)
      onFile(file)
    }
  }

  return (
    <div className="w-full">
      <input
        ref={ref}
        type="file"
        accept={accept}
        onChange={handleChange}
        className="hidden"
        id={`file-${label}`}
      />
      <label
        htmlFor={`file-${label}`}
        className={`flex items-center justify-center gap-2 w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-xl text-sm cursor-pointer transition-colors
          ${loading ? 'opacity-50 pointer-events-none' : 'hover:border-brand-400 hover:bg-brand-50'}`}
      >
        {loading ? (
          <span className="animate-pulse text-gray-400">Procesando…</span>
        ) : (
          <>
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            <span className="text-gray-600">{fileName || label}</span>
          </>
        )}
      </label>
    </div>
  )
}
