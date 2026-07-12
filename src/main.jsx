import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import Landing from './Landing.jsx'
import LandingAlt from './LandingAlt.jsx'
import { useSession, GirisEkrani } from './Auth.jsx'
import { supabaseHazir } from './supabaseClient.js'
import './storage.js'

function Kok() {
  const params = new URLSearchParams(window.location.search)
  const girisOnizleme = params.get('auth') === '1'
  if (girisOnizleme) return <GirisEkrani />
  if (params.get('landing') === 'classic') return <Landing />
  if (params.get('app') !== '1') return <LandingAlt />
  if (!supabaseHazir) return <App />
  return <KimlikliKok />
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
