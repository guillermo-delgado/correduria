// src/hooks/usePwaUpdater.ts
import { useRegisterSW } from 'virtual:pwa-register/react';


export function usePwaUpdater() {
  const {
    needRefresh,
    updateServiceWorker
  } = useRegisterSW({
    onRegistered(r) {
      console.log('✅ Service Worker registrado:', r);
    },
    onRegisterError(error) {
      console.error('❌ Error registrando el Service Worker:', error);
    }
  });

  return { needRefresh, updateServiceWorker };
}
