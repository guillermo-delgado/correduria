/// <reference types="vite/client" />

declare module 'virtual:pwa-register/react' {
    import type { SWUpdaterProps } from 'vite-plugin-pwa/client'
  
    export function useRegisterSW(
      options?: SWUpdaterProps
    ): {
      needRefresh: boolean
      updateServiceWorker: (reloadPage?: boolean) => void
    }
  }
  