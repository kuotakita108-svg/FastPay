import {CheckCircle2,KeyRound,Mail,Phone,UserPlus,UserRound,X} from 'lucide-react'
import {useState} from 'react'
import {createManagedAgent} from '../../services/authService'

const initial={name:'',username:'',phone:'',email:'',password:''}
export default function AgentAccountForm({onClose}){
  const [form,setForm]=useState(initial),[message,setMessage]=useState(''),[created,setCreated]=useState(null)
  const update=event=>setForm({...form,[event.target.name]:event.target.value})
  const submit=async event=>{event.preventDefault();setMessage('');try{const account=await createManagedAgent(form);setCreated(account);setForm(initial)}catch(error){setMessage(error.message)}}
  return <section className="agent-account-form">
    <header><i><UserPlus/></i><div><span>AKUN AGENT BARU</span><h2>Daftarkan agent resmi</h2><p>Agent akan mendapat username dan password untuk masuk ke KuotaKita serta mengakses Kredit Saldo Agent.</p></div>{onClose&&<button type="button" onClick={onClose} aria-label="Tutup"><X/></button>}</header>
    {created&&<div className="agent-account-success"><CheckCircle2/><div><strong>Akun agent berhasil dibuat</strong><small>Username: <b>{created.username}</b> · Role: Agent · Saldo awal Rp0</small><small>Simpan username dan password ini untuk agent.</small></div></div>}
    {message&&<div className="agent-account-error">{message}</div>}
    <form onSubmit={submit}><label><UserRound/>Nama lengkap<input name="name" value={form.name} onChange={update} placeholder="Nama agent" required/></label><label><UserPlus/>Username agent<input name="username" value={form.username} onChange={update} placeholder="Contoh: agentandi" autoCapitalize="none" required/></label><label><Phone/>Nomor WhatsApp<input name="phone" value={form.phone} onChange={update} inputMode="tel" placeholder="08xxxxxxxxxx" required/></label><label><Mail/>Email<input name="email" value={form.email} onChange={update} type="email" placeholder="Email agent (opsional)"/></label><label className="wide"><KeyRound/>Password sementara<input name="password" value={form.password} onChange={update} type="password" minLength="6" placeholder="Minimal 6 karakter" required/></label><button className="agent-account-submit" type="submit"><UserPlus/>Buat akun agent</button></form>
  </section>
}
