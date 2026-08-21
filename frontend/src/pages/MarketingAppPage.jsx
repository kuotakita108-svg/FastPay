import {useEffect,useMemo,useState} from 'react'
import {Navigate,useNavigate,useSearchParams} from 'react-router-dom'
import {BookOpenCheck,ChevronRight,ClipboardCheck,Eye,EyeOff,FileCheck2,Home,LogOut,PlusCircle,ShieldCheck,UserPlus,UsersRound,WalletCards} from 'lucide-react'
import KuotaKitaLogo from '../components/common/KuotaKitaLogo'
import CreditApplicationsPage from './CreditApplicationsPage'
import {useAuth} from '../context/AuthContext'
import {listManagedAgents} from '../services/authService'

const tabs={home:null,agents:'peminjam',apply:'input',survey:'verifikasi'}

export default function MarketingAppPage(){
  const {user,logout}=useAuth(),navigate=useNavigate(),[params,setParams]=useSearchParams()
  const [agents,setAgents]=useState([]),[balanceVisible,setBalanceVisible]=useState(false)
  const requestedView=params.get('view')
  const tab=params.get('tab')||(requestedView?'workflow':'home')
  const view=requestedView||tabs[tab]
  useEffect(()=>{let active=true;listManagedAgents().then(rows=>active&&setAgents(Array.isArray(rows)?rows:[])).catch(()=>active&&setAgents([]));return()=>{active=false}},[])
  const open=(nextTab,nextView=tabs[nextTab])=>setParams({tab:nextTab,...(nextView?{view:nextView}:{})})
  const initials=useMemo(()=>String(user?.name||user?.username||'MK').split(/\s+/).slice(0,2).map(word=>word[0]).join('').toUpperCase(),[user])
  const exit=()=>{logout();navigate('/login',{replace:true})}
  const accountMenus=[
    ['Agent Binaan','Lihat seluruh agent yang kamu daftarkan',UsersRound,'agents','peminjam'],
    ['Tambah Agent','Buat akun resmi untuk agent baru',UserPlus,'apply','agent-input'],
    ['Pengajuan Kredit','Buat dan pantau pengajuan agent',ClipboardCheck,'apply','input'],
    ['Survei & Dokumen','Lengkapi empat foto sebelum dikirim',FileCheck2,'survey','verifikasi'],
    ['Panduan Kerja','Pelajari alur marketing KuotaKita',BookOpenCheck,'guide','panduan'],
  ]
  if(!requestedView)return <Navigate to="/app/profile" replace/>
  const isWorkspace=Boolean(view)&&tab!=='account'&&tab!=='home'
  return <main className={`marketing-mobile-app${isWorkspace?' workspace-open':''}`}>
    <header className="marketing-app-header"><KuotaKitaLogo compact/><span className="marketing-app-role"><ShieldCheck/>Marketing</span><button type="button" onClick={()=>open('account')}><span>{initials}</span><small>Akun</small></button></header>

    {tab==='home'&&<div className="marketing-app-content">
      <section className="marketing-welcome"><div><span>AREA MARKETING</span><h1>Halo, {user?.name||'Marketing'}</h1><p>Kelola agent binaan dan teruskan berkas yang lengkap kepada Operator.</p></div><i>{initials}</i></section>
      <section className="marketing-summary-card"><header><div><span>PORTOFOLIO SAYA</span><h2>Agent binaan aktif</h2></div><strong>{agents.length}</strong></header><div><button onClick={()=>open('apply','agent-input')}><UserPlus/><span><b>Tambah Agent</b><small>Buat akun baru</small></span></button><button onClick={()=>open('apply','input')}><PlusCircle/><span><b>Pengajuan</b><small>Ajukan kredit</small></span></button><button onClick={()=>open('survey','verifikasi')}><FileCheck2/><span><b>Survei</b><small>Lengkapi berkas</small></span></button></div></section>
      <section className="marketing-home-menu"><header><span>PEKERJAAN UTAMA</span><h2>Kerjakan lebih cepat</h2></header>{accountMenus.slice(0,4).map(([title,desc,Icon,nextTab,nextView])=><button type="button" onClick={()=>open(nextTab,nextView)} key={title}><i><Icon/></i><span><b>{title}</b><small>{desc}</small></span><ChevronRight/></button>)}</section>
    </div>}

    {tab==='account'&&<div className="marketing-app-content marketing-account-page">
      <section className="marketing-account-card"><span>AKUN MARKETING</span><div><i>{initials}</i><p><b>{user?.name||'Marketing KuotaKita'}</b><small>{user?.email||`@${user?.username}`}</small></p></div><footer><span>Agent binaan</span><strong>{balanceVisible?`${agents.length} agent`:'••••••'}<button type="button" aria-label="Tampilkan jumlah agent" onClick={()=>setBalanceVisible(value=>!value)}>{balanceVisible?<EyeOff/>:<Eye/>}</button></strong></footer></section>
      <section className="marketing-account-menu"><header>MENU AKUN</header>{accountMenus.map(([title,desc,Icon,nextTab,nextView],index)=><button type="button" onClick={()=>open(nextTab,nextView)} key={title}><i className={`tone-${index+1}`}><Icon/></i><span><b>{title}</b><small>{desc}</small></span><ChevronRight/></button>)}</section>
      <button className="marketing-logout" type="button" onClick={exit}><LogOut/>Keluar</button>
    </div>}

    {isWorkspace&&<section className="marketing-app-workspace"><CreditApplicationsPage/></section>}

    <nav className="marketing-bottom-nav">
      <button className={tab==='home'?'active':''} onClick={()=>open('home')}><Home/><span>Beranda</span></button>
      <button className={tab==='agents'?'active':''} onClick={()=>open('agents')}><UsersRound/><span>Agent</span></button>
      <button className={['apply','survey','guide','workflow'].includes(tab)?'active':''} onClick={()=>open('survey')}><ClipboardCheck/><span>Pengajuan</span></button>
      <button className={tab==='account'?'active':''} onClick={()=>open('account')}><WalletCards/><span>Akun</span></button>
    </nav>
  </main>
}
