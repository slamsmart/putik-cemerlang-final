import { useEffect, useState } from "react";
import { Download, X } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export default function PWAInstallBanner() {
  const [prompt, setPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Jangan tampilkan kalau sudah dismiss atau sudah install
    const dismissed = sessionStorage.getItem("pwa-banner-dismissed");
    if (dismissed) return;

    const handler = (e: Event) => {
      e.preventDefault();
      setPrompt(e as BeforeInstallPromptEvent);
      // Tunda 3 detik biar user sempat lihat konten dulu
      setTimeout(() => setVisible(true), 3000);
    };

    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (!prompt) return;
    await prompt.prompt();
    const { outcome } = await prompt.userChoice;
    if (outcome === "accepted") setVisible(false);
  };

  const handleDismiss = () => {
    setVisible(false);
    sessionStorage.setItem("pwa-banner-dismissed", "1");
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 animate-in slide-in-from-bottom-4 duration-300">
      <div
        className="mx-auto max-w-sm rounded-2xl shadow-2xl flex items-center gap-3 px-4 py-3"
        style={{ background: "linear-gradient(135deg, #001e40 0%, #00539b 100%)" }}
      >
        {/* Icon */}
        <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center">
          <img src="/icons/icon-192.png" alt="Putik Cemerlang" className="w-9 h-9 rounded-lg" />
        </div>

        {/* Text */}
        <div className="flex-1 min-w-0">
          <p className="text-white font-semibold text-sm leading-tight">Install Putik Cemerlang</p>
          <p className="text-blue-200 text-xs mt-0.5 leading-tight">
            Pasang di HP untuk akses offline lebih cepat
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={handleInstall}
            className="flex items-center gap-1.5 bg-white text-[#001e40] text-xs font-bold px-3 py-2 rounded-xl hover:bg-blue-50 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            Install
          </button>
          <button
            onClick={handleDismiss}
            className="text-white/60 hover:text-white transition-colors p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
