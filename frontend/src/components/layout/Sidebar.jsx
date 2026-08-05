import {NavLink, useLocation, useNavigate} from 'react-router-dom'
import {navigation} from '../../constants/navigation'
import {Banknote, BarChart3, Camera, CheckCircle2, CircleHelp, ClipboardCheck, FileCheck2, Gauge, Landmark, LockKeyhole, LogOut, ShieldCheck, TrendingUp, UserPlus, Users, WalletCards, XCircle, Zap} from 'lucide-react'
import {useAuth} from '../../context/AuthContext'
import {initials} from '../../utils/name'

const marketingNavigation = [
  {
    section: 'Marketing Kredit',
    items: [
      {to: '/credit-applications', label: 'Ringkasan Kerja', icon: WalletCards},
      {to: '/credit-applications?view=agent-input', label: 'Daftar & Survei Agent', icon: UserPlus},
      {to: '/credit-applications?view=verifikasi', label: 'Survei & Selfie Lapangan', icon: Camera},
      {to: '/credit-applications?view=peminjam', label: 'Agen Binaan', icon: Users},
      {to: '/credit-applications?view=rekomendasi', label: 'Rekomendasi Limit', icon: TrendingUp},
      {to: '/credit-applications?view=komisi', label: 'Kantong Komisi', icon: Banknote},
    ],
  },
]

const operatorNavigation = [
  {
    section: 'Operator Kredit',
    items: [
      {to: '/credit-applications', label: 'Dashboard Operator', icon: ShieldCheck},
      {to: '/credit-applications?view=verifikasi', label: 'Ruang Verifikasi', icon: ClipboardCheck},
      {to: '/credit-applications?view=limit', label: 'Tier & Limit Agent', icon: Gauge},
      {to: '/credit-applications?view=peminjam', label: 'Kredit Aktif', icon: CheckCircle2},
      {to: '/credit-applications?view=pelunasan', label: 'Pelunasan & Bukti', icon: FileCheck2},
      {to: '/credit-applications?view=suspend', label: 'Suspend & Tunggakan', icon: LockKeyhole},
      {to: '/credit-applications?view=h2h', label: 'Monitor Saldo H2H', icon: Landmark},
      {to: '/credit-applications?view=laporan', label: 'Arsip Keputusan', icon: BarChart3},
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
  // "analis" remains supported for existing accounts. New accounts use the
  // clearer Operator role but both open the same controlled panel.
  const isOperator = role === 'operator' || role === 'analis'
  const isCreditAdmin = isOperator || role === 'admin' || role === 'master'
  const visibleNavigation = isMarketing ? marketingNavigation : isCreditAdmin ? operatorNavigation : navigation
  const home = isMarketing || isCreditAdmin ? '/credit-applications' : '/dashboard'
  const roleLabel = role === 'master' ? 'Admin Pusat Kredit' : role === 'marketing' ? 'Marketing Kredit' : isOperator ? 'Operator Kredit' : 'Panel Administrator'
  const current = `${location.pathname}${location.search}`
  const active = to => current === to || (!to.includes('?') && location.pathname === to && !location.search)
  const activeLabel = visibleNavigation.flatMap(group => group.items).find(item => active(item.to))?.label || (isCreditAdmin ? 'Dashboard Operator' : 'Ringkasan Kerja')
  const rolePanel = isMarketing
    ? {eyebrow: 'MODE MARKETING', title: 'Validasi lapangan', description: 'Daftarkan agent, ambil tiga foto langsung, pantau agen binaan, dan kirim rekomendasi limit.'}
    : isCreditAdmin
      ? {eyebrow: isOperator ? 'MODE OPERATOR' : 'MODE ADMIN PUSAT', title: 'Kontrol modal & kredit', description: 'Verifikasi berkas, atur limit, pantau pelunasan, suspend akses, dan cek kesiapan H2H.'}
      : null

  return <aside className={`sidebar ${open ? 'open' : ''}`}>
    <NavLink className="brand" to={home} onClick={onClose}><span><Zap size={20}/></span>KuotaKita</NavLink>
    {rolePanel && <div className={`sidebar-role-panel ${isCreditAdmin ? 'analis-role-panel' : ''}`}>
      <span>{rolePanel.eyebrow}</span>
      <strong>{rolePanel.title}</strong>
      <small>{rolePanel.description}</small>
      <em>Bagian aktif: {activeLabel}</em>
    </div>}
    <nav>{visibleNavigation.map(group => <div key={group.section}>
      <p className="nav-label">{group.section}</p>
      {group.items.map(({to, label, icon: Icon, badge}) => <NavLink className={`nav-item nav-${label.toLowerCase().replace(/[^a-z]+/g, '-')} ${active(to) ? 'active' : ''}`} to={to} key={to} onClick={onClose}>
        <Icon size={18}/><span>{label}</span>{active(to) && label === 'Ringkasan Kerja' && <b className="nav-current">AKTIF</b>}{badge && <b>{badge}</b>}
      </NavLink>)}
    </div>)}</nav>
    <div className="sidebar-bottom">
      <div className="help-card"><CircleHelp/><strong>Pusat Bantuan</strong><small>Tim KuotaKita siap membantu 24/7</small><button>Hubungi Support</button></div>
      <div className="user-card"><span className="avatar coral">{initials(user.name)}</span><div><strong>{user.name}</strong><small>{roleLabel}</small></div><button onClick={signOut} title="Keluar"><LogOut size={16}/></button></div>
    </div>
  </aside>
}
