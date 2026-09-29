import {useMemo,useState} from 'react'
import {useSearchParams,useOutletContext} from 'react-router-dom'
import {Plus,Search} from 'lucide-react'
import PageHeader from '../components/common/PageHeader'
import TransactionTable from '../components/transactions/TransactionTable'
import LoadingState from '../components/common/LoadingState'
import ErrorState from '../components/common/ErrorState'
import {useAsync} from '../hooks/useAsync'
import {getTransactions} from '../services/transactionService'
import {useAuth} from '../context/AuthContext'

export default function TransactionsPage(){
  const[params]=useSearchParams(),[query,setQuery]=useState(params.get('q')||''),[status,setStatus]=useState('')
  const{openPayment}=useOutletContext(),{user}=useAuth(),isOwner=user?.role==='master'
  const{data=[],loading,error,reload}=useAsync(getTransactions)
  const filtered=useMemo(()=>data?.filter(transaction=>(String(transaction.id||'').toLowerCase().includes(query.toLowerCase())||String(transaction.customer||'').toLowerCase().includes(query.toLowerCase()))&&(!status||transaction.status===status))||[],[data,query,status])
  if(isOwner)return loading?<LoadingState cards={2}/>:error?<ErrorState message={error} onRetry={reload}/>:<RetailOrderWorkspace items={data}/>
  return <><PageHeader eyebrow="Operasional" title="Seluruh Transaksi" description="Kelola dan pantau seluruh pembayaran pelanggan." action={<button className="primary-button" onClick={openPayment}><Plus size={17}/>Tambah Transaksi</button>}/>{loading?<LoadingState cards={2}/>:error?<ErrorState message={error} onRetry={reload}/>:<section className="panel"><div className="toolbar"><div><Search size={16}/><input value={query} onChange={event=>setQuery(event.target.value)} placeholder="Cari ID atau pelanggan..."/></div><select value={status} onChange={event=>setStatus(event.target.value)}><option value="">Semua status</option><option>Berhasil</option><option>Diproses</option><option>Gagal</option></select></div><TransactionTable items={filtered}/></section>}</>
}

const normalizeStatus=value=>{const status=String(value||'').toLowerCase();if(['berhasil','success','sukses','paid'].includes(status))return'berhasil';if(['gagal','failed','failure','expired'].includes(status))return'gagal';return'diproses'}
const statusLabel=value=>normalizeStatus(value)==='berhasil'?'Berhasil':normalizeStatus(value)==='gagal'?'Gagal':'Diproses Provider'
const dateTime=value=>{const date=new Date(value||0);return Number.isNaN(date.getTime())?'-':new Intl.DateTimeFormat('id-ID',{day:'2-digit',month:'2-digit',year:'numeric',hour:'2-digit',minute:'2-digit',second:'2-digit'}).format(date)}
const dayOf=value=>{const date=new Date(value||0);return Number.isNaN(date.getTime())?'':date.toISOString().slice(0,10)}
const buyerOf=item=>item.customer_name||item.customer||item.email||'Guest'
const productOf=item=>item.title||item.product||item.provider||item.method||'-'

function RetailOrderWorkspace({items=[]}){
  const source=useMemo(()=>Array.isArray(items)?items:[],[items])
  const[query,setQuery]=useState(''),[status,setStatus]=useState(''),[buyer,setBuyer]=useState(''),[from,setFrom]=useState(''),[to,setTo]=useState(''),[page,setPage]=useState(1),[selected,setSelected]=useState(null)
  const buyers=useMemo(()=>[...new Set(source.map(buyerOf).filter(Boolean))].sort((a,b)=>a.localeCompare(b)),[source])
  const filtered=useMemo(()=>source.filter(item=>{const haystack=`${item.id||''} ${item.order_number||''} ${buyerOf(item)} ${productOf(item)} ${item.target||''}`.toLowerCase();const day=dayOf(item.created_at);return(!query||haystack.includes(query.toLowerCase()))&&(!status||normalizeStatus(item.status)===status)&&(!buyer||buyerOf(item)===buyer)&&(!from||day>=from)&&(!to||day<=to)}),[source,query,status,buyer,from,to])
  const pageSize=10,totalPages=Math.max(1,Math.ceil(filtered.length/pageSize)),safePage=Math.min(page,totalPages),rows=filtered.slice((safePage-1)*pageSize,safePage*pageSize)
  const update=setter=>event=>{setter(event.target.value);setPage(1)}
  const reset=()=>{setQuery('');setStatus('');setBuyer('');setFrom('');setTo('');setPage(1)}
  return <section className="retail-order-workspace">
    <header><span>TRANSAKSI RETAIL KUOTAKITA</span><h1>Order Aplikasi</h1><p>Daftar seluruh order aplikasi dari user, agent, maupun transaksi guest.</p></header>
    <div className="retail-order-filters"><input value={query} onChange={update(setQuery)} placeholder="Cari invoice, tujuan, atau produk"/><select value={status} onChange={update(setStatus)}><option value="">Semua status</option><option value="berhasil">Berhasil</option><option value="diproses">Diproses provider</option><option value="gagal">Gagal</option></select><select value={buyer} onChange={update(setBuyer)}><option value="">Semua buyer</option>{buyers.map(name=><option key={name}>{name}</option>)}</select><input type="date" value={from} max={to||undefined} onChange={update(setFrom)}/><input type="date" value={to} min={from||undefined} onChange={update(setTo)}/><button className="apply" type="button" onClick={()=>setPage(1)}>Terapkan</button><button type="button" onClick={reset}>Reset</button></div>
    <div className="retail-order-scroll"><div className="retail-order-table"><div className="head"><span>No</span><span>Waktu</span><span>Invoice</span><span>Buyer</span><span>Produk</span><span>Tujuan</span><span>Total</span><span>Status</span><span>Detail</span></div>{rows.map((item,index)=><article key={item.id||index}><span>{(safePage-1)*pageSize+index+1}</span><time>{dateTime(item.created_at)}</time><code>{item.order_number||item.id||'-'}</code><span>{buyerOf(item)}</span><span>{productOf(item)}</span><span>{item.target||'-'}</span><strong>{new Intl.NumberFormat('id-ID',{style:'currency',currency:'IDR',maximumFractionDigits:0}).format(Number(item.amount||0))}</strong><em className={normalizeStatus(item.status)}>{statusLabel(item.status)}</em><button type="button" onClick={()=>setSelected(item)}>Lihat</button></article>)}{!rows.length&&<p>Belum ada order yang sesuai dengan filter.</p>}</div></div>
    <footer><span>Menampilkan {filtered.length?`${(safePage-1)*pageSize+1}-${Math.min(safePage*pageSize,filtered.length)}`:'0'} dari {filtered.length} transaksi</span><nav><button disabled={safePage===1} onClick={()=>setPage(1)}>«</button><button disabled={safePage===1} onClick={()=>setPage(value=>Math.max(1,value-1))}>‹</button><b>{safePage}</b><span>/ {totalPages}</span><button disabled={safePage===totalPages} onClick={()=>setPage(value=>Math.min(totalPages,value+1))}>›</button><button disabled={safePage===totalPages} onClick={()=>setPage(totalPages)}>»</button></nav></footer>
    {selected&&<div className="retail-order-modal" onMouseDown={event=>event.target===event.currentTarget&&setSelected(null)}><article><header><span>DETAIL ORDER</span><h2>{selected.order_number||selected.id}</h2></header><dl><div><dt>Buyer</dt><dd>{buyerOf(selected)}</dd></div><div><dt>Waktu</dt><dd>{dateTime(selected.created_at)}</dd></div><div><dt>Produk</dt><dd>{productOf(selected)}</dd></div><div><dt>Tujuan</dt><dd>{selected.target||'-'}</dd></div><div><dt>Total</dt><dd>{new Intl.NumberFormat('id-ID',{style:'currency',currency:'IDR',maximumFractionDigits:0}).format(Number(selected.amount||0))}</dd></div><div><dt>Status</dt><dd>{statusLabel(selected.status)}</dd></div><div><dt>Metode</dt><dd>{selected.method||'-'}</dd></div><div><dt>SN / Referensi</dt><dd>{selected.sn||'-'}</dd></div></dl><button type="button" onClick={()=>setSelected(null)}>Tutup</button></article></div>}
  </section>
}
