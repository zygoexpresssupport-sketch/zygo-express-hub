import { useEffect, useState } from "react";

export const InstallPrompt = () => {
  const [prompt, setPrompt] = useState<any>(null);
  const [visible, setVisible] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  const DISMISS_KEY = "zygo_install_dismissed";
  const DISMISS_DURATION = 7 * 24 * 60 * 60 * 1000;

  useEffect(() => {
    // Register service worker
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js");
    }

    // Check if already dismissed
    const dismissed = localStorage.getItem(DISMISS_KEY);
    if (dismissed && Date.now() < parseInt(dismissed)) return;

    // Check if already installed
    if (window.matchMedia("(display-mode: standalone)").matches) return;

    // iOS detection
    const ios = /iphone|ipad|ipod/i.test(navigator.userAgent);
    if (ios) {
      setIsIOS(true);
      setTimeout(() => setVisible(true), 3000);
      return;
    }

    // Android/Chrome install prompt
    const handler = (e: any) => {
      e.preventDefault();
      setPrompt(e);
      setTimeout(() => setVisible(true), 3000);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    setVisible(false);
    if (prompt) {
      prompt.prompt();
      const result = await prompt.userChoice;
      if (result.outcome === "accepted") {
        localStorage.setItem(DISMISS_KEY, String(Date.now() + 365 * 24 * 60 * 60 * 1000));
      }
      setPrompt(null);
    }
  };

  const handleDismiss = () => {
    setVisible(false);
    localStorage.setItem(DISMISS_KEY, String(Date.now() + DISMISS_DURATION));
  };

  if (!visible) return null;

  return (
    <div
      style={{
        position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 99999,
        background: "#0f0f0f", borderTop: "3px solid #f97316",
        padding: "14px 16px", display: "flex", alignItems: "center", gap: "12px",
        boxShadow: "0 -4px 20px rgba(0,0,0,0.4)",
        animation: "slideUp 0.35s cubic-bezier(0.34,1.2,0.64,1)",
        fontFamily: "Inter, system-ui, sans-serif",
      }}
    >
      <style>{`@keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }`}</style>

      <div style={{
        width: 44, height: 44, borderRadius: 10, background: "#f97316",
        display: "grid", placeItems: "center", fontWeight: 900,
        color: "white", fontSize: 20, flexShrink: 0,
      }}>Z</div>

      <div style={{ flex: 1 }}>
        <div style={{ color: "white", fontWeight: 700, fontSize: 14 }}>
          Install Zygo Express
        </div>
        <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 12, marginTop: 2 }}>
          {isIOS
            ? 'Tap Share ↑ then "Add to Home Screen"'
            : "Book deliveries faster — works offline too"}
        </div>
      </div>

      {!isIOS && (
        <button
          onClick={handleInstall}
          style={{
            background: "#f97316", color: "white", border: "none",
            borderRadius: 8, padding: "10px 16px", fontWeight: 700,
            fontSize: 13, cursor: "pointer", flexShrink: 0,
          }}
        >
          Install
        </button>
      )}

      <button
        onClick={handleDismiss}
        style={{
          background: "none", border: "none", color: "rgba(255,255,255,0.4)",
          fontSize: 22, cursor: "pointer", flexShrink: 0, lineHeight: 1,
        }}
      >×</button>
    </div>
  );
};