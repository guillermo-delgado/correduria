declare module 'virtual:pwa-register' {
    import { RegisterSWOptions } from 'vite-plugin-pwa/types';
    export function useRegisterSW(options?: RegisterSWOptions): {
      needRefresh: boolean;
      updateServiceWorker: (reloadPage?: boolean) => void;
    };
  }

  