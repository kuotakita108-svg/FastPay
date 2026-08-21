import {useEffect,useMemo,useState} from 'react'
import {CheckCircle2,PhoneCall,RefreshCw,Store,UserRound} from 'lucide-react'
import SubPageHeader from '../components/mobile/SubPageHeader'
import MobileNav from '../components/mobile/MobileNav'
import {listManagedAgents,updateAgentFollowUp} from '../services/authService'

const actions=[['CONTACTED','Sudah dihubungi'],['UNREACHABLE','Belum terhubung'],['VISITED','Sudah dikunjungi'],['WILL_CONTINUE','Usaha dilanjutkan'],['WANTS_TO_STOP','Ajukan berhenti']]
const copy={ACTIVE:'Aktif',NEED_FOLLOW_UP:'Perlu ditindaklanjuti',NO_TRANSACTION:'Belum transaksi',PARTNERSHIP_ENDED:'Kemitraan berakhir'}
export default function MarketingFollowUpPage(){
 const [rows,setRows]=useState([]),[loading,setLoading]=useState(true),[error,setError]=useState(''),[saving,setSaving]=useState(''),[message,setMessage]=useState('')
 const load=()=>{setLoading(true);setError('');listManagedAgents().then(data=>setRows(Array.isArray(data)?data:[])).catch(err=>setError(err.message||'Data Agent belum dapat dimuat.')).finally(()=>setLoading(false))}
 useEffect(load,[])
 const ordered=useMemo(()=>[...rows].sort((a,b)=>Number(['NEED_FOLLOW_UP','NO_TRANSACTION'].includes(b.activity_status))-Number(['NEED_FOLLOW_UP','NO_TRANSACTION'].includes(a.activity_status))),[rows])
 const save=async(agent,status)=>{setSaving(agent.id);setMessage('');try{await updateAgentFollowUp(agent.id,status,`Laporan Marketing: ${actions.find(item=>item[0]===status)?.[1]||status}`);setMessage(`Tindak lanjut ${agent.name} berhasil dikirim ke Operator.`);load()}catch(err){setError(err.message||'Tindak lanjut belum dapat disimpan.')}finally{setSaving('')}}
 return <main className="mobile-app marketing-follow-page"><SubPageHeader title="Tindak Lanjut Agent" description="Laporan kondisi agent binaan" back/>
  <section className="marketing-follow-hero"><i><PhoneCall/></i><div><span>KOORDINASI LAPANGAN</span><h1>Catat hasil pendampingan</h1><p>Utamakan Agent yang belum transaksi atau perlu dihubungi. Hasilnya langsung tersedia bagi Operator.</p></div></section>
  {message&&<p className="marketing-follow-message"><CheckCircle2/>{message}</p>}
  <section className="marketing-follow-list"><header><div><span>AGENT SAYA</span><h2>Daftar tindak lanjut</h2></div><button onClick={load} aria-label="Muat ulang"><RefreshCw/></button></header>
   {loading?<div className="marketing-status-empty"><span className="mutation-loader"/><strong>Memuat Agent...</strong></div>:error?<div className="marketing-status-empty"><strong>Data belum dapat dimuat</strong><small>{error}</small><button onClick={load}>Coba lagi</button></div>:ordered.length===0?<div className="marketing-status-empty"><Store/><strong>Belum ada Agent binaan</strong><small>Daftarkan Agent melalui menu Jaringan Agent.</small></div>:ordered.map(agent=><article key={agent.id}><header><i><UserRound/></i><div><strong>{agent.name}</strong><small>{agent.store_name||'Toko belum dilengkapi'} · {agent.phone||'Nomor belum dilengkapi'}</small></div><b>{copy[agent.activity_status]||'Belum diperiksa'}</b></header><div>{actions.map(([value,label])=><button disabled={saving===agent.id} key={value} onClick={()=>save(agent,value)}>{label}</button>)}</div>{agent.follow_up_status&&<small>Terakhir: {agent.follow_up_status}</small>}</article>)}
  </section><MobileNav/></main>
}
