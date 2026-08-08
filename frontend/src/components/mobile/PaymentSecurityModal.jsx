import {useEffect,useState} from 'react'
import {Fingerprint,KeyRound,ShieldCheck,X} from 'lucide-react'
import {verifyBiometric,verifyPin} from '../../services/securityService'

export default function PaymentSecurityModal({open,user,settings,onClose,onVerified}){
  const [pin,setPin]=useState(''),[error,setError]=useState(''),[checking,setChecking]=useState(false)
  useEffect(()=>{if(open){setPin('');setError('');setChecking(false)}},[open])
  if(!open)return null
  const complete=()=>{setPin('');onVerified()}
  const pinSubmit=async event=>{event.preventDefault();setChecking(true);setError('');try{if(!await verifyPin(user.id,pin))throw new Error('PIN KuotaKita salah.');complete()}catch(current){setError(current.message)}finally{setChecking(false)}}
  const biometric=async()=>{setChecking(true);setError('');try{if(await verifyBiometric(user.id))complete()}catch(current){setError(current.name==='NotAllowedError'?'Verifikasi sidik jari dibatalkan atau waktunya habis.':current.message)}finally{setChecking(false)}}
  const both=settings.biometricEnabled&&settings.pinHash
  return <div className="security-backdrop"><section className="payment-security-modal refined-security-modal"><button className="security-close" onClick={onClose} disabled={checking}><X/></button><i className="security-shield"><ShieldCheck/></i><h2>Konfirmasi Pembayaran</h2><p>Pilih metode keamanan yang ingin kamu gunakan.</p>
    {settings.biometricEnabled&&<button type="button" className="biometric-pay" disabled={checking} onClick={biometric}><Fingerprint/><span><strong>{checking?'Menunggu verifikasi HP...':'Gunakan Sidik Jari'}</strong><small>Tempelkan jari saat permintaan perangkat muncul</small></span></button>}
    {both&&<div className="security-choice-divider"><span>atau gunakan PIN</span></div>}
    {settings.pinHash&&<form onSubmit={pinSubmit}><label><KeyRound/><span>PIN KuotaKita</span><input autoFocus={!settings.biometricEnabled} value={pin} onChange={event=>setPin(event.target.value.replace(/\D/g,'').slice(0,6))} inputMode="numeric" type="password" autoComplete="off" placeholder="••••••"/></label><button disabled={pin.length!==6||checking}>Konfirmasi dengan PIN</button></form>}
    {error&&<div className="security-error">{error}</div>}
    <small className="security-modal-safe"><ShieldCheck/>Pembayaran baru diproses setelah verifikasi berhasil.</small>
  </section></div>
}
