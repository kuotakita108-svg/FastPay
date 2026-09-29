import {useMemo, useState} from 'react'
import {Download, RefreshCw} from 'lucide-react'
import {rupiah} from '../../utils/currency'

const isoDay=value=>{
  const date=new Date(value||0)
  if(Number.isNaN(date.getTime())) return ''
  return date.toISOString().slice(0,10)
}
const displayDay=value=>value?new Intl.DateTimeFormat('id-ID',{day:'2-digit',month:'2-digit',year:'numeric'}).format(new Date(`${value}T00:00:00`)):'-'
const statusOf=order=>String(order?.Status||'pending').toLowerCase()
const sum=(rows,selector)=>rows.reduce((total,row)=>total+Number(selector(row)||0),0)

export default function SuperAdminBusinessReport({h2h={},accounts=[],onRefresh}){
  const today=new Date().toISOString().slice(0,10)
  const initialFrom=useMemo(()=>{const date=new Date();date.setDate(date.getDate()-89);return date.toISOString().slice(0,10)},[])
  const [from,setFrom]=useState(initialFrom)
  const [to,setTo]=useState(today)
  const [channel,setChannel]=useState('gabungan')
  const orders=useMemo(()=>Array.isArray(h2h.orders)?h2h.orders:[],[h2h.orders])
  const filtered=useMemo(()=>orders.filter(order=>{
    const day=isoDay(order.CreatedAt)
    if(!day||day<from||day>to) return false
    if(channel==='h2h') return Boolean(order.DirectH2H)
    if(channel==='retail') return !order.DirectH2H
    return true
  }),[orders,from,to,channel])
  const rows=useMemo(()=>{
    const grouped=new Map()
    filtered.forEach(order=>{
      const day=isoDay(order.CreatedAt)
      const row=grouped.get(day)||{day,count:0,nominal:0,success:0,pending:0,failed:0,memberPayment:0,directH2H:0,refund:0}
      const status=statusOf(order)
      row.count+=1;row.nominal+=Number(order.Amount||0);row[status]=(row[status]||0)+1
      row.memberPayment+=Number(order.MainUsed||0)+Number(order.CreditUsed||0)
      if(order.DirectH2H) row.directH2H+=Number(order.Amount||0)
      if(order.Refunded) row.refund+=Number(order.Amount||0)
      grouped.set(day,row)
    })
    return [...grouped.values()].sort((a,b)=>b.day.localeCompare(a.day))
  },[filtered])
  const memberBalance=sum(accounts,account=>account.balance)
  const successful=filtered.filter(order=>statusOf(order)==='success')
  const failed=filtered.filter(order=>statusOf(order)==='failed')
  const pending=filtered.filter(order=>statusOf(order)==='pending')
  const metrics=[
    ['Jumlah transaksi',filtered.length],['Nominal transaksi',rupiah(sum(filtered,order=>order.Amount))],
    ['Transaksi berhasil',successful.length],['Nominal berhasil',rupiah(sum(successful,order=>order.Amount))],
    ['Transaksi diproses',pending.length],['Transaksi gagal',failed.length],
    ['Total saldo member',rupiah(memberBalance)],['Saldo H2H Pulsa24Jam',h2h.balance==null?'Belum terhubung':rupiah(h2h.balance)],
  ]
  const exportCsv=()=>{
    const data=[['Tanggal','Jumlah transaksi','Nilai penjualan','Berhasil','Diproses','Gagal','Pembayaran member','Transaksi H2H langsung','Refund'],...rows.map(row=>[row.day,row.count,row.nominal,row.success,row.pending,row.failed,row.memberPayment,row.directH2H,row.refund])]
    const csv=data.map(row=>row.map(value=>`"${String(value).replaceAll('"','""')}"`).join(',')).join('\n')
    const link=document.createElement('a');link.href=URL.createObjectURL(new Blob([csv],{type:'text/csv;charset=utf-8'}));link.download=`laporan-bisnis-kuotakita-${today}.csv`;link.click();URL.revokeObjectURL(link.href)
  }
  return <div className="owner-business-report">
    <header className="owner-report-head"><div><span>LAPORAN BISNIS KUOTAKITA</span><h1>Rekap operasional aplikasi</h1><p>Pantau penjualan, status transaksi, pembayaran member, refund, dan operasional H2H dari data server.</p></div><div className="owner-report-tabs">{['gabungan','retail','h2h'].map(value=><button className={channel===value?'active':''} onClick={()=>setChannel(value)} key={value}>{value==='gabungan'?'Semua':value==='retail'?'Member':'H2H langsung'}</button>)}</div></header>
    <section className="owner-report-filters"><label>Dari<input type="date" value={from} max={to} onChange={event=>setFrom(event.target.value)}/></label><label>Sampai<input type="date" value={to} min={from} onChange={event=>setTo(event.target.value)}/></label><button className="primary" type="button" onClick={onRefresh} disabled={h2h.loading}><RefreshCw/>Perbarui data</button><button type="button" onClick={exportCsv}><Download/>Export CSV</button></section>
    <section className="owner-report-metrics">{metrics.map(([label,value])=><article key={label}><span>{label}</span><strong>{value}</strong></article>)}</section>
    <section className="owner-report-ledger"><header><div><span>REKAP HARIAN APLIKASI</span><h2>Aktivitas transaksi KuotaKita</h2></div><small>{rows.length} hari memiliki aktivitas</small></header><div className="owner-report-scroll"><div className="owner-report-table"><div className="head"><span>Tanggal</span><span>Jumlah trx</span><span>Penjualan</span><span>Berhasil</span><span>Diproses</span><span>Gagal</span><span>Pembayaran member</span><span>H2H langsung</span><span>Refund</span></div>{rows.map(row=><div className="row" key={row.day}><b>{displayDay(row.day)}</b><span>{row.count}</span><strong>{rupiah(row.nominal)}</strong><em className="success">{row.success}</em><em className="pending">{row.pending}</em><em className="failed">{row.failed}</em><span>{rupiah(row.memberPayment)}</span><span>{rupiah(row.directH2H)}</span><span>{rupiah(row.refund)}</span></div>)}{!rows.length&&<p>Belum ada transaksi KuotaKita pada periode dan kanal yang dipilih.</p>}</div></div></section>
  </div>
}
