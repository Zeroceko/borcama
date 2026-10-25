import React, { useState } from "react";
import Marketing from "../Marketing.jsx";
import { oran } from "./crmVeri.js";

const sayi = (v) => (v === null || v === undefined ? "—" : new Intl.NumberFormat("tr-TR").format(v));
const yuzde = (pay, payda) => {
  const o = oran(pay, payda);
  return o === null ? "—" : `%${o}`;
};
const DURUM = { active: ["Açık", "pro"], paused: ["Durduruldu", "uyari"], archived: ["Arşivde", ""] };
const TUR = { lifecycle: "Otomatik", auth: "Hesap", manual: "Toplu" };

// CRM İletişim: otomatik ve toplu e-postaların özeti. Gönderim ve konu
// düzenleme, onay adımları korunarak "Kampanya yönetimi" sekmesinde.
export default function Iletisim({ veri, preview }) {
  const [sekme, setSekme] = useState("ozet");
  const kampanyalar = veri?.campaigns || [];
  const gruplar = [
    ["Otomatik e-postalar", kampanyalar.filter((k) => k.kind === "lifecycle" || k.kind === "auth")],
    ["Toplu kampanyalar", kampanyalar.filter((k) => k.kind === "manual")],
  ];
  const toplam = kampanyalar.reduce((t, k) => ({
    sent: t.sent + (k.metrics?.sent || 0),
    opened: t.opened + (k.metrics?.opened || 0),
    clicked: t.clicked + (k.metrics?.clicked || 0),
    visited: t.visited + (k.metrics?.visited || 0),
  }), { sent: 0, opened: 0, clicked: 0, visited: 0 });

  return (
    <>
      <div className="crm-segmentler crm-donem" role="tablist" aria-label="İletişim bölümleri">
        <button type="button" role="tab" className={sekme === "ozet" ? "aktif" : ""} aria-selected={sekme === "ozet"} onClick={() => setSekme("ozet")}>Genel bakış</button>
        <button type="button" role="tab" className={sekme === "yonetim" ? "aktif" : ""} aria-selected={sekme === "yonetim"} onClick={() => setSekme("yonetim")}>Kampanya yönetimi</button>
      </div>

      {sekme === "yonetim" ? (
        preview ? <section className="crm-kart crm-bos">Kampanya yönetimi yerel önizlemede canlı veri olmadan açılmaz.</section> : <div className="crm-gomulu"><Marketing /></div>
      ) : (
        <>
          <section className="crm-kpi" aria-label="Toplam">
            <div className="crm-kpi-kutu"><span>Gönderilen</span><strong>{sayi(toplam.sent)}</strong></div>
            <div className="crm-kpi-kutu"><span>Açılma</span><strong>{yuzde(toplam.opened, toplam.sent)}</strong><small>{sayi(toplam.opened)} e-posta</small></div>
            <div className="crm-kpi-kutu"><span>Tıklama</span><strong>{yuzde(toplam.clicked, toplam.sent)}</strong><small>{sayi(toplam.clicked)} e-posta</small></div>
            <div className="crm-kpi-kutu"><span>Siteye gelen</span><strong>{sayi(toplam.visited)}</strong></div>
          </section>
          {gruplar.map(([baslik, liste]) => (
            <section className="crm-kart" key={baslik}>
              <h2>{baslik} <small>{liste.length} e-posta</small></h2>
              <div className="crm-tablo" role="table">
                <div className="crm-satir crm-satir-bas crm-satir-ileti" role="row"><span>E-posta</span><span>Durum</span><span>Gönderilen</span><span>Açılma</span><span>Tıklama</span><span>Siteye gelen</span></div>
                {liste.map((k) => {
                  const [durumAdi, durumSinifi] = DURUM[k.status] || [k.status || "—", ""];
                  return (
                    <div className="crm-satir crm-satir-ileti" role="row" key={k.slug}>
                      <span className="crm-ileti-ad"><b>{k.name}</b><small>{k.subject}</small><small>{TUR[k.kind] || k.kind} · {k.audience_type}</small></span>
                      <span data-etiket="Durum"><em className={`crm-rozet ${durumSinifi}`}>{durumAdi}</em></span>
                      <span data-etiket="Gönderilen">{sayi(k.metrics?.sent)}</span>
                      <span data-etiket="Açılma">{yuzde(k.metrics?.opened, k.metrics?.sent)}</span>
                      <span data-etiket="Tıklama">{yuzde(k.metrics?.clicked, k.metrics?.sent)}</span>
                      <span data-etiket="Siteye gelen">{sayi(k.metrics?.visited)}</span>
                    </div>
                  );
                })}
                {!liste.length && <p className="crm-bos-kucuk">Bu grupta e-posta yok.</p>}
              </div>
            </section>
          ))}
          <p className="crm-not">Toplu gönderim ve konu düzenleme "Kampanya yönetimi" sekmesinde, iki adımlı onayla yapılır. Toplu gönderimin son onayı Özer'dedir.</p>
        </>
      )}
    </>
  );
}
