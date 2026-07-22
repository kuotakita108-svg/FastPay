import {useState} from 'react'
import {Fingerprint,KeyRound,ShieldCheck,X} from 'lucide-react'
import {verifyBiometric,verifyPin} from '../../services/securityService'

export default function PaymentSecurityModal({open,user,settings,onClose,onVerified}){
 const[pin,setPin]=useState(''),[error,setError]=useState(''),[checking,setChecking]=useState(false)
 if(!open)return null
 const pinSubmit=async event=>{event.preventDefault();setChecking(true);setError('');try{if(!await verifyPin(user.id,pin))throw new Error('PIN PulsaPrime salah.');onVerified()}catch(current){setError(current.message)}finally{setChecking(false)}}
 const biometric=async()=>{setChecking(true);setError('');try{if(await verifyBiometric(user.id))onVerified()}catch(current){setError(current.name==='NotAllowedError'?'Verifikasi sidik jari dibatalkan.':current.message)}finally{setChecking(false)}}
 return <div className="security-backdrop"><section className="payment-security-modal"><button className="security-close" onClick={onClose}><X/></button><i className="security-shield"><ShieldCheck/></i><h2>Verifikasi Pembayaran</h2><p>Konfirmasi identitasmu sebelum saldo digunakan.</p>{settings.biometricEnabled&&<button className="biometric-pay" disabled={checking} onClick={biometric}><Fingerprint/><span><strong>Gunakan Sidik Jari</strong><small>Verifikasi melalui keamanan perangkat</small></span></button>}{settings.pinHash&&<form onSubmit={pinSubmit}><label><KeyRound/>PIN PulsaPrime<input autoFocus={!settings.biometricEnabled} value={pin} onChange={event=>setPin(event.target.value.replace(/\D/g,'').slice(0,6))} inputMode="numeric" type="password" placeholder="••••••"/></label><button disabled={pin.length!==6||checking}>Konfirmasi PIN</button></form>}{error&&<div className="security-error">{error}</div>}</section></div>
}
