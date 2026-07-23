import {useRef, useState} from 'react'
import {ArrowRight, Camera, CheckCircle2, FileText, PenLine, ShieldCheck, Store, Upload, UserRound, WalletCards, X} from 'lucide-react'
import SubPageHeader from '../components/mobile/SubPageHeader'
import MobileNav from '../components/mobile/MobileNav'
import {useAuth} from '../context/AuthContext'
import {rupiah} from '../utils/currency'
import financeHero from '../assets/service-heroes/finance.png'

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
  const state = value?.status || ''
  return <label className={`agent-doc-upload ${state === 'ok' ? 'filled' : ''} ${state === 'error' ? 'error' : ''} ${state === 'checking' ? 'checking' : ''}`}>
    <input type="file" accept="image/*" onChange={event => onChange(item.key, event.target.files?.[0] || null)}/>
    {value?.preview ? <img src={value.preview} alt="" aria-hidden="true"/> : <i>{state === 'ok' ? <CheckCircle2/> : <Upload/>}</i>}
    <span>
      <b>{item.title}</b>
      <small>{state === 'checking' ? 'Mengecek kualitas foto...' : value?.error || value?.name || item.hint}</small>
      {value?.width && <em>{value.width}×{value.height}px · {state === 'ok' ? 'jelas' : 'perlu ulang'}</em>}
    </span>
  </label>
}

function checkImageQuality(file, key) {
  return new Promise(resolve => {
    if (!file) return resolve(null)
    const preview = URL.createObjectURL(file)
    const fail = error => resolve({file, name: file.name, preview, status: 'error', error})
    if (!file.type.startsWith('image/')) return fail('File harus foto/gambar, bukan dokumen lain.')
    const minimumSize = key === 'selfie' ? 90000 : 65000
    const minimumWidth = key === 'selfie' ? 700 : 640
    const minimumHeight = key === 'selfie' ? 700 : 420
    const image = new Image()
    image.onload = () => {
      const width = image.naturalWidth
      const height = image.naturalHeight
      if (file.size < minimumSize) return resolve({file, name: file.name, preview, status: 'error', error: 'Foto terlalu kecil/terkompres. Ulangi dengan kamera lebih jelas.', width, height})
      if (width < minimumWidth || height < minimumHeight) return resolve({file, name: file.name, preview, status: 'error', error: 'Resolusi foto rendah. Ulangi agar KTP/wajah terbaca jelas.', width, height})
      resolve({file, name: file.name, preview, status: 'ok', width, height})
    }
    image.onerror = () => fail('Gambar rusak atau tidak bisa dibaca. Upload ulang foto yang jelas.')
    image.src = preview
  })
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
  const updateFile = async (key, file) => {
    if (!file) return setFiles(current => ({...current, [key]: null}))
    const preview = URL.createObjectURL(file)
    setFiles(current => ({...current, [key]: {file, name: file.name, preview, status: 'checking'}}))
    const checked = await checkImageQuality(file, key)
    setFiles(current => ({...current, [key]: checked}))
  }
  const position = event => {
    const rect = canvasRef.current.getBoundingClientRect()
    const point = event.touches?.[0] || event
    return {
      x: (point.clientX - rect.left) * (canvasRef.current.width / rect.width),
      y: (point.clientY - rect.top) * (canvasRef.current.height / rect.height),
    }
  }
  const startDraw = event => {
    event.preventDefault()
    event.currentTarget.setPointerCapture?.(event.pointerId)
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
  const stopDraw = event => {
    event?.currentTarget?.releasePointerCapture?.(event.pointerId)
    drawing.current = false
  }
  const clearSignature = () => {
    const canvas = canvasRef.current
    canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height)
    setSigned(false)
  }
  const submit = event => {
    event.preventDefault()
    const amount = Math.min(500000, Math.max(50000, Number(form.amount || 0)))
    const documentValues = Object.values(files)
    if (documentValues.some(file => !file?.file)) return setMessage('Lengkapi Foto KTP, Foto toko, dan Foto selfie pegang KTP dulu bro.')
    const badDocument = documentValues.find(file => file.status !== 'ok')
    if (badDocument) return setMessage(`${badDocument.name}: ${badDocument.error || 'Foto belum lolos pengecekan kualitas. Upload ulang dulu.'}`)
    if (!accepted) return setMessage('Centang persetujuan ketentuan pengajuan dulu.')
    if (!signed) return setMessage('Tanda tangan online wajib diisi.')
    const application = {
      id: `KSA-${Date.now().toString().slice(-8)}`,
      status: 'Menunggu verifikasi analis',
      createdAt: new Date().toISOString(),
      form: {...form, amount},
      documents: Object.fromEntries(Object.entries(files).map(([key, file]) => [key, file.file.name])),
    }
    const key = `pulsaprime_agent_credit_${user?.id || 'guest'}`
    const history = JSON.parse(localStorage.getItem(key) || '[]')
    localStorage.setItem(key, JSON.stringify([application, ...history].slice(0, 10)))
    setMessage(`Pengajuan ${application.id} berhasil dibuat. Tim PulsaPrime akan mengecek dokumen agent.`)
  }

  return <main className="mobile-app agent-credit-page">
    <SubPageHeader title="Kredit Saldo Agent" description="Ajukan tanam saldo langsung dari aplikasi" back/>
    <section className="agent-credit-hero">
      <img className="agent-credit-person" src={financeHero} alt="" aria-hidden="true"/>
      <div className="agent-credit-hero-shade"/>
      <i><WalletCards/></i>
      <div><span>MODAL AGENT RESMI</span><h1>Ajukan Kredit Saldo Lebih Cepat</h1><p>Upload dokumen jelas, isi formulir agent, lalu tanda tangan online. Tim analis tinggal verifikasi dari data yang kamu kirim.</p></div>
      <b>{rupiah(Math.min(500000, Math.max(0, Number(form.amount || 0))))}</b>
    </section>
    <form className="agent-credit-form" onSubmit={submit}>
      <section className="agent-card">
        <header><i><UserRound/></i><div><h2>Data Agent</h2><p>Isi sesuai identitas asli agar pengajuan mudah diverifikasi.</p></div></header>
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
        <header><i><Camera/></i><div><h2>Upload Dokumen</h2><p>Sistem mengecek kualitas foto. Jika buram, kecil, atau rusak wajib upload ulang.</p></div></header>
        <div className="agent-doc-grid">{docs.map(item => <DocUpload key={item.key} item={item} value={files[item.key]} onChange={updateFile}/>)}</div>
        <div className="agent-doc-tips"><b>Tips foto lolos cepat</b><span>KTP tidak kepotong, cahaya cukup, wajah terlihat, dan foto selfie harus benar-benar sambil memegang KTP.</span></div>
      </section>
      <section className="agent-card">
        <header><i><FileText/></i><div><h2>Ketentuan Umum</h2><p>Baca dan setujui sebelum mengajukan.</p></div></header>
        <ol className="agent-terms">{terms.map(term => <li key={term}>{term}</li>)}</ol>
        <label className="agent-check"><input type="checkbox" checked={accepted} onChange={event => setAccepted(event.target.checked)}/><span>Saya menyatakan data benar dan bersedia mengikuti ketentuan kredit saldo PulsaPrime.</span></label>
      </section>
      <section className="agent-card">
        <header><i><PenLine/></i><div><h2>Tanda Tangan Online</h2><p>Gores tanda tangan langsung di kotak ini.</p></div></header>
        <div className="signature-box">
          <canvas ref={canvasRef} width="640" height="220" onPointerDown={startDraw} onPointerMove={moveDraw} onPointerUp={stopDraw} onPointerCancel={stopDraw} onPointerLeave={stopDraw}/>
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
