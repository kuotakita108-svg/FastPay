import {NavLink, useLocation, useNavigate} from 'react-router-dom'
import {navigation} from '../../constants/navigation'
import {Banknote, BarChart3, CircleHelp, ClipboardCheck, FilePlus2, LogOut, ShieldCheck, Users, WalletCards, Zap} from 'lucide-react'
import {useAuth} from '../../context/AuthContext'
import {initials} from '../../utils/name'

const marketingNavigation = [
  {
    section: 'Marketing Kredit',
    items: [
      {to: '/credit-applications', label: 'Ringkasan Kredit', icon: WalletCards},
      {to: '/credit-applications?view=peminjam', label: 'Data Peminjam', icon: Users},
      {to: '/credit-applications?view=input', label: 'Input Peminjaman', icon: FilePlus2},
      {to: '/credit-applications?view=verifikasi', label: 'Antrean Verifikasi', icon: ClipboardCheck},
      {to: '/credit-applications?view=angsuran', label: 'Angsuran & Lunas', icon: Banknote},
      {to: '/credit-applications?view=laporan', label: 'Laporan Kredit', icon: BarChart3},
    ],
  },
  {
    section: 'Bantuan',
    items: [
      {to: '/credit-applications?view=panduan', label: 'Panduan Marketing', icon: CircleHelp},
    ],
  },
]

const analisNavigation = [
  {
    section: 'Analisis Kredit',
    items: [
      {to: '/credit-applications', label: 'Review Kredit Agent', icon: ShieldCheck},
      {to: '/credit-applications?view=verifikasi', label: 'Menunggu Analisis', icon: ClipboardCheck},
      {to: '/credit-applications?view=laporan', label: 'Laporan Kredit', icon: BarChart3},
    ],
  },
]

export default function Sidebar({open, onClose}) {
  const {user, logout} = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const signOut = () => { logout(); navigate('/login') }
  const role = user.role
  const isMarketing = role === 'marketing'
  const isAnalis = role === 'analis'
  const visibleNavigation = isMarketing ? marketingNavigation : isAnalis ? analisNavigation : navigation
  const home = isMarketing || isAnalis ? '/credit-applications' : '/dashboard'
  const roleLabel = role === 'master' ? 'Master Account' : role === 'marketing' ? 'Marketing Kredit' : role === 'analis' ? 'Analis Kredit' : 'Panel Administrator'
  const current = `${location.pathname}${location.search}`
  const active = to => current === to || (!to.includes('?') && location.pathname === to && !location.search)

  return <aside className={`sidebar ${open ? 'open' : ''}`}>
    <NavLink className="brand" to={home} onClick={onClose}><span><Zap size={20}/></span>KuotaKita</NavLink>
    {isMarketing && <div className="sidebar-role-panel">
      <span>MODE MARKETING</span>
      <strong>Kelola pinjaman agent</strong>
      <small>Input, verifikasi, cicilan, dan laporan dari satu tempat.</small>
    </div>}
    <nav>{visibleNavigation.map(group => <div key={group.section}>
      <p className="nav-label">{group.section}</p>
      {group.items.map(({to, label, icon: Icon, badge}) => <NavLink className={`nav-item ${active(to) ? 'active' : ''}`} to={to} key={to} onClick={onClose}>
        <Icon size={18}/><span>{label}</span>{badge && <b>{badge}</b>}
      </NavLink>)}
    </div>)}</nav>
    <div className="sidebar-bottom">
      <div className="help-card"><CircleHelp/><strong>Pusat Bantuan</strong><small>Tim KuotaKita siap membantu 24/7</small><button>Hubungi Support</button></div>
      <div className="user-card"><span className="avatar coral">{initials(user.name)}</span><div><strong>{user.name}</strong><small>{roleLabel}</small></div><button onClick={signOut} title="Keluar"><LogOut size={16}/></button></div>
    </div>
  </aside>
}
