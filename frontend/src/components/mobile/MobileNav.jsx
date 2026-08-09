import {CreditCard,Home,History,UserRound} from 'lucide-react'
import {NavLink} from 'react-router-dom'
import {useAuth} from '../../context/AuthContext'

export default function MobileNav(){
  const {user}=useAuth()
  const isAgent=user?.role==='agent'
  return <nav className={`mobile-nav advanced-nav no-scan-nav ${isAgent?'agent-mobile-nav':'user-mobile-nav'}`}>
    <NavLink to="/app" end><Home/><span>Beranda</span></NavLink>
    <NavLink to="/app/history"><History/><span>Riwayat</span></NavLink>
    {isAgent&&<NavLink to="/app/balance/credit"><CreditCard/><span>Kredit</span></NavLink>}
    <NavLink to="/app/profile"><UserRound/><span>Akun</span></NavLink>
  </nav>
}
