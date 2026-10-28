// Büyük ekran (≥1024 px, yalnız web) ortak kabuğu: üst çubuk (72 px, logo
// solda), 1120 px ızgara ve 32 px kenar; kayıt, kod, kurulum ve uygulama aynı
// çubuğu ve aynı ızgarayı kullanır (docs/web-akis-direktifi.md §3 PR-3).
// Burada ayrıca uygulamanın sağdan açılan paneli (SagPanel) ve üst çubuk
// menüleri (AcilirMenu) var. iOS ve <1024 px'te hiçbiri çizilmez; mevcut
// düzen aynen kalır.
import React, { useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { nativeMi } from "./platform.js";
import { t } from "./i18n.js";
import "./masaustuKabuk.css";

export const MASAUSTU_SORGUSU = "(min-width: 1024px)";

function masaustuMu() {
  if (nativeMi || typeof window === "undefined" || typeof window.matchMedia !== "function") return false;
  return window.matchMedia(MASAUSTU_SORGUSU).matches;
}

// Web'de ve ≥1024 px'te true; pencere daralınca anında false olur.
export function useMasaustu() {
  const [masaustu, setMasaustu] = useState(masaustuMu);
  useEffect(() => {
    if (nativeMi || typeof window.matchMedia !== "function") return undefined;
    const sorgu = window.matchMedia(MASAUSTU_SORGUSU);
    const dinle = () => setMasaustu(sorgu.matches);
    dinle();
    sorgu.addEventListener?.("change", dinle);
    return () => sorgu.removeEventListener?.("change", dinle);
  }, []);
  return masaustu;
}

// Uygulamanın başlığıyla aynı logo dosyası; kabuklar arasında logo yerinden
// oynamaz. `href` yoksa bağlantı değil, yalnız logo.
export function KabukLogosu({ koyu = false, href, onClick }) {
  const gorsel = (
    <img src={koyu ? "/borcama-logo-koyu.png" : "/borcama-logo.png"} alt="Borcama" width="140" height="35" />
  );
  if (!href) return <span className="mk-logo">{gorsel}</span>;
  return (
    <a className="mk-logo" href={href} onClick={onClick} aria-label={t("web.kabuk.anaSayfa")}>
      {gorsel}
    </a>
  );
}

// Kayıt/giriş ve kurulumun üst çubuğu (.oa yüzeyi içinde).
export function MasaustuUstCubuk({ koyu = false, sag = null, logoHref, onLogo }) {
  return (
    <header className="mk-ust">
      <div className="mk-ust-ic">
        <KabukLogosu koyu={koyu} href={logoHref} onClick={onLogo} />
        <div className="mk-ust-sag">{sag}</div>
      </div>
    </header>
  );
}

/* ---------------- Açılır menü (+ Ekle, hesap) ---------------- */

// Düğme + role=menu. Aşağı ok / Enter / boşluk açar, oklar gezer, Esc kapatıp
// odağı düğmeye döndürür, dışarı tıklama ve Tab kapatır.
export function AcilirMenu({ etiket, dugmeSinifi = "", dugmeAria, dugmeIcerigi, dugmeBaslik, maddeler, ust = null, sinif = "" }) {
  const [acik, setAcik] = useState(false);
  const dugmeRef = useRef(null);
  const menuRef = useRef(null);
  const menuId = useId();

  useEffect(() => {
    if (!acik) return undefined;
    menuRef.current?.querySelector('[role="menuitem"]')?.focus();
    const disTiklama = (olay) => {
      if (menuRef.current?.contains(olay.target) || dugmeRef.current?.contains(olay.target)) return;
      setAcik(false);
    };
    document.addEventListener("mousedown", disTiklama);
    return () => document.removeEventListener("mousedown", disTiklama);
  }, [acik]);

  function tus(olay) {
    const ogeler = [...(menuRef.current?.querySelectorAll('[role="menuitem"]') || [])];
    const i = ogeler.indexOf(document.activeElement);
    const git = (n) => ogeler[(n + ogeler.length) % ogeler.length]?.focus();
    if (olay.key === "Escape") {
      olay.preventDefault();
      olay.stopPropagation();
      setAcik(false);
      dugmeRef.current?.focus();
    } else if (olay.key === "ArrowDown") {
      olay.preventDefault();
      git(i + 1);
    } else if (olay.key === "ArrowUp") {
      olay.preventDefault();
      git(i - 1);
    } else if (olay.key === "Home") {
      olay.preventDefault();
      git(0);
    } else if (olay.key === "End") {
      olay.preventDefault();
      git(-1);
    } else if (olay.key === "Tab") {
      setAcik(false);
    }
  }

  return (
    <div className={`mk-menu-kap ${sinif}`.trim()}>
      <button
        ref={dugmeRef}
        type="button"
        className={dugmeSinifi}
        aria-haspopup="menu"
        aria-expanded={acik}
        aria-controls={acik ? menuId : undefined}
        aria-label={dugmeAria}
        title={dugmeBaslik}
        onClick={() => setAcik((eski) => !eski)}
        onKeyDown={(olay) => {
          if (olay.key === "ArrowDown") {
            olay.preventDefault();
            setAcik(true);
          }
        }}
      >
        {dugmeIcerigi}
      </button>
      {acik && (
        <div className="mk-menu" id={menuId} role="menu" aria-label={etiket} ref={menuRef} onKeyDown={tus}>
          {ust}
          {maddeler.map(({ anahtar, ad, alt, ikon: Ikon, onSec }) => (
            <button
              key={anahtar || ad}
              type="button"
              role="menuitem"
              className="mk-menu-madde"
              onClick={() => {
                setAcik(false);
                onSec?.(dugmeRef.current);
              }}
            >
              {Ikon && (
                <span className="mk-menu-ikon" aria-hidden="true">
                  <Ikon size={17} strokeWidth={2.2} />
                </span>
              )}
              <span className="mk-menu-metin">
                <strong>{ad}</strong>
                {alt && <small>{alt}</small>}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ---------------- Sağ panel ---------------- */

const ODAKLANABILIR = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled]):not([type=hidden])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  "[tabindex]:not([tabindex='-1'])",
].join(",");
const ALAN = "input:not([disabled]):not([type=hidden]):not([readonly]),select:not([disabled]),textarea:not([disabled])";

// Bir panel kapanıp hemen başkası açılırsa (ör. borç türü seçici → kart
// formu) ikincisi kaymadan, yerinde açılır.
let sonKapanis = 0;
// Menüden açılan panelde odak, kapanınca menünün düğmesine döner (menü maddesi
// o sırada artık yok).
let bekleyenTetikleyici = null;
export function panelTetikleyicisiniAyarla(eleman) {
  bekleyenTetikleyici = eleman || null;
}

// Uygulamanın kökü (#bt-app-kok): panel temanın CSS değişkenlerini oradan alır.
function panelKoku() {
  if (typeof document === "undefined") return null;
  return document.getElementById("bt-app-kok");
}

// 440 px, sağdan kayar; arka plan tıklaması ve Esc kapatır, odak panelde
// kalır, açılınca ilk alana, kapanınca açan düğmeye döner. Liste düzeni
// değişmez (panel sayfanın üstünde; kaydırma çubuğu yeri kabuk.css'te sabit).
export function SagPanel({ acik = true, ...ozellikler }) {
  if (!acik) return null;
  return <SagPanelGovdesi {...ozellikler} />;
}

function SagPanelGovdesi({ baslik, aciklama, onKapat, children, sinif = "" }) {
  const panelRef = useRef(null);
  const kapatRef = useRef(onKapat);
  kapatRef.current = onKapat;
  const baslikId = useId();
  const [anlik] = useState(() => Date.now() - sonKapanis < 160);

  useLayoutEffect(() => {
    const donus = bekleyenTetikleyici || document.activeElement;
    bekleyenTetikleyici = null;
    const panel = panelRef.current;
    const ilk = panel?.querySelector(`.sag-panel-govde :is(${ALAN})`)
      || panel?.querySelector(`.sag-panel-govde :is(${ODAKLANABILIR})`)
      || panel?.querySelector(".sag-panel-kapat");
    ilk?.focus({ preventScroll: true });
    const oncekiTasma = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = oncekiTasma;
      sonKapanis = Date.now();
      if (donus && donus !== document.body && donus.isConnected && typeof donus.focus === "function") {
        donus.focus({ preventScroll: true });
      }
    };
  }, []);

  useEffect(() => {
    const tus = (olay) => {
      const panel = panelRef.current;
      if (!panel) return;
      // Panelin üstünde açılan bir pencere (ör. kaynak ekleme) kendi tuşlarını yönetir.
      if (!panel.contains(olay.target) && olay.target !== document.body) return;
      if (olay.key === "Escape") {
        olay.preventDefault();
        kapatRef.current?.();
        return;
      }
      if (olay.key !== "Tab") return;
      const odaklar = [...panel.querySelectorAll(ODAKLANABILIR)].filter((e) => e.getClientRects().length > 0);
      if (!odaklar.length) return;
      const ilk = odaklar[0];
      const son = odaklar[odaklar.length - 1];
      const aktif = document.activeElement;
      if (olay.shiftKey && (aktif === ilk || !panel.contains(aktif))) {
        olay.preventDefault();
        son.focus();
      } else if (!olay.shiftKey && (aktif === son || !panel.contains(aktif))) {
        olay.preventDefault();
        ilk.focus();
      }
    };
    document.addEventListener("keydown", tus);
    return () => document.removeEventListener("keydown", tus);
  }, []);

  const icerik = (
    <div
      className={`sag-panel-arka${anlik ? " anlik" : ""}`}
      role="presentation"
      onMouseDown={(olay) => {
        if (olay.target !== olay.currentTarget) return;
        // Tarayıcı odağı gövdeye taşımasın; odak açan düğmeye döner.
        olay.preventDefault();
        kapatRef.current?.();
      }}
    >
      <aside className={`sag-panel ${sinif}`.trim()} role="dialog" aria-modal="true" aria-labelledby={baslikId} ref={panelRef}>
        <div className="sag-panel-ust">
          <div>
            <h2 id={baslikId} className="sag-panel-baslik">{baslik}</h2>
            {aciklama && <p className="sag-panel-aciklama">{aciklama}</p>}
          </div>
          <button type="button" className="sag-panel-kapat" aria-label={t("ortak.kapat")} onClick={() => kapatRef.current?.()}>
            <X size={18} strokeWidth={2.2} />
          </button>
        </div>
        <div className="sag-panel-govde">{children}</div>
      </aside>
    </div>
  );
  const kok = panelKoku();
  return kok ? createPortal(icerik, kok) : icerik;
}
