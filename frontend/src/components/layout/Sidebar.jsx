import {useEffect, useMemo, useState} from 'react'
import {Link, useLocation, useNavigate} from 'react-router-dom'
import {navigation} from '../../constants/navigation'
import {Activity, BarChart3, BookOpenCheck, CalendarClock, Camera, CheckCircle2, CircleHelp, ClipboardCheck, FileCheck2, Gauge, Headphones, Landmark, LockKeyhole, LogOut, PhoneCall, ShieldCheck, UserPlus, Users, WalletCards, Zap} from 'lucide-react'
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
      {to: '/credit-applications?view=verifikasi', label: 'Validasi Lapangan', icon: Camera},
    ],
  },
  {
    section: 'PORTOFOLIO',
    items: [
      {to: '/credit-applications?view=peminjam', label: 'Portofolio Binaan', icon: Users},
      {to: '/credit-applications?view=agenda', label: 'Tugas Lapangan', icon: CalendarClock},
    ],
  },
  {
    section: 'KINERJA',
    items: [
      {to: '/credit-applications?view=kontak', label: 'Hubungi Agent', icon: PhoneCall},
      {to: '/credit-applications?view=panduan', label: 'Panduan', icon: BookOpenCheck},
    ],
  },
]

const operatorNavigation = [
  {
    section: 'PUSAT KERJA',
    items: [
      {to: '/credit-applications', label: 'Dashboard Operator', icon: ShieldCheck},
      {to: '/credit-applications?view=verifikasi', label: 'Antrean Keputusan', icon: ClipboardCheck, badgeKey: 'review'},
    ],
  },
  {
    section: 'PENGAWASAN KREDIT',
    items: [
      {to: '/credit-applications?view=peminjam', label: 'Agen & Kredit Aktif', icon: CheckCircle2, badgeKey: 'active'},
      {to: '/credit-applications?view=jatuh-tempo', label: 'Jatuh Tempo', icon: CalendarClock, badgeKey: 'due'},
      {to: '/credit-applications?view=pelunasan', label: 'Verifikasi Pelunasan', icon: FileCheck2, badgeKey: 'payments'},
      {to: '/credit-applications?view=suspend', label: 'Risiko & Akses', icon: LockKeyhole, badgeKey: 'risk'},
    ],
  },
  {section: 'LAPORAN & TIM', items: [
    {to: '/credit-applications?view=laporan', label: 'Audit & Rekonsiliasi', icon: BarChart3},
    {to: '/credit-applications?view=kinerja-marketing', label: 'Kinerja Marketing', icon: Users},
  ]},
]

const superAdminNavigation = [
  {section: 'KONTROL PUSAT', items: [
    {to: '/credit-applications', label: 'Dasbor Super Admin', icon: ShieldCheck},
    {to: '/credit-applications?view=verifikasi', label: 'Antrean Keputusan', icon: ClipboardCheck, badgeKey: 'review'},
    {to: '/credit-applications?view=peminjam', label: 'Seluruh Kredit Agent', icon: Users, badgeKey: 'active'},
    {to: '/credit-applications?view=limit', label: 'Limit & Tier', icon: Gauge, badgeKey: 'managed'},
    {to: '/credit-applications?view=pelunasan', label: 'Verifikasi Pelunasan', icon: FileCheck2, badgeKey: 'payments'},
    {to: '/credit-applications?view=suspend', label: 'Risiko & Akses', icon: LockKeyhole, badgeKey: 'risk'},
  ]},
  {section: 'RAHASIA OWNER', items: [
    {to: '/credit-applications?view=h2h', label: 'Saldo & Transaksi H2H', icon: Landmark},
    {to: '/credit-applications?view=transaksi-agent', label: 'Monitor Transaksi Agen', icon: Activity},
    {to: '/credit-applications?view=helpdesk', label: 'Helpdesk & Refund', icon: Headphones},
    {to: '/credit-applications?view=laporan', label: 'Laporan & Audit', icon: BarChart3},
  ]},
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
  const isSuperAdmin = role === 'master'
  const isCreditAdmin = isOperator || role === 'admin' || role === 'master'
  const [workCounts, setWorkCounts] = useState({})
  useEffect(() => {
    if (!isCreditAdmin) return undefined
    let active = true
    const load = () => request('/agent-credit/applications').then(rows => {
      if (!active || !Array.isArray(rows)) return
      const now = Date.now()
      const nextCounts = {
        review: rows.filter(item => item.status === 'Menunggu keputusan operator').length,
        managed: new Set(rows.filter(item => ['Disetujui', 'Lunas'].includes(item.status) || item.paymentStatus === 'Lunas').map(item => item.userId || item.form?.whatsapp || item.userName)).size,
        active: rows.filter(item => item.status === 'Disetujui' && item.paymentStatus !== 'Lunas').length,
        due: rows.filter(item => item.status === 'Disetujui' && item.paymentStatus !== 'Lunas' && item.dueAt && new Date(item.dueAt).getTime() <= now + (7 * 86400000)).length,
        payments: rows.filter(item => (item.repayments || []).some(payment => payment.status === 'Menunggu verifikasi')).length,
        risk: rows.filter(item => item.agentAccessStatus === 'suspended' || (item.status === 'Disetujui' && item.paymentStatus !== 'Lunas' && item.dueAt && new Date(item.dueAt).getTime() < now)).length,
      }
      setWorkCounts(current => Object.keys(nextCounts).every(key => current[key] === nextCounts[key]) ? current : nextCounts)
    }).catch(() => {})
    load()
    const timer = window.setInterval(load, 45000)
    return () => { active = false; window.clearInterval(timer) }
  }, [isCreditAdmin])
  const visibleNavigation = useMemo(() => {
    const source = isMarketing ? marketingNavigation : isSuperAdmin ? superAdminNavigation : isCreditAdmin ? operatorNavigation : navigation
    return source.map(group => ({...group, items: group.items.map(item => ({...item, badge: item.badgeKey && workCounts[item.badgeKey] > 0 ? workCounts[item.badgeKey] : item.badge}))}))
  }, [isMarketing, isSuperAdmin, isCreditAdmin, workCounts])
  const home = isMarketing || isCreditAdmin ? '/credit-applications' : '/dashboard'
  const roleLabel = role === 'master' ? 'Super Admin / Owner' : role === 'marketing' ? 'Marketing Kredit' : isOperator || role === 'admin' ? 'Operator Kredit' : 'Panel Administrator'
  const current = `${location.pathname}${location.search}`
  const active = to => current === to || (!to.includes('?') && location.pathname === to && !location.search)
  const activeLabel = visibleNavigation.flatMap(group => group.items).find(item => active(item.to))?.label || (isCreditAdmin ? 'Dashboard' : 'Ringkasan Kerja')
  const rolePanel = isMarketing
    ? {eyebrow: 'MODE MARKETING', title: 'Validasi lapangan', description: 'Daftarkan agent, ambil tiga foto langsung, pantau agen binaan, dan kirim rekomendasi limit.'}
    : isCreditAdmin
      ? isSuperAdmin
        ? {eyebrow: 'MODE SUPER ADMIN', title: 'Kontrol pusat & H2H', description: 'Akses owner untuk modal, H2H, audit, dan seluruh operasional kredit.'}
        : {eyebrow: 'MODE OPERATOR', title: 'Keputusan akhir kredit', description: 'Fokus memeriksa berkas, menentukan limit, memantau kredit, pelunasan, dan risiko agent.'}
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
