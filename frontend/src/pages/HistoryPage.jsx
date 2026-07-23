import {useMemo, useState} from 'react'
import {CalendarDays, ChevronRight, Eye, Printer, ReceiptText, Search, X} from 'lucide-react'
import SubPageHeader from '../components/mobile/SubPageHeader'
import StatusBadge from '../components/common/StatusBadge'
import LoadingState from '../components/common/LoadingState'
import MobileNav from '../components/mobile/MobileNav'
import TransactionReceipt from '../components/mobile/TransactionReceipt'
import {useAuth} from '../context/AuthContext'
import {useAsync} from '../hooks/useAsync'
import {getReceipt, getTransactions} from '../services/transactionService'
import {rupiah} from '../utils/currency'
import {formatDate} from '../utils/date'

const safe = value => value || '-'

export default function HistoryPage() {
  const {user} = useAuth()
  const {data = [], loading} = useAsync(getTransactions)
  const [filter, setFilter] = useState('all')
  const [query, setQuery] = useState('')
  const [date, setDate] = useState('')
  const [selected, setSelected] = useState(null)
  const [receipt, setReceipt] = useState(null)
  const [printMode, setPrintMode] = useState(false)

  const items = useMemo(() => {
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    return data?.filter(item => {
      const created = new Date(item.created_at)
      const target = String(item.customer || '').toLowerCase()
      const id = String(item.id || '').toLowerCase()
      const matchesText = target.includes(query.toLowerCase()) || id.includes(query.toLowerCase())
      const matchesDate = !date || item.created_at?.startsWith(date)
      let matchesPeriod = true
      if (filter === 'today') matchesPeriod = created >= today
      if (filter === 'yesterday') {
        const yesterday = new Date(today)
        yesterday.setDate(today.getDate() - 1)
        matchesPeriod = created >= yesterday && created < today
      }
      if (filter === 'week') {
        const week = new Date(today)
        week.setDate(today.getDate() - 7)
        matchesPeriod = created >= week
      }
      return matchesText && matchesDate && matchesPeriod
    }) || []
  }, [data, query, date, filter])

  const enriched = item => getReceipt(item.id) || item
  const openDetail = item => setSelected(enriched(item))
  const openReceipt = (item, printer = false) => {
    setReceipt(enriched(item))
    setPrintMode(printer)
  }

  return <main className="mobile-app history-page">
    <SubPageHeader title="Riwayat Transaksi" description="Pantau semua transaksi KuotaKita"/>
    <section className="history-tools">
      <div className="history-search"><Search/><input value={query} onChange={event => setQuery(event.target.value)} placeholder="Cari nomor atau ID transaksi"/></div>
      <div className="period-filters">{[['all', 'Semua'], ['today', 'Hari ini'], ['yesterday', 'Kemarin'], ['week', '7 Hari']].map(([key, label]) => <button className={filter === key ? 'active' : ''} onClick={() => setFilter(key)} key={key}>{label}</button>)}</div>
      <label className="date-picker"><CalendarDays/>Pilih tanggal<input type="date" value={date} onChange={event => setDate(event.target.value)}/></label>
    </section>
    {loading ? <LoadingState cards={3}/> : <section className="history-list clean-history-list">
      {items.map(item => <button type="button" className="history-item-card" key={item.id} onClick={() => openDetail(item)}>
        <i><ReceiptText/></i>
        <div><strong>{safe(item.customer)}</strong><small>{safe(item.method)}</small><span>{formatDate(item.created_at)} Â· {safe(item.id)}</span></div>
        <aside><b>{rupiah(item.amount)}</b><StatusBadge status={item.status}/></aside>
        <ChevronRight/>
      </button>)}
      {!items.length && <div className="history-empty"><ReceiptText/><strong>Belum ada transaksi</strong><p>Transaksi pada tanggal yang dipilih tidak ditemukan.</p></div>}
    </section>}

    {selected && <section className="history-detail-backdrop" onClick={() => setSelected(null)}>
      <article className="history-detail-sheet" onClick={event => event.stopPropagation()}>
        <button className="history-detail-close" type="button" onClick={() => setSelected(null)}><X/></button>
        <header>
          <i><ReceiptText/></i>
          <div>
            <small>Detail Transaksi</small>
            <strong>{safe(selected.customer)}</strong>
            <span>{safe(selected.method)}</span>
          </div>
        </header>
        <section className="history-detail-total">
          <div><span>Total Bayar</span><b>{rupiah(selected.amount)}</b></div>
          <StatusBadge status={selected.status}/>
        </section>
        <dl>
          <div><dt>ID Transaksi</dt><dd>{safe(selected.id)}</dd></div>
          <div><dt>No. Pesanan</dt><dd>{safe(selected.order_number || selected.orderNumber)}</dd></div>
          <div><dt>SN / Ref</dt><dd>{safe(selected.sn || selected.serial)}</dd></div>
          <div><dt>Tanggal</dt><dd>{formatDate(selected.created_at)}</dd></div>
        </dl>
        <footer>
          <button type="button" className="history-detail-print" onClick={() => openReceipt(selected, true)}><Printer/>Cetak Struk</button>
          <button type="button" className="history-detail-view" onClick={() => openReceipt(selected, false)}><Eye/>Lihat Struk</button>
        </footer>
      </article>
    </section>}

    {receipt && <TransactionReceipt transaction={receipt} user={user} printMode={printMode} onClose={() => setReceipt(null)}/>}
    <MobileNav/>
  </main>
}
