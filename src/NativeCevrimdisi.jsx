import React, { useEffect, useState } from "react";
import { WifiOff } from "lucide-react";
import { nativeMi } from "./platform.js";

const CSS = `
.nc-ekran{position:fixed;inset:0;z-index:2100;display:grid;place-items:center;padding:28px;
  padding-top:calc(28px + env(safe-area-inset-top,0px));padding-bottom:calc(28px + env(safe-area-inset-bottom,0px));
  background:#f4efe0;color:#14160f;font-family:'Space Grotesk',sans-serif;text-align:center}
.nc-kutu{display:grid;justify-items:center;gap:14px;max-width:340px}.nc-simge{display:grid;place-items:center;width:58px;height:58px;
  border:2px solid #14160f;border-radius:16px;background:#cdf564;box-shadow:5px 5px 0 #ff6f59}
.nc-kutu h1{margin:6px 0 0;font-size:24px}.nc-kutu p{margin:0;color:#55584c;font-size:14px;line-height:1.6}
.nc-btn{min-height:48px;padding:0 22px;border:2px solid #14160f;border-radius:999px;background:#fff;color:#14160f;
  font:800 14px 'Space Grotesk',sans-serif;cursor:pointer}
`;

export default function NativeCevrimdisi({ children }) {
  const [cevrimici, setCevrimici] = useState(() => !nativeMi || navigator.onLine);

  useEffect(() => {
    if (!nativeMi) return undefined;
    const baglandi = () => setCevrimici(true);
    const koptu = () => setCevrimici(false);
    window.addEventListener("online", baglandi);
    window.addEventListener("offline", koptu);
    return () => {
      window.removeEventListener("online", baglandi);
      window.removeEventListener("offline", koptu);
    };
  }, []);

  if (!nativeMi || cevrimici) return children;
  return (
    <div className="nc-ekran" role="alert" aria-live="assertive">
      <style>{CSS}</style>
      <div className="nc-kutu">
        <span className="nc-simge"><WifiOff size={28} /></span>
        <h1>İnternet bağlantısı gerekli</h1>
        <p>
          Borcama gerçek finansal kayıtlarını güvenli hesabından getirir. Bağlantın geri
          geldiğinde bu ekran otomatik olarak açılır; verilerin silinmez.
        </p>
        <button className="nc-btn" type="button" onClick={() => setCevrimici(navigator.onLine)}>
          Tekrar dene
        </button>
      </div>
    </div>
  );
}
