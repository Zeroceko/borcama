import React, { useEffect, useState } from "react";
import { WifiOff } from "lucide-react";
import { nativeMi } from "./platform.js";

const CSS = `
.cd-ekran{position:fixed;inset:0;z-index:1900;display:grid;place-items:center;
  padding:32px;background:#f4efe0;color:#14160f;font-family:'Space Grotesk',sans-serif;
  padding-top:calc(32px + env(safe-area-inset-top,0px));
  padding-bottom:calc(32px + env(safe-area-inset-bottom,0px))}
.cd-kutu{display:grid;justify-items:center;gap:16px;text-align:center;max-width:330px}
.cd-ikon{display:grid;place-items:center;width:64px;height:64px;border:2px solid #14160f;
  border-radius:50%;background:#fff;box-shadow:4px 4px 0 #ff6f59}
.cd-baslik{font-family:'Archivo Black',sans-serif;font-size:24px;line-height:1.15;margin:0;
  letter-spacing:-.02em}
.cd-metin{margin:0;color:#55584c;font-size:14px;line-height:1.6}
.cd-guvence{margin:0;padding:12px 14px;border:1.5px solid #14160f24;border-radius:14px;
  background:#fff;color:#14160f;font-size:12.5px;line-height:1.5;font-weight:600}
`;

// iOS gonderim kaydi: ilk surumde cevrimdisi okuma/yazma yok. Baglanti
// kesildiginde bos ya da sifir finansal ekran GOSTERILMEZ; bunun yerine
// baglantinin gerekli oldugunu ve kayitlarin silinmedigini anlatan
// engelleyici durum gosterilir. Tarayicida tamamen devre disidir.
export default function CevrimdisiPerde({ children }) {
  const [cevrimdisi, setCevrimdisi] = useState(false);

  useEffect(() => {
    if (!nativeMi) return undefined;
    let temizle = () => {};
    let iptal = false;

    (async () => {
      try {
        const { Network } = await import("@capacitor/network");
        const durum = await Network.getStatus();
        if (!iptal) setCevrimdisi(!durum.connected);
        const kayit = await Network.addListener("networkStatusChange", (d) => {
          setCevrimdisi(!d.connected);
        });
        if (iptal) kayit.remove();
        else temizle = () => kayit.remove();
      } catch {
        /* eklenti yoksa perde hic gosterilmez */
      }
    })();

    return () => {
      iptal = true;
      temizle();
    };
  }, []);

  if (!nativeMi || !cevrimdisi) return children;

  return (
    <div className="cd-ekran" role="alert" aria-live="assertive">
      <style>{CSS}</style>
      <div className="cd-kutu">
        <div className="cd-ikon">
          <WifiOff size={28} />
        </div>
        <h1 className="cd-baslik">Bağlantı gerekiyor</h1>
        <p className="cd-metin">
          Borcama finansal kayıtlarını hesabından okur. İnternet bağlantısı
          olmadan güncel tutarları gösteremez.
        </p>
        <p className="cd-guvence">
          Kayıtların silinmedi. Bağlantı geri geldiğinde kaldığın yerden devam
          edeceksin.
        </p>
      </div>
    </div>
  );
}
