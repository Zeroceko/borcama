import React, { useEffect } from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import Landing from './Landing.jsx'
import LandingAlt from './LandingAlt.jsx'
import Backoffice from './Backoffice.jsx'
import CeoDashboard from './CeoDashboard.jsx'
import { useSession, GirisEkrani } from './Auth.jsx'
import { demoModu, supabaseHazir } from './supabaseClient.js'
import './storage.js'

function Kok() {
  const yol = window.location.pathname.replace(/\/+$/, '') || '/'
  if (yol === '/login') return supabaseHazir ? <GirisEkrani /> : demoModu ? <GirisEkrani /> : <YapilandirmaEksik />
  if (yol === '/register') return supabaseHazir ? <GirisEkrani kayitModu /> : demoModu ? <GirisEkrani kayitModu /> : <YapilandirmaEksik />
  if (yol === '/classic') return <Landing />
  if (yol === '/backoffice') return supabaseHazir ? <KimlikliBackoffice /> : <YapilandirmaEksik />
  if (yol === '/ceo') return supabaseHazir ? <KimlikliYonetim tur="ceo" /> : <YapilandirmaEksik />
  const uygulamaYollari = ['/summary', '/debts', '/payments', '/debt-plan', '/income', '/expenses', '/settings']
  if (yol === '/') return supabaseHazir ? <AnaSayfa /> : <LandingAlt />
  if (!uygulamaYollari.includes(yol)) return <LandingAlt />
  if (!supabaseHazir) return demoModu ? <App /> : <YapilandirmaEksik />
  return <KimlikliKok />
}

function KimlikliBackoffice() {
  const session = useSession()
  if (session === undefined) return <Yukleniyor />
  if (!session) return <GirisEkrani redirectTo="/backoffice" />
  return <Backoffice />
}

function KimlikliYonetim({ tur }) {
  const session = useSession()
  if (session === undefined) return <Yukleniyor />
  if (!session) return <GirisEkrani redirectTo={`/${tur}`} />
  return tur === 'ceo' ? <CeoDashboard /> : <Backoffice />
}

function Yukleniyor() {
  return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f4efe0', color: '#55584c', fontFamily: 'Space Grotesk, system-ui, sans-serif', fontSize: 14 }}>Yükleniyor…</div>
}

function YapilandirmaEksik() {
  return <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', padding: 24, background: '#f4efe0', color: '#14160f', fontFamily: 'Space Grotesk, system-ui, sans-serif' }}>
    <div style={{ maxWidth: 480, padding: 28, border: '2px solid #14160f', borderRadius: 20, background: '#fff' }}>
      <h1 style={{ marginTop: 0, fontSize: 22 }}>Uygulama geçici olarak kullanılamıyor</h1>
      <p style={{ marginBottom: 0, color: '#55584c', lineHeight: 1.6 }}>Güvenli bağlantı ayarları tamamlanmadı. Lütfen daha sonra tekrar deneyin.</p>
    </div>
  </div>
}

function AnaSayfa() {
  const session = useSession()

  useEffect(() => {
    if (session) window.history.replaceState({}, '', '/summary')
  }, [session])

  if (session === undefined) {
    return <Yukleniyor />
  }

  return session ? <App /> : <LandingAlt />
}

function KimlikliKok() {
  const session = useSession()

  if (session === undefined) {
    return <Yukleniyor />
  }

  if (!session) return <GirisEkrani />

  return <App />
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Kok />
  </React.StrictMode>,
)
