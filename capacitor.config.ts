import type { CapacitorConfig } from '@capacitor/cli'

const config: CapacitorConfig = {
  appId: 'com.pedroj1985.countingapp',
  appName: 'Herramienta de Conteo',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
  },
}

export default config
