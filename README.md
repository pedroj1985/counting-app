# 📦 counting-app

Aplicación web progresiva (PWA) para comparar Manifiestos de Embarque vs Conteos manuales de bultos. Funciona 100% offline después de la primera carga.

## Tecnologías

- **React 19** + **TypeScript**
- **Vite** + **Tailwind CSS**
- **SheetJS (xlsx)** — parseo de Excel en el navegador
- **vite-plugin-pwa** — service worker con Workbox
- **localStorage** — historial de sesiones guardado localmente

## Características

- 📄 Carga de Manifiesto (.xls / .xlsx) con metadatos y tabla filtrable
- 🔢 Carga de 1 o 2 archivos de Conteo con normalización automática de BLs
- 📊 Dashboard comparativo: KPIs, detalle por BL, BLs extraños/faltantes
- 💾 **Historial local**: guarda, exporta e importa sesiones anteriores
- 📱 **Offline total**: PWA instalable en Android, funciona sin internet
- 🎨 Diseño mobile-first con acordeones nativos

## Uso local

```bash
npm install
npm run dev
```

## Build producción

```bash
npm run build
npm run preview
```

## Deploy en Vercel

1. Sube el repo a GitHub
2. En [Vercel](https://vercel.com) → Add New → Project
3. Importa el repo → **Framework: Vite** (se detecta automáticamente)
4. Deploy → tu app en `counting-app.vercel.app`

## Estructura

```
counting-app/
├── public/
│   ├── favicon.svg
│   ├── icon-192.png
│   └── icon-512.png
├── src/
│   ├── components/
│   │   ├── Header.tsx
│   │   ├── FileUploader.tsx
│   │   ├── ManifestAccordion.tsx
│   │   ├── ConteoAccordion.tsx
│   │   ├── DashboardAccordion.tsx
│   │   ├── KPICards.tsx
│   │   ├── BLTable.tsx
│   │   ├── Warnings.tsx
│   │   └── HistorySidebar.tsx
│   ├── hooks/
│   │   └── useHistory.ts
│   ├── utils/
│   │   ├── parser.ts
│   │   ├── normalizer.ts
│   │   ├── comparator.ts
│   │   └── history.ts
│   ├── types.ts
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── index.html
├── package.json
├── vite.config.ts
└── tailwind.config.js
```
