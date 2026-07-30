import {Bell, ClipboardCheck, Menu, Moon, Plus, Search, Sun} from 'lucide-react'
import {useState} from 'react'
import {useLocation,useNavigate} from 'react-router-dom'
import {useTheme} from '../../context/ThemeContext'
import {useAuth} from '../../context/AuthContext'

export default function Topbar({onMenu}) {
  const {dark, toggle} = useTheme()
  const {user} = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [query, setQuery] = useState('')
  const [noticeOpen, setNoticeOpen] = useState(false)
  const isMarketing = user?.role === 'marketing'
  const isAnalis = user?.role === 'analis'
  const canCreateAgent = ['marketing', 'admin', 'master'].includes(user?.role)
  const isCreditTeam = isMarketing || isAnalis || ['admin', 'master'].includes(user?.role)
  // Admin/master memakai ruang kerja marketing juga. Semua role yang dapat
  // menambah agent perlu topbar kredit yang ringkas ketika dibuka dari HP.
  // Halaman kredit adalah ruang kerja khusus. Jangan tampilkan pencarian
  // transaksi di sini, bahkan saat sesi pengguna baru saja dipulihkan.
  const isCreditPanel = isCreditTeam && location.pathname === '/credit-applications'
  const isMarketingPanel = isCreditPanel
  const notices = isCreditTeam
    ? [{title: isAnalis ? 'Berkas analisis siap' : 'Ruang kerja kredit siap', desc: isAnalis ? 'Periksa berkas dari marketing lalu beri keputusan akhir.' : 'Cek antrean verifikasi dan data agent terbaru.', action: () => navigate('/credit-applications?view=verifikasi'), icon: ClipboardCheck}]
    : [{title: 'Transaksi KuotaKita', desc: 'Pantau transaksi dan status pembayaran terbaru.', action: () => navigate('/transactions'), icon: Bell}]
  const submit = event => {
    event.preventDefault()
    if (query) navigate(`/transactions?q=${encodeURIComponent(query)}`)
  }

  return <header className={`topbar ${isCreditPanel ? 'marketing-topbar' : ''}`}>
    <button className="menu-button" onClick={onMenu} aria-label="Buka menu"><Menu/></button>
    {!isMarketingPanel && <form className="global-search" onSubmit={submit}><Search size={18}/><input value={query} onChange={event => setQuery(event.target.value)} placeholder="Cari produk, nomor, transaksi..."/><kbd>⌘ K</kbd></form>}
    <div className="top-actions">
      <button className="icon-button" onClick={toggle} aria-label={dark ? 'Gunakan tampilan terang' : 'Gunakan tampilan gelap'}>{dark ? <Sun size={18}/> : <Moon size={18}/>}</button>
      <div className="notification-wrap">
        <button className="icon-button notification" onClick={() => setNoticeOpen(value => !value)} aria-label="Buka notifikasi"><Bell size={18}/><i/></button>
        {noticeOpen && <div className="notification-popover"><header><div><strong>Notifikasi</strong><small>Informasi yang perlu kamu cek</small></div><span>{notices.length}</span></header>{notices.map(({title, desc, action, icon: Icon}) => <button type="button" key={title} onClick={() => {setNoticeOpen(false); action()}}><i><Icon/></i><span><b>{title}</b><small>{desc}</small></span><em>›</em></button>)}</div>}
      </div>
      {canCreateAgent
        ? <button className="primary-button add-agent-action" onClick={() => navigate('/credit-applications?view=agent-input')}><Plus size={17}/><span className="agent-label-wide">Tambah Agent</span><span className="agent-label-mobile">Agent Baru</span></button>
        : isAnalis
          ? <button className="primary-button" onClick={() => navigate('/credit-applications?view=verifikasi')}><ClipboardCheck size={17}/>Buka Analisis</button>
          : <button className="primary-button" onClick={() => navigate('/topup')}><Plus size={17}/>Transaksi Pulsa</button>}
    </div>
  </header>
}
