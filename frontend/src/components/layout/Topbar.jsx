import {Bell, ClipboardCheck, Menu, Moon, Plus, Search, Sun} from 'lucide-react'
import {useState} from 'react'
import {useNavigate} from 'react-router-dom'
import {useTheme} from '../../context/ThemeContext'
import {useAuth} from '../../context/AuthContext'

export default function Topbar({onMenu}) {
  const {dark, toggle} = useTheme()
  const {user} = useAuth()
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [noticeOpen, setNoticeOpen] = useState(false)
  const isReviewer = ['marketing', 'analis', 'admin', 'master'].includes(user?.role)
  const notices = isReviewer
    ? [{title: 'Ruang kerja kredit siap', desc: 'Cek antrean verifikasi dan data agent terbaru.', action: () => navigate('/credit-applications?view=verifikasi'), icon: ClipboardCheck}]
    : [{title: 'Transaksi KuotaKita', desc: 'Pantau transaksi dan status pembayaran terbaru.', action: () => navigate('/transactions'), icon: Bell}]
  const submit = event => {
    event.preventDefault()
    if (query) navigate(`/transactions?q=${encodeURIComponent(query)}`)
  }
  return <header className="topbar">
    <button className="menu-button" onClick={onMenu}><Menu/></button>
    <form className="global-search" onSubmit={submit}><Search size={18}/><input value={query} onChange={event => setQuery(event.target.value)} placeholder="Cari produk, nomor, transaksi..."/><kbd>⌘ K</kbd></form>
    <div className="top-actions">
      <button className="icon-button" onClick={toggle} aria-label={dark ? 'Gunakan tampilan terang' : 'Gunakan tampilan gelap'}>{dark ? <Sun size={18}/> : <Moon size={18}/>}</button>
      <div className="notification-wrap">
        <button className="icon-button notification" onClick={() => setNoticeOpen(value => !value)} aria-label="Buka notifikasi"><Bell size={18}/><i/></button>
        {noticeOpen && <div className="notification-popover"><header><div><strong>Notifikasi</strong><small>Informasi yang perlu kamu cek</small></div><span>{notices.length}</span></header>{notices.map(({title, desc, action, icon: Icon}) => <button type="button" key={title} onClick={() => {setNoticeOpen(false); action()}}><i><Icon/></i><span><b>{title}</b><small>{desc}</small></span><em>›</em></button>)}</div>}
      </div>
      <button className="primary-button" onClick={() => navigate(isReviewer ? '/credit-applications?view=agent-input' : '/topup')}><Plus size={17}/>{isReviewer ? 'Tambah Agent' : 'Transaksi Pulsa'}</button>
    </div>
  </header>
}
