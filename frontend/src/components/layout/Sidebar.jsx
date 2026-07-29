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
    ],
  },
]

const analisNavigation = [
  {
    section: 'Analisis Kredit',
    items: [
      {to: '/credit-applications', label: 'Meja Analisis', icon: ShieldCheck},
      {to: '/credit-applications?view=verifikasi', label: 'Keputusan Analis', icon: ClipboardCheck},
      {to: '/credit-applications?view=laporan', label: 'Rekap Keputusan', icon: BarChart3},
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
  const activeLabel = visibleNavigation.flatMap(group => group.items).find(item => active(item.to))?.label || (isAnalis ? 'Meja Analisis' : 'Ringkasan Kredit')
  const rolePanel = isMarketing
    ? {eyebrow: 'MODE MARKETING', title: 'Kelola pengajuan agent', description: 'Validasi data, selfie pertemuan, verifikasi, lalu pantau cicilan.'}
    : isAnalis
      ? {eyebrow: 'MODE ANALIS', title: 'Keputusan akhir kredit', description: 'Periksa hanya berkas yang sudah diverifikasi Marketing, lalu terima atau tolak.'}
      : null

  return <aside className={`sidebar ${open ? 'open' : ''}`}>
    <NavLink className="brand" to={home} onClick={onClose}><span><Zap size={20}/></span>KuotaKita</NavLink>
    {rolePanel && <div className={`sidebar-role-panel ${isAnalis ? 'analis-role-panel' : ''}`}>
      <span>{rolePanel.eyebrow}</span>
      <strong>{rolePanel.title}</strong>
      <small>{rolePanel.description}</small>
      <em>Bagian aktif: {activeLabel}</em>
    </div>}
    <nav>{visibleNavigation.map(group => <div key={group.section}>
      <p className="nav-label">{group.section}</p>
      {group.items.map(({to, label, icon: Icon, badge}) => <NavLink className={`nav-item nav-${label.toLowerCase().replace(/[^a-z]+/g, '-')} ${active(to) ? 'active' : ''}`} to={to} key={to} onClick={onClose}>
        <Icon size={18}/><span>{label}</span>{active(to) && label === 'Ringkasan Kredit' && <b className="nav-current">AKTIF</b>}{badge && <b>{badge}</b>}
      </NavLink>)}
    </div>)}</nav>
    <div className="sidebar-bottom">
      <div className="help-card"><CircleHelp/><strong>Pusat Bantuan</strong><small>Tim KuotaKita siap membantu 24/7</small><button>Hubungi Support</button></div>
      <div className="user-card"><span className="avatar coral">{initials(user.name)}</span><div><strong>{user.name}</strong><small>{roleLabel}</small></div><button onClick={signOut} title="Keluar"><LogOut size={16}/></button></div>
    </div>
  </aside>
}
