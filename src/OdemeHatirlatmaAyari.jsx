import React, { useState } from "react";
import { BellRing } from "lucide-react";
import { nativeMi } from "./platform.js";
import { hatirlatmaAcikMi, hatirlatmayiAyarla } from "./odemeBildirimi.js";

// Odeme hatirlatmasi ayari. Yalniz native'de gorunur; kullanici acikca
// acmadan hicbir bildirim kurulmaz.
export default function OdemeHatirlatmaAyari() {
  const [acik, setAcik] = useState(() => hatirlatmaAcikMi());
  const [islemde, setIslemde] = useState(false);
  const [uyari, setUyari] = useState("");

  if (!nativeMi) return null;

  async function degistir() {
    setIslemde(true);
    setUyari("");
    try {
      const sonuc = await hatirlatmayiAyarla(!acik);
      setAcik(sonuc);
      if (!acik && !sonuc) {
        setUyari(
          "Bildirim izni verilmedi. iOS Ayarlar → Borcama → Bildirimler bölümünden açabilirsin.",
        );
      }
    } finally {
      setIslemde(false);
    }
  }

  return (
    <section className="bt-settings-card">
      <div className="bt-settings-title">
        <BellRing size={18} /> Hatırlatmalar
      </div>
      <div className="bt-setting-row">
        <div>
          <strong>Ödeme günü hatırlatması</strong>
          <small>
            {acik
              ? "Kayıtlı ödemelerinden bir gün önce saat 09:00'da hatırlatılır. Hesaplama cihazında yapılır; tutar ve banka bilgisi bildirimde gösterilmez."
              : "Açarsan kayıtlı ödemelerinden bir gün önce saat 09:00'da hatırlatılır."}
          </small>
          {uyari && (
            <small style={{ color: "var(--coral)", marginTop: 6 }}>{uyari}</small>
          )}
        </div>
        <button className="bt-btn kucuk ikincil" type="button" disabled={islemde} onClick={degistir}>
          {acik ? "Hatırlatmayı kapat" : "Hatırlatmayı aç"}
        </button>
      </div>
    </section>
  );
}
