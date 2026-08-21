import {useEffect,useMemo,useState} from 'react'
import {useNavigate} from 'react-router-dom'
import {ChevronRight,Clock3,PhoneCall,RefreshCw,Store,UserPlus,UsersRound,X} from 'lucide-react'
import MobileHeader from '../components/mobile/MobileHeader'
import MobileNav from '../components/mobile/MobileNav'
import {listManagedAgents,updateAgentFollowUp} from '../services/authService'

const statusCopy={ACTIVE:'Aktif',NEED_FOLLOW_UP:'Perlu Follow-up',NO_TRANSACTION:'Belum Transaksi',PARTNERSHIP_ENDED:'Putus Mitra'}
const followUps=[['CONTACTED','Sudah dihubungi'],['UNREACHABLE','Tidak bisa dihubungi'],['VISITED','Sudah dikunjungi'],['WILL_CONTINUE','Agent akan lanjut'],['WANTS_TO_STOP','Agent ingin berhenti']]
const formatDate=value=>value?new Date(value).toLocaleString('id-ID',{day:'2-digit',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit'}):'Belum pernah transaksi'

export default function MarketingFieldHome(){
 const navigate=useNavigate(),[agents,setAgents]=useState([]),[loading,setLoading]=useState(true),[selected,setSelected]=useState(null),[error,setError]=useState('')
 const load=()=>{setLoading(true);setError('');listManagedAgents().then(rows=>setAgents(Array.isArray(rows)?rows:[])).catch(err=>setError(err.message)).finally(()=>setLoading(false))}
 useEffect(load,[])
 const stats=useMemo(()=>({total:agents.length,active:agents.filter(a=>a.activity_status==='ACTIVE').length,follow:agents.filter(a=>a.activity_status==='NEED_FOLLOW_UP').length,never:agents.filter(a=>a.activity_status==='NO_TRANSACTION').length}),[agents])
 const saveFollowUp=async status=>{try{const saved=await updateAgentFollowUp(selected.id,status);setAgents(rows=>rows.map(row=>row.id===saved.id?saved:row));setSelected(saved)}catch(err){setError(err.message)}}
 return <main className="mobile-app marketing-field-app"><MobileHeader/>
  <section className="marketing-field-head"><div><span>OPERASIONAL LAPANGAN</span><h1>Agent Saya</h1><p>Pantau aktivitas agent yang kamu daftarkan tanpa membuka data keuangan mereka.</p></div><button onClick={()=>navigate('/app/profile/retail-network')}><UserPlus/>Daftarkan Agent</button></section>
  <section className="marketing-field-stats"><article><UsersRound/><span>Total Agent</span><strong>{stats.total}</strong></article><article><Store/><span>Aktif Hari Ini</span><strong>{stats.active}</strong></article><article><PhoneCall/><span>Perlu Follow-up</span><strong>{stats.follow}</strong></article><article><Clock3/><span>Belum Transaksi</span><strong>{stats.never}</strong></article></section>
  <section className="marketing-agent-list"><header><div><span>AGENT BINAAN</span><h2>Aktivitas terbaru</h2></div><button onClick={load} aria-label="Muat ulang"><RefreshCw/></button></header>
   {error&&<p className="marketing-agent-error">{error}</p>}{loading?<p className="marketing-agent-empty">Memuat agent...</p>:agents.length?agents.map(agent=><button className="marketing-agent-row" onClick={()=>setSelected(agent)} key={agent.id}><i>{String(agent.name||'AG').slice(0,2).toUpperCase()}</i><span><b>{agent.name}</b><small>{agent.store_name||'Nama toko belum diisi'} · {agent.phone||'Nomor belum diisi'}</small><em>{formatDate(agent.last_transaction_at)}</em></span><strong className={`activity-${String(agent.activity_status).toLowerCase()}`}>{statusCopy[agent.activity_status]||agent.activity_status}</strong><ChevronRight/></button>):<p className="marketing-agent-empty">Belum ada agent binaan. Daftarkan agent pertama saat kunjungan lapangan.</p>}
  </section>
  {selected&&<div className="marketing-agent-sheet-backdrop" onMouseDown={event=>event.target===event.currentTarget&&setSelected(null)}><section className="marketing-agent-sheet"><header><div><span>PROFIL OPERASIONAL</span><h2>{selected.name}</h2><p>{selected.store_name||'Nama toko belum diisi'}</p></div><button onClick={()=>setSelected(null)}><X/></button></header><dl><div><dt>WhatsApp</dt><dd>{selected.phone||'-'}</dd></div><div><dt>Bergabung</dt><dd>{formatDate(selected.created_at)}</dd></div><div><dt>Transaksi terakhir</dt><dd>{formatDate(selected.last_transaction_at)}</dd></div><div><dt>Tidak aktif</dt><dd>{selected.inactive_days||0} hari</dd></div><div><dt>Status aktivitas</dt><dd>{statusCopy[selected.activity_status]||selected.activity_status}</dd></div><div><dt>Follow-up terakhir</dt><dd>{selected.follow_up_status||'Belum ada'}</dd></div></dl><h3>Catat hasil follow-up</h3><div className="marketing-follow-actions">{followUps.map(([value,label])=><button key={value} onClick={()=>saveFollowUp(value)}>{label}</button>)}</div><small>Marketing hanya melaporkan kondisi lapangan. Keputusan modal dan kemitraan tetap milik Operator.</small></section></div>}
  <MobileNav/>
 </main>
}
