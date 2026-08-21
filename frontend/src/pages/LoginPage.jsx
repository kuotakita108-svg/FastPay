import {useEffect, useState} from 'react'
import {useNavigate, useSearchParams} from 'react-router-dom'
import {ArrowRight, CheckCircle2, Eye, EyeOff, LockKeyhole, Mail, Phone, ShieldCheck, Sparkles, UserRound} from 'lucide-react'
import {useAuth} from '../context/AuthContext'
import {googleLogin, resetPassword as resetPasswordRequest} from '../services/authService'
import KuotaKitaLogo from '../components/common/KuotaKitaLogo'
import loginHero from '../assets/images/kuotakita-ppob-hero-v4.webp'

const loginInitial = {username: '', password: ''}
const registerInitial = {name: '', username: '', phone: '', email: '', password: '', account_type: 'user'}
const resetInitial = {identity: '', password: ''}

function Field({form, onChange, name, label, icon: Icon, type = 'text', placeholder, inputMode, required = true}) {
  return <label><span>{label}</span><div><Icon/><input name={name} type={type} value={form[name] || ''} onChange={onChange} placeholder={placeholder} inputMode={inputMode} required={required}/></div></label>
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
  const [notice, setNotice] = useState('')
  const {login, register} = useAuth()
  const navigate = useNavigate()
  const [params] = useSearchParams()

  useEffect(() => {
    const oauthError = params.get('oauth_error')
    if (oauthError) setError(oauthError)
  }, [params])

  const change = event => setForm({...form, [event.target.name]: event.target.value})
  const switchMode = next => {
    setMode(next)
    setForm(next === 'login' ? loginInitial : next === 'register' ? registerInitial : resetInitial)
    setError('')
    setNotice('')
  }
  const submit = async event => {
    event.preventDefault()
    setLoading(true)
    setError('')
    setNotice('')
    try {
      if (mode === 'reset') {
        const result = await resetPasswordRequest(form)
        setNotice(result.message || 'Kata sandi berhasil diperbarui. Silakan masuk kembali.')
        setMode('login')
        setForm(loginInitial)
        return
      }
      const result = mode === 'login' ? await login(form) : await register(form)
      navigate(result.user.role === 'marketing' ? '/marketing' : ['user','agent'].includes(result.user.role) ? '/app' : ['master','operator','analis'].includes(result.user.role) ? '/credit-applications' : '/dashboard', {replace: true})
    } catch (current) {
      setError(current.message)
    } finally {
      setLoading(false)
    }
  }

  const props = {form, onChange: change}
  const title = mode === 'login' ? 'Selamat datang kembali' : mode === 'register' ? 'Mulai bersama KuotaKita' : 'Reset kata sandi akun'
  const subtitle = mode === 'reset'
    ? 'Masukkan akun dan kata sandi baru agar kamu bisa masuk lagi.'
    : mode === 'login'
      ? 'Masuk dan lanjutkan semua kebutuhan transaksi digitalmu.'
      : 'Satu akun untuk pulsa, tagihan, transfer, dan berbagai layanan digital.'

  return <main className="mobile-auth-page auth-premium">
    <section className="auth-phone">
      <header className="auth-welcome">
        <img className="auth-hero-person" src={loginHero} alt="" aria-hidden="true" decoding="async" fetchPriority="high"/>
        <div className="auth-hero-shade"/>
        <div className="auth-light-trail trail-one"/>
        <div className="auth-light-trail trail-two"/>
        <KuotaKitaLogo className="auth-title-logo" />
        <div className="auth-welcome-copy">
          <span>AMAN Â· CEPAT Â· TERPERCAYA</span>
          <h1>{title}</h1>
          <p>{subtitle}</p>
          <div className="auth-trust"><b><ShieldCheck/>Akun terlindungi</b><b><Sparkles/>Aktif 24 jam</b></div>
        </div>
      </header>
      <section className="auth-sheet">
        <div className="auth-tabs">
          <button type="button" className={mode === 'login' ? 'active' : ''} onClick={() => switchMode('login')}>Masuk</button>
          <button type="button" className={mode === 'register' ? 'active' : ''} onClick={() => switchMode('register')}>Daftar</button>
        </div>
        {mode !== 'reset' && <button type="button" className="auth-google" onClick={googleLogin}><GoogleMark/><span>{mode === 'login' ? 'Masuk dengan Google' : 'Daftar dengan Google'}</span><ArrowRight/></button>}
        <div className="auth-divider"><span/>{mode === 'reset' ? 'buat kata sandi baru' : `atau gunakan ${mode === 'login' ? 'akun KuotaKita' : 'data diri tanpa Google'}`}<span/></div>
        <form onSubmit={submit}>
          {mode === 'register' && <>
            <div className="register-account-type" role="group" aria-label="Pilih jenis akun">
              <button type="button" className={form.account_type === 'user' ? 'active' : ''} onClick={() => setForm(current => ({...current, account_type: 'user'}))}><UserRound/><span><b>Pengguna biasa</b><small>Untuk transaksi pribadi</small></span></button>
              <button type="button" className={form.account_type === 'agent' ? 'active' : ''} onClick={() => setForm(current => ({...current, account_type: 'agent'}))}><ShieldCheck/><span><b>Agent / Pemilik toko</b><small>Ajukan kredit setelah login</small></span></button>
            </div>
            <Field {...props} name="name" label="Nama lengkap" icon={UserRound} placeholder="Nama sesuai identitas"/>
            <div className="auth-field-row">
              <Field {...props} name="phone" label="Nomor handphone" icon={Phone} placeholder="0812..." inputMode="numeric"/>
              <Field {...props} name="email" label="Email (opsional)" icon={Mail} type="email" placeholder="Boleh dikosongkan" required={false}/>
            </div>
          </>}
          {mode === 'reset'
            ? <Field {...props} name="identity" label="Username / nomor HP / email" icon={UserRound} placeholder="Akun yang mau dipulihkan"/>
            : <Field {...props} name="username" label={mode === 'login' ? 'Username / nomor HP / email' : 'Nama pengguna'} icon={UserRound} placeholder={mode === 'login' ? 'Masukkan data akun' : 'Buat username'}/>}
          <label>
            <span>{mode === 'reset' ? 'Kata sandi baru' : 'Kata sandi'}</span>
            <div>
              <LockKeyhole/>
              <input name="password" type={visible ? 'text' : 'password'} value={form.password} onChange={change} placeholder={mode === 'register' || mode === 'reset' ? 'Minimal 6 karakter' : 'Masukkan kata sandi'} minLength={mode === 'register' || mode === 'reset' ? 6 : undefined} required/>
              <button type="button" onClick={() => setVisible(value => !value)} aria-label="Tampilkan kata sandi">{visible ? <EyeOff/> : <Eye/>}</button>
            </div>
          </label>
          {mode === 'login' && <button type="button" className="forgot-button" onClick={() => switchMode('reset')}>Lupa kata sandi?</button>}
          {error && <div className="auth-error">{error}</div>}
          {notice && <div className="auth-success">{notice}</div>}
          <button className="auth-submit" disabled={loading}>{loading ? 'Mohon tunggu...' : mode === 'login' ? 'Masuk ke KuotaKita' : mode === 'register' ? (form.account_type === 'agent' ? 'Buat Akun Agent' : 'Buat Akun KuotaKita') : 'Reset Kata Sandi'}<ArrowRight/></button>
        </form>
        {mode === 'register' && <div className="register-benefits"><span><CheckCircle2/>Tanpa Gmail</span><span><CheckCircle2/>Saldo awal Rp0</span><span><CheckCircle2/>{form.account_type === 'agent' ? 'Survei oleh Marketing' : 'Langsung aktif'}</span></div>}
        <p className="auth-switch">{mode === 'login' ? 'Belum punya akun?' : mode === 'register' ? 'Sudah punya akun?' : 'Ingat kata sandi?'} <button type="button" onClick={() => switchMode(mode === 'login' ? 'register' : 'login')}>{mode === 'login' ? 'Daftar sekarang' : 'Masuk di sini'}</button></p>
        <small className="auth-terms">Dengan melanjutkan, kamu menyetujui Syarat Layanan dan Kebijakan Privasi KuotaKita.</small>
      </section>
    </section>
  </main>
}
