import {useEffect,useState} from 'react'
import {Link, useLocation, useNavigate} from 'react-router-dom'
import {navigation} from '../../constants/navigation'
import {Activity, BarChart3, BookOpenCheck, Boxes, CalendarClock, CheckCircle2, ChevronDown, CircleHelp, CreditCard, FileCheck2, Landmark, LogOut, PhoneCall, ShieldCheck, UserPlus, Users, WalletCards} from 'lucide-react'
import {useAuth} from '../../context/AuthContext'
import {initials} from '../../utils/name'

const marketingNavigation = [
  {
    section: 'AGENT BINAAN',
    items: [
      {to: '/credit-applications', label: 'Ringkasan Hari Ini', icon: WalletCards},
      {to: '/credit-applications?view=agent-input', label: 'Daftarkan Agent', icon: UserPlus},
      {to: '/credit-applications?view=peminjam', label: 'Agent Saya', icon: Users},
    ],
  },
  {
    section: 'AKTIVITAS LAPANGAN',
    items: [
      {to: '/credit-applications?view=agenda', label: 'Perlu Follow-up', icon: CalendarClock},
      {to: '/credit-applications?view=kontak', label: 'Hasil Follow-up', icon: PhoneCall},
    ],
  },
  {section: 'BANTUAN KERJA', items: [
    {to: '/credit-applications?view=panduan', label: 'Panduan Onboarding', icon: BookOpenCheck},
  ]},
]

const operatorNavigation = [
  {
    section: '',
    items: [
      {to: '/credit-applications', label: 'Dashboard', icon: ShieldCheck},
      {to: '/credit-applications?view=pinjaman-retail', label: 'Kredit Retail', icon: CreditCard},
      {to: '/credit-applications?view=migrasi-data', label: 'Migrasi Data Lama', icon: FileCheck2},
      {to: '/credit-applications?view=konter-tidak-transaksi', label: 'Konter Tidak Transaksi', icon: CalendarClock},
      {to: '/credit-applications?view=perputaran-uang', label: 'Perputaran Uang Konter', icon: Activity},
    ],
  },
]

const superAdminNavigation = [
  {section: 'RINGKASAN', items: [
    {to: '/dashboard', label: 'Dashboard', icon: ShieldCheck},
    {to: '/admin/business-report', label: 'Laporan Bisnis', icon: BarChart3},
  ]},
  {section: 'AKUN & KOMISI', items: [
    {to: '/customers', label: 'Akun & Role', icon: Users},
    {to: '/analytics', label: 'Komisi Retail', icon: BarChart3},
  ]},
  {section: 'OPERASIONAL TRANSAKSI', items: [
    {to: '/transactions', label: 'Transaksi Retail', icon: Activity},
    {to: '/transactions?scope=fulfillment', label: 'Fulfillment Retail', icon: CheckCircle2},
    {to: '/invoices?scope=refund', label: 'Refund Guest Pending', icon: FileCheck2},
    {to: '/admin/h2h', label: 'Transaksi H2H', icon: Landmark},
  ]},
  {section: 'KEUANGAN', items: [
    {to: '/payment-methods', label: 'Permintaan Deposit', icon: CreditCard},
    {to: '/invoices?scope=va', label: 'Deposit VA', icon: Landmark},
    {to: '/transactions?scope=member-wallet', label: 'Dompet Member', icon: WalletCards},
  ]},
  {section: 'KREDIT RETAIL', items: [
    {to: '/credit-applications?view=pinjaman-retail', label: 'Kredit Retail', icon: CreditCard},
    {to: '/credit-applications?view=migrasi-data', label: 'Migrasi Data Lama', icon: FileCheck2},
    {to: '/credit-applications?view=konter-tidak-transaksi', label: 'Konter Tidak Transaksi', icon: CalendarClock},
    {to: '/credit-applications?view=perputaran-uang', label: 'Perputaran Uang Konter', icon: WalletCards},
  ]},
  {section: 'PRODUK & HARGA', items: [
    {to: '/products', label: 'Produk', icon: Boxes},
  ]},
  {section: 'MONITORING & AUDIT', items: [
    {to: '/monitoring-audit/products', label: 'Produk Sukses Harian', icon: CheckCircle2},
    {to: '/monitoring-audit/wallet', label: 'Aktivitas Wallet', icon: WalletCards},
    {to: '/monitoring-audit/status', label: 'Log Status Member', icon: Users},
  ]},
]

export default function Sidebar({open, onClose}) {
  const {user, logout} = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const signOut = () => { logout(); navigate('/login') }
  const role = String(user?.role || 'user').toLowerCase()
  const displayName = user?.name || user?.full_name || user?.fullName || user?.username || user?.email || 'Pengguna KuotaKita'
  const isMarketing = role === 'marketing'
  // "analis" remains supported for existing accounts. New accounts use the
  // clearer Operator role but both open the same controlled panel.
  const isOperator = role === 'operator' || role === 'analis'
  const isSuperAdmin = role === 'master'
  const isCreditAdmin = isOperator || role === 'admin' || role === 'master'
  const visibleNavigation = isMarketing ? marketingNavigation : isSuperAdmin ? superAdminNavigation : isCreditAdmin ? operatorNavigation : navigation
  const home = isSuperAdmin ? '/dashboard' : isMarketing || isCreditAdmin ? '/credit-applications' : '/dashboard'
  const roleLabel = role === 'master' ? 'Super Admin / Owner' : role === 'marketing' ? 'Marketing Kredit' : isOperator || role === 'admin' ? 'Operator Kredit' : 'Panel Administrator'
  const current = `${location.pathname}${location.search}`
  const active = to => current === to || (!to.includes('?') && location.pathname === to && !location.search)
  const activeWorkspaceSection = visibleNavigation.find(group => group.items.some(item => active(item.to)))?.section
  const [openWorkspaceSections, setOpenWorkspaceSections] = useState(() => ({
    [visibleNavigation[0]?.section || '']: true,
    ...(activeWorkspaceSection ? {[activeWorkspaceSection]: true} : {}),
  }))
  useEffect(() => {
    if (!activeWorkspaceSection) return
    setOpenWorkspaceSections(sections => sections[activeWorkspaceSection] ? sections : {...sections,[activeWorkspaceSection]:true})
  }, [activeWorkspaceSection])
  const activeLabel = visibleNavigation.flatMap(group => group.items).find(item => active(item.to))?.label || (isCreditAdmin ? 'Dashboard' : 'Ringkasan Kerja')
  const rolePanel = isMarketing
    ? {eyebrow: 'MODE MARKETING', title: 'Onboarding lapangan', description: 'Daftarkan Agent dan pantau aktivitas sederhana Agent binaan tanpa akses data finansial.'}
    : isCreditAdmin
      ? isSuperAdmin
        ? {eyebrow: 'MODE SUPER ADMIN', title: 'Kontrol seluruh sistem', description: 'Pantau bisnis, keuangan, pengguna, produk, tim, provider, dan keamanan aplikasi.'}
        : {eyebrow: 'MODE OPERATOR', title: 'Kontrol modal kemitraan', description: 'Periksa pengajuan langsung dari Agent dan kendalikan modal, aktivitas, serta status kemitraan.'}
      : null

  return <aside className={`sidebar ${open ? 'open' : ''}${rolePanel ? ' credit-sidebar' : ''}`}>
    <Link className="brand console-brand" to={home} onClick={onClose} aria-label="KuotaKita">
      <img className="console-brand-image" src="/branding/kuotakita-console-logo.png?v=20260929-3" alt="KuotaKita" width="440" height="151" decoding="async"/>
      {rolePanel && <small className="console-brand-role">{isMarketing ? 'Marketing Console' : isSuperAdmin ? 'Owner Console' : 'Operator Console'}</small>}
    </Link>
    {rolePanel && <div className={`sidebar-role-panel ${isCreditAdmin ? 'analis-role-panel' : ''}`}>
      <span>{rolePanel.eyebrow}</span>
      <strong>{rolePanel.title}</strong>
      <small>Bagian aktif: {activeLabel}</small>
    </div>}
    <nav className={`${rolePanel ? 'workspace-nav' : ''}${isSuperAdmin ? ' owner-workspace-nav' : ''}`}>{visibleNavigation.map(group => {const hasSection=Boolean(group.section);const sectionOpen=!rolePanel||!hasSection||Boolean(openWorkspaceSections[group.section]);return <div className={rolePanel && !sectionOpen ? 'section-collapsed' : ''} key={group.section||'main-navigation'}>
      {hasSection&&(rolePanel ? <button type="button" className="nav-section-toggle" aria-expanded={sectionOpen} aria-controls={`sidebar-${group.section.toLowerCase().replace(/[^a-z]+/g, '-')}`} onClick={() => setOpenWorkspaceSections(currentSections => ({...currentSections,[group.section]:!currentSections[group.section]}))}><span>{group.section}</span><ChevronDown/></button> : <p className="nav-label">{group.section}</p>)}
      <div className="nav-section-items" id={`sidebar-${group.section.toLowerCase().replace(/[^a-z]+/g, '-')}`}>{group.items.map(({to, label, icon: Icon}) => <Link className={`nav-item nav-${label.toLowerCase().replace(/[^a-z]+/g, '-')} ${active(to) ? 'active' : ''}`} to={to} key={to} onClick={onClose}>
        <Icon size={18}/><span>{label}</span>
      </Link>)}</div>
    </div>})}</nav>
    <div className="sidebar-bottom">
      <div className="help-card"><CircleHelp/><strong>Pusat Bantuan</strong><small>Tim KuotaKita siap membantu 24/7</small><button>Hubungi Support</button></div>
      {isSuperAdmin
        ? <button type="button" className="owner-sidebar-logout" onClick={signOut}>Logout</button>
        : <div className="user-card"><span className="avatar coral">{initials(displayName)}</span><div><strong>{displayName}</strong><small>{roleLabel}</small></div><button onClick={signOut} title="Keluar"><LogOut size={16}/></button></div>}
    </div>
  </aside>
}
