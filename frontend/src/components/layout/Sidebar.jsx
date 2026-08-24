import {useState} from 'react'
import {Link, useLocation, useNavigate} from 'react-router-dom'
import {navigation} from '../../constants/navigation'
import {Activity, BarChart3, BookOpenCheck, Boxes, CalendarClock, Camera, CheckCircle2, ChevronDown, CircleHelp, ClipboardCheck, CreditCard, FileCheck2, Headphones, Landmark, LockKeyhole, LogOut, PhoneCall, Settings, ShieldCheck, UserCheck, UserPlus, Users, WalletCards} from 'lucide-react'
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
    section: 'OPERASIONAL',
    items: [
      {to: '/credit-applications', label: 'Dashboard', icon: ShieldCheck},
      {to: '/credit-applications?view=pinjaman-retail', label: 'Pinjaman Retail', icon: ClipboardCheck},
      {to: '/credit-applications?view=konter-tidak-transaksi', label: 'Konter Tidak Transaksi', icon: Users},
      {to: '/credit-applications?view=bank', label: 'Bank', icon: Landmark},
      {to: '/credit-applications?view=mapping-provider', label: 'Mapping Provider', icon: Boxes},
    ],
  },
  {
    section: 'TRANSAKSI',
    items: [
      {to: '/credit-applications?view=transaksi-retail', label: 'Transaksi Retail', icon: Activity},
      {to: '/credit-applications?view=transaksi-provider', label: 'Transaksi Provider', icon: BarChart3},
    ],
  },
  {section: 'AUDIT', items: [
    {to: '/credit-applications?view=audit-provider', label: 'Audit Status Provider', icon: ShieldCheck},
  ]},
]

const superAdminNavigation = [
  {section: 'RINGKASAN', items: [
    {to: '/credit-applications', label: 'Dashboard Super Admin', icon: ShieldCheck},
  ]},
  {section: 'BISNIS APLIKASI', items: [
    {to: '/transactions', label: 'Monitor Transaksi User', icon: Activity},
    {to: '/products', label: 'Kelola Produk & Harga', icon: Boxes},
    {to: '/customers', label: 'Kelola Akun & Role', icon: Users},
  ]},
  {section: 'KEUANGAN', items: [
    {to: '/analytics', label: 'Arus Keuangan', icon: BarChart3},
    {to: '/invoices', label: 'Invoice & Refund', icon: FileCheck2},
    {to: '/payment-methods', label: 'Kanal Pembayaran', icon: CreditCard},
    {to: '/credit-applications?view=h2h', label: 'Saldo Provider H2H', icon: Landmark},
  ]},
  {section: 'TIM & KREDIT', items: [
    {to: '/credit-applications?view=peminjam', label: 'Monitor Kredit Agent', icon: WalletCards},
    {to: '/credit-applications?view=jatuh-tempo', label: 'Tagihan & Risiko', icon: CalendarClock},
    {to: '/credit-applications?view=pelunasan', label: 'Audit Pelunasan', icon: FileCheck2},
    {to: '/credit-applications?view=kinerja-marketing', label: 'Kinerja Tim Lapangan', icon: Users},
  ]},
  {section: 'KEAMANAN & SISTEM', items: [
    {to: '/credit-applications?view=transaksi-agent', label: 'Log Transaksi Agent', icon: Activity},
    {to: '/credit-applications?view=helpdesk', label: 'Tiket Komplain', icon: Headphones},
    {to: '/settings', label: 'Pengaturan Sistem', icon: Settings},
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
  const visibleNavigation = isMarketing ? marketingNavigation : isSuperAdmin ? superAdminNavigation : isCreditAdmin ? operatorNavigation : navigation
  const home = isMarketing || isCreditAdmin ? '/credit-applications' : '/dashboard'
  const roleLabel = role === 'master' ? 'Super Admin / Owner' : role === 'marketing' ? 'Marketing Kredit' : isOperator || role === 'admin' ? 'Operator Kredit' : 'Panel Administrator'
  const current = `${location.pathname}${location.search}`
  const active = to => current === to || (!to.includes('?') && location.pathname === to && !location.search)
  const activeWorkspaceSection = visibleNavigation.find(group => group.items.some(item => active(item.to)))?.section
  const [openWorkspaceSections, setOpenWorkspaceSections] = useState(() => ({
    [visibleNavigation[0]?.section || '']: true,
    ...(activeWorkspaceSection ? {[activeWorkspaceSection]: true} : {}),
  }))
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
      <img className="console-brand-image" src="/branding/kuotakita-console-logo.png" alt="KuotaKita"/>
      {rolePanel && <small className="console-brand-role">{isMarketing ? 'Marketing Console' : isSuperAdmin ? 'Owner Console' : 'Operator Console'}</small>}
    </Link>
    {rolePanel && <div className={`sidebar-role-panel ${isCreditAdmin ? 'analis-role-panel' : ''}`}>
      <span>{rolePanel.eyebrow}</span>
      <strong>{rolePanel.title}</strong>
      <small>Bagian aktif: {activeLabel}</small>
    </div>}
    <nav className={`${rolePanel ? 'workspace-nav' : ''}${isSuperAdmin ? ' owner-workspace-nav' : ''}`}>{visibleNavigation.map(group => {const sectionOpen=!rolePanel||Boolean(openWorkspaceSections[group.section]);return <div className={rolePanel && !sectionOpen ? 'section-collapsed' : ''} key={group.section}>
      {rolePanel ? <button type="button" className="nav-section-toggle" aria-expanded={sectionOpen} aria-controls={`sidebar-${group.section.toLowerCase().replace(/[^a-z]+/g, '-')}`} onClick={() => setOpenWorkspaceSections(currentSections => ({...currentSections,[group.section]:!currentSections[group.section]}))}><span>{group.section}</span><ChevronDown/></button> : <p className="nav-label">{group.section}</p>}
      <div className="nav-section-items" id={`sidebar-${group.section.toLowerCase().replace(/[^a-z]+/g, '-')}`}>{group.items.map(({to, label, icon: Icon}) => <Link className={`nav-item nav-${label.toLowerCase().replace(/[^a-z]+/g, '-')} ${active(to) ? 'active' : ''}`} to={to} key={to} onClick={onClose}>
        <Icon size={18}/><span>{label}</span>
      </Link>)}</div>
    </div>})}</nav>
    <div className="sidebar-bottom">
      <div className="help-card"><CircleHelp/><strong>Pusat Bantuan</strong><small>Tim KuotaKita siap membantu 24/7</small><button>Hubungi Support</button></div>
      <div className="user-card"><span className="avatar coral">{initials(user.name)}</span><div><strong>{user.name}</strong><small>{roleLabel}</small></div><button onClick={signOut} title="Keluar"><LogOut size={16}/></button></div>
    </div>
  </aside>
}
