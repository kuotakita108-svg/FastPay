import React from 'react'
import ReactDOM from 'react-dom/client'
import {BrowserRouter,useLocation} from 'react-router-dom'
import App from './App'
import {ThemeProvider} from './context/ThemeContext'
import {ToastProvider} from './context/ToastContext'
import {AuthProvider} from './context/AuthContext'
import {env} from './config/env'
import AppErrorBoundary from './components/common/AppErrorBoundary'
import {clearRecoveryMarker,recoverApplication} from './utils/recoverApplication'
import heroImage from './assets/images/kuotakita-ppob-hero-v4.webp'
import './styles/global.css'
// Loaded after the legacy stylesheet bundle so the final Operator theme cannot
// be partially overwritten by older dark-console rules.
import './styles/operator-workspace-light.css'

// Hero adalah gambar pertama yang terlihat pada login dan beranda.
// Preload membuatnya mulai diunduh tanpa menunggu komponen selesai dirender.
if (window.location.pathname === '/login') {
  const heroPreload=document.createElement('link')
  heroPreload.rel='preload'
  heroPreload.as='image'
  heroPreload.href=heroImage
  heroPreload.fetchPriority='high'
  document.head.appendChild(heroPreload)
}

// PWA KuotaKita memakai service worker berversi agar manifest dan ikon instalasi
// terbaru menggantikan aset lama pada perangkat yang sudah pernah membuka app.
// Vite memancarkan event ini ketika HTML lama meminta chunk yang sudah diganti
// saat deploy. Pulihkan cache satu kali tanpa menjebak pengguna di reload loop.
window.addEventListener('vite:preloadError',event=>{
  event.preventDefault()
  recoverApplication({automatic:true})
})
window.setTimeout(clearRecoveryMarker,12000)

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js?v=6').then(registration => registration.update()).catch(() => {})
  }, {once: true})
}

function StableApp(){
  const location=useLocation()
  return <AppErrorBoundary resetKey={`${location.pathname}${location.search}`}><App/></AppErrorBoundary>
}

ReactDOM.createRoot(document.getElementById('root')).render(<React.StrictMode><BrowserRouter basename={env.basePath}><ThemeProvider><ToastProvider><AuthProvider><StableApp/></AuthProvider></ToastProvider></ThemeProvider></BrowserRouter></React.StrictMode>)
