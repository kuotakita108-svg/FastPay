import {useMemo,useState} from 'react'
import {useParams} from 'react-router-dom'
import LoadingState from '../components/common/LoadingState'
import ErrorState from '../components/common/ErrorState'
import {useAsync} from '../hooks/useAsync'
import {getPulsa24Operations,getTransactions} from '../services/transactionService'

const loadAudit=async()=>{const [transactions,operations]=await Promise.allSettled([getTransactions(),getPulsa24Operations()]);if(transactions.status==='rejected'&&operations.status==='rejected')throw transactions.reason;return{transactions:transactions.status==='fulfilled'&&Array.isArray(transactions.value)?transactions.value:[],operations:operations.status==='fulfilled'?(Array.isArray(operations.value)?operations.value:operations.value?.orders||[]):[]}}
const dateKey=value=>{const date=new Date(value||0);return Number.isNaN(date.getTime())?'':date.toISOString().slice(0,10)}
const dateTime=value=>{const date=new Date(value||0);return Number.isNaN(date.getTime())?'-':new Intl.DateTimeFormat('id-ID',{dateStyle:'medium',timeStyle:'medium'}).format(date)}
const money=value=>new Intl.NumberFormat('id-ID',{style:'currency',currency:'IDR',maximumFractionDigits:0}).format(Number(value||0))
const statusOf=item=>String(item.Status||item.status||'pending').toLowerCase()
const success=item=>['success','sukses','berhasil','paid'].includes(statusOf(item))
const timeOf=item=>item.CreatedAt||item.created_at||item.updated_at
const productOf=item=>item.Product||item.product_name||item.product||item.title||item.method||'-'
const refOf=item=>item.RefID||item.ref_id||item.reference||item.order_number||item.id||'-'
const amountOf=item=>Number(item.Amount||item.amount||item.total||0)
const today=()=>new Date().toISOString().slice(0,10)

export default function MonitoringAuditPage(){
 const{view}=useParams(),{data={transactions:[],operations:[]},loading,error,reload}=useAsync(loadAudit)
 if(loading)return <LoadingState cards={3}/>
 if(error)return <ErrorState message={error} onRetry={reload}/>
 if(view==='wallet')return <WalletAudit items={data.transactions} reload={reload}/>
 if(view==='status')return <StatusAudit items={[...data.operations,...data.transactions]} reload={reload}/>
 return <DailyProducts items={[...data.operations,...data.transactions]} reload={reload}/>
}

function DailyProducts({items,reload}){
 const[from,setFrom]=useState(today()),[to,setTo]=useState(today()),[query,setQuery]=useState('')
 const rows=useMemo(()=>{const map=new Map();items.filter(success).filter(item=>{const day=dateKey(timeOf(item));return(!from||day>=from)&&(!to||day<=to)&&`${productOf(item)} ${item.Provider||item.provider||''}`.toLowerCase().includes(query.toLowerCase())}).forEach(item=>{const sku=productOf(item),key=sku.toLowerCase(),current=map.get(key)||{sku,name:sku,group:item.Group||item.category||item.service||'-',count:0,nominal:0,provider:new Set(),last:null};current.count++;current.nominal+=amountOf(item);if(item.Provider||item.provider)current.provider.add(item.Provider||item.provider);if(!current.last||new Date(timeOf(item))>new Date(current.last))current.last=timeOf(item);map.set(key,current)});return[...map.values()].sort((a,b)=>b.count-a.count)},[items,from,to,query])
 const total=rows.reduce((sum,row)=>sum+row.nominal,0),transactions=rows.reduce((sum,row)=>sum+row.count,0)
 return <section className="monitor-audit"><AuditTitle title="Produk Sukses Harian" note="Transaksi sukses dikelompokkan berdasarkan SKU internal."/><div className="audit-filters"><input type="date" value={from} onChange={e=>setFrom(e.target.value)}/><input type="date" value={to} onChange={e=>setTo(e.target.value)}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Cari SKU / nama / grup"/><button onClick={reload}>Refresh</button></div><div className="audit-metrics five"><Metric name="Grup Harian" value={rows.length}/><Metric name="SKU Internal" value={rows.length}/><Metric name="TRX Sukses" value={transactions.toLocaleString('id-ID')} green/><Metric name="Nominal" value={money(total)} cyan/><Metric name="Sumber Data" value="Server KuotaKita"/></div><AuditTable columns={['No','Tanggal','SKU Internal','Grup','Sukses','Nominal','Provider','Sukses Terakhir']} template="35px 80px 1.2fr .8fr .65fr 1fr .8fr 1fr">{rows.map((row,index)=><article key={row.sku}><span>{index+1}</span><span>{to||from||'-'}</span><b>{row.name}</b><span>{row.group}</span><em>{row.count.toLocaleString('id-ID')}</em><strong>{money(row.nominal)}</strong><span>{row.provider.size||'-'} provider</span><time>{dateTime(row.last)}</time></article>)}</AuditTable>{!rows.length&&<Empty/>}</section>
}

function WalletAudit({items,reload}){
 const[from,setFrom]=useState(today()),[to,setTo]=useState(today())
 const rows=useMemo(()=>items.filter(item=>/wallet|saldo|top.?up|deposit/i.test(`${item.type||''} ${item.method||''} ${item.title||''} ${item.description||''}`)).filter(item=>{const day=dateKey(timeOf(item));return(!from||day>=from)&&(!to||day<=to)}),[items,from,to])
 const credit=rows.filter(item=>amountOf(item)>0).reduce((sum,item)=>sum+amountOf(item),0)
 return <section className="monitor-audit"><AuditTitle title="Audit Aktivitas Wallet" note="Laporan koreksi saldo member dan aktivitas wallet yang tercatat pada server."/><div className="audit-filters wallet"><select><option>Sistem KuotaKita</option></select><input type="date" value={from} onChange={e=>setFrom(e.target.value)}/><input type="date" value={to} onChange={e=>setTo(e.target.value)}/><button onClick={reload}>Muat ulang</button></div><div className="audit-metrics four"><Metric name="Aktivitas Wallet" value={rows.length}/><Metric name="Total Kredit" value={money(credit)} green/><Metric name="Aktor Terpilih" value="Sistem KuotaKita"/><Metric name="Total Aktivitas" value={rows.length}/></div><h2 className="audit-subtitle">Aktivitas Wallet <small>{rows.length} data</small></h2><AuditTable columns={['Waktu','Referensi','Member','Aktivitas','Nominal','Status']} template="1fr 1fr 1.2fr 1fr .8fr .7fr">{rows.map((item,index)=><article key={`${refOf(item)}-${index}`}><time>{dateTime(timeOf(item))}</time><code>{refOf(item)}</code><span>{item.customer||item.email||'-'}</span><b>{item.type||item.method||'Aktivitas wallet'}</b><strong>{money(amountOf(item))}</strong><em>{statusOf(item)}</em></article>)}</AuditTable>{!rows.length&&<Empty text="Tidak ada aktivitas wallet untuk filter ini."/>}</section>
}

function StatusAudit({items,reload}){
 const[from,setFrom]=useState(''),[to,setTo]=useState(''),[query,setQuery]=useState(''),[page,setPage]=useState(1)
 const filtered=useMemo(()=>items.filter(item=>{const day=dateKey(timeOf(item)),hay=`${refOf(item)} ${item.id||''} ${statusOf(item)} ${item.Message||item.message||item.SN||''}`.toLowerCase();return(!from||day>=from)&&(!to||day<=to)&&(!query||hay.includes(query.toLowerCase()))}).sort((a,b)=>new Date(timeOf(b))-new Date(timeOf(a))),[items,from,to,query]),pages=Math.max(1,Math.ceil(filtered.length/10)),safe=Math.min(page,pages),rows=filtered.slice((safe-1)*10,safe*10)
 return <section className="monitor-audit"><AuditTitle title="Audit Log Status Member" note="Riwayat status transaksi member yang tercatat di server KuotaKita."/><div className="audit-filters status"><input value={query} onChange={e=>{setQuery(e.target.value);setPage(1)}} placeholder="Filter ref ID, transaksi, status"/><input type="date" value={from} onChange={e=>setFrom(e.target.value)}/><input type="date" value={to} onChange={e=>setTo(e.target.value)}/><button onClick={reload}>Terapkan</button></div><p className="audit-total">Total log: {filtered.length.toLocaleString('id-ID')}</p><AuditTable columns={['No','Waktu','Ref ID','Trx ID','Status','Aksi','Keterangan']} template="35px 1fr 1.05fr .8fr .75fr .9fr 2fr">{rows.map((item,index)=><article key={`${refOf(item)}-${index}`}><span>{(safe-1)*10+index+1}</span><time>{dateTime(timeOf(item))}</time><code>{refOf(item)}</code><span>{item.id||item.order_number||'-'}</span><em>{statusOf(item)}</em><span>{item.action||item.type||'status_update'}</span><span>{item.Message||item.message||item.SN||'-'}</span></article>)}</AuditTable>{!rows.length&&<Empty/>}<footer className="audit-pages"><span>Halaman {safe} / {pages}</span><div><button disabled={safe===1} onClick={()=>setPage(v=>v-1)}>Sebelumnya</button><button disabled={safe===pages} onClick={()=>setPage(v=>v+1)}>Berikutnya</button></div></footer></section>
}

const AuditTitle=({title,note})=><header className="audit-title"><h1>{title}</h1><p>{note}</p></header>
const Metric=({name,value,green=false,cyan=false})=><article><span>{name}</span><strong className={green?'green':cyan?'cyan':''}>{value}</strong></article>
const AuditTable=({columns,template,children})=><div className="audit-table" style={{'--audit-columns':template}}><div className="head">{columns.map(column=><span key={column}>{column}</span>)}</div>{children}</div>
const Empty=({text='Tidak ada data untuk filter ini.'})=><p className="audit-empty">{text}</p>
