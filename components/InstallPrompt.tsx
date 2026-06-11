"use client";

import { useState, useEffect } from "react";
import { Download, X } from "lucide-react";

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Check if device is iOS
    const isIosDevice =
      /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    setIsIOS(isIosDevice);

    // Check if app is already installed
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (navigator as any).standalone;

    if (isStandalone) {
      return;
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      // Prevent Chrome 67 and earlier from automatically showing the prompt
      e.preventDefault();
      // Stash the event so it can be triggered later.
      setDeferredPrompt(e);
      // Update UI to notify the user they can add to home screen
      setShowPrompt(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    // If it's iOS and not standalone, show the custom iOS prompt
    // because iOS doesn't support the beforeinstallprompt event
    if (isIosDevice && !isStandalone) {
      const hasDismissed = localStorage.getItem("iosInstallDismissed");
      if (!hasDismissed) {
        setShowPrompt(true);
      }
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    // Show the install prompt
    deferredPrompt.prompt();
    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === "accepted") {
      setShowPrompt(false);
    }
    // We've used the prompt, and can't use it again, throw it away
    setDeferredPrompt(null);
  };

  const dismissPrompt = () => {
    setShowPrompt(false);
    if (isIOS) {
      localStorage.setItem("iosInstallDismissed", "true");
    }
  };

  if (!showPrompt) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 z-[9999] animate-in slide-in-from-bottom-10 fade-in duration-300">
      <div className="bg-slate-900/95 backdrop-blur-md border border-slate-800 rounded-2xl p-4 shadow-2xl flex items-center gap-4 max-w-sm ml-auto relative overflow-hidden">
        {/* decorative background element */}
        <div className="absolute -top-10 -right-10 w-20 h-20 bg-blue-500/20 rounded-full blur-2xl" />

        <div className="bg-blue-500/10 p-3 rounded-xl shrink-0 border border-blue-500/20">
          <Download className="w-6 h-6 text-blue-400" />
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="text-slate-200 font-semibold text-sm">Install Aplikasi</h3>
          {isIOS ? (
            <p className="text-slate-400 text-xs mt-1 leading-snug">
              Tap ikon <span className="inline-block bg-slate-800 px-1.5 py-0.5 rounded text-slate-300">Share</span> di bawah, lalu pilih <b>Add to Home Screen</b>.
            </p>
          ) : (
            <p className="text-slate-400 text-xs mt-1 leading-snug">
              Install aplikasi ini di layar utama untuk akses instan.
            </p>
          )}
        </div>

        {!isIOS && (
          <button
            onClick={handleInstallClick}
            className="shrink-0 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold px-4 py-2 rounded-xl transition-all shadow-lg shadow-blue-500/20 active:scale-95"
          >
            Install
          </button>
        )}

        <button
          onClick={dismissPrompt}
          className="absolute top-2 right-2 text-slate-500 hover:text-slate-300 p-1 bg-slate-800/50 rounded-full transition-colors"
          aria-label="Tutup"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
