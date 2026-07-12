import React, { useEffect } from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import Landing from './Landing.jsx'
import LandingAlt from './LandingAlt.jsx'
import { useSession, GirisEkrani } from './Auth.jsx'
import { demoModu, supabaseHazir } from './supabaseClient.js'
import './storage.js'

function Kok() {
  const yol = window.location.pathname.replace(/\/+$/, '') || '/'
  if (yol === '/login') return supabaseHazir ? <GirisEkrani /> : demoModu ? <GirisEkrani /> : <YapilandirmaEksik />
  if (yol === '/classic') return <Landing />
  const uygulamaYollari = ['/summary', '/debts', '/debt-plan', '/income', '/expenses']
  if (yol === '/') return supabaseHazir ? <AnaSayfa /> : <LandingAlt />
  if (!uygulamaYollari.includes(yol)) return <LandingAlt />
  if (!supabaseHazir) return demoModu ? <App /> : <YapilandirmaEksik />
  return <KimlikliKok />
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
    return (
      <div style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: '#f4efe0', color: '#55584c', fontFamily: 'Space Grotesk, system-ui, sans-serif', fontSize: 14,
      }}>
        Yükleniyor…
      </div>
    )
  }

  return session ? <App /> : <LandingAlt />
}

function KimlikliKok() {
  const session = useSession()

  if (session === undefined) {
    return (
      <div style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: '#f4efe0', color: '#55584c', fontFamily: 'Space Grotesk, system-ui, sans-serif', fontSize: 14,
      }}>
        Yükleniyor…
      </div>
    )
  }

  if (!session) return <GirisEkrani />

  return <App />
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Kok />
  </React.StrictMode>,
)
