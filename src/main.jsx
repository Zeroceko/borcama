import React, { useEffect } from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import Landing from "./Landing.jsx";
import LandingAlt from "./LandingAlt.jsx";
import LandingStory from "./LandingStory.jsx";
import Backoffice from "./Backoffice.jsx";
import CeoDashboard from "./CeoDashboard.jsx";
import Marketing from "./Marketing.jsx";
import {
  KullaniciSozlesmesi,
  GizlilikMetni,
  IadePolitikasi,
} from "./Legal.jsx";
import { useSession, GirisEkrani, ParolaYenileEkrani } from "./Auth.jsx";
import { demoModu, supabaseHazir } from "./supabaseClient.js";
import ProCheckout from "./ProCheckout.jsx";
import Faq from "./Faq.jsx";
import { proNiyetiniOku } from "./proIntent.js";
import GoogleAdsConsent from "./GoogleAdsConsent.jsx";
import { googleAdsBaslat } from "./googleAds.js";
import "./storage.js";

googleAdsBaslat();

const YONETIM_EPOSTALARI = new Set(["ozerocek@gmail.com"]);

function yonetimYetkisiVar(session) {
  return YONETIM_EPOSTALARI.has(
    String(session?.user?.email || "").trim().toLowerCase(),
  );
}

function Kok() {
  const yol = window.location.pathname.replace(/\/+$/, "") || "/";
  useEffect(() => {
    const yonetimSayfasi = ["/ceo", "/backoffice", "/marketing"].includes(yol);
    let meta = document.querySelector('meta[name="robots"]');
    if (!meta) {
      meta = document.createElement("meta");
      meta.setAttribute("name", "robots");
      document.head.appendChild(meta);
    }
    meta.setAttribute("content", yonetimSayfasi ? "noindex,nofollow,noarchive" : "index,follow");
  }, [yol]);
  if (demoModu && ["/login", "/register"].includes(yol)) {
    window.history.replaceState({}, "", "/assets");
    return <App />;
  }
  if (yol === "/login")
    return supabaseHazir ? (
      <GirisEkrani />
    ) : demoModu ? (
      <GirisEkrani />
    ) : (
      <YapilandirmaEksik />
    );
  if (yol === "/register")
    return supabaseHazir ? (
      <GirisEkrani kayitModu />
    ) : demoModu ? (
      <GirisEkrani kayitModu />
    ) : (
      <YapilandirmaEksik />
    );
  if (yol === "/reset-password")
    return supabaseHazir || demoModu ? <ParolaYenileEkrani /> : <YapilandirmaEksik />;
  if (yol === "/terms") return <KullaniciSozlesmesi />;
  if (yol === "/privacy") return <GizlilikMetni />;
  if (yol === "/refund-policy") return <IadePolitikasi />;
  if (yol === "/faq") return <Faq />;
  if (yol === "/classic") return <Landing />;
  if (yol === "/landing-v2") return <LandingStory />;
  if (yol === "/backoffice")
    return supabaseHazir ? <KimlikliBackoffice /> : <YapilandirmaEksik />;
  if (yol === "/ceo")
    return supabaseHazir ? (
      <KimlikliYonetim tur="ceo" />
    ) : (
      <YapilandirmaEksik />
    );
  if (yol === "/marketing")
    return supabaseHazir ? (
      <KimlikliYonetim tur="marketing" />
    ) : (
      <YapilandirmaEksik />
    );
  if (yol === "/welcome")
    return supabaseHazir ? <KimlikliWelcome /> : <YapilandirmaEksik />;
  if (yol === "/upgrade")
    return supabaseHazir ? <ProCheckout /> : <YapilandirmaEksik />;
  const uygulamaYollari = [
    "/summary",
    "/debts",
    "/payments",
    "/debt-plan",
    "/income",
    "/expenses",
    "/assets",
    "/settings",
  ];
  if (yol === "/") return supabaseHazir ? <AnaSayfa /> : <LandingAlt />;
  if (!uygulamaYollari.includes(yol)) return <LandingAlt />;
  if (!supabaseHazir) return demoModu ? <App /> : <YapilandirmaEksik />;
  return <KimlikliKok />;
}

function KimlikliBackoffice() {
  const session = useSession();
  if (session === undefined) return <Yukleniyor />;
  if (!session) return <GirisEkrani redirectTo="/backoffice" />;
  if (!yonetimYetkisiVar(session)) return <YonetimYetkisiz />;
  return <Backoffice />;
}

function KimlikliYonetim({ tur }) {
  const session = useSession();
  if (session === undefined) return <Yukleniyor />;
  if (!session) return <GirisEkrani redirectTo={`/${tur}`} />;
  if (!yonetimYetkisiVar(session)) return <YonetimYetkisiz />;
  if (tur === "ceo") return <CeoDashboard />;
  if (tur === "marketing") return <Marketing />;
  return <Backoffice />;
}

function YonetimYetkisiz() {
  return (
    <main
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        padding: 24,
        background: "#f4efe0",
        color: "#14160f",
        fontFamily: "Space Grotesk, system-ui, sans-serif",
      }}
    >
      <section
        style={{
          width: "min(100%, 520px)",
          padding: 32,
          border: "1px solid #d8d4c8",
          borderRadius: 24,
          background: "#fff",
          boxShadow: "0 18px 44px rgba(28,30,21,.08)",
        }}
      >
        <h1 style={{ margin: "0 0 10px", fontSize: 28 }}>Yönetim erişimi yok</h1>
        <p style={{ margin: "0 0 22px", color: "#626458", lineHeight: 1.6 }}>
          Bu sayfa yalnızca yetkilendirilmiş Borcama yöneticilerine açıktır.
        </p>
        <a
          href="/summary"
          style={{
            display: "inline-flex",
            minHeight: 44,
            alignItems: "center",
            padding: "0 18px",
            borderRadius: 999,
            background: "#cdf564",
            color: "#14160f",
            fontWeight: 800,
            textDecoration: "none",
          }}
        >
          Borcama'ya dön
        </a>
      </section>
    </main>
  );
}

function KimlikliWelcome() {
  const session = useSession();
  if (session === undefined) return <Yukleniyor />;
  if (!session) return <GirisEkrani redirectTo="/welcome" />;

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        padding: 24,
        background: "#f4efe0",
        color: "#14160f",
        fontFamily: "Space Grotesk, system-ui, sans-serif",
      }}
    >
      <section
        style={{
          width: "min(100%, 560px)",
          padding: "clamp(26px, 6vw, 46px)",
          border: "3px solid #14160f",
          borderRadius: 28,
          background: "#fff",
          boxShadow: "10px 10px 0 #ff6b5b",
          textAlign: "center",
        }}
      >
        <div style={{ fontSize: 46, marginBottom: 12 }}>✦</div>
        <h1 style={{ margin: "0 0 12px", fontSize: "clamp(30px, 7vw, 48px)" }}>
          Borcama Pro hazır.
        </h1>
        <p style={{ margin: "0 auto 24px", maxWidth: 430, color: "#5d6054", lineHeight: 1.65 }}>
          Satın alma tamamlandı. Tüm kişisel finansal sinyaller ve gelişmiş analizler hesabında aktif.
        </p>
        <a
          href="/summary"
          style={{
            display: "inline-flex",
            minHeight: 48,
            alignItems: "center",
            justifyContent: "center",
            padding: "0 24px",
            border: "2px solid #14160f",
            borderRadius: 999,
            background: "#c6fa53",
            color: "#14160f",
            fontWeight: 800,
            textDecoration: "none",
          }}
        >
          Özetime git →
        </a>
      </section>
    </main>
  );
}

function Yukleniyor() {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#f4efe0",
        color: "#55584c",
        fontFamily: "Space Grotesk, system-ui, sans-serif",
        fontSize: 14,
      }}
    >
      Yükleniyor…
    </div>
  );
}

function YapilandirmaEksik() {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        padding: 24,
        background: "#f4efe0",
        color: "#14160f",
        fontFamily: "Space Grotesk, system-ui, sans-serif",
      }}
    >
      <div
        style={{
          maxWidth: 480,
          padding: 28,
          border: "2px solid #14160f",
          borderRadius: 20,
          background: "#fff",
        }}
      >
        <h1 style={{ marginTop: 0, fontSize: 22 }}>
          Uygulama geçici olarak kullanılamıyor
        </h1>
        <p style={{ marginBottom: 0, color: "#55584c", lineHeight: 1.6 }}>
          Güvenli bağlantı ayarları tamamlanmadı. Lütfen daha sonra tekrar
          deneyin.
        </p>
      </div>
    </div>
  );
}

function AnaSayfa() {
  const session = useSession();

  useEffect(() => {
    if (session) {
      const plan = proNiyetiniOku();
      if (plan) window.location.replace(`/upgrade?plan=${plan}`);
      else window.history.replaceState({}, "", "/summary");
    }
  }, [session]);

  if (session === undefined) {
    return <Yukleniyor />;
  }

  return session ? <App /> : <LandingAlt />;
}

function KimlikliKok() {
  const session = useSession();

  if (session === undefined) {
    return <Yukleniyor />;
  }

  if (!session) return <GirisEkrani />;

  const bekleyenPlan = proNiyetiniOku();
  if (bekleyenPlan) {
    window.location.replace(`/upgrade?plan=${bekleyenPlan}`);
    return <Yukleniyor />;
  }

  return <App />;
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <>
      <Kok />
      <GoogleAdsConsent />
    </>
  </React.StrictMode>,
);
