import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import { useSession, GirisEkrani } from './Auth.jsx'
import './storage.js'

function Kok() {
  const session = useSession()

  if (session === undefined) {
    return (
      <div style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: '#0E1420', color: '#8C99B3', fontFamily: 'Inter, system-ui, sans-serif', fontSize: 14,
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
