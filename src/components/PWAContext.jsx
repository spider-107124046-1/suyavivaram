import { createContext, useContext, useState, useEffect } from 'react';
import IOSInstallModal from './IOSInstallModal';

const PWAContext = createContext({
  isInstallable: false,
  isStandalone: false,
  installApp: () => Promise.resolve(),
  showIOSInstructions: false,
  setShowIOSInstructions: () => {},
  updateAvailable: false,
  updateApp: () => {},
});

export const usePWA = () => useContext(PWAContext);

export const PWAProvider = ({ children }) => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [showIOSInstructions, setShowIOSInstructions] = useState(false);
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [waitingWorker, setWaitingWorker] = useState(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Check if already in standalone mode
    const checkStandalone = () => {
      const isStandaloneMode = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;
      setIsStandalone(!!isStandaloneMode);
    };

    checkStandalone();

    // Listen to beforeinstallprompt
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    // Listen to appinstalled
    const handleAppInstalled = () => {
      setDeferredPrompt(null);
      setIsInstallable(false);
      setIsStandalone(true);
      console.log('PWA was installed');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    // Detect iOS Safari if not standalone
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    const isSafari = /Safari/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent);
    const isStandaloneMode = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;

    if (isIOS && isSafari && !isStandaloneMode) {
      setIsInstallable(true);
    }

    // Register Service Worker and track updates (deferred for performance / LCP optimization)
    let registration = null;
    let refreshScheduled = false;
    let intervalId = null;

    const checkUpdate = () => {
      if (registration) {
        registration.update().catch(err => console.log('Error updating Service Worker:', err));
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        checkUpdate();
      }
    };

    const registerSW = () => {
      navigator.serviceWorker.register('/sw.js')
        .then(reg => {
          registration = reg;
          console.log('Service Worker registered:', reg.scope);

          // If there's already a waiting worker, prompt to update
          if (reg.waiting) {
            setWaitingWorker(reg.waiting);
            setUpdateAvailable(true);
          }

          // Listen for new service worker installations
          reg.addEventListener('updatefound', () => {
            const newWorker = reg.installing;
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed') {
                  // Only prompt if there is an active controller (i.e. not the first install)
                  if (navigator.serviceWorker.controller) {
                    setWaitingWorker(newWorker);
                    setUpdateAvailable(true);
                  }
                }
              });
            }
          });
        })
        .catch(err => console.error('Service Worker registration failed:', err));

      document.addEventListener('visibilitychange', handleVisibilityChange);
      // Check every 5 minutes
      intervalId = setInterval(checkUpdate, 5 * 60 * 1000);
    };

    if ('serviceWorker' in navigator) {
      // Reload the page when the active service worker changes
      const handleControllerChange = () => {
        if (!refreshScheduled) {
          refreshScheduled = true;
          window.location.reload();
        }
      };
      
      navigator.serviceWorker.addEventListener('controllerchange', handleControllerChange);

      const scheduleSW = () => {
        if ('requestIdleCallback' in window) {
          window.requestIdleCallback(() => registerSW());
        } else {
          setTimeout(registerSW, 1000);
        }
      };

      if (document.readyState === 'complete') {
        scheduleSW();
      } else {
        window.addEventListener('load', scheduleSW);
      }

      return () => {
        window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        window.removeEventListener('appinstalled', handleAppInstalled);
        window.removeEventListener('load', scheduleSW);
        navigator.serviceWorker.removeEventListener('controllerchange', handleControllerChange);
        document.removeEventListener('visibilitychange', handleVisibilityChange);
        if (intervalId) clearInterval(intervalId);
      };
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const installApp = async () => {
    // If iOS Safari, show instructions modal
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    const isSafari = /Safari/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent);
    if (isIOS && isSafari) {
      setShowIOSInstructions(true);
      return;
    }

    if (!deferredPrompt) {
      return;
    }
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`User response to the install prompt: ${outcome}`);
    setDeferredPrompt(null);
    setIsInstallable(false);
  };

  const updateApp = () => {
    if (waitingWorker) {
      waitingWorker.postMessage({ type: 'SKIP_WAITING' });
    }
  };

  return (
    <PWAContext.Provider
      value={{
        isInstallable: isInstallable && !isStandalone,
        isStandalone,
        installApp,
        showIOSInstructions,
        setShowIOSInstructions,
        updateAvailable,
        updateApp,
      }}
    >
      {children}
      <IOSInstallModal 
        isOpen={showIOSInstructions} 
        onClose={() => setShowIOSInstructions(false)} 
      />

      {/* Premium site-wide Update App Banner */}
      {updateAvailable && !dismissed && (
        <div className="fixed bottom-6 right-6 z-[9999] max-w-sm w-full p-4 bg-white/95 backdrop-blur-md border border-slate-200 text-slate-800 rounded-2xl shadow-2xl flex flex-col gap-3 animate-fade-in">
          <div className="flex gap-3 items-start">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-cerulean/10 text-cerulean border border-cerulean/20">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
              </svg>
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-bold text-slate-950 flex items-center gap-2">
                Update Available
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cerulean/40 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-cerulean"></span>
                </span>
              </h4>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed font-normal">
                A new version of the app is ready. Reload now to apply the updates and access new features.
              </p>
            </div>
            <button 
              onClick={() => setDismissed(true)}
              className="rounded-lg p-1 text-slate-400 hover:bg-slate-50 hover:text-slate-600 transition-colors"
              aria-label="Dismiss update notification"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-8.586a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
          <div className="flex gap-2 justify-end mt-1">
            <button
              onClick={() => setDismissed(true)}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-500 hover:text-slate-800 hover:bg-slate-50 transition-all"
            >
              Later
            </button>
            <button
              onClick={updateApp}
              className="px-4 py-1.5 bg-cerulean hover:bg-cerulean/90 text-white font-bold rounded-lg text-xs shadow-md shadow-cerulean/20 hover:shadow-lg hover:shadow-cerulean/30 transition-all hover:-translate-y-0.5 active:translate-y-0"
            >
              Reload to Update
            </button>
          </div>
        </div>
      )}
    </PWAContext.Provider>
  );
};
