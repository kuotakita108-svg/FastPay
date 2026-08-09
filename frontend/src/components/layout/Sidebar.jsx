import {useEffect, useMemo, useState} from 'react'
import {Link, useLocation, useNavigate} from 'react-router-dom'
import {navigation} from '../../constants/navigation'
import {BarChart3, BookOpenCheck, Camera, CheckCircle2, CircleHelp, ClipboardCheck, FileCheck2, Gauge, Landmark, LockKeyhole, LogOut, ShieldCheck, UserPlus, Users, WalletCards, XCircle, Zap} from 'lucide-react'
import {useAuth} from '../../context/AuthContext'
import {initials} from '../../utils/name'
import {request} from '../../services/http'

const marketingNavigation = [
  {
    section: 'AKTIVITAS',
    items: [
      {to: '/credit-applications', label: 'Dashboard', icon: WalletCards},
      {to: '/credit-applications?view=agent-input', label: 'Tambah Agent', icon: UserPlus},
      {to: '/credit-applications?view=input', label: 'Pengajuan Kredit', icon: ClipboardCheck},
      {to: '/credit-applications?view=verifikasi', label: 'Dokumen & Survei', icon: Camera},
    ],
  },
  {
    section: 'PORTOFOLIO',
    items: [
      {to: '/credit-applications?view=peminjam', label: 'Agen Binaan', icon: Users},
      {to: '/credit-applications?view=angsuran', label: 'Buku Tagihan', icon: FileCheck2},
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
    section: 'PEMERIKSAAN',
    items: [
      {to: '/credit-applications?view=verifikasi', label: 'Antrean Keputusan', icon: ClipboardCheck, badgeKey: 'review'},
      {to: '/credit-applications?view=limit', label: 'Limit & Tier Agent', icon: Gauge, badgeKey: 'managed'},
    ],
  },
  {
    section: 'PORTOFOLIO KREDIT',
    items: [
      {to: '/credit-applications?view=peminjam', label: 'Agent & Kredit Aktif', icon: CheckCircle2, badgeKey: 'active'},
      {to: '/credit-applications?view=pelunasan', label: 'Verifikasi Pelunasan', icon: FileCheck2, badgeKey: 'payments'},
      {to: '/credit-applications?view=suspend', label: 'Risiko & Akses Agent', icon: LockKeyhole, badgeKey: 'risk'},
    ],
  },
  {
    section: 'OPERASIONAL',
    items: [
      {to: '/credit-applications?view=h2h', label: 'Transaksi & Saldo H2H', icon: Landmark},
      {to: '/credit-applications?view=laporan', label: 'Laporan & Audit', icon: BarChart3},
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
  const [workCounts, setWorkCounts] = useState({})
  useEffect(() => {
    if (!isCreditAdmin) return undefined
    let active = true
    const load = () => request('/agent-credit/applications').then(rows => {
      if (!active || !Array.isArray(rows)) return
      const now = Date.now()
      setWorkCounts({
        review: rows.filter(item => item.status === 'Menunggu keputusan operator').length,
        managed: new Set(rows.filter(item => ['Disetujui', 'Lunas'].includes(item.status) || item.paymentStatus === 'Lunas').map(item => item.userId || item.form?.whatsapp || item.userName)).size,
        active: rows.filter(item => item.status === 'Disetujui' && item.paymentStatus !== 'Lunas').length,
        payments: rows.filter(item => (item.repayments || []).some(payment => payment.status === 'Menunggu verifikasi')).length,
        risk: rows.filter(item => item.agentAccessStatus === 'suspended' || (item.status === 'Disetujui' && item.paymentStatus !== 'Lunas' && item.dueAt && new Date(item.dueAt).getTime() < now)).length,
      })
    }).catch(() => {})
    load()
    const timer = window.setInterval(load, 15000)
    return () => { active = false; window.clearInterval(timer) }
  }, [isCreditAdmin])
  const visibleNavigation = useMemo(() => {
    const source = isMarketing ? marketingNavigation : isCreditAdmin ? operatorNavigation : navigation
    return source.map(group => ({...group, items: group.items.map(item => ({...item, badge: item.badgeKey && workCounts[item.badgeKey] > 0 ? workCounts[item.badgeKey] : item.badge}))}))
  }, [isMarketing, isCreditAdmin, workCounts])
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
