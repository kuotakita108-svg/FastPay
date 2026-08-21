import {Home,History,UserRound} from 'lucide-react'
import {NavLink} from 'react-router-dom'

export default function MobileNav(){
  return <nav className="mobile-nav advanced-nav no-scan-nav user-mobile-nav">
    <NavLink to="/app" end><Home/><span>Beranda</span></NavLink>
    <NavLink to="/app/history"><History/><span>Riwayat</span></NavLink>
    <NavLink to="/app/profile"><UserRound/><span>Akun</span></NavLink>
  </nav>
}
