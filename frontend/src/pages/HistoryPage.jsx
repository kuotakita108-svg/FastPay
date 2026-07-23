import {useMemo, useState} from 'react'
import {CalendarDays, ChevronRight, Printer, ReceiptText, Search} from 'lucide-react'
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

export default function HistoryPage() {
  const {user} = useAuth()
  const {data = [], loading} = useAsync(getTransactions)
  const [filter, setFilter] = useState('all')
  const [query, setQuery] = useState('')
  const [date, setDate] = useState('')
  const [receipt, setReceipt] = useState(null)
  const items = useMemo(() => {
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    return data?.filter(item => {
      const created = new Date(item.created_at)
      const matchesText = item.customer.toLowerCase().includes(query.toLowerCase()) || item.id.toLowerCase().includes(query.toLowerCase())
      const matchesDate = !date || item.created_at.startsWith(date)
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
  const openReceipt = item => setReceipt(getReceipt(item.id) || item)

  return <main className="mobile-app history-page">
    <SubPageHeader title="Riwayat Transaksi" description="Pantau semua transaksi PulsaPrime"/>
    <section className="history-tools">
      <div className="history-search"><Search/><input value={query} onChange={event => setQuery(event.target.value)} placeholder="Cari nomor atau ID transaksi"/></div>
      <div className="period-filters">{[['all', 'Semua'], ['today', 'Hari ini'], ['yesterday', 'Kemarin'], ['week', '7 Hari']].map(([key, label]) => <button className={filter === key ? 'active' : ''} onClick={() => setFilter(key)} key={key}>{label}</button>)}</div>
      <label className="date-picker"><CalendarDays/>Pilih tanggal<input type="date" value={date} onChange={event => setDate(event.target.value)}/></label>
    </section>
    {loading ? <LoadingState cards={3}/> : <section className="history-list">
      {items.map(item => <article key={item.id}>
        <i><ReceiptText/></i>
        <div><strong>{item.customer}</strong><small>{item.method}</small><span>{formatDate(item.created_at)} · {item.id}</span></div>
        <aside><b>{rupiah(item.amount)}</b><StatusBadge status={item.status}/><button className="history-print" onClick={() => openReceipt(item)}><Printer/>Struk</button></aside>
        <ChevronRight/>
      </article>)}
      {!items.length && <div className="history-empty"><ReceiptText/><strong>Belum ada transaksi</strong><p>Transaksi pada tanggal yang dipilih tidak ditemukan.</p></div>}
    </section>}
    {receipt && <TransactionReceipt transaction={receipt} user={user} onClose={() => setReceipt(null)}/>}
    <MobileNav/>
  </main>
}
