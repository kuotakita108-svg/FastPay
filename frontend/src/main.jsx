import React from 'react'
import ReactDOM from 'react-dom/client'
import {BrowserRouter} from 'react-router-dom'
import App from './App'
import {ThemeProvider} from './context/ThemeContext'
import {ToastProvider} from './context/ToastContext'
import {AuthProvider} from './context/AuthContext'
import {env} from './config/env'
import heroImage from './assets/images/kuotakita-ppob-hero-v4.png'
import './styles/global.css'

// Hero adalah gambar pertama yang terlihat pada login dan beranda.
// Preload membuatnya mulai diunduh tanpa menunggu komponen selesai dirender.
const heroPreload=document.createElement('link')
heroPreload.rel='preload'
heroPreload.as='image'
heroPreload.href=heroImage
heroPreload.fetchPriority='high'
document.head.appendChild(heroPreload)

ReactDOM.createRoot(document.getElementById('root')).render(<React.StrictMode><BrowserRouter basename={env.basePath}><ThemeProvider><ToastProvider><AuthProvider><App/></AuthProvider></ToastProvider></ThemeProvider></BrowserRouter></React.StrictMode>)
