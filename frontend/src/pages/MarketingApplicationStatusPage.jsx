import {useEffect,useMemo,useState} from 'react'
import {CheckCircle2,Clock3,FileSearch,RefreshCw,ShieldCheck,XCircle} from 'lucide-react'
import SubPageHeader from '../components/mobile/SubPageHeader'
import MobileNav from '../components/mobile/MobileNav'
import {request} from '../services/http'

const statusOf=value=>{
  const status=String(value||'').toLowerCase()
  if(status.includes('disetujui')||status.includes('diterima'))return {key:'accepted',label:'Diterima',Icon:CheckCircle2}
  if(status.includes('ditolak'))return {key:'rejected',label:'Ditolak',Icon:XCircle}
  return {key:'processing',label:'Diproses Operator',Icon:Clock3}
}

export default function MarketingApplicationStatusPage(){
  const [items,setItems]=useState([]),[loading,setLoading]=useState(true),[error,setError]=useState('')
  const load=()=>{setLoading(true);setError('');request('/agent-credit/applications',{noCache:true}).then(rows=>setItems(Array.isArray(rows)?rows:[])).catch(err=>setError(err.message||'Status pengajuan belum dapat dimuat.')).finally(()=>setLoading(false))}
  useEffect(load,[])
  const counts=useMemo(()=>items.reduce((result,item)=>{result[statusOf(item.status).key]++;return result},{processing:0,accepted:0,rejected:0}),[items])
  return <main className="mobile-app marketing-status-page">
    <SubPageHeader title="Status Pengajuan" description="Pantau pengajuan agent binaan" back/>
    <section className="marketing-status-summary"><header><div><span>MONITOR PENGAJUAN</span><h1>Keputusan Operator</h1><p>Pengajuan dikirim Agent langsung ke Operator. Marketing hanya memantau hasil agent yang didaftarkannya.</p></div><i><ShieldCheck/></i></header><div><article><b>{counts.processing}</b><small>Diproses</small></article><article><b>{counts.accepted}</b><small>Diterima</small></article><article><b>{counts.rejected}</b><small>Ditolak</small></article></div></section>
    <section className="marketing-status-list"><header><div><span>AGENT BINAAN</span><h2>Riwayat Pengajuan</h2></div><button type="button" onClick={load} disabled={loading} aria-label="Muat ulang"><RefreshCw/></button></header>
      {loading?<div className="marketing-status-empty"><span className="mutation-loader"/><strong>Memuat status...</strong></div>:error?<div className="marketing-status-empty"><XCircle/><strong>Data belum dapat dimuat</strong><small>{error}</small><button onClick={load}>Coba lagi</button></div>:items.length===0?<div className="marketing-status-empty"><FileSearch/><strong>Belum ada pengajuan</strong><small>Pengajuan Agent yang kamu daftarkan akan otomatis tampil di sini.</small></div>:items.map(item=>{const state=statusOf(item.status),Icon=state.Icon;return <article key={item.id}><i className={state.key}><Icon/></i><div><strong>{item.userName||'Agent KuotaKita'}</strong><small>{item.id}</small><span>{item.updatedAt?new Date(item.updatedAt).toLocaleString('id-ID'):'Status tercatat di server'}</span></div><b className={state.key}>{state.label}</b></article>})}
    </section><MobileNav/>
  </main>
}
