import React, { useEffect } from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import Landing from './Landing.jsx'
import LandingAlt from './LandingAlt.jsx'
import { useSession, GirisEkrani } from './Auth.jsx'
import { supabaseHazir } from './supabaseClient.js'
import './storage.js'

function Kok() {
  const yol = window.location.pathname.replace(/\/+$/, '') || '/'
  if (yol === '/login') return <GirisEkrani />
  if (yol === '/classic') return <Landing />
  const uygulamaYollari = ['/summary', '/debts', '/debt-plan', '/income', '/expenses']
  if (yol === '/') return supabaseHazir ? <AnaSayfa /> : <LandingAlt />
  if (!uygulamaYollari.includes(yol)) return <LandingAlt />
  if (!supabaseHazir) return <App />
  return <KimlikliKok />
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
