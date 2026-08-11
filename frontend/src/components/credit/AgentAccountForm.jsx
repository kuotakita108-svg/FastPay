import {Building2,CheckCircle2,KeyRound,Mail,MapPin,Phone,UserPlus,UserRound,X} from 'lucide-react'
import {useEffect,useState} from 'react'
import {createManagedAgent} from '../../services/authService'
import {getDistricts,getProvinces,getRegencies} from '../../services/regionService'

const initial={name:'',store_name:'',phone:'',email:'',province:'',city:'',district:'',username:'',password:''}

export default function AgentAccountForm({onClose}){
  const [form,setForm]=useState(initial),[message,setMessage]=useState(''),[created,setCreated]=useState(null)
  const [provinceId,setProvinceId]=useState(''),[regencyId,setRegencyId]=useState('')
  const [provinces,setProvinces]=useState([]),[regencies,setRegencies]=useState([]),[districts,setDistricts]=useState([]),[regionMessage,setRegionMessage]=useState('Memuat data wilayah Indonesia...')
  useEffect(()=>{let active=true;getProvinces().then(rows=>{if(active){setProvinces(rows);setRegionMessage('')}}).catch(error=>active&&setRegionMessage(error.message));return()=>{active=false}},[])
  const chooseProvince=async event=>{const id=event.target.value,name=provinces.find(row=>row.id===id)?.name||'';setProvinceId(id);setRegencyId('');setRegencies([]);setDistricts([]);setForm(current=>({...current,province:name,city:'',district:''}));if(!id)return;setRegionMessage('Memuat kabupaten/kota...');try{setRegencies(await getRegencies(id));setRegionMessage('')}catch(error){setRegionMessage(error.message)}}
  const chooseRegency=async event=>{const id=event.target.value,name=regencies.find(row=>row.id===id)?.name||'';setRegencyId(id);setDistricts([]);setForm(current=>({...current,city:name,district:''}));if(!id)return;setRegionMessage('Memuat kecamatan...');try{setDistricts(await getDistricts(id));setRegionMessage('')}catch(error){setRegionMessage(error.message)}}
  const chooseDistrict=event=>{const name=districts.find(row=>row.id===event.target.value)?.name||'';setForm(current=>({...current,district:name}))}
  const update=event=>setForm({...form,[event.target.name]:event.target.value})
  const submit=async event=>{event.preventDefault();setMessage('');try{const account=await createManagedAgent(form);setCreated(account);setForm(initial);setProvinceId('');setRegencyId('');setRegencies([]);setDistricts([])}catch(error){setMessage(error.message==='sesi berakhir'?'Sesi Marketing sudah habis. Silakan login ulang, lalu data agent dapat disimpan.':error.message)}}
  return <section className="agent-account-form">
    <header><i><UserPlus/></i><div><span>AKUN AGENT BARU</span><h2>Daftarkan agent resmi</h2><p>Catat identitas, toko, wilayah, dan buat akses KuotaKita dalam satu langkah.</p></div>{onClose&&<button type="button" onClick={onClose} aria-label="Tutup"><X/></button>}</header>
    {created&&<div className="agent-account-success"><CheckCircle2/><div><strong>Akun login agent berhasil dibuat</strong><small>ID Agent: <b>{created.id}</b> · Username: <b>{created.username}</b> · Saldo awal Rp0</small><small>Data ganda diblokir berdasarkan username, WhatsApp, dan email.</small></div></div>}
    {message&&<div className="agent-account-error">{message}</div>}
    <form onSubmit={submit}>
      <label><UserRound/>Nama lengkap agent<input name="name" value={form.name} onChange={update} placeholder="Nama sesuai identitas" required/></label>
      <label><Building2/>Nama toko<input name="store_name" value={form.store_name} onChange={update} placeholder="Nama toko agent" required/></label>
      <label><Phone/>Nomor WhatsApp<input name="phone" value={form.phone} onChange={update} inputMode="tel" placeholder="08xxxxxxxxxx" required/></label>
      <label><Mail/>Email agent<input name="email" value={form.email} onChange={update} type="email" placeholder="Email agent (opsional)"/></label>
      <label><MapPin/>Provinsi<select value={provinceId} onChange={chooseProvince} required disabled={!provinces.length}><option value="">Pilih provinsi</option>{provinces.map(row=><option value={row.id} key={row.id}>{row.name}</option>)}</select></label>
      <label><MapPin/>Kota / kabupaten<select value={regencyId} onChange={chooseRegency} required disabled={!provinceId||!regencies.length}><option value="">Pilih kota/kabupaten</option>{regencies.map(row=><option value={row.id} key={row.id}>{row.name}</option>)}</select></label>
      <label><MapPin/>Kecamatan<select value={districts.find(row=>row.name===form.district)?.id||''} onChange={chooseDistrict} required disabled={!regencyId||!districts.length}><option value="">Pilih kecamatan</option>{districts.map(row=><option value={row.id} key={row.id}>{row.name}</option>)}</select></label>
      <label><UserPlus/>Username login<input name="username" value={form.username} onChange={update} placeholder="Contoh: agentandi" autoCapitalize="none" required/></label>
      <label className="wide"><KeyRound/>Kata sandi agent<input name="password" value={form.password} onChange={update} type="password" minLength="6" placeholder="Minimal 6 karakter" required/></label>
      {regionMessage&&<p className="agent-account-note region-load-note">{regionMessage}</p>}
      <p className="agent-account-note">Akun dibuat langsung di server KuotaKita. Marketing tetap wajib mencocokkan pilihan wilayah dengan lokasi toko saat survei.</p>
      <button className="agent-account-submit" type="submit"><UserPlus/>Buat akun &amp; ID agent</button>
    </form>
  </section>
}
