import {useEffect,useMemo,useState} from 'react'
import {RefreshCw,Store,UserPlus,UsersRound} from 'lucide-react'
import {useNavigate} from 'react-router-dom'
import SubPageHeader from '../components/mobile/SubPageHeader'
import MobileNav from '../components/mobile/MobileNav'
import {listManagedAgents} from '../services/authService'
import {rupiah} from '../utils/currency'

const initials=value=>String(value||'AG').split(/\s+/).slice(0,2).map(word=>word[0]).join('').toUpperCase()

export default function RetailNetworkPage(){
  const navigate=useNavigate()
  const [agents,setAgents]=useState([])
  const [loading,setLoading]=useState(true)
  const [error,setError]=useState('')
  const load=()=>{
    setLoading(true);setError('')
    listManagedAgents().then(rows=>setAgents(Array.isArray(rows)?rows:[])).catch(requestError=>setError(requestError.message||'Jaringan retail belum dapat dimuat.')).finally(()=>setLoading(false))
  }
  useEffect(load,[])
  const active=useMemo(()=>agents.filter(agent=>String(agent.access_status||'aktif').toLowerCase()!=='suspended').length,[agents])
  return <main className="mobile-app retail-network-page">
    <SubPageHeader title="Jaringan Retail" description="Agent binaan yang terhubung"/>
    <section className="retail-network-hero"><i><UsersRound/></i><div><span>DOWNLINE</span><h1>Jaringan Retail</h1><p>Kelola agent yang kamu daftarkan langsung melalui akun Marketing ini.</p></div></section>
    <section className="retail-network-directory">
      <header><div><h2>Daftar Agent</h2><p>{agents.length} agent terhubung · {active} aktif</p></div><button type="button" onClick={()=>navigate('/marketing?tab=apply&view=agent-input')}><UserPlus/>Tambah</button></header>
      {loading&&<div className="retail-network-state"><span className="mutation-loader"/><strong>Memuat jaringan retail...</strong></div>}
      {!loading&&error&&<div className="retail-network-state error"><RefreshCw/><strong>Jaringan retail belum dapat dimuat</strong><small>{error}</small><button type="button" onClick={load}>Coba lagi</button></div>}
      {!loading&&!error&&agents.length===0&&<div className="retail-network-state"><Store/><strong>Belum ada agent terhubung</strong><small>Tambahkan agent pertama. Akunnya akan tersimpan di server dan dapat langsung digunakan untuk login KuotaKita.</small><button type="button" onClick={()=>navigate('/marketing?tab=apply&view=agent-input')}><UserPlus/>Tambah Agent</button></div>}
      {!loading&&!error&&agents.map(agent=>{
        const suspended=String(agent.access_status||'').toLowerCase()==='suspended'
        return <article className="retail-network-row" key={agent.id}>
          <i>{initials(agent.name)}</i><div><strong>{agent.name||agent.username}</strong><small>{agent.email||agent.phone||`@${agent.username}`}</small><span>{agent.store_name||'Agent KuotaKita'}</span></div><aside><b className={suspended?'suspended':'active'}>{suspended?'NONAKTIF':'AKTIF'}</b><strong>{rupiah(agent.balance)}</strong></aside>
        </article>
      })}
    </section>
    <MobileNav/>
  </main>
}
