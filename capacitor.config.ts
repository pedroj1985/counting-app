import type { CapacitorConfig } from '@capacitor/cli'

const config: CapacitorConfig = {
  appId: 'com.vitalsoftgroup.countingapp',
  appName: 'Herramienta de Conteo',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
  },
}

export default config
