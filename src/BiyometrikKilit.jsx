import React, { useCallback, useEffect, useRef, useState } from "react";
import { ShieldCheck } from "lucide-react";
import { nativeMi } from "./platform.js";
import { biyometriKullanilabilir, kilidiAyarla, kilitAcikMi, kimlikDogrula } from "./biometrik.js";

const CSS = `
.bk-ekran{position:fixed;inset:0;z-index:2000;display:grid;place-items:center;
  padding:32px;background:#f4efe0;color:#14160f;font-family:'Space Grotesk',sans-serif;
  padding-top:calc(32px + env(safe-area-inset-top,0px));
  padding-bottom:calc(32px + env(safe-area-inset-bottom,0px))}
.bk-kutu{display:grid;justify-items:center;gap:18px;text-align:center;max-width:320px}
.bk-logo{width:170px;height:auto}
.bk-metin{margin:0;color:#55584c;font-size:14px;line-height:1.6}
.bk-btn{min-height:52px;padding:0 26px;border:2px solid #14160f;border-radius:999px;
  background:#cdf564;color:#14160f;font:800 14px 'Space Grotesk',sans-serif;
  box-shadow:4px 4px 0 #ff6f59;cursor:pointer}
.bk-btn:active{opacity:.6}
`;

// Native kabukta uygulama kilidi. Kilit kapaliysa hicbir sey render etmez ve
// cocuklari dogrudan gecirir; tarayicida tamamen devre disidir.
export default function BiyometrikKilit({ children }) {
  const [kilitli, setKilitli] = useState(() => nativeMi && kilitAcikMi());
  const dogrulamaSuruyor = useRef(false);

  const kilidiAcmayiDene = useCallback(async () => {
    if (dogrulamaSuruyor.current) return;
    dogrulamaSuruyor.current = true;
    try {
      const basarili = await kimlikDogrula();
      if (basarili) setKilitli(false);
    } finally {
      dogrulamaSuruyor.current = false;
    }
  }, []);

  // Acilista kilit varsa hemen dogrulama iste.
  useEffect(() => {
    if (kilitli) kilidiAcmayiDene();
  }, [kilitli, kilidiAcmayiDene]);

  // Uygulama arka plandan donunce yeniden kilitle. Finansal veri gosteren bir
  // uygulamada beklenen davranis budur.
  useEffect(() => {
    if (!nativeMi) return undefined;
    let temizle = () => {};
    let iptal = false;
    (async () => {
      try {
        const { App } = await import("@capacitor/app");
        const kayit = await App.addListener("appStateChange", ({ isActive }) => {
          if (isActive || !kilitAcikMi()) return;
          setKilitli(true);
        });
        if (iptal) kayit.remove();
        else temizle = () => kayit.remove();
      } catch {
        /* eklenti yoksa kilit yalniz acilista calisir */
      }
    })();
    return () => {
      iptal = true;
      temizle();
    };
  }, []);

  if (!nativeMi || !kilitli) return children;

  return (
    <div className="bk-ekran" role="dialog" aria-modal="true" aria-label="Uygulama kilidi">
      <style>{CSS}</style>
      <div className="bk-kutu">
        <img className="bk-logo" src="/borcama-logo.png" alt="Borcama" />
        <p className="bk-metin">
          Finansal verilerini görmek için kimliğini doğrula.
        </p>
        <button className="bk-btn" type="button" onClick={kilidiAcmayiDene}>
          Kilidi aç
        </button>
      </div>
    </div>
  );
}

// Ayarlar ekranindaki acma/kapama karti. Tarayicida ve biyometri
// desteklemeyen cihazlarda hicbir sey render etmez.
export function BiyometrikAyar() {
  const [destek, setDestek] = useState({ kullanilabilir: false, ad: "" });
  const [acik, setAcik] = useState(() => kilitAcikMi());
  const [islemde, setIslemde] = useState(false);

  useEffect(() => {
    if (!nativeMi) return;
    let iptal = false;
    biyometriKullanilabilir().then((d) => {
      if (!iptal) setDestek(d);
    });
    return () => {
      iptal = true;
    };
  }, []);

  if (!nativeMi || !destek.kullanilabilir) return null;

  const ad = destek.ad;

  async function degistir() {
    setIslemde(true);
    try {
      if (acik) {
        kilidiAyarla(false);
        setAcik(false);
        return;
      }
      // Acarken bir kez dogrulat: kullanici kilidin calistigini gorsun.
      const basarili = await kimlikDogrula();
      if (!basarili) return;
      kilidiAyarla(true);
      setAcik(true);
    } finally {
      setIslemde(false);
    }
  }

  return (
    <section className="bt-settings-card">
      <div className="bt-settings-title">
        <ShieldCheck size={18} /> Güvenlik
      </div>
      <div className="bt-setting-row">
        <div>
          <strong>{ad} ile uygulama kilidi</strong>
          <small>
            {acik
              ? `Borcama her açıldığında ve arka plandan her dönüşte ${ad} sorulur.`
              : `Açarsan Borcama her açıldığında ${ad} sorulur.`}
          </small>
        </div>
        <button className="bt-btn kucuk ikincil" type="button" disabled={islemde} onClick={degistir}>
          {acik ? "Kilidi kapat" : "Kilidi aç"}
        </button>
      </div>
    </section>
  );
}
