import {useEffect, useRef, useState} from 'react'
import {useLocation,useNavigate} from 'react-router-dom'
import {QRCodeSVG} from 'qrcode.react'
import {ArrowRight, Award, CalendarDays, Camera, Check, CheckCircle2, Clock3, Copy, CreditCard, FileText, Images, Landmark, Loader2, PenLine, QrCode, Search, ShieldCheck, Stamp, Store, TrendingUp, Upload, UserRound, WalletCards, X} from 'lucide-react'
import SubPageHeader from '../components/mobile/SubPageHeader'
import MobileNav from '../components/mobile/MobileNav'
import {useAuth} from '../context/AuthContext'
import {rupiah} from '../utils/currency'
import {request} from '../services/http'
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
  {key: 'selfieMarketing', title: 'Selfie dengan Marketing', hint: 'Agent dan marketing terlihat jelas', camera: 'user'},
]

const terms = [
  'Pengajuan hanya untuk agent terdaftar KuotaKita dan akan diverifikasi oleh tim analis.',
  'Limit kredit saldo maksimal Rp500.000 dan dapat berubah sesuai hasil penilaian.',
  'Pelunasan wajib dilakukan sesuai jatuh tempo agar akses kredit tetap aktif.',
  'Data KTP, toko, selfie, dan tanda tangan dipakai untuk validasi permohonan.',
]

const verificationDuration = 5 * 60 * 1000
const rankLevels = [
  {name: 'Agent Pemula', minApproved: 0, limit: 500000, badge: 'BRONZE'},
  {name: 'Agent Lancar', minApproved: 3, limit: 1000000, badge: 'SILVER'},
  {name: 'Agent Prioritas', minApproved: 6, limit: 2000000, badge: 'GOLD'},
  {name: 'Agent Platinum', minApproved: 10, limit: 5000000, badge: 'PLATINUM'},
]
const paymentSteps = [
  {label: 'Cicilan 1', day: 7, portion: 0.25},
  {label: 'Cicilan 2', day: 14, portion: 0.25},
  {label: 'Cicilan 3', day: 21, portion: 0.25},
  {label: 'Pelunasan', day: 30, portion: 0.25},
]
const finalCreditStatus = ['Disetujui', 'Ditolak']

const readJSON = (key, fallback = []) => {
  try { return JSON.parse(localStorage.getItem(key)) || fallback } catch { return fallback }
}

function DocUpload({item, value, onOpenCamera}) {
  const state = value?.status || ''
  return <button type="button" className={`agent-doc-upload ${state === 'ok' ? 'filled' : ''} ${state === 'error' ? 'error' : ''} ${state === 'checking' ? 'checking' : ''}`} onClick={() => onOpenCamera(item)}>
    {value?.preview ? <img src={value.preview} alt="" aria-hidden="true"/> : <i>{state === 'ok' ? <CheckCircle2/> : <Upload/>}</i>}
    <span>
      <b>{item.title}</b>
      <small>{state === 'checking' ? 'Mengecek kualitas foto...' : value?.error || value?.name || item.hint}</small>
      {value?.width && <em>{value.width}Ã—{value.height}px Â· {value.focusScore ? `fokus ${value.focusScore}` : ''} Â· {state === 'ok' ? 'jelas' : 'perlu ulang'}</em>}
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
    const isSelfie = key === 'selfie' || key === 'selfieMarketing'
    const minimumSize = isSelfie ? 90000 : 65000
    const minimumWidth = isSelfie ? 700 : 640
    const minimumHeight = isSelfie ? 700 : 420
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

const filePreviewData = file => new Promise(resolve => {
  const url = URL.createObjectURL(file)
  const image = new Image()
  image.onload = () => {
    const max = 1200
    const ratio = Math.min(1, max / Math.max(image.naturalWidth, image.naturalHeight))
    const canvas = document.createElement('canvas')
    canvas.width = Math.max(1, Math.round(image.naturalWidth * ratio))
    canvas.height = Math.max(1, Math.round(image.naturalHeight * ratio))
    canvas.getContext('2d').drawImage(image, 0, 0, canvas.width, canvas.height)
    URL.revokeObjectURL(url)
    resolve(canvas.toDataURL('image/jpeg', .8))
  }
  image.onerror = () => { URL.revokeObjectURL(url); resolve('') }
  image.src = url
})

export default function AgentCreditPage() {
  const {user} = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const canvasRef = useRef(null)
  const videoRef = useRef(null)
  const galleryRef = useRef(null)
  const drawing = useRef(false)
  const [form, setForm] = useState({...initialForm, agentName: user?.name || '', whatsapp: user?.phone || '', email: user?.email || ''})
  const [files, setFiles] = useState({ktp: null, store: null, selfie: null, selfieMarketing: null})
  const [signed, setSigned] = useState(false)
  const [accepted, setAccepted] = useState(false)
  const [message, setMessage] = useState('')
  const [cameraDoc, setCameraDoc] = useState(null)
  const [cameraReady, setCameraReady] = useState(false)
  const [cameraError, setCameraError] = useState('')
  const [application, setApplication] = useState(null)
  const [applications, setApplications] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [detailOpen, setDetailOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('Semua')
  const [repayments, setRepayments] = useState([])
  const [paymentItem, setPaymentItem] = useState(null)
  const [paymentMethod, setPaymentMethod] = useState('')
  const [paymentProof, setPaymentProof] = useState(null)
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
    const key = `kuotakita_agent_credit_${user?.id || 'guest'}`
    const legacy = readJSON(key)
    request('/me/agent-credit').then(async remote => {
      if (!Array.isArray(remote)) return
      // One-time migration for applications made before server persistence.
      if (!remote.length && legacy.length) {
        await Promise.all(legacy.filter(item => item?.id).map(item => request('/me/agent-credit', {method: 'POST', body: JSON.stringify(item)}).catch(() => null)))
        remote = await request('/me/agent-credit')
      }
      const rows = Array.isArray(remote) ? remote : []
      setApplications(rows)
      setApplication(rows[0] || null)
      setShowForm(rows.length === 0)
    }).catch(() => {
      // Offline display only; once online the server always replaces this cache.
      setApplications(legacy)
      setApplication(legacy[0] || null)
      setShowForm(legacy.length === 0)
    })
  }, [user?.id])

  useEffect(() => {
    const view = location.state?.creditView
    if (view === 'detail') setDetailOpen(true)
    if (view === 'form') setShowForm(true)
    if (!view && applications.length) {
      setDetailOpen(false)
      setShowForm(false)
    }
  }, [location.state, applications.length])

  // Pembayaran berasal dari pengajuan yang sudah disimpan server, sehingga
  // agent membuka dari perangkat lain tetap melihat cicilan yang sama.
  useEffect(() => {
    setRepayments(applications.flatMap(item => item.repayments || []))
  }, [applications])

  useEffect(() => {
    if (!application) return
    const latest = applications.find(item => item.id === application.id)
    if (latest && latest.updatedAt !== application.updatedAt) setApplication(latest)
  }, [applications, application])

  const persistApplication = nextApplication => {
    const userId = nextApplication.userId || user?.id || 'guest'
    const userName = nextApplication.userName || user?.name || nextApplication.form?.agentName
    const optimistic = {...nextApplication, userId, userName, updatedAt: new Date().toISOString()}
    setApplications(current => [optimistic, ...current.filter(row => row.id !== optimistic.id)])
    setApplication(optimistic)
    request('/me/agent-credit', {method: 'POST', body: JSON.stringify(optimistic)}).then(saved => {
      setApplications(current => [saved, ...current.filter(row => row.id !== saved.id)])
      setApplication(current => current?.id === saved.id ? saved : current)
    }).catch(() => setMessage('Data belum tersimpan ke server. Periksa koneksi lalu coba lagi.'))
    return optimistic
  }

  useEffect(() => {
    if (!application || finalCreditStatus.includes(application.status)) return
    if (application.marketingSignature || application.status === 'Menunggu verifikasi marketing' || application.status === 'Menunggu analis' || application.status === 'Menunggu keputusan analis') return
    if (now < Number(application.verifyUntil || 0)) return
    persistApplication({...application, status: 'Menunggu verifikasi marketing', queuedAt: application.queuedAt || new Date().toISOString(), updatedAt: new Date().toISOString()})
  }, [application, now])

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
    if (!canvas) {
      setSigned(false)
      return
    }
    canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height)
    setSigned(false)
  }
  const approvedBorrowerCount = applications.filter(item => item.status === 'Disetujui').length
  const currentRank = rankLevels.reduce((rank, item) => (approvedBorrowerCount >= item.minApproved ? item : rank), rankLevels[0])
  const nextRank = rankLevels.find(item => item.minApproved > approvedBorrowerCount)
  const rankProgress = nextRank ? Math.min(100, Math.round((approvedBorrowerCount / nextRank.minApproved) * 100)) : 100
  const maxCredit = currentRank.limit
  const pendingApplications = applications.filter(item => !finalCreditStatus.includes(item.status)).length
  const approvedApplications = applications.filter(item => item.status === 'Disetujui').length
  const rejectedApplications = applications.filter(item => item.status === 'Ditolak').length
  const filteredApplications = applications.filter(item => {
    const query = searchTerm.trim().toLowerCase()
    const matchesQuery = !query || [item.id, item.form?.agentName, item.form?.storeName, item.form?.whatsapp].some(value => String(value || '').toLowerCase().includes(query))
    const matchesStatus = statusFilter === 'Semua' || (statusFilter === 'Menunggu' ? !finalCreditStatus.includes(item.status) : item.status === statusFilter)
    return matchesQuery && matchesStatus
  })
  const payKey = (appId, index) => `${appId}-${index}`
  const isPaid = (appId, index) => repayments.some(item => item.key === payKey(appId, index) && item.status === 'Lunas')
  const paymentPlan = application ? paymentSteps.map((step, index) => ({
    ...step,
    index,
    key: payKey(application.id, index),
    amount: Math.ceil(Number(application.form.amount || 0) * step.portion),
    due: new Date(new Date(application.createdAt).getTime() + step.day * 86400000),
    paid: isPaid(application.id, index),
  })) : []
  const payInstallment = item => {
    if (!paymentProof) return setMessage('Bukti transfer wajib diunggah sebelum pembayaran dikonfirmasi.')
    const next = [{key: item.key, applicationId: application.id, label: item.label, amount: item.amount, status: 'Lunas', paidAt: new Date().toISOString(), proof: paymentProof}, ...repayments.filter(row => row.key !== item.key)]
    setRepayments(next)
    const appRepayments = next.filter(row => row.applicationId === application.id)
    const paymentStatus = appRepayments.length >= paymentSteps.length ? 'Lunas' : `Terbayar ${appRepayments.length}/${paymentSteps.length}`
    const updatedApplication = {...application, repayments: appRepayments, paymentStatus, updatedAt: new Date().toISOString()}
    persistApplication(updatedApplication)
    setPaymentItem(null)
    setPaymentMethod('')
    setPaymentProof(null)
  }
  const copyPaymentReference = value => navigator.clipboard?.writeText(value)
  const choosePaymentProof = async event => {
    const file = event.target.files?.[0]
    if (!file) return
    const dataUrl = file.type.startsWith('image/') ? await filePreviewData(file) : ''
    setPaymentProof({name: file.name, type: file.type, dataUrl})
    event.target.value = ''
  }
  const submit = async event => {
    event.preventDefault()
    const amount = Math.min(maxCredit, Math.max(50000, Number(form.amount || 0)))
    const documentValues = Object.values(files)
    if (documentValues.some(file => !file?.file)) return setMessage('Lengkapi Foto KTP, Foto toko, selfie pegang KTP, dan selfie dengan marketing dulu bro.')
    const badDocument = documentValues.find(file => file.status !== 'ok')
    if (badDocument) return setMessage(`${badDocument.name}: ${badDocument.error || 'Foto belum lolos pengecekan kualitas. Upload ulang dulu.'}`)
    if (!accepted) return setMessage('Centang persetujuan ketentuan pengajuan dulu.')
    if (!signed) return setMessage('Tanda tangan online wajib diisi.')
    const documentEntries = await Promise.all(Object.entries(files).map(async ([key, file]) => [key, {name: file.file.name, dataUrl: await filePreviewData(file.file)}]))
    if (documentEntries.some(([, document]) => !document.dataUrl)) {
      return setMessage('Foto belum berhasil disimpan. Pilih ulang atau ambil ulang ketiga foto agar langsung terlihat saat dicek Marketing.')
    }
    const application = {
      id: `KSA-${Date.now().toString().slice(-8)}`,
      status: 'Menunggu verifikasi marketing',
      createdAt: new Date().toISOString(),
      queuedAt: new Date().toISOString(),
      verifyUntil: Date.now() + verificationDuration,
      userId: user?.id || 'guest',
      userName: user?.name || form.agentName,
      form: {...form, amount},
      documents: Object.fromEntries(documentEntries),
    }
    setMessage('')
    persistApplication(application)
    setShowForm(false)
  }

  const resetAgentForm = () => {
    setForm({...initialForm, agentName: user?.name || '', whatsapp: user?.phone || '', email: user?.email || ''})
    setFiles({ktp: null, store: null, selfie: null, selfieMarketing: null})
    setSigned(false)
    setAccepted(false)
    setMessage('')
    const canvas = canvasRef.current
    if (canvas) canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height)
  }
  const startNewApplication = () => {
    resetAgentForm()
    setApplication(null)
    setDetailOpen(false)
    if (applications.length && location.state?.creditView !== 'form') navigate(location.pathname, {state: {creditView: 'form'}})
    setShowForm(true)
    window.setTimeout(() => document.querySelector('.agent-credit-form')?.scrollIntoView({behavior: 'smooth', block: 'start'}), 80)
  }
  const selectApplication = item => {
    setApplication(item)
    setShowForm(false)
    setDetailOpen(true)
    navigate(location.pathname, {state: {creditView: 'detail', applicationId: item.id}})
    setMessage('')
    window.setTimeout(() => document.querySelector('.agent-verification')?.scrollIntoView({behavior: 'smooth', block: 'start'}), 80)
  }
  const backToApplications = () => {
    if (location.state?.creditView) {
      navigate(-1)
      return
    }
    setDetailOpen(false)
    setShowForm(false)
    window.setTimeout(() => document.querySelector('.agent-registered-list')?.scrollIntoView({behavior: 'smooth', block: 'start'}), 60)
  }
  const applicationStatus = item => {
    if (item.status === 'Disetujui') return {label: 'Sukses Diterima', className: 'approved'}
    if (item.status === 'Ditolak') return {label: 'Ditolak', className: 'rejected'}
    return {label: 'Menunggu', className: 'waiting'}
  }

  const remainingMs = application?.status === 'Disetujui' ? 0 : Math.max(0, (application?.verifyUntil || 0) - now)
  const remainingSeconds = Math.ceil(remainingMs / 1000)
  const progress = application ? Math.min(100, Math.round(((verificationDuration - remainingMs) / verificationDuration) * 100)) : 0
  const minutes = String(Math.floor(remainingSeconds / 60)).padStart(2, '0')
  const seconds = String(remainingSeconds % 60).padStart(2, '0')
  const approved = application?.status === 'Disetujui'
  const rejected = application?.status === 'Ditolak'
  const waitingDecision = application && !approved && !rejected && remainingMs === 0
  const shouldShowForm = showForm || applications.length === 0
  const totalCreditApproved = applications.filter(item => item.status === 'Disetujui' || item.paymentStatus === 'Lunas').reduce((sum, item) => sum + Number(item.form?.amount || 0), 0)
  const totalCreditPaid = repayments.filter(item => item.status === 'Lunas').reduce((sum, item) => sum + Number(item.amount || 0), 0)
  const canRefill = approved && paymentPlan.length > 0 && paymentPlan.every(item => item.paid)
  return <main className="mobile-app agent-credit-page">
    <SubPageHeader title="Kredit Saldo Agent" description="Ajukan tanam saldo langsung dari aplikasi" back/>
    <section className="agent-credit-hero">
      <img className="agent-credit-person" src={financeHero} alt="" aria-hidden="true"/>
      <div className="agent-credit-hero-shade"/>
      <i><WalletCards/></i>
      <div><span>MODAL AGENT RESMI</span><h1>Ajukan Kredit Saldo Lebih Cepat</h1><p>Upload dokumen jelas, isi formulir agent, lalu tanda tangan online. Tim analis tinggal verifikasi dari data yang kamu kirim.</p></div>
      <b>{rupiah(Math.min(maxCredit, Math.max(0, Number(form.amount || 0))))}</b>
    </section>
    <section className="agent-rank-card">
      <header>
        <i><Award/></i>
        <div><span>PANGKAT AGENT</span><h2>{currentRank.name}</h2><p>{approvedBorrowerCount} peminjam disetujui · Limit {rupiah(currentRank.limit)}.</p></div>
        <b>{currentRank.badge}</b>
      </header>
      <div className="rank-meter"><span style={{width: `${rankProgress}%`}}/></div>
      <p><TrendingUp/> Pangkat naik otomatis setiap jumlah peminjam yang kamu daftarkan sudah diterima tim verifikasi.</p>
      <div className="agent-credit-totals"><div><small>Total kredit diterima</small><strong>{rupiah(totalCreditApproved)}</strong></div><div><small>Total sudah lunas</small><strong>{rupiah(totalCreditPaid)}</strong></div></div>
    </section>
    <div className="agent-credit-tabs" role="tablist" aria-label="Menu Kredit Agent">
      <button type="button" className={!showForm && !detailOpen ? 'active' : ''} onClick={backToApplications}><FileText/><span>Semua Peminjam<small>{applications.length} pengajuan tersimpan</small></span></button>
      <button type="button" className={showForm ? 'active' : ''} onClick={startNewApplication}><UserRound/><span>Daftar Baru<small>Tambah orang yang ingin meminjam</small></span></button>
    </div>
    {(!showForm && !detailOpen || applications.length === 0) && <section className="agent-registered-list">
      <header>
        <div>
          <span>DATA PENGAJUAN AGENT</span>
          <h2>Orang yang didaftarkan</h2>
          <p>Semua pengajuan tersimpan rapi di sini. Pilih salah satu untuk melihat detail dan progres verifikasinya.</p>
        </div>
        <button type="button" onClick={startNewApplication}>+ Daftar Baru</button>
      </header>
      <div className="agent-list-summary" aria-label="Ringkasan pengajuan">
        <div><strong>{applications.length}</strong><span>Total</span></div>
        <div><strong>{pendingApplications}</strong><span>Menunggu</span></div>
        <div><strong>{approvedApplications}</strong><span>Diterima</span></div>
        <div><strong>{rejectedApplications}</strong><span>Ditolak</span></div>
      </div>
      {applications.length > 0 && <div className="agent-list-tools">
        <label><Search/><input value={searchTerm} onChange={event => setSearchTerm(event.target.value)} placeholder="Cari nama, toko, nomor, atau ID..."/></label>
        <div className="agent-list-filters" role="tablist" aria-label="Filter status">
          {['Semua', 'Menunggu', 'Disetujui', 'Ditolak'].map(filter => <button key={filter} type="button" className={statusFilter === filter ? 'active' : ''} onClick={() => setStatusFilter(filter)}>{filter === 'Disetujui' ? 'Diterima' : filter}</button>)}
        </div>
        <small>Menampilkan {filteredApplications.length} dari {applications.length} pengajuan</small>
      </div>}
      {filteredApplications.length ? <div className="agent-registered-grid">
        {filteredApplications.map(item => {
          const status = applicationStatus(item)
          return <article className={application?.id === item.id ? 'active' : ''} key={item.id}>
            <i><FileText/></i>
            <div>
              <strong>{item.form?.agentName || item.userName || 'Pendaftar Agent'}</strong>
              <small>{item.form?.storeName || 'Toko belum diisi'} • {item.createdAt ? new Date(item.createdAt).toLocaleDateString('id-ID', {day: '2-digit', month: 'short', year: 'numeric'}) : 'Tanggal belum ada'}</small>
              <b>{rupiah(item.form?.amount || 0)}</b>
            </div>
            <span className={`agent-status-pill ${status.className}`}>{status.label}</span>
            <button type="button" onClick={() => selectApplication(item)}>Lihat Status</button>
          </article>
        })}
      </div> : <div className="agent-registered-empty"><FileText/><strong>{applications.length ? 'Pengajuan tidak ditemukan' : 'Belum ada yang didaftarkan'}</strong><small>{applications.length ? 'Coba ubah kata pencarian atau filter status.' : 'Isi formulir pertama, nanti status pengajuan muncul otomatis di sini.'}</small></div>}
    </section>}
    {detailOpen && application && <section className={`agent-verification ${approved ? 'approved' : ''} ${rejected ? 'rejected' : ''}`}>
      <i>{approved ? <Stamp/> : rejected ? <X/> : <Loader2/>}</i>
      <span>{approved ? 'PENGAJUAN DISETUJUI' : rejected ? 'PENGAJUAN DITOLAK' : waitingDecision ? 'MENUNGGU KEPUTUSAN' : 'MOHON MENUNGGU'}</span>
      <h2>{approved ? 'Kredit saldo sudah diterima' : rejected ? 'Pengajuan belum diterima' : waitingDecision ? 'Menunggu keputusan' : 'Data sedang diverifikasi'}</h2>
      <p>{approved ? 'Pengajuan agent kamu sudah diterima. Limit kredit saldo siap diproses sesuai nominal yang diajukan.' : rejected ? 'Pengajuan ini ditolak tim verifikasi. Periksa kembali data dan dokumen sebelum membuat pengajuan baru.' : waitingDecision ? 'Pemeriksaan awal sudah selesai. Status akan berubah setelah keputusan akhir diberikan.' : 'Sistem sedang mengecek formulir, dokumen, kualitas foto, dan tanda tangan online.'}</p>
      <div className="verification-meta">
        <b>{application.id}</b>
        <strong>{rupiah(application.form.amount)}</strong>
      </div>
      <div className="verification-timer"><Clock3/><strong>{approved ? 'DITERIMA' : rejected ? 'DITOLAK' : waitingDecision ? 'REVIEW' : `${minutes}:${seconds}`}</strong><small>{approved ? 'Diterima tim verifikasi' : rejected ? 'Ditolak tim verifikasi' : waitingDecision ? 'Menunggu keputusan' : 'Estimasi pemeriksaan 5 menit'}</small></div>
      <div className="verification-progress"><span style={{width: `${approved ? 100 : progress}%`}}/></div>
      <ul className="verification-steps">
        <li className="done"><CheckCircle2/>Formulir agent diterima</li>
        <li className={progress >= 25 || approved ? 'done' : 'active'}>{progress >= 25 || approved ? <CheckCircle2/> : <Loader2/>}Validasi foto KTP, toko, dan selfie</li>
        <li className={progress >= 55 || approved ? 'done' : ''}>{progress >= 55 || approved ? <CheckCircle2/> : <Clock3/>}Pengecekan tanda tangan online</li>
        <li className={approved ? 'done' : rejected ? 'rejected' : ''}>{approved ? <CheckCircle2/> : rejected ? <X/> : <Clock3/>}Keputusan analis</li>
      </ul>
      {canRefill && <button type="button" className="agent-refill-button" onClick={startNewApplication}><PlusCircle/> Ajukan Refill Kredit</button>}
    </section>}
    {detailOpen && approved && <section className="agent-payment-lane">
        <header><i><CreditCard/></i><div><h2>Jalur Pembayaran Kredit</h2><p>Pembayaran cicilan dicatat oleh marketing. Agent hanya dapat memantau status pembayaran.</p></div></header>
      <div className="payment-lane-total"><span>Total pinjaman</span><strong>{rupiah(application.form.amount)}</strong></div>
      <div className="payment-lane-list">
        {paymentPlan.map(item => <article className={item.paid ? 'paid' : ''} key={item.key}>
          <i>{item.paid ? <CheckCircle2/> : <CalendarDays/>}</i>
          <div><strong>{item.label}</strong><small>Jatuh tempo {item.due.toLocaleDateString('id-ID', {day: '2-digit', month: 'short', year: 'numeric'})}</small></div>
          <b>{rupiah(item.amount)}</b>
          <button type="button" disabled={item.paid} onClick={() => {setPaymentItem(item);setPaymentMethod('')}}>{item.paid ? 'Lunas' : 'Bayar Cicilan'}</button>
        </article>)}
      </div>
    </section>}
    {paymentItem && <section className="agent-payment-backdrop" onClick={event => event.target === event.currentTarget && setPaymentItem(null)}>
      <div className="agent-payment-sheet">
        <header><div><span>PEMBAYARAN CICILAN</span><h2>{paymentItem.label}</h2></div><button type="button" onClick={() => {setPaymentItem(null);setPaymentProof(null)}}><X/></button></header>
        <div className="agent-payment-amount"><small>Total yang harus dibayar</small><strong>{rupiah(paymentItem.amount)}</strong><span>Jatuh tempo {paymentItem.due.toLocaleDateString('id-ID', {day: '2-digit', month: 'long', year: 'numeric'})}</span></div>
        <div className="agent-payment-methods">
          <button type="button" className={paymentMethod === 'bank' ? 'active' : ''} onClick={() => setPaymentMethod('bank')}><i><Landmark/></i><span><b>Transfer Bank</b><small>BCA · 1234567890 · a.n. KuotaKita</small></span>{paymentMethod === 'bank' && <Check/>}</button>
          <button type="button" className={paymentMethod === 'qris' ? 'active' : ''} onClick={() => setPaymentMethod('qris')}><i><QrCode/></i><span><b>QRIS / Barcode</b><small>Nominal otomatis sesuai cicilan</small></span>{paymentMethod === 'qris' && <Check/>}</button>
        </div>
        {paymentMethod === 'bank' && <div className="agent-bank-detail"><div><span>Nominal transfer</span><strong>{rupiah(paymentItem.amount)}</strong></div><div><span>Kode pembayaran</span><strong>{paymentItem.key.toUpperCase()}</strong></div><button type="button" onClick={() => copyPaymentReference(paymentItem.key.toUpperCase())}><Copy/> Salin kode</button></div>}
        {paymentMethod === 'qris' && <div className="agent-qr-detail"><div className="agent-qr-art"><QRCodeSVG value={`https://kuotakita-app.pages.dev/pay?ref=${encodeURIComponent(paymentItem.key)}&amount=${paymentItem.amount}`} size={220} level="H" minVersion={5} includeMargin/></div><strong>{rupiah(paymentItem.amount)}</strong><small>QR dinamis untuk {paymentItem.label}. Scan dari kamera, bank, atau e-wallet.</small></div>}
        <label className="agent-payment-proof"><Upload/><span><b>Bukti transfer wajib</b><small>{paymentProof?.name || 'Unggah foto/screenshot bukti pembayaran'}</small></span><input type="file" accept="image/*" onChange={choosePaymentProof}/></label>
        <button type="button" className="agent-payment-confirm" disabled={!paymentMethod || !paymentProof} onClick={() => payInstallment(paymentItem)}>Konfirmasi Pembayaran <ArrowRight/></button>
      </div>
    </section>}
    {shouldShowForm && <>
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
          <label className="wide">Nominal Kredit Saldo<input name="amount" value={form.amount} onChange={event => setForm({...form, amount: event.target.value.replace(/\D/g, '').slice(0, 7)})} inputMode="numeric" required/><small>Maksimal sesuai pangkat saat ini: {rupiah(maxCredit)}</small></label>
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
      <section className="agent-credit-preview" aria-label="Ringkasan nominal kredit">
        <header><div><span>RINGKASAN SEBELUM TANDA TANGAN</span><h2>Nominal yang diajukan</h2><p>Pastikan jumlah kredit dan cicilan sudah sesuai sebelum menyetujui ketentuan.</p></div><strong>{rupiah(Number(form.amount || 0))}</strong></header>
        <div><article><small>Total kredit</small><b>{rupiah(Number(form.amount || 0))}</b></article><article><small>Per cicilan (4x)</small><b>{rupiah(Math.ceil(Number(form.amount || 0) * .25))}</b></article><article><small>Status</small><b>Menunggu verifikasi</b></article></div>
      </section>
      <section className="agent-card">
        <header><i><Camera/></i><div><h2>Upload Dokumen</h2><p>Sistem mengecek kualitas foto. Jika buram, kecil, atau rusak wajib upload ulang.</p></div></header>
        <div className="agent-doc-grid">{docs.map(item => <DocUpload key={item.key} item={item} value={files[item.key]} onOpenCamera={setCameraDoc}/>)}</div>
        <div className="agent-doc-tips"><b>Tips foto lolos cepat</b><span>KTP tidak kepotong, cahaya cukup, wajah terlihat, dan foto selfie harus benar-benar sambil memegang KTP.</span></div>
      </section>
      <section className="agent-card">
        <header><i><FileText/></i><div><h2>Ketentuan Umum</h2><p>Baca dan setujui sebelum mengajukan.</p></div></header>
        <ol className="agent-terms">{terms.map(term => <li key={term}>{term}</li>)}</ol>
        <label className="agent-check"><input type="checkbox" checked={accepted} onChange={event => setAccepted(event.target.checked)}/><span>Saya menyatakan data benar dan bersedia mengikuti ketentuan kredit saldo KuotaKita.</span></label>
      </section>
      <section className="agent-card">
        <header><i><PenLine/></i><div><h2>Tanda Tangan Agent</h2><p>Cukup tanda tangan agent di sini. Marketing dan analis akan memeriksa lalu menandatangani dari panel verifikasi.</p></div></header>
        <div className="signature-approval-grid">
          <div className="signature-party active">
            <strong>AGENT</strong>
            <div className="signature-box">
              <canvas ref={canvasRef} width="640" height="220" onPointerDown={startDraw} onPointerMove={moveDraw} onPointerUp={stopDraw} onPointerCancel={stopDraw} onPointerLeave={stopDraw}/>
              {!signed && <span>Tanda tangan agent</span>}
            </div>
            <small>{form.agentName || user?.name || 'Nama & tanda tangan'}</small>
          </div>
        </div>
        <button type="button" className="clear-signature" onClick={clearSignature}><X/>Hapus tanda tangan</button>
      </section>
      {message && <div className="agent-message">{message}</div>}
      <button className="agent-submit">Ajukan Kredit Saldo <ArrowRight/></button>
    </form>
    <section className="agent-safe-note"><ShieldCheck/><span>Dokumen hanya digunakan untuk verifikasi pengajuan agent KuotaKita.</span></section>
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
