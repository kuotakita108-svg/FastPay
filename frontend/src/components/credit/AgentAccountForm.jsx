import {Building2,CheckCircle2,KeyRound,Mail,MapPin,Phone,UserPlus,UserRound,X} from 'lucide-react'
import {useState} from 'react'
import {createManagedAgent} from '../../services/authService'

const initial={name:'',store_name:'',phone:'',email:'',province:'',city:'',district:'',username:'',password:''}

export default function AgentAccountForm({onClose}){
  const [form,setForm]=useState(initial),[message,setMessage]=useState(''),[created,setCreated]=useState(null)
  const update=event=>setForm({...form,[event.target.name]:event.target.value})
  const submit=async event=>{event.preventDefault();setMessage('');try{const account=await createManagedAgent(form);setCreated(account);setForm(initial)}catch(error){setMessage(error.message)}}
  return <section className="agent-account-form">
    <header><i><UserPlus/></i><div><span>AKUN AGENT BARU</span><h2>Daftarkan agent resmi</h2><p>Catat identitas, toko, wilayah, dan buat akses KuotaKita dalam satu langkah.</p></div>{onClose&&<button type="button" onClick={onClose} aria-label="Tutup"><X/></button>}</header>
    {created&&<div className="agent-account-success"><CheckCircle2/><div><strong>Akun login agent berhasil dibuat</strong><small>ID Agent: <b>{created.id}</b> · Username: <b>{created.username}</b> · Saldo awal Rp0</small><small>Data ganda diblokir berdasarkan username, WhatsApp, dan email.</small></div></div>}
    {message&&<div className="agent-account-error">{message}</div>}
    <form onSubmit={submit}>
      <label><UserRound/>Nama lengkap agent<input name="name" value={form.name} onChange={update} placeholder="Nama sesuai identitas" required/></label>
      <label><Building2/>Nama toko<input name="store_name" value={form.store_name} onChange={update} placeholder="Nama toko agent" required/></label>
      <label><Phone/>Nomor WhatsApp<input name="phone" value={form.phone} onChange={update} inputMode="tel" placeholder="08xxxxxxxxxx" required/></label>
      <label><Mail/>Email agent<input name="email" value={form.email} onChange={update} type="email" placeholder="Email agent (opsional)"/></label>
      <label><MapPin/>Provinsi<input name="province" value={form.province} onChange={update} placeholder="Provinsi" required/></label>
      <label><MapPin/>Kota / kabupaten<input name="city" value={form.city} onChange={update} placeholder="Kota atau kabupaten" required/></label>
      <label><MapPin/>Kecamatan<input name="district" value={form.district} onChange={update} placeholder="Kecamatan" required/></label>
      <label><UserPlus/>Username login<input name="username" value={form.username} onChange={update} placeholder="Contoh: agentandi" autoCapitalize="none" required/></label>
      <label className="wide"><KeyRound/>Kata sandi agent<input name="password" value={form.password} onChange={update} type="password" minLength="6" placeholder="Minimal 6 karakter" required/></label>
      <p className="agent-account-note">Akses dibuat langsung di KuotaKita. Pengiriman otomatis melalui WhatsApp aktif setelah gateway WhatsApp resmi dihubungkan.</p>
      <button className="agent-account-submit" type="submit"><UserPlus/>Buat akun &amp; ID agent</button>
    </form>
  </section>
}
