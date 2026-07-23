import {useEffect, useRef, useState} from 'react'
import {ArrowRight, Camera, CheckCircle2, Clock3, FileText, Images, Loader2, PenLine, ShieldCheck, Stamp, Store, Upload, UserRound, WalletCards, X} from 'lucide-react'
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
  {key: 'ktp', title: 'Foto KTP', hint: 'KTP asli, jelas, tidak buram', camera: 'environment'},
  {key: 'store', title: 'Foto Toko', hint: 'Tampak depan toko/usaha', camera: 'environment'},
  {key: 'selfie', title: 'Selfie Pegang KTP', hint: 'Wajah dan KTP terlihat jelas', camera: 'user'},
]

const terms = [
  'Pengajuan hanya untuk agent terdaftar PulsaPrime dan akan diverifikasi oleh tim analis.',
  'Limit kredit saldo maksimal Rp500.000 dan dapat berubah sesuai hasil penilaian.',
  'Pelunasan wajib dilakukan sesuai jatuh tempo agar akses kredit tetap aktif.',
  'Data KTP, toko, selfie, dan tanda tangan dipakai untuk validasi permohonan.',
]

const verificationDuration = 5 * 60 * 1000

function DocUpload({item, value, onOpenCamera}) {
  const state = value?.status || ''
  return <button type="button" className={`agent-doc-upload ${state === 'ok' ? 'filled' : ''} ${state === 'error' ? 'error' : ''} ${state === 'checking' ? 'checking' : ''}`} onClick={() => onOpenCamera(item)}>
    {value?.preview ? <img src={value.preview} alt="" aria-hidden="true"/> : <i>{state === 'ok' ? <CheckCircle2/> : <Upload/>}</i>}
    <span>
      <b>{item.title}</b>
      <small>{state === 'checking' ? 'Mengecek kualitas foto...' : value?.error || value?.name || item.hint}</small>
      {value?.width && <em>{value.width}×{value.height}px · {value.focusScore ? `fokus ${value.focusScore}` : ''} · {state === 'ok' ? 'jelas' : 'perlu ulang'}</em>}
    </span>
  </button>
}

function imageSharpnessScore(image) {
  const size = 140
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d', {willReadFrequently: true})
  ctx.drawImage(image, 0, 0, size, size)
  const data = ctx.getImageData(0, 0, size, size).data
  let totalBrightness = 0
  let totalDiff = 0
  let count = 0
  for (let y = 0; y < size - 1; y += 1) {
    for (let x = 0; x < size - 1; x += 1) {
      const index = (y * size + x) * 4
      const right = (y * size + x + 1) * 4
      const down = ((y + 1) * size + x) * 4
      const gray = data[index] * 0.299 + data[index + 1] * 0.587 + data[index + 2] * 0.114
      const grayRight = data[right] * 0.299 + data[right + 1] * 0.587 + data[right + 2] * 0.114
      const grayDown = data[down] * 0.299 + data[down + 1] * 0.587 + data[down + 2] * 0.114
      totalBrightness += gray
      totalDiff += Math.abs(gray - grayRight) + Math.abs(gray - grayDown)
      count += 1
    }
  }
  return {brightness: Math.round(totalBrightness / count), focusScore: Number((totalDiff / (count * 2)).toFixed(1))}
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
      const quality = imageSharpnessScore(image)
      if (file.size < minimumSize) return resolve({file, name: file.name, preview, status: 'error', error: 'Foto terlalu kecil/terkompres. Ulangi dengan kamera lebih jelas.', width, height})
      if (width < minimumWidth || height < minimumHeight) return resolve({file, name: file.name, preview, status: 'error', error: 'Resolusi foto rendah. Ulangi agar KTP/wajah terbaca jelas.', width, height})
      if (quality.brightness < 35) return resolve({file, name: file.name, preview, status: 'error', error: 'Foto terlalu gelap. Ulangi di tempat yang lebih terang.', width, height, ...quality})
      if (quality.brightness > 242) return resolve({file, name: file.name, preview, status: 'error', error: 'Foto terlalu terang/silau. Ulangi tanpa pantulan cahaya.', width, height, ...quality})
      if (quality.focusScore < 4.2) return resolve({file, name: file.name, preview, status: 'error', error: 'Foto terdeteksi blur. Ulangi dan tahan kamera lebih stabil.', width, height, ...quality})
      resolve({file, name: file.name, preview, status: 'ok', width, height, ...quality})
    }
    image.onerror = () => fail('Gambar rusak atau tidak bisa dibaca. Upload ulang foto yang jelas.')
    image.src = preview
  })
}

export default function AgentCreditPage() {
  const {user} = useAuth()
  const canvasRef = useRef(null)
  const videoRef = useRef(null)
  const galleryRef = useRef(null)
  const drawing = useRef(false)
  const [form, setForm] = useState({...initialForm, agentName: user?.name || '', whatsapp: user?.phone || '', email: user?.email || ''})
  const [files, setFiles] = useState({ktp: null, store: null, selfie: null})
  const [signed, setSigned] = useState(false)
  const [accepted, setAccepted] = useState(false)
  const [message, setMessage] = useState('')
  const [cameraDoc, setCameraDoc] = useState(null)
  const [cameraReady, setCameraReady] = useState(false)
  const [cameraError, setCameraError] = useState('')
  const [application, setApplication] = useState(null)
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    if (!cameraDoc) return undefined
    let stream
    let cancelled = false
    setCameraReady(false)
    setCameraError('')
    const start = async () => {
      try {
        if (!navigator.mediaDevices?.getUserMedia) throw new Error('Kamera tidak didukung browser ini.')
        stream = await navigator.mediaDevices.getUserMedia({
          audio: false,
          video: {facingMode: {ideal: cameraDoc.camera}, width: {ideal: 1280}, height: {ideal: 1280}},
        })
        if (cancelled) return
        videoRef.current.srcObject = stream
        await videoRef.current.play()
        setCameraReady(true)
      } catch (error) {
        setCameraError(error.message || 'Kamera belum bisa dibuka. Coba izinkan kamera atau pilih dari galeri.')
      }
    }
    start()
    return () => {
      cancelled = true
      stream?.getTracks().forEach(track => track.stop())
    }
  }, [cameraDoc])

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    const key = `pulsaprime_agent_credit_${user?.id || 'guest'}`
    const history = JSON.parse(localStorage.getItem(key) || '[]')
    const latest = history[0]
    if (latest?.verifyUntil && latest.status !== 'Disetujui') setApplication(latest)
  }, [user?.id])

  useEffect(() => {
    if (!application || application.status === 'Disetujui' || now < application.verifyUntil) return
    const approved = {...application, status: 'Disetujui', approvedAt: new Date().toISOString()}
    const key = `pulsaprime_agent_credit_${user?.id || 'guest'}`
    const history = JSON.parse(localStorage.getItem(key) || '[]')
    localStorage.setItem(key, JSON.stringify([approved, ...history.filter(item => item.id !== approved.id)].slice(0, 10)))
    setApplication(approved)
  }, [application, now, user?.id])

  const update = event => setForm({...form, [event.target.name]: event.target.value})
  const updateFile = async (key, file) => {
    if (!file) return setFiles(current => ({...current, [key]: null}))
    const preview = URL.createObjectURL(file)
    setFiles(current => ({...current, [key]: {file, name: file.name, preview, status: 'checking'}}))
    const checked = await checkImageQuality(file, key)
    setFiles(current => ({...current, [key]: checked}))
  }
  const closeCamera = () => setCameraDoc(null)
  const capturePhoto = () => {
    const video = videoRef.current
    if (!video?.videoWidth || !cameraDoc) return setCameraError('Kamera belum siap. Tunggu sebentar lalu coba lagi.')
    const canvas = document.createElement('canvas')
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height)
    canvas.toBlob(blob => {
      if (!blob) return setCameraError('Foto gagal diproses. Coba ulangi.')
      updateFile(cameraDoc.key, new File([blob], `${cameraDoc.key}-${Date.now()}.jpg`, {type: 'image/jpeg'}))
      closeCamera()
    }, 'image/jpeg', 0.92)
    return undefined
  }
  const pickFromGallery = event => {
    const file = event.target.files?.[0]
    if (file && cameraDoc) updateFile(cameraDoc.key, file)
    event.target.value = ''
    closeCamera()
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
      status: 'Sedang diverifikasi pihak atas',
      createdAt: new Date().toISOString(),
      verifyUntil: Date.now() + verificationDuration,
      form: {...form, amount},
      documents: Object.fromEntries(Object.entries(files).map(([key, file]) => [key, file.file.name])),
    }
    const key = `pulsaprime_agent_credit_${user?.id || 'guest'}`
    const history = JSON.parse(localStorage.getItem(key) || '[]')
    localStorage.setItem(key, JSON.stringify([application, ...history].slice(0, 10)))
    setMessage('')
    setApplication(application)
  }

  const remainingMs = application?.status === 'Disetujui' ? 0 : Math.max(0, (application?.verifyUntil || 0) - now)
  const remainingSeconds = Math.ceil(remainingMs / 1000)
  const progress = application ? Math.min(100, Math.round(((verificationDuration - remainingMs) / verificationDuration) * 100)) : 0
  const minutes = String(Math.floor(remainingSeconds / 60)).padStart(2, '0')
  const seconds = String(remainingSeconds % 60).padStart(2, '0')
  const approved = application?.status === 'Disetujui'

  return <main className="mobile-app agent-credit-page">
    <SubPageHeader title="Kredit Saldo Agent" description="Ajukan tanam saldo langsung dari aplikasi" back/>
    <section className="agent-credit-hero">
      <img className="agent-credit-person" src={financeHero} alt="" aria-hidden="true"/>
      <div className="agent-credit-hero-shade"/>
      <i><WalletCards/></i>
      <div><span>MODAL AGENT RESMI</span><h1>Ajukan Kredit Saldo Lebih Cepat</h1><p>Upload dokumen jelas, isi formulir agent, lalu tanda tangan online. Tim analis tinggal verifikasi dari data yang kamu kirim.</p></div>
      <b>{rupiah(Math.min(500000, Math.max(0, Number(form.amount || 0))))}</b>
    </section>
    {application && <section className={`agent-verification ${approved ? 'approved' : ''}`}>
      <i>{approved ? <Stamp/> : <Loader2/>}</i>
      <span>{approved ? 'PENGAJUAN DISETUJUI' : 'MOHON MENUNGGU'}</span>
      <h2>{approved ? 'Kredit saldo sudah ACC' : 'Data sedang diverifikasi pihak atas'}</h2>
      <p>{approved ? 'Pengajuan agent kamu sudah disetujui. Limit kredit saldo siap diproses sesuai nominal yang diajukan.' : 'Sistem sedang mengecek formulir, dokumen, kualitas foto, dan tanda tangan online. Jangan tutup halaman sampai proses selesai.'}</p>
      <div className="verification-meta">
        <b>{application.id}</b>
        <strong>{rupiah(application.form.amount)}</strong>
      </div>
      <div className="verification-timer"><Clock3/><strong>{approved ? 'ACC' : `${minutes}:${seconds}`}</strong><small>{approved ? 'Disetujui pihak atas' : 'Estimasi maksimal 5 menit'}</small></div>
      <div className="verification-progress"><span style={{width: `${approved ? 100 : progress}%`}}/></div>
      <ul className="verification-steps">
        <li className="done"><CheckCircle2/>Formulir agent diterima</li>
        <li className={progress >= 25 || approved ? 'done' : 'active'}>{progress >= 25 || approved ? <CheckCircle2/> : <Loader2/>}Validasi foto KTP, toko, dan selfie</li>
        <li className={progress >= 55 || approved ? 'done' : ''}>{progress >= 55 || approved ? <CheckCircle2/> : <Clock3/>}Pengecekan tanda tangan online</li>
        <li className={approved ? 'done' : ''}>{approved ? <CheckCircle2/> : <Clock3/>}Persetujuan analis pihak atas</li>
      </ul>
      {approved && <button type="button" onClick={() => setApplication(null)}>Buat Pengajuan Baru <ArrowRight/></button>}
    </section>}
    {!application && <>
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
        <div className="agent-doc-grid">{docs.map(item => <DocUpload key={item.key} item={item} value={files[item.key]} onOpenCamera={setCameraDoc}/>)}</div>
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
    </>}
    {cameraDoc && <section className="agent-camera-backdrop" aria-label={`Ambil ${cameraDoc.title}`}>
      <div className="agent-camera-shell">
        <header><button type="button" onClick={closeCamera}><X/></button><span>{cameraDoc.title}</span><i>{cameraDoc.camera === 'user' ? 'Depan' : 'Belakang'}</i></header>
        <div className="agent-camera-preview">
          <video ref={videoRef} playsInline muted/>
          {!cameraReady && !cameraError && <p>Membuka kamera...</p>}
          {cameraError && <p>{cameraError}</p>}
        </div>
        <footer>
          <button type="button" className="camera-gallery" onClick={() => galleryRef.current?.click()} aria-label="Pilih dari galeri"><Images/></button>
          <button type="button" className="camera-shot" disabled={!cameraReady} onClick={capturePhoto} aria-label="Ambil foto"/>
          <button type="button" className="camera-close" onClick={closeCamera} aria-label="Tutup kamera"><X/></button>
        </footer>
        <input ref={galleryRef} className="agent-camera-gallery-input" type="file" accept="image/*" onChange={pickFromGallery}/>
      </div>
    </section>}
    <MobileNav/>
  </main>
}
