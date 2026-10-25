import React, { useMemo, useState } from "react";
import { huniOzeti, oran } from "./crmVeri.js";

const sayi = (v) => (v === null || v === undefined ? "—" : new Intl.NumberFormat("tr-TR").format(v));
const yuzde = (pay, payda) => {
  const o = oran(pay, payda);
  return o === null ? "—" : `%${o}`;
};

const GIRIS_ADLARI = { ana: "Ana sayfa", araclar: "Araçlar", sozluk: "Finansal sözlük", rehber: "Rehber", diger: "Diğer" };

// CRM Büyüme ekranı: ziyaretten kayda ve kayıttan kullanıma huni, kanallar, içerik.
export default function Buyume({ veri }) {
  const [gun, setGun] = useState(30);
  const analitik = veri?.analytics || {};
  const saglik = veri?.product_health;
  const huni = useMemo(() => huniOzeti(analitik.daily || [], gun), [analitik.daily, gun]);
  const gunluk = useMemo(() => [...(analitik.daily || [])].sort((a, b) => String(a.day).localeCompare(String(b.day))).slice(-gun), [analitik.daily, gun]);
  const enYuksek = Math.max(1, ...gunluk.map((g) => Number(g.visitors || 0)));
  const olcum = analitik.olcum?.[gun <= 7 ? "son_7_gun" : "son_30_gun"] || {};
  const kanallar = [...(analitik.sources || [])].sort((a, b) => Number(b.visitors || 0) - Number(a.visitors || 0));

  return (
    <>
      <div className="crm-segmentler crm-donem" role="group" aria-label="Dönem">
        {[7, 30, 90].map((g) => (
          <button key={g} type="button" className={gun === g ? "aktif" : ""} aria-pressed={gun === g} onClick={() => setGun(g)}>Son {g} gün</button>
        ))}
      </div>

      <section className="crm-kart">
        <h2>Kayıt hunisi</h2>
        <div className="crm-huni">
          <Adim ad="Ziyaret" deger={huni.bu.ziyaret} onceki={huni.oncekiTam ? huni.onceki.ziyaret : undefined} />
          <Adim ad="Kayıt ekranı" deger={huni.bu.kayitEkrani} onceki={huni.oncekiTam ? huni.onceki.kayitEkrani : undefined} not={yuzde(huni.bu.kayitEkrani, huni.bu.ziyaret)} />
          <Adim ad="Hesap" deger={huni.bu.hesap} onceki={huni.oncekiTam ? huni.onceki.hesap : undefined} not={yuzde(huni.bu.hesap, huni.bu.kayitEkrani)} />
          <Adim ad="Doğrulanan" deger={huni.bu.dogrulanan} onceki={huni.oncekiTam ? huni.onceki.dogrulanan : undefined} not={yuzde(huni.bu.dogrulanan, huni.bu.hesap)} />
        </div>
        <div className="crm-grafik" aria-label="Günlük ziyaret">
          {gunluk.map((g) => (
            <span key={g.day} title={`${g.day}: ${g.visitors} ziyaret, ${g.accounts_created} hesap`} style={{ height: `${Math.max(3, (Number(g.visitors || 0) / enYuksek) * 100)}%` }} className={Number(g.accounts_created) > 0 ? "hesapli" : ""} />
          ))}
        </div>
        <p className="crm-not">Çubuklar günlük ziyaret; yeşil olanlar hesap açılan günler. Önceki dönemle fark rakamların altında. Bot ve otomasyon ziyaretleri 10 Ekim'den beri sayılmıyor.</p>
      </section>

      <section className="crm-kart">
        <h2>Ziyaretçi ne yapıyor? <small>{gun <= 7 ? "Son 7 gün" : "Son 30 gün"} · 10 Ekim'den beri ölçülüyor</small></h2>
        {analitik.olcum?.available ? (
          <div className="crm-tablo crm-tablo-dar" role="table">
            <div className="crm-satir crm-satir-bas crm-satir-6" role="row"><span>Giriş</span><span>Ziyaret</span><span>Yarısını gördü</span><span>Kayıt butonu</span><span>Ürüne geçti</span><span>Kayıt ekranı</span></div>
            {Object.entries(olcum).sort((a, b) => b[1].ziyaret - a[1].ziyaret).map(([g, d]) => (
              <div className="crm-satir crm-satir-6" role="row" key={g}>
                <span className="crm-eposta">{GIRIS_ADLARI[g] || g}</span>
                <span data-etiket="Ziyaret">{sayi(d.ziyaret)}</span>
                <span data-etiket="Yarısını gördü">{g === "ana" ? `${sayi(d.yari)} (${yuzde(d.yari, d.ziyaret)})` : "—"}</span>
                <span data-etiket="Kayıt butonu">{g === "ana" ? `${sayi(d.cta)} (${yuzde(d.cta, d.ziyaret)})` : "—"}</span>
                <span data-etiket="Ürüne geçti">{g !== "ana" ? `${sayi(d.icerik_gecis)} (${yuzde(d.icerik_gecis, d.ziyaret)})` : "—"}</span>
                <span data-etiket="Kayıt ekranı">{sayi(d.kayit_ekrani)} ({yuzde(d.kayit_ekrani, d.ziyaret)})</span>
              </div>
            ))}
            {!Object.keys(olcum).length && <p className="crm-bos-kucuk">Bu dönemde ziyaret yok.</p>}
          </div>
        ) : <p className="crm-not">Olay ölçümü şu an alınamadı.</p>}
      </section>

      <div className="crm-izgara crm-izgara-2">
        <AracHunisi baslik="Borç kapatma aracı" d={analitik.debt_payoff_tool} ilkKayit="first_debt_or_statement" />
        <AracHunisi baslik="Mevduat aracı" d={analitik.deposit_tool} ilkKayit="first_asset" />
      </div>

      {saglik?.available && (
        <section className="crm-kart">
          <h2>Kayıttan kullanıma <small>{saglik.period?.label || ""}</small></h2>
          <div className="crm-huni">
            <Adim ad="Kayıt" deger={saglik.summary?.registered} onceki={saglik.summary?.previous?.registered} />
            <Adim ad="Doğrulanan" deger={saglik.summary?.verified} onceki={saglik.summary?.previous?.verified} not={yuzde(saglik.summary?.verified, saglik.summary?.registered)} />
            <Adim ad="İlk borç/ekstre" deger={saglik.summary?.first_debt_or_statement} onceki={saglik.summary?.previous?.first_debt_or_statement} not={yuzde(saglik.summary?.first_debt_or_statement, saglik.summary?.registered)} />
            <Adim ad="Tam aktivasyon" deger={saglik.summary?.full_activation_observed} onceki={saglik.summary?.previous?.full_activation_observed} not={yuzde(saglik.summary?.full_activation_observed, saglik.summary?.registered)} />
          </div>
          <div className="crm-kpi crm-kpi-dar">
            <Kutu ad="Bugün aktif" deger={saglik.active_users?.today} />
            <Kutu ad="7 gün aktif" deger={saglik.active_users?.last_7_days} />
            <Kutu ad="30 gün aktif" deger={saglik.active_users?.last_30_days} />
            <Kutu ad="7. gün dönüş" deger={saglik.retention?.d7?.available ? `${saglik.retention.d7.returned}/${saglik.retention.d7.eligible}` : "—"} />
          </div>
          <p className="crm-not">{saglik.measurement?.activation_definition} Aktif: {saglik.active_users?.definition}</p>
        </section>
      )}

      <section className="crm-kart">
        <h2>Kanallar <small>Son 90 gün, ilk temasa göre</small></h2>
        <div className="crm-tablo" role="table">
          <div className="crm-satir crm-satir-bas crm-satir-5k" role="row"><span>Kaynak</span><span>Ziyaret</span><span>Kayıt ekranı</span><span>Hesap</span><span>Doğrulanan</span></div>
          {kanallar.map((k, i) => (
            <div className="crm-satir crm-satir-5k" role="row" key={`${k.source}-${k.medium}-${k.campaign}-${i}`}>
              <span className="crm-eposta">{k.source || "direct"}{k.medium ? ` / ${k.medium}` : ""}{k.campaign ? <small> · {k.campaign}</small> : null}</span>
              <span data-etiket="Ziyaret">{sayi(k.visitors)}</span>
              <span data-etiket="Kayıt ekranı">{sayi(k.register_views)}</span>
              <span data-etiket="Hesap">{sayi(k.accounts_created)}</span>
              <span data-etiket="Doğrulanan">{sayi(k.accounts_verified)}</span>
            </div>
          ))}
          {!kanallar.length && <p className="crm-bos-kucuk">Kanal verisi yok.</p>}
        </div>
      </section>
    </>
  );
}

function Adim({ ad, deger, onceki, not }) {
  const fark = Number.isFinite(onceki) && Number.isFinite(deger) ? deger - onceki : null;
  return (
    <div className="crm-huni-adim">
      <span>{ad}</span>
      <strong>{sayi(deger)}</strong>
      <small>
        {not && not !== "—" ? `${not} önceki adımdan` : " "}
        {fark !== null && <em className={fark > 0 ? "arti" : fark < 0 ? "eksi" : ""}>{fark > 0 ? `+${fark}` : fark} önceki döneme göre</em>}
      </small>
    </div>
  );
}

function Kutu({ ad, deger }) {
  return <div className="crm-kpi-kutu"><span>{ad}</span><strong>{typeof deger === "string" ? deger : sayi(deger)}</strong></div>;
}

function AracHunisi({ baslik, d, ilkKayit }) {
  return (
    <section className="crm-kart crm-ilgi">
      <h3 className="crm-arac-baslik">{baslik} <small>Son 90 gün</small></h3>
      {d ? (
        <ul className="crm-arac">
          <li><span>Ziyaret</span><b>{sayi(d.landing_visit)}</b></li>
          <li><span>Sonucu gördü</span><b>{sayi(d.result_view)}</b></li>
          <li><span>Ürüne geçti</span><b>{sayi(d.product_click)}</b></li>
          <li><span>Kayıt ekranı</span><b>{sayi(d.register_view)}</b></li>
          <li><span>Hesap</span><b>{sayi(d.sign_up)}</b></li>
          <li><span>İlk kayıt</span><b>{sayi(d[ilkKayit])}</b></li>
        </ul>
      ) : <p className="crm-bos-kucuk">Veri yok.</p>}
    </section>
  );
}
