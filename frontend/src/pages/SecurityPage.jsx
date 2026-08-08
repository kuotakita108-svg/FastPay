import {useEffect,useState} from 'react'
import {CheckCircle2,Fingerprint,KeyRound,ShieldCheck,Smartphone,Trash2} from 'lucide-react'
import SubPageHeader from '../components/mobile/SubPageHeader'
import MobileNav from '../components/mobile/MobileNav'
import {useAuth} from '../context/AuthContext'
import {biometricAvailable,disableBiometric,enableBiometric,getSecurity,loadSecurity,removePin,setPin} from '../services/securityService'

export default function SecurityPage(){
  const {user}=useAuth()
  const [settings,setSettings]=useState(()=>getSecurity(user.id))
  const [pin,setPinValue]=useState(''),[confirm,setConfirm]=useState('')
  const [notice,setNotice]=useState(null),[busy,setBusy]=useState(false)
  useEffect(()=>{loadSecurity(user.id).then(setSettings).catch(error=>setNotice({type:'error',text:error.message}))},[user.id])
  const refresh=async action=>setSettings(await action)
  const createPin=async event=>{
    event.preventDefault();setNotice(null)
    if(pin.length!==6)return setNotice({type:'error',text:'PIN harus terdiri dari 6 angka.'})
    if(pin!==confirm)return setNotice({type:'error',text:'Konfirmasi PIN belum sama.'})
    setBusy(true)
    try{await refresh(setPin(user.id,pin));setPinValue('');setConfirm('');setNotice({type:'success',text:'PIN pembayaran berhasil diaktifkan.'})}
    catch(error){setNotice({type:'error',text:error.message})}finally{setBusy(false)}
  }
  const fingerprint=async()=>{
    setBusy(true);setNotice({type:'info',text:'Ikuti verifikasi perangkat lalu tempelkan jari pada sensor HP.'})
    try{await refresh(enableBiometric(user.id,user.email||user.username));setNotice({type:'success',text:'Sidik jari berhasil diverifikasi dan siap digunakan untuk pembayaran.'})}
    catch(error){setNotice({type:'error',text:error.name==='NotAllowedError'?'Verifikasi sidik jari dibatalkan atau waktunya habis.':error.message})}finally{setBusy(false)}
  }
  const deletePin=async()=>{setBusy(true);try{await refresh(removePin(user.id));setNotice({type:'success',text:'PIN pembayaran dinonaktifkan.'})}catch(error){setNotice({type:'error',text:error.message})}finally{setBusy(false)}}
  const deleteBiometric=async()=>{setBusy(true);try{await refresh(disableBiometric(user.id));setNotice({type:'success',text:'Sidik jari dinonaktifkan pada akun ini.'})}catch(error){setNotice({type:'error',text:error.message})}finally{setBusy(false)}}
  return <main className="mobile-app account-feature-page security-page-refined">
    <SubPageHeader title="Keamanan Akun" description="PIN dan keamanan perangkat" back/>
    <section className="security-hero"><ShieldCheck/><div><strong>Perlindungan transaksi</strong><p>Pilih PIN, sidik jari, atau aktifkan keduanya. Verifikasi diminta sebelum pembayaran diproses.</p></div></section>
    {notice&&<div className={`security-notice ${notice.type}`}><CheckCircle2/><span>{notice.text}</span></div>}

    <section className="account-feature-card security-method-card">
      <header><i><KeyRound/></i><div><h2>PIN Pembayaran</h2><p>{settings.pinHash?'Siap digunakan sebelum pembayaran':'Buat enam angka rahasia'}</p></div><span className={settings.pinHash?'active':''}>{settings.pinHash?'Aktif':'Nonaktif'}</span></header>
      {settings.pinHash?<div className="security-active-state"><CheckCircle2/><div><strong>PIN sudah terlindungi</strong><small>Kamu dapat memilih PIN saat mengonfirmasi pembayaran.</small></div><button type="button" onClick={deletePin} disabled={busy}><Trash2/>Matikan</button></div>:<form className="security-pin-form" onSubmit={createPin}><label>Buat PIN 6 digit<input value={pin} onChange={event=>setPinValue(event.target.value.replace(/\D/g,'').slice(0,6))} inputMode="numeric" type="password" autoComplete="new-password" placeholder="••••••"/></label><label>Ulangi PIN<input value={confirm} onChange={event=>setConfirm(event.target.value.replace(/\D/g,'').slice(0,6))} inputMode="numeric" type="password" autoComplete="new-password" placeholder="••••••"/></label><button disabled={busy||pin.length!==6||confirm.length!==6}>{busy?'Mengaktifkan...':'Aktifkan PIN'}</button></form>}
    </section>

    <section className="account-feature-card security-method-card biometric-card">
      <header><i><Fingerprint/></i><div><h2>Sidik Jari</h2><p>{settings.biometricEnabled?'Terverifikasi pada perangkat ini':biometricAvailable()?'Siap diverifikasi oleh HP':'Browser atau perangkat belum mendukung'}</p></div><span className={settings.biometricEnabled?'active':''}>{settings.biometricEnabled?'Aktif':'Nonaktif'}</span></header>
      {settings.biometricEnabled?<div className="security-active-state"><Fingerprint/><div><strong>Sidik jari terhubung</strong><small>Pilih sidik jari saat melakukan pembayaran.</small></div><button type="button" onClick={deleteBiometric} disabled={busy}><Trash2/>Matikan</button></div>:<><div className="fingerprint-guide"><Fingerprint/><span><b>Gunakan sensor sidik jari HP</b><small>Tekan tombol di bawah, lalu tempelkan jari ketika verifikasi perangkat muncul.</small></span></div><button className="feature-primary fingerprint-enroll" disabled={busy||!biometricAvailable()} onClick={fingerprint}><Fingerprint/>{busy?'Menunggu Verifikasi...':'Aktifkan Sidik Jari'}</button></>}
    </section>
    <section className="security-device"><Smartphone/><div><strong>Perangkat saat ini</strong><small>Biometrik mengikuti keamanan layar dan sensor perangkat ini.</small></div></section>
    <MobileNav/>
  </main>
}
