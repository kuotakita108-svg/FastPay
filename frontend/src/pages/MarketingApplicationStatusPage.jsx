import {useEffect,useMemo,useState} from 'react'
import {ChevronDown,FileCheck2,FileSearch,RefreshCw,XCircle} from 'lucide-react'
import SubPageHeader from '../components/mobile/SubPageHeader'
import MobileNav from '../components/mobile/MobileNav'
import {request} from '../services/http'
import {rupiah} from '../utils/currency'
import '../styles/marketing-credit.css'

const documentTypes=[['ktp','KTP pemilik konter'],['store','Foto konter'],['marketing','Foto bersama marketing'],['application','Dokumen pengajuan kredit']]
const statusOf=value=>{const status=String(value||'').toLowerCase();if(status.includes('disetujui')||status.includes('diterima')||status.includes('aktif'))return {key:'accepted',label:'Aktif'};if(status.includes('ditolak'))return {key:'rejected',label:'Ditolak'};return {key:'processing',label:'Diproses'}}
const agentName=item=>item?.form?.agentName||item?.userName||item?.form?.storeName||'Agent KuotaKita'
const agentKey=item=>item?.userId||item?._owner_id||item?.form?.email||item?.form?.whatsapp||agentName(item)
const approvedAmount=item=>Number(item?.approvedCapital||item?.approvedAmount||item?.creditOriginalAmount||item?.form?.amount||0)
const decisionNote=item=>item?.operatorDecision?.note||item?.reviewNote||item?.note||'Belum ada catatan reviewer.'
const documentSource=document=>typeof document==='string'?document:document?.image||document?.dataUrl||document?.url||''

function EmptyState({loading,error,onRetry}){
  if(loading)return <div className="marketing-status-empty"><span className="mutation-loader"/><strong>Memuat data agent...</strong></div>
  if(error)return <div className="marketing-status-empty"><XCircle/><strong>Data belum dapat dimuat</strong><small>{error}</small><button type="button" onClick={onRetry}>Coba lagi</button></div>
  return <div className="marketing-status-empty"><FileSearch/><strong>Belum ada pengajuan agent</strong><small>Dokumen dan pengajuan agent binaan akan tampil otomatis setelah dikirim ke Operator.</small></div>
}

export default function MarketingApplicationStatusPage(){
  const [items,setItems]=useState([]),[loading,setLoading]=useState(true),[error,setError]=useState(''),[expanded,setExpanded]=useState('')
  const load=()=>{setLoading(true);setError('');request('/agent-credit/applications',{noCache:true}).then(rows=>setItems(Array.isArray(rows)?rows:[])).catch(err=>setError(err.message||'Status pengajuan belum dapat dimuat.')).finally(()=>setLoading(false))}
  useEffect(load,[])
  const agents=useMemo(()=>{const groups=new Map();items.forEach(item=>{const key=agentKey(item);if(!groups.has(key))groups.set(key,{key,name:agentName(item),applications:[]});groups.get(key).applications.push(item)});return [...groups.values()].map(group=>({...group,latest:group.applications[0]}))},[items])
  const empty=loading||error||items.length===0

  return <main className="mobile-app marketing-status-page">
    <SubPageHeader title="Kredit Modal" description="Dokumen dan pengajuan agent binaan" back/>
    <section className="marketing-credit-section marketing-agent-documents">
      <header><FileCheck2/><h1>Dokumen Agent</h1><button type="button" onClick={load} disabled={loading} aria-label="Muat ulang"><RefreshCw/></button></header>
      {!empty&&agents.map(group=>{const item=group.latest,documents=item?.documents||{},hasSignature=Boolean(item?.agentConsent?.signature),count=documentTypes.filter(([key])=>Boolean(documents[key])).length+(hasSignature?1:0),state=statusOf(item?.status),open=expanded===group.key;return <article className={`marketing-agent-document ${open?'open':''}`} key={group.key}>
        <button type="button" className="marketing-agent-document-toggle" onClick={()=>setExpanded(open?'':group.key)} aria-expanded={open}><span><strong>{group.name}</strong><small>{count} dokumen · klik untuk melihat semua</small></span><b className={state.key}>{state.key==='accepted'?'Disetujui':state.label}</b><i><ChevronDown/></i></button>
        {open&&<div className="marketing-document-gallery">{documentTypes.map(([key,label])=>{const source=documentSource(documents[key]);return <figure key={key} className={!source?'missing':''}><figcaption><strong>{label}</strong><b className={source?'ready':'missing'}>{source?(state.key==='accepted'?'Disetujui':'Terkirim'):'Belum ada'}</b></figcaption>{source?<img src={source} alt={label} loading="lazy"/>:<div className="marketing-document-placeholder"><FileSearch/><span>Foto belum tersedia</span></div>}</figure>})}{hasSignature&&<figure><figcaption><strong>Tanda tangan agent</strong><b className="ready">Tersedia</b></figcaption><img className="signature" src={item.agentConsent.signature} alt="Tanda tangan agent" loading="lazy"/></figure>}</div>}
      </article>})}
      {empty&&<EmptyState loading={loading} error={error} onRetry={load}/>}
    </section>
    <section className="marketing-credit-section marketing-agent-applications">
      <header><h2>Pengajuan Agent</h2></header>
      {!empty&&items.map(item=>{const state=statusOf(item.status),amount=approvedAmount(item);return <article key={item.id}><div className="marketing-application-top"><strong>{item.id} · {agentName(item)}</strong><span><b>{rupiah(amount)}</b><em className={state.key}>{state.label}</em></span></div><p>{item?.form?.purpose||'Tanpa keterangan'}</p>{state.key==='accepted'&&<div className="marketing-approved-amount">Disetujui: {rupiah(amount)}</div>}<small>Catatan review: {decisionNote(item)}</small></article>})}
      {empty&&<EmptyState loading={loading} error={error} onRetry={load}/>}
    </section><MobileNav/>
  </main>
}
