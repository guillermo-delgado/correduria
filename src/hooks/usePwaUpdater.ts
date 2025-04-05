import { useRegisterSW } from 'virtual:pwa-register/react';

export function usePwaUpdater() {
  const {
    needRefresh,
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(r: ServiceWorkerRegistration | undefined) {
      console.log('✅ Service Worker registrado:', r);
    },
    onRegisterError(error: unknown) {
      console.error('❌ Error registrando el Service Worker:', error);
    },
  });

  return { needRefresh, updateServiceWorker };
}
