import {useMemo,useState} from 'react'
import {useSearchParams} from 'react-router-dom'
import {ReceiptText} from 'lucide-react'
import PageHeader from '../components/common/PageHeader'
import LoadingState from '../components/common/LoadingState'
import ErrorState from '../components/common/ErrorState'
import TransactionTable from '../components/transactions/TransactionTable'
import {useAsync} from '../hooks/useAsync'
import {getTransactions} from '../services/transactionService'

export default function InvoicesPage(){const[params]=useSearchParams(),{data,loading,error,reload}=useAsync(getTransactions),items=Array.isArray(data)?data:[];if(params.get('scope')==='refund')return loading?<LoadingState cards={2}/>:error?<ErrorState message={error} onRetry={reload}/>:<GuestRefundWorkspace items={items}/>;return <><PageHeader eyebrow="Audit Pembayaran" title="Invoice & Pembayaran" description="Arsip pembayaran yang dibuat otomatis oleh sistem KuotaKita."/>{loading?<LoadingState cards={2}/>:error?<ErrorState message={error} onRetry={reload}/>:<section className="panel owner-invoice-panel"><header><div><span>ARSIP OTOMATIS</span><h2>{items.length} invoice transaksi</h2><p>Invoice mengikuti transaksi server dan tidak dibuat manual oleh Super Admin.</p></div><ReceiptText/></header>{items.length?<TransactionTable items={items}/>:<div className="owner-monitor-empty"><ReceiptText/><b>Belum ada invoice transaksi</b><span>Data masuk otomatis setelah pengguna melakukan pembayaran.</span></div>}</section>}</>}

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
