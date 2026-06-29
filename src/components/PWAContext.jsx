import { createContext, useContext, useState, useEffect } from 'react';
import IOSInstallModal from './IOSInstallModal';

const PWAContext = createContext({
  isInstallable: false,
  isStandalone: false,
  installApp: () => Promise.resolve(),
  showIOSInstructions: false,
  setShowIOSInstructions: () => {},
});

export const usePWA = () => useContext(PWAContext);

export const PWAProvider = ({ children }) => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [showIOSInstructions, setShowIOSInstructions] = useState(false);

  useEffect(() => {
    // Check if already in standalone mode
    const checkStandalone = () => {
      const isStandaloneMode = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;
      setIsStandalone(!!isStandaloneMode);
    };

    checkStandalone();

    // Listen to beforeinstallprompt
    const handleBeforeInstallPrompt = (e) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Stash the event so it can be triggered later.
      setDeferredPrompt(e);
      // Update UI notify the user they can install the PWA
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
    // Show the install prompt
    deferredPrompt.prompt();
    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`User response to the install prompt: ${outcome}`);
    // We've used the prompt, and can't use it again
    setDeferredPrompt(null);
    setIsInstallable(false);
  };

  return (
    <PWAContext.Provider
      value={{
        isInstallable: isInstallable && !isStandalone,
        isStandalone,
        installApp,
        showIOSInstructions,
        setShowIOSInstructions,
      }}
    >
      {children}
      <IOSInstallModal 
        isOpen={showIOSInstructions} 
        onClose={() => setShowIOSInstructions(false)} 
      />
    </PWAContext.Provider>
  );
};
