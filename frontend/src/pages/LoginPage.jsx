import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { ArrowRight, CheckCircle2, Eye, EyeOff, LockKeyhole, Mail, Phone, ShieldCheck, Sparkles, UserRound } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { googleLogin } from '../services/authService'
import loginHero from '../assets/images/fastpay-login-hero.png'

const loginInitial = { username: '', password: '' }
const registerInitial = { name: '', username: '', phone: '', email: '', password: '' }

function Field({ form, onChange, name, label, icon: Icon, type = 'text', placeholder, inputMode }) {
  return <label><span>{label}</span><div><Icon /><input name={name} type={type} value={form[name] || ''} onChange={onChange} placeholder={placeholder} inputMode={inputMode} required /></div></label>
}

function GoogleMark() {
  return <svg className="google-mark" viewBox="0 0 24 24" aria-hidden="true"><path fill="#4285F4" d="M21.6 12.23c0-.71-.06-1.4-.18-2.07H12v3.92h5.38a4.6 4.6 0 0 1-2 3.02v2.54h3.24c1.9-1.75 2.98-4.33 2.98-7.41z"/><path fill="#34A853" d="M12 22c2.7 0 4.97-.9 6.62-2.36l-3.24-2.54c-.9.6-2.05.96-3.38.96-2.6 0-4.81-1.76-5.6-4.13H3.06v2.62A10 10 0 0 0 12 22z"/><path fill="#FBBC05" d="M6.4 13.93A6 6 0 0 1 6.08 12c0-.67.12-1.32.32-1.93V7.45H3.06A10 10 0 0 0 2 12c0 1.63.39 3.17 1.06 4.55l3.34-2.62z"/><path fill="#EA4335" d="M12 5.94c1.47 0 2.79.5 3.83 1.5l2.87-2.88A9.64 9.64 0 0 0 12 2a10 10 0 0 0-8.94 5.45l3.34 2.62c.79-2.37 3-4.13 5.6-4.13z"/></svg>
}

export default function LoginPage() {
  const [mode, setMode] = useState('login')
  const [form, setForm] = useState(loginInitial)
  const [visible, setVisible] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { login, register } = useAuth()
  const navigate = useNavigate()
  const [params] = useSearchParams()

  useEffect(() => {
    const oauthError = params.get('oauth_error')
    if (oauthError) setError(oauthError)
  }, [params])

  const change = event => setForm({ ...form, [event.target.name]: event.target.value })
  const switchMode = next => { setMode(next); setForm(next === 'login' ? loginInitial : registerInitial); setError('') }
  const submit = async event => {
    event.preventDefault(); setLoading(true); setError('')
    try { const result = mode === 'login' ? await login(form) : await register(form); navigate(result.user.role === 'user' ? '/app' : '/dashboard') }
    catch (current) { setError(current.message) }
    finally { setLoading(false) }
  }

  const props = { form, onChange: change }
  return <main className="mobile-auth-page auth-premium"><section className="auth-phone"><header className="auth-welcome"><img className="auth-hero-person" src={loginHero} alt="" aria-hidden="true"/><div className="auth-hero-shade"/><div className="auth-light-trail trail-one"/><div className="auth-light-trail trail-two"/><div className="auth-logo" aria-label="FastPay"><span><i>F</i><b>Fast</b><strong>Pay</strong></span></div><div className="auth-welcome-copy"><span>AMAN · CEPAT · TERPERCAYA</span><h1>{mode === 'login' ? 'Selamat datang kembali' : 'Mulai bersama FastPay'}</h1><p>{mode === 'login' ? 'Masuk dan lanjutkan semua kebutuhan transaksi digitalmu.' : 'Satu akun untuk pulsa, tagihan, transfer, dan berbagai layanan digital.'}</p><div className="auth-trust"><b><ShieldCheck/>Akun terlindungi</b><b><Sparkles/>Aktif 24 jam</b></div></div></header><section className="auth-sheet"><div className="auth-tabs"><button type="button" className={mode === 'login' ? 'active' : ''} onClick={() => switchMode('login')}>Masuk</button><button type="button" className={mode === 'register' ? 'active' : ''} onClick={() => switchMode('register')}>Daftar</button></div><button type="button" className="auth-google" onClick={googleLogin}><GoogleMark/><span>{mode === 'login' ? 'Masuk dengan Google' : 'Daftar dengan Google'}</span><ArrowRight/></button><div className="auth-divider"><span/>atau gunakan {mode === 'login' ? 'akun FastPay' : 'data diri'}<span/></div><form onSubmit={submit}>{mode === 'register' && <><Field {...props} name="name" label="Nama lengkap" icon={UserRound} placeholder="Nama sesuai identitas"/><div className="auth-field-row"><Field {...props} name="phone" label="Nomor handphone" icon={Phone} placeholder="0812..." inputMode="numeric"/><Field {...props} name="email" label="Email" icon={Mail} type="email" placeholder="nama@gmail.com"/></div></>}<Field {...props} name="username" label="Nama pengguna" icon={UserRound} placeholder="Masukkan username"/><label><span>Kata sandi</span><div><LockKeyhole/><input name="password" type={visible ? 'text' : 'password'} value={form.password} onChange={change} placeholder={mode === 'register' ? 'Minimal 6 karakter' : 'Masukkan kata sandi'} minLength={mode === 'register' ? 6 : undefined} required/><button type="button" onClick={() => setVisible(value => !value)} aria-label="Tampilkan kata sandi">{visible ? <EyeOff/> : <Eye/>}</button></div></label>{error && <div className="auth-error">{error}</div>}<button className="auth-submit" disabled={loading}>{loading ? 'Mohon tunggu...' : mode === 'login' ? 'Masuk ke FastPay' : 'Buat Akun FastPay'}<ArrowRight/></button></form>{mode === 'register' && <div className="register-benefits"><span><CheckCircle2/>Gratis</span><span><CheckCircle2/>Saldo awal Rp0</span><span><CheckCircle2/>Langsung aktif</span></div>}<p className="auth-switch">{mode === 'login' ? 'Belum punya akun?' : 'Sudah punya akun?'} <button type="button" onClick={() => switchMode(mode === 'login' ? 'register' : 'login')}>{mode === 'login' ? 'Daftar sekarang' : 'Masuk di sini'}</button></p><small className="auth-terms">Dengan melanjutkan, kamu menyetujui Syarat Layanan dan Kebijakan Privasi FastPay.</small></section></section></main>
}
