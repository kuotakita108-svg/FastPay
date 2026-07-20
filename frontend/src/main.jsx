import React from 'react'
import ReactDOM from 'react-dom/client'
import {BrowserRouter} from 'react-router-dom'
import App from './App'
import {ThemeProvider} from './context/ThemeContext'
import {ToastProvider} from './context/ToastContext'
import {AuthProvider} from './context/AuthContext'
import './styles/global.css'

if('serviceWorker' in navigator){navigator.serviceWorker.getRegistrations().then(items=>items.forEach(item=>item.unregister()))}
if('caches' in window){caches.keys().then(keys=>Promise.all(keys.filter(key=>key.startsWith('fastpay-')).map(key=>caches.delete(key))))}

ReactDOM.createRoot(document.getElementById('root')).render(<React.StrictMode><BrowserRouter><ThemeProvider><ToastProvider><AuthProvider><App/></AuthProvider></ToastProvider></ThemeProvider></BrowserRouter></React.StrictMode>)
