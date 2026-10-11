import React, { useEffect, useMemo, useState } from "react";
import { ArrowLeft, BarChart3, Gift, Home, Mail, MessageSquare, RefreshCw, Search, Timer, UserRound, Users } from "lucide-react";
import { supabase } from "../supabaseClient.js";
import { CRM_ALANI } from "../yonetimUrls.js";
import Backoffice from "../Backoffice.jsx";
import Analytics from "../Analytics.jsx";
import Marketing from "../Marketing.jsx";
import {
  SEGMENTLER,
  huniOzeti,
  ilgilenilecekler,
  kullanicilariFiltrele,
  oran,
  paketAdi,
  sonEtkinlikler,
} from "./crmVeri.js";
import { crmOnizlemeVerisi } from "./crmOnizleme.js";
import "./crm.css";

const MENU = [
  ["bugun", "Bugün", Home],
  ["kullanicilar", "Kullanıcılar", Users],
  ["buyume", "Büyüme", BarChart3],
  ["iletisim", "İletişim", Mail],
];

const YOL_EKI = { bugun: "/", kullanicilar: "/kullanicilar", buyume: "/buyume", iletisim: "/iletisim" };

// CRM alanında kısa yollar, yerel önizlemede /crm-preview altı, ana alanda CRM'e tam adres.
export function crmYolu(sayfa, { preview = false, userId = "" } = {}) {
  const ek = sayfa === "kullanici" ? `/user/${encodeURIComponent(userId)}` : YOL_EKI[sayfa] || "/";
  if (preview) return `/crm-preview${ek === "/" ? "" : ek}`;
  if (typeof window !== "undefined" && window.location.hostname.toLowerCase() === CRM_ALANI) return ek;
  return `https://${CRM_ALANI}${ek}`;
}

const ETKINLIK_ADLARI = {
  login: "Giriş yaptı",
  card_added: "Kredi kartı ekledi",
  loan_added: "Kredi ekledi",
  overdraft_added: "Ek hesap ekledi",
  statement_added: "Ekstre ekledi",
  payment_added: "Ödeme kaydetti",
  expense_added: "Harcama ekledi",
  income_added: "Gelir ekledi",
  asset_added: "Varlık ekledi",
  record_deleted: "Kayıt sildi",
};

const tarih = (v, saatli = false) => {
  const d = v ? new Date(v) : null;
  if (!d || !Number.isFinite(d.getTime())) return "—";
  return new Intl.DateTimeFormat("tr-TR", saatli ? { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" } : { day: "numeric", month: "short", year: "numeric" }).format(d);
};

const sayi = (v) => (v === null || v === undefined ? "—" : new Intl.NumberFormat("tr-TR").format(v));

async function backofficeVerisi() {
  const { data } = await supabase.auth.getSession();
  const cevap = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/backoffice`, {
    headers: { Authorization: `Bearer ${data.session?.access_token}` },
  });
  const json = await cevap.json().catch(() => null);
  if (!cevap.ok || !json) throw new Error(json?.error || `HTTP_${cevap.status}`);
  return json;
}

export default function CrmApp({ sayfa = "bugun", userId = "", preview = false }) {
  const [yenileme, setYenileme] = useState(0);
  const veriGerekli = sayfa === "bugun" || sayfa === "kullanicilar";
  const [veri, setVeri] = useState(() => (preview ? crmOnizlemeVerisi() : null));
  const [hata, setHata] = useState("");
  const [yukleniyor, setYukleniyor] = useState(false);

  useEffect(() => {
    if (!veriGerekli || preview) return;
    let iptal = false;
    setYukleniyor(true);
    setHata("");
    backofficeVerisi()
      .then((json) => { if (!iptal) setVeri(json); })
      .catch((e) => { if (!iptal) setHata(e.message === "FORBIDDEN" ? "Bu ekran için yetkin yok." : "Veriler yüklenemedi. Yenilemeyi dene."); })
      .finally(() => { if (!iptal) setYukleniyor(false); });
    return () => { iptal = true; };
  }, [veriGerekli, preview, yenileme]);

  const aktifMenu = sayfa === "kullanici" ? "kullanicilar" : sayfa;
  const baslik = { bugun: "Bugün", kullanicilar: "Kullanıcılar", kullanici: "Kullanıcı detayı", buyume: "Büyüme", iletisim: "İletişim" }[sayfa];
  const altBaslik = {
    bugun: "Kim geldi, kim takıldı, kime bakmak gerekiyor.",
    kullanicilar: "Segment seç, ara, detaya git.",
    kullanici: "Üyelik, kayıt geçmişi ve iletişim.",
    buyume: "Ziyaretten kayda huni ve kanallar.",
    iletisim: "Otomatik e-postalar ve kampanyalar.",
  }[sayfa];

  return (
    <div className="crm">
      <aside className="crm-yan">
        <a className="crm-logo" href={crmYolu("bugun", { preview })}>Borcama<span>CRM</span></a>
        <nav className="crm-menu" aria-label="CRM menüsü">
          {MENU.map(([anahtar, ad, Ikon]) => (
            <a key={anahtar} href={crmYolu(anahtar, { preview })} className={aktifMenu === anahtar ? "aktif" : ""} aria-current={aktifMenu === anahtar ? "page" : undefined}>
              <Ikon size={17} aria-hidden="true" /> {ad}
            </a>
          ))}
        </nav>
        <a className="crm-uygulama" href="https://borcama.com/summary">Uygulamaya dön</a>
      </aside>
      <main className="crm-icerik">
        <header className="crm-baslik">
          <div>
            {sayfa === "kullanici" && <a className="crm-geri" href={crmYolu("kullanicilar", { preview })}><ArrowLeft size={14} /> Kullanıcılar</a>}
            <h1>{baslik}</h1>
            <p>{altBaslik}{preview ? " · yerel önizleme" : ""}</p>
          </div>
          <button type="button" className="crm-btn" onClick={() => setYenileme((x) => x + 1)} disabled={yukleniyor}>
            <RefreshCw size={14} aria-hidden="true" /> Yenile
          </button>
        </header>
        {hata && <div className="crm-hata" role="alert">{hata} <button type="button" className="crm-btn" onClick={() => setYenileme((x) => x + 1)}>Tekrar dene</button></div>}
        {veriGerekli && !veri && !hata && <div className="crm-yukleniyor">Yükleniyor…</div>}
        {sayfa === "bugun" && veri && <Bugun veri={veri} preview={preview} />}
        {sayfa === "kullanicilar" && veri && <Kullanicilar veri={veri} preview={preview} />}
        {sayfa === "kullanici" && <div className="crm-gomulu" key={`k${yenileme}`}><Backoffice userId={userId} preview={preview} /></div>}
        {sayfa === "buyume" && (preview ? <Onizlemede /> : <div className="crm-gomulu" key={`b${yenileme}`}><Analytics /></div>)}
        {sayfa === "iletisim" && (preview ? <Onizlemede /> : <div className="crm-gomulu" key={`i${yenileme}`}><Marketing /></div>)}
      </main>
    </div>
  );
}

function Onizlemede() {
  return <div className="crm-kart crm-bos">Bu ekran yerel önizlemede canlı veri olmadan açılmaz.</div>;
}

function Bugun({ veri, preview }) {
  const ilgi = useMemo(() => ilgilenilecekler(veri), [veri]);
  const huni = useMemo(() => huniOzeti(veri?.analytics?.daily || [], 7), [veri]);
  const akis = useMemo(() => sonEtkinlikler(veri?.activities || []), [veri]);
  const saglik = veri?.product_health;
  const kullaniciLinki = (id) => crmYolu("kullanici", { preview, userId: id });
  return (
    <>
      <section className="crm-kpi" aria-label="Özet">
        <Kpi ad="Toplam kullanıcı" deger={sayi(veri?.summary?.total)} />
        <Kpi ad="Son 7 gün yeni" deger={sayi(veri?.summary?.new_7d)} />
        <Kpi ad="Haftalık aktif" deger={sayi(saglik?.active_users?.last_7_days)} not="Giriş hariç kayıt yapan" />
        <Kpi ad="Pro / deneme" deger={`${sayi(saglik?.pro?.paid_active_pro ?? veri?.users?.filter((u) => u.pro_active).length)} / ${sayi(veri?.summary?.trial_active)}`} />
      </section>

      <section className="crm-kart">
        <h2>Son 7 gün huni</h2>
        <div className="crm-huni">
          <HuniAdim ad="Ziyaret" deger={huni.bu.ziyaret} onceki={huni.onceki.ziyaret} />
          <HuniAdim ad="Kayıt ekranı" deger={huni.bu.kayitEkrani} onceki={huni.onceki.kayitEkrani} oranMetni={oran(huni.bu.kayitEkrani, huni.bu.ziyaret)} />
          <HuniAdim ad="Hesap" deger={huni.bu.hesap} onceki={huni.onceki.hesap} oranMetni={oran(huni.bu.hesap, huni.bu.kayitEkrani)} />
          <HuniAdim ad="Doğrulanan" deger={huni.bu.dogrulanan} onceki={huni.onceki.dogrulanan} oranMetni={oran(huni.bu.dogrulanan, huni.bu.hesap)} />
          {saglik?.summary && <HuniAdim ad="İlk borç/ekstre" deger={saglik.summary.first_debt_or_statement} onceki={saglik.summary.previous?.first_debt_or_statement} oranMetni={oran(saglik.summary.first_debt_or_statement, saglik.summary.registered)} />}
        </div>
        {!veri?.analytics?.available && <p className="crm-not">Huni verisi şu an alınamadı.</p>}
      </section>

      <h2 className="crm-bolum">İlgilenilecekler</h2>
      <div className="crm-izgara">
        <IlgiKart ikon={UserRound} baslik="Kayıt olup veri girmeyenler" aciklama="Son 14 gün, e-postası doğrulanmış" grup={ilgi.verisizYeni} satir={(u) => <a href={kullaniciLinki(u.id)}>{u.email}<small>{tarih(u.created_at)}</small></a>} />
        <IlgiKart ikon={Mail} baslik="E-postası doğrulanmamış" aciklama="Son 14 gün" grup={ilgi.dogrulanmamis} satir={(u) => <a href={kullaniciLinki(u.id)}>{u.email}<small>{tarih(u.created_at)}</small></a>} />
        <IlgiKart ikon={Timer} baslik="Denemesi bitiyor" aciklama="3 gün veya daha az" grup={ilgi.denemesiBiten} satir={(u) => <a href={kullaniciLinki(u.id)}>{u.email}<small>{u.trial_days_remaining} gün</small></a>} />
        <IlgiKart ikon={MessageSquare} baslik="Yeni geri bildirim" aciklama="Son 14 gün" grup={ilgi.geriBildirim} satir={(f) => <a href={f.user_id ? kullaniciLinki(f.user_id) : undefined}>{f.message}<small>{f.email} · {tarih(f.created_at)}</small></a>} />
        <IlgiKart ikon={Gift} baslik="Davet incelemesi" aciklama="Onay bekleyen ödüller" grup={ilgi.davetIncelemesi} satir={(r) => <a href={kullaniciLinki(r.invitee_user_id)}>{r.referrer_email} → {r.invitee_email}<small>Kullanıcı detayından onayla</small></a>} />
      </div>

      <section className="crm-kart">
        <h2>Son 24 saat</h2>
        {akis.length ? (
          <ul className="crm-akis">
            {akis.map((a) => (
              <li key={a.id}>
                <span>{tarih(a.created_at, true)}</span>
                <a href={a.user_id ? kullaniciLinki(a.user_id) : undefined}>{a.email}</a>
                <b>{ETKINLIK_ADLARI[a.event_type] || a.event_type}</b>
              </li>
            ))}
          </ul>
        ) : <p className="crm-not">Son 24 saatte hareket yok.</p>}
      </section>
    </>
  );
}

function Kpi({ ad, deger, not }) {
  return <div className="crm-kpi-kutu"><span>{ad}</span><strong>{deger}</strong>{not && <small>{not}</small>}</div>;
}

function HuniAdim({ ad, deger, onceki, oranMetni }) {
  const fark = Number.isFinite(onceki) ? deger - onceki : null;
  return (
    <div className="crm-huni-adim">
      <span>{ad}</span>
      <strong>{sayi(deger)}</strong>
      <small>
        {oranMetni !== null && oranMetni !== undefined ? `%${oranMetni} önceki adımdan` : " "}
        {fark !== null && <em className={fark > 0 ? "arti" : fark < 0 ? "eksi" : ""}>{fark > 0 ? `+${fark}` : fark} önceki 7 güne göre</em>}
      </small>
    </div>
  );
}

function IlgiKart({ ikon: Ikon, baslik, aciklama, grup, satir }) {
  return (
    <section className="crm-kart crm-ilgi">
      <div className="crm-ilgi-bas"><Ikon size={16} aria-hidden="true" /><h3>{baslik}</h3><b>{grup.toplam}</b></div>
      <p className="crm-not">{aciklama}</p>
      {grup.kayitlar.length ? <ul>{grup.kayitlar.map((k, i) => <li key={k.id || i}>{satir(k)}</li>)}</ul> : <p className="crm-bos-kucuk">Yok</p>}
    </section>
  );
}

const SAYFA_BOYUTU = 50;

function Kullanicilar({ veri, preview }) {
  const [segment, setSegment] = useState("tumu");
  const [arama, setArama] = useState("");
  const [goster, setGoster] = useState(SAYFA_BOYUTU);
  const liste = useMemo(() => kullanicilariFiltrele(veri?.users || [], { segment, arama }), [veri, segment, arama]);
  const sayilar = useMemo(() => Object.fromEntries(SEGMENTLER.map(([s]) => [s, kullanicilariFiltrele(veri?.users || [], { segment: s }).length])), [veri]);
  return (
    <section className="crm-kart">
      <div className="crm-filtre">
        <label className="crm-arama"><Search size={15} aria-hidden="true" /><input type="search" placeholder="E-posta ara" value={arama} onChange={(e) => { setArama(e.target.value); setGoster(SAYFA_BOYUTU); }} /></label>
        <div className="crm-segmentler" role="group" aria-label="Segment">
          {SEGMENTLER.map(([s, ad]) => (
            <button key={s} type="button" className={segment === s ? "aktif" : ""} aria-pressed={segment === s} onClick={() => { setSegment(s); setGoster(SAYFA_BOYUTU); }}>{ad} <b>{sayilar[s]}</b></button>
          ))}
        </div>
      </div>
      <div className="crm-tablo" role="table" aria-label="Kullanıcılar">
        <div className="crm-satir crm-satir-bas" role="row"><span role="columnheader">Kullanıcı</span><span role="columnheader">Kayıt</span><span role="columnheader">Son giriş</span><span role="columnheader">Paket</span><span role="columnheader">Veri</span></div>
        {liste.slice(0, goster).map((u) => (
          <a key={u.id} className="crm-satir" role="row" href={crmYolu("kullanici", { preview, userId: u.id })}>
            <span role="cell" className="crm-eposta">{u.email}{!u.email_confirmed_at && <em className="crm-rozet uyari">Doğrulanmadı</em>}{u.access_status === "blocked" && <em className="crm-rozet tehlike">Engelli</em>}</span>
            <span role="cell" data-etiket="Kayıt">{tarih(u.created_at)}</span>
            <span role="cell" data-etiket="Son giriş">{tarih(u.last_sign_in_at)}</span>
            <span role="cell" data-etiket="Paket"><em className={`crm-rozet ${u.pro_active ? "pro" : u.trial_active ? "deneme" : ""}`}>{paketAdi(u)}</em></span>
            <span role="cell" data-etiket="Veri">{u.has_data ? "Var" : "Yok"}</span>
          </a>
        ))}
        {!liste.length && <p className="crm-bos-kucuk">Bu segmentte kullanıcı yok.</p>}
      </div>
      {liste.length > goster && <button type="button" className="crm-btn crm-daha" onClick={() => setGoster((g) => g + SAYFA_BOYUTU)}>Daha fazla göster ({liste.length - goster})</button>}
    </section>
  );
}
