import {createContext,useContext,useLayoutEffect,useState} from 'react'
import {useLocation} from 'react-router-dom'

const ThemeContext=createContext()

// Mode gelap hanya milik panel kerja (marketing/operator/admin). Aplikasi
// agen tetap terang agar tombol bulan dari panel tidak "terbawa" ke /app.
const isPanelPath=pathname=>!pathname.startsWith('/app')&&pathname!=='/login'

export function ThemeProvider({children}){
  const location=useLocation()
  const [dark,setDark]=useState(()=>localStorage.getItem('panel-theme')==='dark')
  const panelActive=isPanelPath(location.pathname)

  useLayoutEffect(()=>{
    document.documentElement.dataset.theme=panelActive&&dark?'dark':'light'
    document.documentElement.style.colorScheme=panelActive&&dark?'dark':'light'
  },[dark,panelActive])

  const toggle=()=>setDark(value=>{
    const next=!value
    localStorage.setItem('panel-theme',next?'dark':'light')
    return next
  })

  return <ThemeContext.Provider value={{dark:panelActive&&dark,toggle}}>{children}</ThemeContext.Provider>
}

export const useTheme=()=>useContext(ThemeContext)
