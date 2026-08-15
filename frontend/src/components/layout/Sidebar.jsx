import {useState} from 'react'
import {Link, useLocation, useNavigate} from 'react-router-dom'
import {navigation} from '../../constants/navigation'
import {Activity, BarChart3, BookOpenCheck, Boxes, CalendarClock, Camera, CheckCircle2, ChevronDown, CircleHelp, ClipboardCheck, CreditCard, FileCheck2, Headphones, Landmark, LockKeyhole, LogOut, PhoneCall, Settings, ShieldCheck, UserPlus, Users, WalletCards} from 'lucide-react'
import {useAuth} from '../../context/AuthContext'
import {initials} from '../../utils/name'

const marketingNavigation = [
  {
    section: 'KEPUTUSAN',
    items: [
      {to: '/credit-applications', label: 'Dashboard Marketing', icon: WalletCards},
      {to: '/credit-applications?view=agent-input', label: 'Registrasi Agent', icon: UserPlus},
      {to: '/credit-applications?view=input', label: 'Pengajuan Kredit', icon: ClipboardCheck},
      {to: '/credit-applications?view=verifikasi', label: 'Survei & Dokumen', icon: Camera},
    ],
  },
  {
    section: 'KONTROL KREDIT',
    items: [
      {to: '/credit-applications?view=peminjam', label: 'Agent Binaan', icon: Users},
      {to: '/credit-applications?view=agenda', label: 'Agenda Lapangan', icon: CalendarClock},
    ],
  },
  {
    section: 'KINERJA',
    items: [
      {to: '/credit-applications?view=kontak', label: 'Kontak Agent', icon: PhoneCall},
      {to: '/credit-applications?view=panduan', label: 'Panduan Kerja', icon: BookOpenCheck},
    ],
  },
]

const operatorNavigation = [
  {
    section: 'AKTIVITAS',
    items: [
      {to: '/credit-applications', label: 'Dashboard Operator', icon: ShieldCheck},
      {to: '/credit-applications?view=verifikasi', label: 'Verifikasi Pengajuan', icon: ClipboardCheck},
    ],
  },
  {
    section: 'PORTOFOLIO',
    items: [
      {to: '/credit-applications?view=peminjam', label: 'Kredit Agent Aktif', icon: CheckCircle2},
      {to: '/credit-applications?view=jatuh-tempo', label: 'Jadwal Tagihan', icon: CalendarClock},
      {to: '/credit-applications?view=pelunasan', label: 'Verifikasi Pelunasan', icon: FileCheck2},
      {to: '/credit-applications?view=suspend', label: 'Kontrol Akses Agent', icon: LockKeyhole},
    ],
  },
  {section: 'TIM & PENGAWASAN', items: [
    {to: '/credit-applications?view=laporan', label: 'Penugasan Marketing', icon: BarChart3},
    {to: '/credit-applications?view=kinerja-marketing', label: 'Kinerja Marketing', icon: Users},
  ]},
]

const superAdminNavigation = [
  {section: 'RINGKASAN', items: [
    {to: '/credit-applications', label: 'Dashboard Super Admin', icon: ShieldCheck},
  ]},
  {section: 'BISNIS APLIKASI', items: [
    {to: '/transactions', label: 'Transaksi Pengguna', icon: Activity},
    {to: '/products', label: 'Katalog Layanan', icon: Boxes},
    {to: '/customers', label: 'Manajemen Pengguna', icon: Users},
  ]},
  {section: 'KEUANGAN', items: [
    {to: '/analytics', label: 'Ringkasan Bisnis', icon: BarChart3},
    {to: '/invoices', label: 'Arsip Pembayaran', icon: FileCheck2},
    {to: '/payment-methods', label: 'Metode Pembayaran', icon: CreditCard},
    {to: '/credit-applications?view=h2h', label: 'Provider H2H', icon: Landmark},
  ]},
  {section: 'TIM & KREDIT', items: [
    {to: '/credit-applications?view=peminjam', label: 'Kredit Agent', icon: WalletCards},
    {to: '/credit-applications?view=jatuh-tempo', label: 'Risiko Kredit', icon: CalendarClock},
    {to: '/credit-applications?view=pelunasan', label: 'Rekonsiliasi Pelunasan', icon: FileCheck2},
    {to: '/credit-applications?view=kinerja-marketing', label: 'Kinerja Marketing', icon: Users},
  ]},
  {section: 'KEAMANAN & SISTEM', items: [
    {to: '/credit-applications?view=transaksi-agent', label: 'Transaksi Agent', icon: Activity},
    {to: '/credit-applications?view=helpdesk', label: 'Pusat Komplain', icon: Headphones},
    {to: '/settings', label: 'Konfigurasi Aplikasi', icon: Settings},
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
  const [ownerSections, setOwnerSections] = useState({'RINGKASAN': true})
  const visibleNavigation = isMarketing ? marketingNavigation : isSuperAdmin ? superAdminNavigation : isCreditAdmin ? operatorNavigation : navigation
  const home = isMarketing || isCreditAdmin ? '/credit-applications' : '/dashboard'
  const roleLabel = role === 'master' ? 'Super Admin / Owner' : role === 'marketing' ? 'Marketing Kredit' : isOperator || role === 'admin' ? 'Operator Kredit' : 'Panel Administrator'
  const current = `${location.pathname}${location.search}`
  const active = to => current === to || (!to.includes('?') && location.pathname === to && !location.search)
  const activeLabel = visibleNavigation.flatMap(group => group.items).find(item => active(item.to))?.label || (isCreditAdmin ? 'Dashboard' : 'Ringkasan Kerja')
  const rolePanel = isMarketing
    ? {eyebrow: 'MODE MARKETING', title: 'Validasi lapangan', description: 'Daftarkan agent, lengkapi empat foto wajib, pantau agent binaan, dan kerjakan tugas Operator.'}
    : isCreditAdmin
      ? isSuperAdmin
        ? {eyebrow: 'MODE SUPER ADMIN', title: 'Kontrol seluruh sistem', description: 'Pantau bisnis, keuangan, pengguna, produk, tim, provider, dan keamanan aplikasi.'}
        : {eyebrow: 'MODE OPERATOR', title: 'Keputusan akhir kredit', description: 'Fokus memeriksa berkas, menentukan limit, memantau kredit, pelunasan, dan risiko agent.'}
      : null

  return <aside className={`sidebar ${open ? 'open' : ''}${rolePanel ? ' credit-sidebar' : ''}`}>
    <Link className="brand console-brand" to={home} onClick={onClose} aria-label="KuotaKita">
      <img className="console-brand-image" src="/branding/kuotakita-console-logo.png" alt="KuotaKita"/>
      {rolePanel && <small className="console-brand-role">{isMarketing ? 'Marketing Console' : isSuperAdmin ? 'Owner Console' : 'Operator Console'}</small>}
    </Link>
    {rolePanel && <div className={`sidebar-role-panel ${isCreditAdmin ? 'analis-role-panel' : ''}`}>
      <span>{rolePanel.eyebrow}</span>
      <strong>{rolePanel.title}</strong>
      <small>Bagian aktif: {activeLabel}</small>
    </div>}
    <nav className={`${rolePanel ? 'workspace-nav' : ''}${isSuperAdmin ? ' owner-workspace-nav' : ''}`}>{visibleNavigation.map(group => {const sectionOpen=ownerSections[group.section]??group.items.some(item=>active(item.to));return <div className={isSuperAdmin && !sectionOpen ? 'section-collapsed' : ''} key={group.section}>
      {isSuperAdmin ? <button type="button" className="nav-section-toggle" aria-expanded={sectionOpen} onClick={() => setOwnerSections(current => ({...current, [group.section]: !sectionOpen}))}><span>{group.section}</span><ChevronDown/></button> : <p className="nav-label">{group.section}</p>}
      <div className="nav-section-items">{group.items.map(({to, label, icon: Icon}) => <Link className={`nav-item nav-${label.toLowerCase().replace(/[^a-z]+/g, '-')} ${active(to) ? 'active' : ''}`} to={to} key={to} onClick={onClose}>
        <Icon size={18}/><span>{label}</span>
      </Link>)}</div>
    </div>})}</nav>
    <div className="sidebar-bottom">
      <div className="help-card"><CircleHelp/><strong>Pusat Bantuan</strong><small>Tim KuotaKita siap membantu 24/7</small><button>Hubungi Support</button></div>
      <div className="user-card"><span className="avatar coral">{initials(user.name)}</span><div><strong>{user.name}</strong><small>{roleLabel}</small></div><button onClick={signOut} title="Keluar"><LogOut size={16}/></button></div>
    </div>
  </aside>
}
