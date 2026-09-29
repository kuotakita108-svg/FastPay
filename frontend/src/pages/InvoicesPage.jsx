import {useMemo,useState} from 'react'
import {useSearchParams} from 'react-router-dom'
import {ReceiptText} from 'lucide-react'
import PageHeader from '../components/common/PageHeader'
import LoadingState from '../components/common/LoadingState'
import ErrorState from '../components/common/ErrorState'
import TransactionTable from '../components/transactions/TransactionTable'
import {useAsync} from '../hooks/useAsync'
import {getTransactions} from '../services/transactionService'

export default function InvoicesPage(){const[params]=useSearchParams(),{data,loading,error,reload}=useAsync(getTransactions),items=Array.isArray(data)?data:[];if(params.get('scope')==='refund')return loading?<LoadingState cards={2}/>:error?<ErrorState message={error} onRetry={reload}/>:<GuestRefundWorkspace items={items}/>;if(params.get('scope')==='va')return loading?<LoadingState cards={2}/>:error?<ErrorState message={error} onRetry={reload}/>:<VirtualAccountDepositWorkspace items={items} onRefresh={reload}/>;return <><PageHeader eyebrow="Audit Pembayaran" title="Invoice & Pembayaran" description="Arsip pembayaran yang dibuat otomatis oleh sistem KuotaKita."/>{loading?<LoadingState cards={2}/>:error?<ErrorState message={error} onRetry={reload}/>:<section className="panel owner-invoice-panel"><header><div><span>ARSIP OTOMATIS</span><h2>{items.length} invoice transaksi</h2><p>Invoice mengikuti transaksi server dan tidak dibuat manual oleh Super Admin.</p></div><ReceiptText/></header>{items.length?<TransactionTable items={items}/>:<div className="owner-monitor-empty"><ReceiptText/><b>Belum ada invoice transaksi</b><span>Data masuk otomatis setelah pengguna melakukan pembayaran.</span></div>}</section>}</>}

const isFailed=value=>['gagal','failed','failure','expired'].includes(String(value||'').toLowerCase())
const isGuest=item=>!item.customer||String(`${item.customer} ${item.email}`).toLowerCase().includes('guest')
const dateTime=value=>{const date=new Date(value||0);return Number.isNaN(date.getTime())?'-':new Intl.DateTimeFormat('id-ID',{day:'2-digit',month:'2-digit',year:'numeric',hour:'2-digit',minute:'2-digit',second:'2-digit'}).format(date)}
const currency=value=>new Intl.NumberFormat('id-ID',{style:'currency',currency:'IDR',maximumFractionDigits:0}).format(Number(value||0))

function GuestRefundWorkspace({items=[]}){
  const source=useMemo(()=>Array.isArray(items)?items:[],[items])
  const[query,setQuery]=useState(''),[appliedQuery,setAppliedQuery]=useState(''),[targets,setTargets]=useState({}),[notice,setNotice]=useState('')
  const candidates=useMemo(()=>source.filter(item=>isFailed(item.status)&&isGuest(item)&&`${item.id||''} ${item.order_number||''}`.toLowerCase().includes(appliedQuery.toLowerCase())),[source,appliedQuery])
  const claim=item=>{const email=String(targets[item.id]||'').trim();if(!/^\S+@\S+\.\S+$/.test(email)){setNotice('Masukkan email user tujuan yang valid sebelum memproses claim.');return}setNotice(`Claim ${item.order_number||item.id} belum dipindahkan. Endpoint backend claim guest harus diaktifkan agar saldo tetap aman dan tidak tercatat ganda.`)}
  return <section className="guest-refund-workspace">
    <header><span>REFUND TRANSAKSI KUOTAKITA</span><h1>Guest Refund Pending</h1><p>Daftar refund transaksi guest yang masih menunggu claim ke akun user tertentu.</p></header>
    <div className="guest-refund-search"><label><span>Cari invoice</span><input value={query} onChange={event=>setQuery(event.target.value)} placeholder="INV-..."/></label><button className="apply" type="button" onClick={()=>setAppliedQuery(query)}>Terapkan</button><button type="button" onClick={()=>{setQuery('');setAppliedQuery('');setNotice('')}}>Reset</button></div>
    {notice&&<p className="guest-refund-notice">{notice}</p>}
    <div className="guest-refund-scroll"><div className="guest-refund-table"><div className="head"><span>No</span><span>Waktu</span><span>Invoice</span><span>Guest</span><span>Produk</span><span>Refund</span><span>Claim ke user</span></div>{candidates.map((item,index)=><article key={item.id||index}><span>{index+1}</span><time>{dateTime(item.created_at)}</time><code>{item.order_number||item.id||'-'}</code><span><b>{item.customer_name||item.customer||'Guest KuotaKita'}</b><small>{item.email||'Email guest tidak tersedia'}</small><small>{item.target||'-'}</small></span><span><b>{item.title||item.product||item.provider||'-'}</b><small>{item.target||'-'}</small></span><strong>{currency(item.amount)}</strong><label><input type="email" value={targets[item.id]||''} onChange={event=>setTargets(current=>({...current,[item.id]:event.target.value}))} placeholder="email user tujuan"/><button type="button" onClick={()=>claim(item)}>Claim</button></label></article>)}{!candidates.length&&<p>Belum ada refund guest pending yang tercatat.</p>}</div></div>
  </section>
}

function VirtualAccountDepositWorkspace({items=[],onRefresh}){
  const source=useMemo(()=>Array.isArray(items)?items:[],[items])
  const[status,setStatus]=useState('ticket'),[ticket,setTicket]=useState(''),[account,setAccount]=useState(''),[member,setMember]=useState(''),[from,setFrom]=useState(''),[to,setTo]=useState(''),[note,setNote]=useState('')
  const vaRows=useMemo(()=>source.filter(item=>/virtual|\bva\b/i.test(String(item.method||''))),[source])
  const members=useMemo(()=>[...new Set(vaRows.map(item=>item.email||item.customer).filter(Boolean))].sort(),[vaRows])
  const filtered=useMemo(()=>vaRows.filter(item=>{const state=String(item.va_status||item.status||'ticket').toLowerCase();const day=new Date(item.created_at||0).toISOString().slice(0,10);return(!status||state===status)&&(!ticket||String(item.ticket||item.order_number||item.id||'').toLowerCase().includes(ticket.toLowerCase()))&&(!account||String(item.va_number||item.target||'').includes(account))&&(!member||(item.email||item.customer)===member)&&(!from||day>=from)&&(!to||day<=to)}),[vaRows,status,ticket,account,member,from,to])
  const reset=()=>{setStatus('ticket');setTicket('');setAccount('');setMember('');setFrom('');setTo('');setNote('')}
  return <section className="va-deposit-workspace">
    <header><span>VIRTUAL ACCOUNT MONITOR</span><h1>Deposit VA</h1><p>Monitor callback transfer Virtual Account dan verifikasi saldo masuk member.</p></header>
    <div className="va-refresh"><span>Data Virtual Account diperbarui dari transaksi server.</span><button onClick={onRefresh}>Refresh</button></div>
    <div className="va-filters"><label>Status<select value={status} onChange={event=>setStatus(event.target.value)}><option value="ticket">Ticket</option><option value="success">Berhasil</option><option value="pending">Pending</option><option value="failed">Gagal</option><option value="">Semua status</option></select></label><label>Tiket<input value={ticket} onChange={event=>setTicket(event.target.value)} placeholder="Nomor tiket"/></label><label>Rekening tujuan VA<input value={account} onChange={event=>setAccount(event.target.value)} placeholder="Masukkan nomor VA"/></label><label>Member<select value={member} onChange={event=>setMember(event.target.value)}><option value="">Semua member</option>{members.map(value=><option key={value}>{value}</option>)}</select></label><label>Dari<input type="date" value={from} max={to||undefined} onChange={event=>setFrom(event.target.value)}/></label><label>Sampai<input type="date" value={to} min={from||undefined} onChange={event=>setTo(event.target.value)}/></label><button className="apply">Terapkan</button><button onClick={reset}>Reset</button></div>
    <label className="va-note">Catatan untuk approve/reject (opsional)<input value={note} onChange={event=>setNote(event.target.value)} placeholder="Contoh: callback valid manual"/></label>
    <div className="va-deposit-scroll"><div className="va-deposit-table"><div className="head"><span>No</span><span>ID</span><span>Member</span><span>Tiket</span><span>Provider</span><span>Total transfer</span><span>Saldo masuk</span><span>Bank VA</span><span>Status</span><span>Waktu</span><span>Aksi</span></div>{filtered.map((item,index)=><article key={item.id||index}><span>{index+1}</span><code>{item.id}</code><span>{item.email||item.customer||'-'}</span><code>{item.ticket||item.order_number||item.id}</code><span>{item.provider||item.method||'Virtual Account'}</span><strong>{currency(item.amount)}</strong><span>{currency(item.balance_credit??item.amount)}</span><span><b>{item.bank_name||'Bank VA'}</b><small>{item.va_number||item.target||'-'}</small></span><em>{item.va_status||item.status||'ticket'}</em><time>{dateTime(item.created_at)}</time><button type="button" disabled title="Menunggu endpoint verifikasi VA">Verifikasi & Approve</button></article>)}{!filtered.length&&<p>Belum ada transaksi Deposit VA.</p>}</div></div>
  </section>
}
