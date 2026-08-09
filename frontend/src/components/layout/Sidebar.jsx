import {Link, useLocation, useNavigate} from 'react-router-dom'
import {navigation} from '../../constants/navigation'
import {BarChart3, BookOpenCheck, Camera, CheckCircle2, CircleHelp, ClipboardCheck, FileCheck2, Gauge, Landmark, LockKeyhole, LogOut, ShieldCheck, UserPlus, Users, WalletCards, XCircle, Zap} from 'lucide-react'
import {useAuth} from '../../context/AuthContext'
import {initials} from '../../utils/name'

const marketingNavigation = [
  {
    section: 'AKTIVITAS',
    items: [
      {to: '/credit-applications', label: 'Dashboard', icon: WalletCards},
      {to: '/credit-applications?view=agent-input', label: 'Tambah Agent', icon: UserPlus},
      {to: '/credit-applications?view=input', label: 'Pengajuan & Dokumen', icon: ClipboardCheck},
      {to: '/credit-applications?view=verifikasi', label: 'Antrean Survei', icon: Camera},
    ],
  },
  {
    section: 'PORTOFOLIO',
    items: [
      {to: '/credit-applications?view=peminjam', label: 'Agen Binaan', icon: Users},
    ],
  },
  {
    section: 'KINERJA',
    items: [
      {to: '/credit-applications?view=laporan', label: 'Laporan', icon: BarChart3},
      {to: '/credit-applications?view=panduan', label: 'Panduan', icon: BookOpenCheck},
    ],
  },
]

const operatorNavigation = [
  {
    section: 'RINGKASAN',
    items: [
      {to: '/credit-applications', label: 'Dashboard', icon: ShieldCheck},
    ],
  },
  {
    section: 'KEPUTUSAN KREDIT',
    items: [
      {to: '/credit-applications?view=verifikasi', label: 'Antrean Verifikasi', icon: ClipboardCheck},
      {to: '/credit-applications?view=limit', label: 'Keputusan Limit', icon: Gauge},
    ],
  },
  {
    section: 'PENGAWASAN',
    items: [
      {to: '/credit-applications?view=peminjam', label: 'Kredit Aktif', icon: CheckCircle2},
      {to: '/credit-applications?view=pelunasan', label: 'Pelunasan & Bukti', icon: FileCheck2},
      {to: '/credit-applications?view=suspend', label: 'Suspend & Tunggakan', icon: LockKeyhole},
      {to: '/credit-applications?view=laporan', label: 'Arsip Keputusan', icon: BarChart3},
    ],
  },
  {
    section: 'SISTEM',
    items: [
      {to: '/credit-applications?view=h2h', label: 'Transaksi & Saldo H2H', icon: Landmark},
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
  const activeLabel = visibleNavigation.flatMap(group => group.items).find(item => active(item.to))?.label || (isCreditAdmin ? 'Dashboard' : 'Ringkasan Kerja')
  const rolePanel = isMarketing
    ? {eyebrow: 'MODE MARKETING', title: 'Validasi lapangan', description: 'Daftarkan agent, ambil tiga foto langsung, pantau agen binaan, dan kirim rekomendasi limit.'}
    : isCreditAdmin
      ? {eyebrow: isOperator ? 'MODE OPERATOR' : 'MODE ADMIN PUSAT', title: 'Kontrol modal & kredit', description: 'Verifikasi berkas, atur limit, pantau pelunasan, suspend akses, dan cek kesiapan H2H.'}
      : null

  return <aside className={`sidebar ${open ? 'open' : ''}${rolePanel ? ' credit-sidebar' : ''}`}>
    <Link className="brand" to={home} onClick={onClose}><span><Zap size={20}/></span>KuotaKita</Link>
    {rolePanel && <div className={`sidebar-role-panel ${isCreditAdmin ? 'analis-role-panel' : ''}`}>
      <span>{rolePanel.eyebrow}</span>
      <strong>{rolePanel.title}</strong>
      <small>Bagian aktif: {activeLabel}</small>
    </div>}
    <nav className={rolePanel ? 'workspace-nav' : ''}>{visibleNavigation.map(group => <div key={group.section}>
      <p className="nav-label">{group.section}</p>
      {group.items.map(({to, label, icon: Icon, badge}) => <Link className={`nav-item nav-${label.toLowerCase().replace(/[^a-z]+/g, '-')} ${active(to) ? 'active' : ''}`} to={to} key={to} onClick={onClose}>
        <Icon size={18}/><span>{label}</span>{active(to) && label === 'Ringkasan Kerja' && <b className="nav-current">AKTIF</b>}{badge && <b>{badge}</b>}
      </Link>)}
    </div>)}</nav>
    <div className="sidebar-bottom">
      <div className="help-card"><CircleHelp/><strong>Pusat Bantuan</strong><small>Tim KuotaKita siap membantu 24/7</small><button>Hubungi Support</button></div>
      <div className="user-card"><span className="avatar coral">{initials(user.name)}</span><div><strong>{user.name}</strong><small>{roleLabel}</small></div><button onClick={signOut} title="Keluar"><LogOut size={16}/></button></div>
    </div>
  </aside>
}
