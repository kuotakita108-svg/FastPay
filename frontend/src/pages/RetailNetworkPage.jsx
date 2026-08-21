import {useEffect,useMemo,useState} from 'react'
import {ChevronRight,RefreshCw,Store,UserPlus,UsersRound,X} from 'lucide-react'
import SubPageHeader from '../components/mobile/SubPageHeader'
import MobileNav from '../components/mobile/MobileNav'
import {createManagedDownline,listManagedDownlines} from '../services/authService'
import {rupiah} from '../utils/currency'

const initials=value=>String(value||'AG').split(/\s+/).slice(0,2).map(word=>word[0]).join('').toUpperCase()

export default function RetailNetworkPage(){
  const [agents,setAgents]=useState([]),[loading,setLoading]=useState(true),[error,setError]=useState('')
  const [creating,setCreating]=useState(false),[saving,setSaving]=useState(false),[formError,setFormError]=useState('')
  const [form,setForm]=useState({role:'user',name:'',email:'',password:''})
  const load=()=>{setLoading(true);setError('');listManagedDownlines().then(rows=>setAgents(Array.isArray(rows)?rows:[])).catch(requestError=>setError(requestError.message||'Jaringan retail belum dapat dimuat.')).finally(()=>setLoading(false))}
  useEffect(load,[])
  const active=useMemo(()=>agents.filter(agent=>String(agent.access_status||'aktif').toLowerCase()!=='suspended').length,[agents])
  const submit=async event=>{event.preventDefault();setSaving(true);setFormError('');try{await createManagedDownline(form);setCreating(false);setForm({role:'user',name:'',email:'',password:''});load()}catch(requestError){setFormError(requestError.message||'Akun belum dapat dibuat.')}finally{setSaving(false)}}
  return <main className="mobile-app retail-network-page">
    <SubPageHeader title="Jaringan Retail" description="Downline yang terhubung"/>
    <section className="retail-network-hero"><i><UsersRound/></i><div><span>DOWNLINE</span><h1>Jaringan Retail</h1><p>Kelola User dan Agent yang kamu daftarkan melalui akun Marketing ini.</p></div></section>
    <section className="retail-network-directory">
      <header><div><h2>Daftar Agent/User</h2><p>{agents.length} downline terhubung · {active} aktif</p></div><button type="button" onClick={()=>setCreating(true)}><UserPlus/>Tambah</button></header>
      {loading&&<div className="retail-network-state"><span className="mutation-loader"/><strong>Memuat jaringan retail...</strong></div>}
      {!loading&&error&&<div className="retail-network-state error"><RefreshCw/><strong>Jaringan retail belum dapat dimuat</strong><small>{error}</small><button type="button" onClick={load}>Coba lagi</button></div>}
      {!loading&&!error&&agents.length===0&&<div className="retail-network-state"><Store/><strong>Belum ada downline terhubung</strong><small>Tambahkan akun pertama. Akun tersimpan di server dan dapat langsung digunakan untuk login KuotaKita.</small><button type="button" onClick={()=>setCreating(true)}><UserPlus/>Tambah Akun</button></div>}
      {!loading&&!error&&agents.map(agent=>{const suspended=String(agent.access_status||'').toLowerCase()==='suspended';return <article className="retail-network-row" key={agent.id}><i>{initials(agent.name)}</i><div><strong>{agent.name||agent.username}</strong><small>{agent.email||agent.phone||`@${agent.username}`}</small><span>{agent.role==='agent'?'Agent':'User'} · Downline Marketing</span></div><aside><b className={suspended?'suspended':'active'}>{suspended?'NONAKTIF':'AKTIF'}</b><strong>{rupiah(agent.balance)}</strong></aside></article>})}
    </section>
    {creating&&<div className="retail-downline-backdrop" onMouseDown={event=>event.target===event.currentTarget&&!saving&&setCreating(false)}><form className="retail-downline-sheet" onSubmit={submit}>
      <header><div><span>TAMBAH DOWNLINE</span><h2>Buat Akun Retail</h2><p>Akun baru akan langsung masuk ke jaringanmu.</p></div><button type="button" onClick={()=>setCreating(false)} disabled={saving}><X/></button></header>
      <label><span>Role</span><select value={form.role} onChange={event=>setForm({...form,role:event.target.value})}><option value="user">User</option><option value="agent">Agent</option></select></label>
      <label><span>Nama</span><input required minLength="3" value={form.name} onChange={event=>setForm({...form,name:event.target.value})} placeholder="Nama lengkap"/></label>
      <label><span>Email</span><input required type="email" value={form.email} onChange={event=>setForm({...form,email:event.target.value})} placeholder="nama@email.com"/></label>
      <label><span>Password</span><input required minLength="6" type="password" value={form.password} onChange={event=>setForm({...form,password:event.target.value})} placeholder="Minimal 6 karakter"/></label>
      {formError&&<div className="retail-downline-error">{formError}</div>}
      <button className="retail-downline-submit" disabled={saving}>{saving?'Menyimpan...':'Tambah Akun'}<ChevronRight/></button>
    </form></div>}
    <MobileNav/>
  </main>
}
