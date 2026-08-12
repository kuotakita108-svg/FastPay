import {Building2,CheckCircle2,KeyRound,Mail,Phone,UserPlus,UserRound,X} from 'lucide-react'
import {useState} from 'react'
import {createManagedAgent} from '../../services/authService'

const initial={name:'',store_name:'',phone:'',email:'',username:'',password:''}

export default function AgentAccountForm({onClose,onCreated}){
  const [form,setForm]=useState(initial),[message,setMessage]=useState(''),[created,setCreated]=useState(null)
  const update=event=>setForm({...form,[event.target.name]:event.target.value})
  const submit=async event=>{event.preventDefault();setMessage('');try{const account=await createManagedAgent(form);setCreated(account);setForm(initial);onCreated?.(account)}catch(error){setMessage(error.message==='sesi berakhir'?'Sesi Marketing sudah habis. Silakan login ulang, lalu data agent dapat disimpan.':error.message)}}
  return <section className="agent-account-form">
    <header><i><UserPlus/></i><div><span>AKUN AGENT BARU</span><h2>Daftarkan agent resmi</h2><p>Catat identitas dan buat akun login Agent KuotaKita dalam satu langkah.</p></div>{onClose&&<button type="button" onClick={onClose} aria-label="Tutup"><X/></button>}</header>
    {created&&<div className="agent-account-success"><CheckCircle2/><div><strong>Agent baru berhasil ditambahkan</strong><small className="created-account-meta"><span>ID Agent</span><b>{created.id}</b><span>Username</span><b>{created.username}</b></small><small>Akun dapat langsung dipakai login. Agent ini hanya tampil pada portfolio Marketing yang mendaftarkannya.</small></div></div>}
    {message&&<div className="agent-account-error">{message}</div>}
    <form onSubmit={submit}>
      <label><UserRound/>Nama lengkap agent<input name="name" value={form.name} onChange={update} placeholder="Nama sesuai identitas" required/></label>
      <label><Building2/>Nama toko<input name="store_name" value={form.store_name} onChange={update} placeholder="Nama toko agent" required/></label>
      <label><Phone/>Nomor WhatsApp<input name="phone" value={form.phone} onChange={update} inputMode="tel" placeholder="08xxxxxxxxxx" required/></label>
      <label><Mail/>Email agent<input name="email" value={form.email} onChange={update} type="email" placeholder="Email agent (opsional)"/></label>
      <label><UserPlus/>Username login<input name="username" value={form.username} onChange={update} placeholder="Contoh: agentandi" autoCapitalize="none" required/></label>
      <label className="wide"><KeyRound/>Kata sandi agent<input name="password" value={form.password} onChange={update} type="password" minLength="6" placeholder="Minimal 6 karakter" required/></label>
      <p className="agent-account-note">Akun dibuat langsung di server KuotaKita dan dapat dipakai Agent untuk login dengan username serta password yang dibuat.</p>
      <button className="agent-account-submit" type="submit"><UserPlus/>Buat akun &amp; ID agent</button>
    </form>
  </section>
}
