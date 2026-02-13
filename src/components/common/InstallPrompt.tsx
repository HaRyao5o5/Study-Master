// src/components/common/InstallPrompt.tsx
import React, { useState, useEffect } from 'react';
import { Download, X } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

declare global {
  interface WindowEventMap {
    beforeinstallprompt: BeforeInstallPromptEvent;
  }
}

const InstallPrompt: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState<boolean>(false);

  useEffect(() => {
    const handler = (e: BeforeInstallPromptEvent) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Stash the event so it can be triggered later
      setDeferredPrompt(e);
      // Show install button
      setShowInstallPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      return;
    }

    // Show the install prompt
    await deferredPrompt.prompt();

    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      // インストール承諾
    } else {
      // インストール拒否
    }

    // Clear the deferredPrompt so it can be garbage collected
    setDeferredPrompt(null);
    setShowInstallPrompt(false);
  };

  const handleDismiss = () => {
    setShowInstallPrompt(false);
    // Hide for this session
    sessionStorage.setItem('install-prompt-dismissed', 'true');
  };

  // Don't show if already dismissed in this session
  useEffect(() => {
    if (sessionStorage.getItem('install-prompt-dismissed')) {
      setShowInstallPrompt(false);
    }
  }, []);

  // Don't show if running in standalone mode (already installed)
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches ||
                       (window.navigator as any).standalone ||
                       document.referrer.includes('android-app://');

  if (!showInstallPrompt || isStandalone) {
    return null;
  }

  return (
    <div className="fixed bottom-20 left-4 right-4 sm:left-auto sm:right-4 sm:bottom-4 z-50 animate-slide-up">
      <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl shadow-2xl p-4 max-w-sm">
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center">
            <div className="bg-white/20 p-2 rounded-lg mr-3">
              <Download size={24} />
            </div>
            <div>
              <h3 className="font-bold text-lg">アプリをインストール</h3>
              <p className="text-sm text-blue-100">ホーム画面に追加して快適に！</p>
            </div>
          </div>
          <button
            onClick={handleDismiss}
            className="text-white/80 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        <button
          onClick={handleInstallClick}
          className="w-full mt-3 bg-white text-blue-600 font-bold py-2 px-4 rounded-lg hover:bg-blue-50 transition-colors"
        >
          インストール
        </button>
      </div>
    </div>
  );
};

export default InstallPrompt;
