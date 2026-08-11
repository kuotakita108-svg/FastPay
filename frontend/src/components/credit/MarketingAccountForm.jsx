import {BadgeCheck,CheckCircle2,KeyRound,Mail,Phone,UserPlus,UserRound,X} from 'lucide-react'
import {useState} from 'react'
import {createManagedMarketing} from '../../services/authService'

const initial={name:'',phone:'',email:'',username:'',password:''}

export default function MarketingAccountForm({onClose}){
  const [form,setForm]=useState(initial),[message,setMessage]=useState(''),[created,setCreated]=useState(null),[loading,setLoading]=useState(false)
  const update=event=>setForm(current=>({...current,[event.target.name]:event.target.value}))
  const submit=async event=>{event.preventDefault();setMessage('');setLoading(true);try{const account=await createManagedMarketing(form);setCreated(account);setForm(initial)}catch(error){setMessage(error.message)}finally{setLoading(false)}}
  return <section className="agent-account-form marketing-account-form">
    <header><i><BadgeCheck/></i><div><span>AKUN MARKETING BARU</span><h2>Daftarkan Marketing resmi</h2><p>Buat akses kerja Marketing. Username dan password dapat langsung dipakai untuk masuk ke panel Marketing KuotaKita.</p></div>{onClose&&<button type="button" onClick={onClose} aria-label="Tutup"><X/></button>}</header>
    {created&&<div className="agent-account-success"><CheckCircle2/><div><strong>Akun Marketing berhasil dibuat</strong><small>ID Marketing: <b>{created.id}</b> · Username: <b>{created.username}</b></small><small>Role aktif: Marketing Kredit · akun sudah dapat digunakan untuk login.</small></div></div>}
    {message&&<div className="agent-account-error">{message}</div>}
    <form onSubmit={submit}>
      <label><UserRound/>Nama lengkap Marketing<input name="name" value={form.name} onChange={update} placeholder="Nama lengkap marketing" required/></label>
      <label><Phone/>Nomor WhatsApp<input name="phone" value={form.phone} onChange={update} inputMode="tel" placeholder="08xxxxxxxxxx" required/></label>
      <label><Mail/>Email Marketing<input name="email" value={form.email} onChange={update} type="email" placeholder="Email (opsional)"/></label>
      <label><UserPlus/>Username login<input name="username" value={form.username} onChange={update} placeholder="Contoh: marketingandi" autoCapitalize="none" required/></label>
      <label className="wide"><KeyRound/>Kata sandi Marketing<input name="password" value={form.password} onChange={update} type="password" minLength="6" placeholder="Minimal 6 karakter" required/></label>
      <p className="agent-account-note">Password disimpan dalam bentuk hash. Username, WhatsApp, dan email ganda otomatis ditolak oleh server.</p>
      <button className="agent-account-submit" type="submit" disabled={loading}><BadgeCheck/>{loading?'Membuat akun...':'Buat akun Marketing'}</button>
    </form>
  </section>
}
