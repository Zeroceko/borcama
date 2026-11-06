import React, { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { oran } from "./crmVeri.js";
import { gunDetayi, gunlukSeri, gunYorumu, oncekiOrtalama, sayfaAdi } from "./gunlukAnaliz.js";

const sayi = (v) => (v === null || v === undefined ? "—" : new Intl.NumberFormat("tr-TR").format(v));
const gunAdi = (gun, uzun = false) => new Intl.DateTimeFormat("tr-TR", { timeZone: "UTC", day: "numeric", month: uzun ? "long" : "short", weekday: uzun ? "long" : "short" }).format(new Date(`${gun}T12:00:00Z`));

// CRM Günlük ekranı: seçilen günün trafiği, kaynakları, giriş sayfaları ve
// kayıt adımları; altta son 30 günün gün gün tablosu.
export default function Gunluk({ veri }) {
  const oturumlar = veri?.analytics?.olcum?.oturumlar;
  const seri = useMemo(() => gunlukSeri(oturumlar || [], veri?.users || []), [oturumlar, veri?.users]);
  const [gun, setGun] = useState(() => seri[0]?.gun);
  const i = seri.findIndex((s) => s.gun === gun);
  const s = seri[i] || seri[0];
  const detay = useMemo(() => gunDetayi(oturumlar || [], s?.gun), [oturumlar, s?.gun]);
  const yorum = useMemo(() => gunYorumu(seri, s?.gun, detay), [seri, s?.gun, detay]);
  if (!oturumlar) return <p className="crm-not">Günlük trafik verisi şu an alınamadı.</p>;
  const enYuksekSaat = Math.max(1, ...detay.saatler);

  return (
    <>
      <div className="crm-gun-sec">
        <button type="button" className="crm-btn" onClick={() => setGun(seri[i + 1]?.gun)} disabled={i >= seri.length - 1} aria-label="Önceki gün"><ChevronLeft size={16} /></button>
        <h2>{gunAdi(s.gun, true)}{i === 0 ? <small>Bugün, şu ana kadar</small> : i === 1 ? <small>Dün</small> : null}</h2>
        <button type="button" className="crm-btn" onClick={() => setGun(seri[i - 1]?.gun)} disabled={i <= 0} aria-label="Sonraki gün"><ChevronRight size={16} /></button>
      </div>

      {yorum.length > 0 && <ul className="crm-yorum">{yorum.map((y) => <li key={y}>{y}</li>)}</ul>}

      <section className="crm-kpi" aria-label="Günün özeti">
        <Kutu ad="Ziyaret" deger={s.ziyaret} ort={oncekiOrtalama(seri, s.gun, "ziyaret")} />
        <Kutu ad="Kayıt ekranı" deger={s.kayitEkrani} ort={oncekiOrtalama(seri, s.gun, "kayitEkrani")} not={oran(s.kayitEkrani, s.ziyaret) !== null ? `Ziyaretin %${oran(s.kayitEkrani, s.ziyaret)}'i` : ""} />
        <Kutu ad="Yeni hesap" deger={s.hesap} ort={oncekiOrtalama(seri, s.gun, "hesap")} />
        <Kutu ad="Doğrulanan" deger={s.dogrulanan} ort={oncekiOrtalama(seri, s.gun, "dogrulanan")} />
      </section>

      <section className="crm-kart">
        <h2>Saat saat ziyaret <small>Türkiye saati</small></h2>
        <div className="crm-grafik crm-saatler" aria-label="Saatlik ziyaret">
          {detay.saatler.map((n, saat) => (
            <span key={saat} title={`${String(saat).padStart(2, "0")}:00 · ${n} ziyaret`} style={{ height: `${n ? Math.max(6, (n / enYuksekSaat) * 100) : 2}%` }} className={n ? "dolu" : ""} />
          ))}
        </div>
        <div className="crm-saat-eksen" aria-hidden="true"><span>00</span><span>06</span><span>12</span><span>18</span><span>23</span></div>
        <p className="crm-not">Ana sayfada yarısını gören {sayi(s.yari)}, kayıt butonuna basan {sayi(s.cta)}; içerik ve araçlardan ürüne geçen {sayi(s.urune)}; App Store'a giden {sayi(s.appStore)}.</p>
      </section>

      <div className="crm-izgara crm-izgara-2">
        <section className="crm-kart crm-ilgi">
          <h3 className="crm-arac-baslik">Kaynaklar</h3>
          <Liste satirlar={detay.kaynaklar} ad={(k) => <>{k.ad}{k.kanal ? <small> / {k.kanal}</small> : null}</>} />
        </section>
        <section className="crm-kart crm-ilgi">
          <h3 className="crm-arac-baslik">Giriş sayfaları</h3>
          <Liste satirlar={detay.sayfalar} ad={(p) => sayfaAdi(p.ad)} urune />
        </section>
      </div>

      <section className="crm-kart">
        <h2>Son 30 gün <small>Satıra basınca o gün açılır</small></h2>
        <div className="crm-tablo crm-tablo-dar" role="table" aria-label="Gün gün trafik">
          <div className="crm-satir crm-satir-bas crm-satir-gun" role="row"><span>Gün</span><span>Ziyaret</span><span>Arama</span><span>Direct</span><span>Diğer</span><span>Kayıt ekranı</span><span>Hesap</span></div>
          {seri.map((g) => (
            <button type="button" key={g.gun} role="row" className={`crm-satir crm-satir-gun${g.gun === s.gun ? " secili" : ""}`} aria-pressed={g.gun === s.gun} onClick={() => { setGun(g.gun); window.scrollTo({ top: 0, behavior: "smooth" }); }}>
              <span className="crm-eposta">{gunAdi(g.gun)}</span>
              <span data-etiket="Ziyaret"><span className="crm-cubuk" style={{ "--oran": `${(g.ziyaret / Math.max(1, ...seri.map((x) => x.ziyaret))) * 100}%` }} />{sayi(g.ziyaret)}</span>
              <span data-etiket="Arama">{sayi(g.arama)}</span>
              <span data-etiket="Direct">{sayi(g.direct)}</span>
              <span data-etiket="Diğer">{sayi(g.diger)}</span>
              <span data-etiket="Kayıt ekranı">{sayi(g.kayitEkrani)}</span>
              <span data-etiket="Hesap">{sayi(g.hesap)}</span>
            </button>
          ))}
        </div>
        <p className="crm-not">Ziyaret: siteye bir sayfadan giren tekil oturum (bot ve otomasyon sayılmaz). Arama: Google, Bing, Yandex. Hesap: o gün açılan hesap; kayıt ekranı uygulamadan doğrudan açılanları da sayar.</p>
      </section>
    </>
  );
}

function Kutu({ ad, deger, ort, not }) {
  const fark = ort === null || ort === undefined ? null : deger - ort;
  return (
    <div className="crm-kpi-kutu">
      <span>{ad}</span>
      <strong>{sayi(deger)}</strong>
      <small>
        {ort === null || ort === undefined ? "Karşılaştırma için veri az" : <>7 gün ort. {ort.toLocaleString("tr-TR", { maximumFractionDigits: 1 })} <em className={fark > 0 ? "arti" : fark < 0 ? "eksi" : ""}>{fark > 0 ? "▲" : fark < 0 ? "▼" : "="}</em></>}
        {not ? <> · {not}</> : null}
      </small>
    </div>
  );
}

function Liste({ satirlar, ad, urune = false }) {
  if (!satirlar.length) return <p className="crm-bos-kucuk">Bu gün ziyaret yok.</p>;
  return (
    <ul className="crm-arac crm-gun-liste">
      {satirlar.slice(0, 12).map((r) => (
        <li key={`${r.ad}|${r.kanal || ""}`}>
          <span>{ad(r)}</span>
          <b>{sayi(r.ziyaret)}{urune && r.urune ? <small> · {r.urune} ürüne</small> : null}{r.kayitEkrani ? <small> · {r.kayitEkrani} kayıt</small> : null}</b>
        </li>
      ))}
    </ul>
  );
}
