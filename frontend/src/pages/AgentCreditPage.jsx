import {useRef, useState} from 'react'
import {ArrowRight, Camera, CheckCircle2, FileText, PenLine, ShieldCheck, Store, Upload, UserRound, WalletCards, X} from 'lucide-react'
import SubPageHeader from '../components/mobile/SubPageHeader'
import MobileNav from '../components/mobile/MobileNav'
import {useAuth} from '../context/AuthContext'
import {rupiah} from '../utils/currency'

const initialForm = {
  agentName: '',
  storeName: '',
  nik: '',
  homeAddress: '',
  storeAddress: '',
  whatsapp: '',
  email: '',
  monthlyTransactions: '',
  amount: '500000',
  familyName: '',
  familyAddress: '',
  familyWhatsapp: '',
  familyRelation: '',
}

const docs = [
  {key: 'ktp', title: 'Foto KTP', hint: 'KTP asli, jelas, tidak buram'},
  {key: 'store', title: 'Foto Toko', hint: 'Tampak depan toko/usaha'},
  {key: 'selfie', title: 'Selfie Pegang KTP', hint: 'Wajah dan KTP terlihat jelas'},
]

const terms = [
  'Pengajuan hanya untuk agent terdaftar PulsaPrime dan akan diverifikasi oleh tim analis.',
  'Limit kredit saldo maksimal Rp500.000 dan dapat berubah sesuai hasil penilaian.',
  'Pelunasan wajib dilakukan sesuai jatuh tempo agar akses kredit tetap aktif.',
  'Data KTP, toko, selfie, dan tanda tangan dipakai untuk validasi permohonan.',
]

function DocUpload({item, value, onChange}) {
  return <label className={`agent-doc-upload ${value ? 'filled' : ''}`}>
    <input type="file" accept="image/*" onChange={event => onChange(item.key, event.target.files?.[0] || null)}/>
    <i>{value ? <CheckCircle2/> : <Upload/>}</i>
    <span><b>{item.title}</b><small>{value ? value.name : item.hint}</small></span>
  </label>
}

export default function AgentCreditPage() {
  const {user} = useAuth()
  const canvasRef = useRef(null)
  const drawing = useRef(false)
  const [form, setForm] = useState({...initialForm, agentName: user?.name || '', whatsapp: user?.phone || '', email: user?.email || ''})
  const [files, setFiles] = useState({ktp: null, store: null, selfie: null})
  const [signed, setSigned] = useState(false)
  const [accepted, setAccepted] = useState(false)
  const [message, setMessage] = useState('')

  const update = event => setForm({...form, [event.target.name]: event.target.value})
  const updateFile = (key, file) => setFiles(current => ({...current, [key]: file}))
  const position = event => {
    const rect = canvasRef.current.getBoundingClientRect()
    const point = event.touches?.[0] || event
    return {x: point.clientX - rect.left, y: point.clientY - rect.top}
  }
  const startDraw = event => {
    drawing.current = true
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    const {x, y} = position(event)
    ctx.beginPath()
    ctx.moveTo(x, y)
  }
  const moveDraw = event => {
    if (!drawing.current) return
    event.preventDefault()
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    const {x, y} = position(event)
    ctx.lineWidth = 2.5
    ctx.lineCap = 'round'
    ctx.strokeStyle = '#34209b'
    ctx.lineTo(x, y)
    ctx.stroke()
    setSigned(true)
  }
  const stopDraw = () => { drawing.current = false }
  const clearSignature = () => {
    const canvas = canvasRef.current
    canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height)
    setSigned(false)
  }
  const submit = event => {
    event.preventDefault()
    const amount = Math.min(500000, Math.max(50000, Number(form.amount || 0)))
    if (Object.values(files).some(file => !file)) return setMessage('Lengkapi Foto KTP, Foto toko, dan Foto selfie pegang KTP dulu bro.')
    if (!accepted) return setMessage('Centang persetujuan ketentuan pengajuan dulu.')
    if (!signed) return setMessage('Tanda tangan online wajib diisi.')
    const application = {
      id: `KSA-${Date.now().toString().slice(-8)}`,
      status: 'Menunggu verifikasi analis',
      createdAt: new Date().toISOString(),
      form: {...form, amount},
      documents: Object.fromEntries(Object.entries(files).map(([key, file]) => [key, file.name])),
    }
    const key = `pulsaprime_agent_credit_${user?.id || 'guest'}`
    const history = JSON.parse(localStorage.getItem(key) || '[]')
    localStorage.setItem(key, JSON.stringify([application, ...history].slice(0, 10)))
    setMessage(`Pengajuan ${application.id} berhasil dibuat. Tim PulsaPrime akan mengecek dokumen agent.`)
  }

  return <main className="mobile-app agent-credit-page">
    <SubPageHeader title="Kredit Saldo Agent" description="Ajukan tanam saldo langsung dari aplikasi" back/>
    <section className="agent-credit-hero">
      <i><WalletCards/></i>
      <div><span>FORMULIR DIGITAL</span><h1>Tanam Saldo Agent</h1><p>Lengkapi data, upload dokumen, dan tanda tangan online tanpa kertas.</p></div>
      <b>{rupiah(Math.min(500000, Math.max(0, Number(form.amount || 0))))}</b>
    </section>
    <form className="agent-credit-form" onSubmit={submit}>
      <section className="agent-card">
        <header><i><UserRound/></i><div><h2>Data Agent</h2><p>Isi sesuai identitas dan toko.</p></div></header>
        <div className="agent-fields">
          <label>Nama Agent<input name="agentName" value={form.agentName} onChange={update} required placeholder="Nama lengkap"/></label>
          <label>Nama Toko<input name="storeName" value={form.storeName} onChange={update} required placeholder="Nama toko/usaha"/></label>
          <label>NIK<input name="nik" value={form.nik} onChange={update} inputMode="numeric" minLength="16" maxLength="16" required placeholder="16 digit NIK"/></label>
          <label>Nomor WA<input name="whatsapp" value={form.whatsapp} onChange={update} inputMode="tel" required placeholder="08xxxxxxxxxx"/></label>
          <label>Email<input name="email" value={form.email} onChange={update} type="email" placeholder="email aktif"/></label>
          <label>Transaksi/Bulan<input name="monthlyTransactions" value={form.monthlyTransactions} onChange={update} inputMode="numeric" required placeholder="Contoh: 150 transaksi"/></label>
          <label className="wide">Alamat Rumah<textarea name="homeAddress" value={form.homeAddress} onChange={update} required placeholder="Alamat lengkap rumah"/></label>
          <label className="wide">Alamat Toko<textarea name="storeAddress" value={form.storeAddress} onChange={update} required placeholder="Alamat lengkap toko"/></label>
          <label className="wide">Nominal Kredit Saldo<input name="amount" value={form.amount} onChange={event => setForm({...form, amount: event.target.value.replace(/\D/g, '').slice(0, 6)})} inputMode="numeric" required/><small>Maksimal pengajuan Rp500.000</small></label>
        </div>
      </section>
      <section className="agent-card">
        <header><i><Store/></i><div><h2>Kontak Keluarga</h2><p>Wajib diisi untuk kebutuhan verifikasi.</p></div></header>
        <div className="agent-fields">
          <label>Nama<input name="familyName" value={form.familyName} onChange={update} required placeholder="Nama keluarga"/></label>
          <label>Nomor WA<input name="familyWhatsapp" value={form.familyWhatsapp} onChange={update} inputMode="tel" required placeholder="08xxxxxxxxxx"/></label>
          <label>Hubungan<input name="familyRelation" value={form.familyRelation} onChange={update} required placeholder="Orang tua / saudara"/></label>
          <label className="wide">Alamat<textarea name="familyAddress" value={form.familyAddress} onChange={update} required placeholder="Alamat keluarga yang dapat dihubungi"/></label>
        </div>
      </section>
      <section className="agent-card">
        <header><i><Camera/></i><div><h2>Upload Dokumen</h2><p>Foto harus jelas dan tidak blur.</p></div></header>
        <div className="agent-doc-grid">{docs.map(item => <DocUpload key={item.key} item={item} value={files[item.key]} onChange={updateFile}/>)}</div>
      </section>
      <section className="agent-card">
        <header><i><FileText/></i><div><h2>Ketentuan Umum</h2><p>Baca dan setujui sebelum mengajukan.</p></div></header>
        <ol className="agent-terms">{terms.map(term => <li key={term}>{term}</li>)}</ol>
        <label className="agent-check"><input type="checkbox" checked={accepted} onChange={event => setAccepted(event.target.checked)}/><span>Saya menyatakan data benar dan bersedia mengikuti ketentuan kredit saldo PulsaPrime.</span></label>
      </section>
      <section className="agent-card">
        <header><i><PenLine/></i><div><h2>Tanda Tangan Online</h2><p>Gores tanda tangan langsung di kotak ini.</p></div></header>
        <div className="signature-box">
          <canvas ref={canvasRef} width="640" height="220" onPointerDown={startDraw} onPointerMove={moveDraw} onPointerUp={stopDraw} onPointerLeave={stopDraw}/>
          {!signed && <span>Tanda tangan di sini</span>}
        </div>
        <button type="button" className="clear-signature" onClick={clearSignature}><X/>Hapus tanda tangan</button>
      </section>
      {message && <div className="agent-message">{message}</div>}
      <button className="agent-submit">Ajukan Kredit Saldo <ArrowRight/></button>
    </form>
    <section className="agent-safe-note"><ShieldCheck/><span>Dokumen hanya digunakan untuk verifikasi pengajuan agent PulsaPrime.</span></section>
    <MobileNav/>
  </main>
}
