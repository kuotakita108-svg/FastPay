import {useEffect,useMemo,useState} from 'react'
import {ArrowDownLeft,ArrowUpRight,CalendarDays,RefreshCw,WalletCards} from 'lucide-react'
import SubPageHeader from '../components/mobile/SubPageHeader'
import MobileNav from '../components/mobile/MobileNav'
import {getTransactions} from '../services/transactionService'
import {rupiah} from '../utils/currency'

const dateValue=date=>{
  const value=new Date(date)
  if(Number.isNaN(value.getTime()))return ''
  const offset=value.getTimezoneOffset()*60000
  return new Date(value.getTime()-offset).toISOString().slice(0,10)
}
const today=()=>dateValue(new Date())
const firstDay=()=>{const value=new Date();value.setDate(1);return dateValue(value)}
const isIncoming=transaction=>{
  const text=`${transaction?.id||''} ${transaction?.customer||''} ${transaction?.title||''} ${transaction?.status||''}`.toLowerCase()
  return text.includes('topup')||text.includes('top up')||text.includes('isi saldo')||text.includes('dikembalikan')||text.includes('refund')
}
const formatTime=value=>new Intl.DateTimeFormat('id-ID',{dateStyle:'medium',timeStyle:'short'}).format(new Date(value))

export default function BalanceMutationsPage(){
  const [draft,setDraft]=useState({from:firstDay(),to:today()})
  const [range,setRange]=useState(draft)
  const [items,setItems]=useState([])
  const [loading,setLoading]=useState(true)
  const [error,setError]=useState('')
  const load=()=>{
    setLoading(true);setError('')
    getTransactions().then(data=>setItems(Array.isArray(data)?data:[])).catch(requestError=>setError(requestError.message||'Riwayat mutasi belum dapat dimuat.')).finally(()=>setLoading(false))
  }
  useEffect(load,[])
  const filtered=useMemo(()=>items.filter(item=>{
    const day=dateValue(item.created_at)
    return day&&day>=range.from&&day<=range.to
  }).sort((a,b)=>new Date(b.created_at)-new Date(a.created_at)),[items,range])
  const reset=()=>{const next={from:firstDay(),to:today()};setDraft(next);setRange(next)}
  return <main className="mobile-app balance-mutations-page">
    <SubPageHeader title="Mutasi Saldo" description="Riwayat perubahan saldo akunmu"/>
    <section className="mutation-filter-card">
      <header><div><span>MUTASI SALDO</span><h1>Riwayat perubahan saldo</h1><p>Pantau uang masuk dan keluar dari akun KuotaKita.</p></div><i><WalletCards/></i></header>
      <div className="mutation-date-grid">
        <label><span>Dari</span><div><CalendarDays/><input type="date" max={draft.to} value={draft.from} onChange={event=>setDraft({...draft,from:event.target.value})}/></div></label>
        <label><span>Sampai</span><div><CalendarDays/><input type="date" min={draft.from} max={today()} value={draft.to} onChange={event=>setDraft({...draft,to:event.target.value})}/></div></label>
      </div>
      <div className="mutation-filter-actions"><button type="button" onClick={()=>setRange(draft)} disabled={!draft.from||!draft.to||draft.from>draft.to}>Terapkan</button><button type="button" onClick={reset}>Reset</button></div>
    </section>
    <section className="mutation-results">
      <header><div><span>RIWAYAT AKUN</span><h2>{filtered.length} mutasi ditemukan</h2></div><button type="button" onClick={load} disabled={loading} aria-label="Muat ulang mutasi"><RefreshCw/></button></header>
      {loading&&<div className="mutation-page-state"><span className="mutation-loader"/><strong>Memuat mutasi saldo...</strong></div>}
      {!loading&&error&&<div className="mutation-page-state error"><RefreshCw/><strong>Riwayat belum dapat dimuat</strong><small>{error}</small><button type="button" onClick={load}>Coba lagi</button></div>}
      {!loading&&!error&&filtered.length===0&&<div className="mutation-page-state"><WalletCards/><strong>Belum ada riwayat mutasi saldo</strong><small>Perubahan saldo pada rentang tanggal ini akan tampil otomatis di sini.</small></div>}
      {!loading&&!error&&filtered.map(item=>{const incoming=isIncoming(item);return <article key={item.id}>
        <i className={incoming?'incoming':'outgoing'}>{incoming?<ArrowDownLeft/>:<ArrowUpRight/>}</i>
        <div><strong>{item.title||item.customer||(incoming?'Saldo masuk':'Pembayaran produk')}</strong><small>{item.method||item.provider||'Saldo KuotaKita'}</small><time>{formatTime(item.created_at)} · {item.id}</time></div>
        <aside><b className={incoming?'incoming':'outgoing'}>{incoming?'+':'-'} {rupiah(Number(item.amount||0))}</b><span>{item.status||'Tercatat'}</span></aside>
      </article>})}
    </section>
    <MobileNav/>
  </main>
}
