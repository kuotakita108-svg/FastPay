import {useEffect,useState} from 'react'
import {useNavigate} from 'react-router-dom'
import {Bell,Camera,ChevronRight,FileText,HelpCircle,Landmark,Link2,LockKeyhole,LogOut,Mail,Phone,QrCode,Save,ShieldCheck,UserRound,UsersRound,WalletCards,X} from 'lucide-react'
import SubPageHeader from '../components/mobile/SubPageHeader'
import MobileNav from '../components/mobile/MobileNav'
import {useAuth} from '../context/AuthContext'
import {updateProfile} from '../services/authService'

export default function ProfilePage(){
  const {user,updateUser,logout}=useAuth(),navigate=useNavigate()
  const isMarketing=user?.role==='marketing'
  const [editing,setEditing]=useState(false)
  const [form,setForm]=useState({name:'',phone:'',email:''})
  const [saving,setSaving]=useState(false)
  const [error,setError]=useState('')
  const [message,setMessage]=useState('')
  useEffect(()=>setForm({name:user?.name||'',phone:user?.phone||'',email:user?.email||''}),[user])
  const exit=()=>{logout();navigate('/login')}
  const menus=[['Keamanan Akun','PIN, sidik jari, dan perangkat',LockKeyhole,'security'],['Notifikasi','Atur informasi transaksi',Bell,'notifications'],['Pusat Bantuan','FAQ dan layanan pelanggan',HelpCircle,'help'],['Syarat & Kebijakan','Ketentuan penggunaan KuotaKita',FileText,'policies']]
  const marketingMenus=[
    ['Mutasi Saldo',WalletCards,'blue'],
    ['Fee Retail',Link2,'green'],
    ['Topup Saldo',QrCode,'cyan'],
    ['Withdraw Fee',Landmark,'violet'],
    ['Jaringan Retail',UsersRound,'orange'],
  ]
  const openEditor=()=>{setForm({name:user.name||'',phone:user.phone||'',email:user.email||''});setError('');setMessage('');setEditing(true)}
  const submit=async event=>{
    event.preventDefault();setSaving(true);setError('')
    try{
      const saved=await updateProfile(form)
      updateUser(saved);setEditing(false);setMessage('Informasi pribadi berhasil diperbarui.')
    }catch(requestError){setError(requestError.message)}finally{setSaving(false)}
  }
  if(isMarketing)return <main className="mobile-app profile-page marketing-kuotakita-profile">
    <SubPageHeader title="Akun Saya" description="Profil dan pengaturan"/>
    <section className="profile-hero"><div className="profile-avatar">{(user?.name||'MK').slice(0,2).toUpperCase()}<button type="button" aria-label="Foto profil segera tersedia" title="Foto profil segera tersedia"><Camera/></button></div><strong>{user?.name||'Marketing KuotaKita'}</strong><span>@{user?.username}</span><small><ShieldCheck/>Akun KuotaKita aktif</small></section>
    {message&&<div className="profile-saved-message"><ShieldCheck/>{message}</div>}
    <section className="personal-info"><header><h2>Informasi Pribadi</h2><button type="button" onClick={openEditor}>Edit</button></header><div><UserRound/><span><small>Nama lengkap</small><strong>{user?.name||'Marketing KuotaKita'}</strong></span></div><div><Phone/><span><small>Nomor handphone</small><strong className={!user?.phone?'incomplete':''}>{user?.phone||'Belum dilengkapi'}</strong></span></div><div><Mail/><span><small>Email / Gmail</small><strong className={!user?.email?'incomplete':''}>{user?.email||'Belum dilengkapi'}</strong></span></div></section>
    <section className="profile-menu marketing-profile-menu"><header><span>MENU AKUN</span></header>{marketingMenus.map(([title,Icon,tone])=><button type="button" key={title} onClick={()=>title==='Mutasi Saldo'?navigate('/app/profile/mutations'):title==='Fee Retail'?navigate('/app/profile/retail-fees'):title==='Topup Saldo'?navigate('/app/balance/topup'):title==='Withdraw Fee'?navigate('/app/profile/withdraw-fees'):undefined}><i className={`tone-${tone}`}><Icon/></i><div><strong>{title}</strong></div><ChevronRight/></button>)}</section>
    <button className="logout-mobile" onClick={exit}><LogOut/>Keluar dari KuotaKita</button><p className="profile-version">KuotaKita versi 1.0.0</p>
    {editing&&<div className="profile-edit-backdrop" onMouseDown={event=>event.target===event.currentTarget&&!saving&&setEditing(false)}><form className="profile-edit-sheet" onSubmit={submit}>
      <header><div><span>PROFIL AKUN</span><h2>Edit Informasi Pribadi</h2><p>Lengkapi data agar akun lebih mudah dikenali.</p></div><button type="button" onClick={()=>setEditing(false)} disabled={saving}><X/></button></header>
      <label><span>Nama lengkap</span><div><UserRound/><input required minLength="3" value={form.name} onChange={event=>setForm({...form,name:event.target.value})} placeholder="Masukkan nama lengkap"/></div></label>
      <label><span>Nomor handphone <em>Opsional</em></span><div><Phone/><input inputMode="numeric" value={form.phone} onChange={event=>setForm({...form,phone:event.target.value.replace(/\D/g,'').slice(0,15)})} placeholder="Contoh: 081234567890"/></div></label>
      <label><span>Email / Gmail <em>Opsional</em></span><div><Mail/><input type="email" value={form.email} onChange={event=>setForm({...form,email:event.target.value})} placeholder="nama@gmail.com"/></div></label>
      <small className="profile-edit-hint"><ShieldCheck/>Nomor dan email disimpan aman pada akunmu.</small>
      {error&&<div className="profile-edit-error">{error}</div>}
      <button className="profile-save-button" disabled={saving}><Save/>{saving?'Menyimpan...':'Simpan Perubahan'}</button>
    </form></div>}
    <MobileNav/>
  </main>
  return <main className="mobile-app profile-page">
    <SubPageHeader title="Akun Saya" description="Profil dan pengaturan"/>
    <section className="profile-hero"><div className="profile-avatar">{(user?.name||'KK').slice(0,2).toUpperCase()}<button type="button" aria-label="Foto profil segera tersedia" title="Foto profil segera tersedia"><Camera/></button></div><strong>{user.name}</strong><span>@{user.username}</span><small><ShieldCheck/>{isMarketing?'Akun Marketing aktif':'Akun KuotaKita aktif'}</small></section>
    {message&&<div className="profile-saved-message"><ShieldCheck/>{message}</div>}
    <section className="personal-info"><header><h2>Informasi Pribadi</h2><button type="button" onClick={openEditor}>Edit</button></header><div><UserRound/><span><small>Nama lengkap</small><strong>{user.name}</strong></span></div><div><Phone/><span><small>Nomor handphone</small><strong className={!user.phone?'incomplete':''}>{user.phone||'Belum dilengkapi'}</strong></span></div><div><Mail/><span><small>Email / Gmail</small><strong className={!user.email?'incomplete':''}>{user.email||'Belum dilengkapi'}</strong></span></div></section>
    <section className="profile-menu">{menus.map(([title,desc,Icon,path])=><button onClick={()=>navigate(`/app/profile/${path}`)} key={title}><i><Icon/></i><div><strong>{title}</strong><small>{desc}</small></div><ChevronRight/></button>)}</section>
    <button className="logout-mobile" onClick={exit}><LogOut/>Keluar dari KuotaKita</button><p className="profile-version">KuotaKita versi 1.0.0</p>

    {editing&&<div className="profile-edit-backdrop" onMouseDown={event=>event.target===event.currentTarget&&!saving&&setEditing(false)}><form className="profile-edit-sheet" onSubmit={submit}>
      <header><div><span>PROFIL AKUN</span><h2>Edit Informasi Pribadi</h2><p>Lengkapi data agar akun lebih mudah dikenali.</p></div><button type="button" onClick={()=>setEditing(false)} disabled={saving}><X/></button></header>
      <label><span>Nama lengkap</span><div><UserRound/><input required minLength="3" value={form.name} onChange={event=>setForm({...form,name:event.target.value})} placeholder="Masukkan nama lengkap"/></div></label>
      <label><span>Nomor handphone <em>Opsional</em></span><div><Phone/><input inputMode="numeric" value={form.phone} onChange={event=>setForm({...form,phone:event.target.value.replace(/\D/g,'').slice(0,15)})} placeholder="Contoh: 081234567890"/></div></label>
      <label><span>Email / Gmail <em>Opsional</em></span><div><Mail/><input type="email" value={form.email} onChange={event=>setForm({...form,email:event.target.value})} placeholder="nama@gmail.com"/></div></label>
      <small className="profile-edit-hint"><ShieldCheck/>Nomor dan email disimpan aman pada akunmu.</small>
      {error&&<div className="profile-edit-error">{error}</div>}
      <button className="profile-save-button" disabled={saving}><Save/>{saving?'Menyimpan...':'Simpan Perubahan'}</button>
    </form></div>}
    <MobileNav/>
  </main>
}
