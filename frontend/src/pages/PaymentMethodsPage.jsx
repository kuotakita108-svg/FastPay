import {useEffect,useMemo,useState} from 'react'
import LoadingState from '../components/common/LoadingState'
import ErrorState from '../components/common/ErrorState'
import {useAsync} from '../hooks/useAsync'
import {getCustomers} from '../services/customerService'

const dayOf=value=>{const date=new Date(value||0);return Number.isNaN(date.getTime())?'':date.toISOString().slice(0,10)}
const currency=value=>new Intl.NumberFormat('id-ID',{style:'currency',currency:'IDR',maximumFractionDigits:0}).format(Number(value||0))

export default function PaymentMethodsPage(){
  const{data,loading,error,reload}=useAsync(getCustomers)
  const[status,setStatus]=useState('pending'),[member,setMember]=useState(''),[from,setFrom]=useState(''),[to,setTo]=useState(''),[note,setNote]=useState(''),[lastRefresh,setLastRefresh]=useState(0)
  const accounts=useMemo(()=>Array.isArray(data)?data:[],[data])
  // Backend deposit approval belum tersedia. Jangan membuat request atau saldo contoh di browser.
  const requests=useMemo(()=>[],[])
  const filtered=useMemo(()=>requests.filter(item=>(!status||String(item.status).toLowerCase()===status)&&(!member||String(item.user_id)===member)&&(!from||dayOf(item.created_at)>=from)&&(!to||dayOf(item.created_at)<=to)),[requests,status,member,from,to])
  useEffect(()=>{const timer=window.setInterval(()=>setLastRefresh(Date.now()),10000);return()=>window.clearInterval(timer)},[])
  const refresh=()=>{setLastRefresh(Date.now());reload()}
  const reset=()=>{setStatus('pending');setMember('');setFrom('');setTo('');setNote('')}
  if(loading)return <LoadingState cards={2}/>
  if(error)return <ErrorState message={error} onRetry={reload}/>
  return <section className="deposit-request-workspace">
    <header><span>DEPOSIT MONITOR</span><h1>Permintaan Deposit</h1><p>Daftar permintaan deposit member untuk pemeriksaan dan keputusan Super Admin.</p></header>
    <div className="deposit-refresh"><span>Monitor request deposit pending dengan pembaruan berkala. Terakhir diperiksa {lastRefresh?new Date(lastRefresh).toLocaleTimeString('id-ID',{hour:'2-digit',minute:'2-digit',second:'2-digit'}):'saat halaman dibuka'}.</span><button type="button" onClick={refresh}>Refresh</button></div>
    <div className="deposit-filters"><label>Status<select value={status} onChange={event=>setStatus(event.target.value)}><option value="pending">Pending</option><option value="approved">Disetujui</option><option value="rejected">Ditolak</option><option value="">Semua status</option></select></label><label>Member<select value={member} onChange={event=>setMember(event.target.value)}><option value="">Semua member</option>{accounts.map(account=><option value={account.id} key={account.id}>{account.email||account.name||account.id}</option>)}</select></label><label>Dari<input type="date" value={from} max={to||undefined} onChange={event=>setFrom(event.target.value)}/></label><label>Sampai<input type="date" value={to} min={from||undefined} onChange={event=>setTo(event.target.value)}/></label><button className="apply" type="button">Terapkan</button><button type="button" onClick={reset}>Reset</button></div>
    <label className="deposit-note">Catatan untuk approve/reject (opsional)<input value={note} onChange={event=>setNote(event.target.value)} placeholder="Contoh: bukti valid"/></label>
    <div className="deposit-request-list">{filtered.map(item=><article key={item.id}><div><b>{item.invoice||item.id}</b><small>{item.member_email||item.user_id}</small></div><strong>{currency(item.amount)}</strong><em>{item.status}</em><nav><button type="button">Setujui</button><button type="button">Tolak</button></nav></article>)}{!filtered.length&&<p>Belum ada request deposit.</p>}</div>
  </section>
}
