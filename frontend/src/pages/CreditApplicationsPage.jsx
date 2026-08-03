import {useEffect, useRef, useState} from 'react'
import {useSearchParams} from 'react-router-dom'
import {AlertCircle, ArrowRight, Banknote, BarChart3, CalendarDays, Camera, Check, CheckCircle2, CircleHelp, ClipboardCheck, Clock3, CreditCard, Eye, FileCheck2, Filter, HandCoins, Images, Landmark, PenLine, PhoneCall, PlusCircle, QrCode, Search, ShieldCheck, Stamp, Trash2, Upload, UserCheck, UserPlus, WalletCards, X, XCircle} from 'lucide-react'
import {QRCodeSVG} from 'qrcode.react'
import PageHeader from '../components/common/PageHeader'
import {useAuth} from '../context/AuthContext'
import {rupiah} from '../utils/currency'
import {request} from '../services/http'
import AgentAccountForm from '../components/credit/AgentAccountForm'

const allKey = 'kuotakita_agent_credit_all'
const userKey = userId => `kuotakita_agent_credit_${userId || 'guest'}`
const finalStatus = ['Disetujui', 'Ditolak']
const creditLevels = [
  {name: 'Agent Pemula', limit: 500000, minPaid: 0, nextAt: 3},
  {name: 'Agent Lancar', limit: 1000000, minPaid: 3, nextAt: 8},
  {name: 'Agent Prioritas', limit: 2000000, minPaid: 8, nextAt: 13},
]
const filters = ['Semua', 'Review', 'Disetujui', 'Ditolak', 'Lunas']
const manualInitial = {
  agentName: '',
  storeName: '',
  nik: '',
  whatsapp: '',
  email: '',
  amount: '500000',
  monthlyTransactions: '',
  homeAddress: '',
  storeAddress: '',
  familyName: '',
  familyRelation: '',
  familyWhatsapp: '',
}
const coreDocumentTypes = [
  {key: 'ktp', label: 'Foto KTP', hint: 'KTP asli dan tidak buram'},
  {key: 'store', label: 'Foto Toko', hint: 'Tampak depan toko/usaha'},
  {key: 'selfie', label: 'Selfie Pegang KTP', hint: 'Wajah dan KTP terlihat jelas'},
]
const manualDocumentTypes = [
  ...coreDocumentTypes,
  {key: 'selfieMarketing', label: 'Selfie dengan Marketing', hint: 'Agent dan marketing terlihat jelas'},
]
const emptyManualDocuments = {ktp: null, store: null, selfie: null, selfieMarketing: null}

// Pengajuan lama yang sudah tersimpan di browser/server bisa belum memiliki
// seluruh field terbaru. Normalisasi ini menjaga satu data lama tidak membuat
// seluruh halaman kredit gagal dimuat.
const normalizeCreditStatus = status => ['Menunggu verifikasi marketing', 'Sedang diverifikasi marketing', 'Siap dikirim ke analis'].includes(status) ? 'Menunggu analis' : (status || 'Menunggu analis')
const normalizeApplication = item => ({
  ...(item || {}),
  id: item?.id || `KSA-LEGACY-${Date.now()}`,
  form: {...manualInitial, ...(item?.form || {})},
  documents: item?.documents && typeof item.documents === 'object' ? item.documents : {},
  repayments: Array.isArray(item?.repayments) ? item.repayments : [],
  creditStatus: item?.creditStatus || (item?.paymentStatus === 'Lunas' ? 'Lunas' : item?.status === 'Disetujui' ? 'Aktif' : 'Menunggu keputusan'),
  creditBalance: Number(item?.creditBalance || 0),
  creditOutstanding: Number(item?.creditOutstanding || 0),
  status: normalizeCreditStatus(item?.status),
})

const readAll = () => {
  const merged = new Map()
  try {
    ;(JSON.parse(localStorage.getItem(allKey)) || []).forEach(item => merged.set(item.id, item))
  } catch {/* data kosong */}
  try {
    for (let index = 0; index < localStorage.length; index += 1) {
      const key = localStorage.key(index)
      if (!key?.startsWith('kuotakita_agent_credit_') || key === allKey || key.includes('repayments')) continue
      const userId = key.replace('kuotakita_agent_credit_', '')
      const rows = JSON.parse(localStorage.getItem(key)) || []
      rows.forEach(item => {
        if (item?.id && !merged.has(item.id)) merged.set(item.id, normalizeApplication({...item, userId: item.userId || userId}))
      })
    }
  } catch {/* abaikan data lokal yang rusak */}
  const list = [...merged.values()].map(normalizeApplication).sort((a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt))
  if (list.length) localStorage.setItem(allKey, JSON.stringify(list.slice(0, 50)))
  return list
}

const mergeDocuments = (remote = {}, local = {}) => {
  const keys = new Set([...Object.keys(remote || {}), ...Object.keys(local || {})])
  return Object.fromEntries([...keys].map(key => {
    const remoteFile = typeof remote[key] === 'string' ? {name: remote[key]} : (remote[key] || {})
    const localFile = typeof local[key] === 'string' ? {name: local[key]} : (local[key] || {})
    return [key, {...remoteFile, ...localFile, dataUrl: localFile.dataUrl || remoteFile.dataUrl || ''}]
  }))
}
const compressDocumentPreview = file => new Promise(resolve => {
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
    resolve(canvas.toDataURL('image/jpeg', .82))
  }
  image.onerror = () => { URL.revokeObjectURL(url); resolve('') }
  image.src = url
})

function saveApplication(target, changes) {
  const next = {...target, ...changes, updatedAt: new Date().toISOString()}
  const all = readAll()
  localStorage.setItem(allKey, JSON.stringify([next, ...all.filter(item => item.id !== target.id)].slice(0, 50)))
  const own = JSON.parse(localStorage.getItem(userKey(target.userId)) || '[]')
  localStorage.setItem(userKey(target.userId), JSON.stringify([next, ...own.filter(item => item.id !== target.id)].slice(0, 10)))
  request(`/agent-credit/applications/${encodeURIComponent(target.id)}`, {method: 'PUT', body: JSON.stringify(next)}).then(saved => {
    const current = readAll()
    localStorage.setItem(allKey, JSON.stringify([saved, ...current.filter(item => item.id !== saved.id)].slice(0, 50)))
    window.dispatchEvent(new Event('kuotakita-credit-sync'))
  }).catch(() => {})
  return next
}

const reviewerName = user => user?.name || (user?.role === 'analis' ? 'Operator KuotaKita' : 'Marketing KuotaKita')
const stampPayload = (user, image) => ({name: reviewerName(user), role: user?.role || 'reviewer', at: new Date().toISOString(), image})
const dateTime = iso => iso ? new Date(iso).toLocaleString('id-ID', {day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'}) : 'Belum tanda tangan'
const paymentRows = item => {
  const key = `${item.id}-pelunasan`
  const paid = (item.repayments || []).find(row => row.key === key) || (item.paymentStatus === 'Lunas' ? {key, paidAt: item.settledAt || item.updatedAt || item.decidedAt} : null)
  return [{key, paid, label: 'Pelunasan Saldo Kredit', amount: Number(item.creditOriginalAmount || item.form?.amount || item.creditOutstanding || 0)}]
}
const paymentSummary = item => {
  const rows = paymentRows(item)
  const paid = rows.filter(row => row.paid).length
  const totalPaid = rows.reduce((sum, row) => sum + (row.paid ? row.amount : 0), 0)
  return {paid, total: rows.length, percent: rows.length ? Math.round((paid / rows.length) * 100) : 0, totalPaid}
}
const statusGroup = item => item.paymentStatus === 'Lunas' ? 'Lunas' : item.status === 'Disetujui' ? 'Disetujui' : item.status === 'Ditolak' ? 'Ditolak' : 'Review'
const firstUnpaidRow = item => paymentRows(item).find(row => !row.paid)
const agentIdentity = item => String(item?.form?.whatsapp || item?.userId || item?.userName || item?.form?.agentName || '').trim().toLowerCase()
const creditProfile = (items, target) => {
  const key = agentIdentity(target)
  const paidCycles = items.filter(item => agentIdentity(item) === key && (item.paymentStatus === 'Lunas' || item.creditStatus === 'Lunas')).length
  const level = creditLevels.reduce((current, row) => paidCycles >= row.minPaid ? row : current, creditLevels[0])
  return {paidCycles, ...level}
}
const viewInfo = {
  overview: {label: 'Ringkasan Kerja', title: 'Prioritas marketing hari ini', desc: 'Daftarkan agent, dampingi pengajuan, lengkapi bukti pertemuan, dan pantau pelunasan penuh.'},
  peminjam: {label: 'Kredit Aktif', title: 'Agent dengan kredit diterima', desc: 'Hanya menampilkan kredit yang sudah diterima, masih aktif, atau sudah lunas.'},
  input: {label: 'Bantu Pengajuan', title: 'Dampingi pengajuan agent', desc: 'Bantu agent mengisi data dan tiga dokumen inti. Selfie pertemuan dibuat pada menu Pertemuan & Selfie.'},
  verifikasi: {label: 'Pertemuan & Selfie', title: 'Pendampingan lapangan marketing', desc: 'Lengkapi selfie bersama agent lalu kirim berkas yang lengkap kepada operator untuk keputusan akhir.'},
  pembayaran: {label: 'Pelunasan Kredit', title: 'Pelunasan saldo kredit', desc: 'Bayar satu kali penuh melalui Bank, QRIS, atau penagihan langsung oleh marketing.'},
  angsuran: {label: 'Pelunasan Kredit', title: 'Monitor pelunasan penuh', desc: 'Pantau transfer Bank, QRIS, penagihan offline, bukti pembayaran, dan hak refill setelah lunas.'},
  pelunasan: {label: 'Bukti Pelunasan', title: 'Arsip bukti pelunasan', desc: 'Periksa kredit yang sudah lunas beserta nominal, metode, waktu, referensi, penerima, dan bukti pembayarannya.'},
  laporan: {label: 'Laporan Kredit', title: 'Rekap kinerja kredit', desc: 'Lihat total nominal pinjaman, pembayaran masuk, sisa tagihan, dan status seluruh peminjam.'},
  panduan: {label: 'Panduan Marketing', title: 'Panduan kerja marketing', desc: 'Daftarkan agent, bantu pengajuan, ambil selfie pertemuan, dan catat pelunasan offline secara tertib.'},
  'agent-input': {label: 'Tambah Agent', title: 'Daftarkan agent baru', desc: 'Buat akun agent resmi agar agent dapat login dan menggunakan layanan Kredit Saldo Agent.'},
}
const dataScore = item => {
  const checks = [
    {label: 'Nama agent', ok: Boolean(item.form.agentName || item.userName)},
    {label: 'Nomor WA', ok: Boolean(item.form.whatsapp)},
    {label: 'NIK', ok: String(item.form.nik || '').length >= 12},
    {label: 'Alamat toko', ok: Boolean(item.form.storeAddress || item.form.homeAddress)},
    {label: 'Kontak keluarga', ok: Boolean(item.form.familyName && item.form.familyWhatsapp)},
    {label: 'Dokumen inti', ok: ['ktp', 'store', 'selfie'].every(key => Boolean(item.documents?.[key]))},
  ]
  const done = checks.filter(check => check.ok).length
  return {checks, done, total: checks.length, percent: Math.round((done / checks.length) * 100)}
}

// Dokumen inti adalah tanggung jawab agent. Selfie bersama Marketing adalah
// bukti pertemuan lapangan yang baru dibuat Marketing saat proses verifikasi.
const marketingReadiness = item => {
  const score = dataScore(item)
  const meetingReady = Boolean(item.documents?.selfieMarketing?.dataUrl || item.documents?.selfieMarketing?.preview || item.documents?.selfieMarketing)
  return {
    score,
    meetingReady,
    readyForAnalysis: score.percent === 100 && meetingReady,
  }
}

// Operator menjadi satu-satunya pemeriksa dan pemberi keputusan akhir.
const analystReadiness = item => {
  const core = dataScore(item)
  const marketing = marketingReadiness(item)
  const amount = Number(item.form?.amount || 0)
  const limit = Number(item.creditLimit || 500000)
  const checks = [
    {label: 'Data peminjam lengkap', ok: core.percent === 100},
    {label: 'Selfie pertemuan marketing', ok: marketing.meetingReady},
    {label: 'Persetujuan syarat agent', ok: Boolean(item.termsAcceptedAt || item.termsAccepted)},
    {label: 'Tanda tangan agent', ok: Boolean(item.agentSignature || item.createdAt)},
    {label: 'Nominal sesuai limit agent', ok: amount >= 50000 && amount <= limit},
  ]
  const done = checks.filter(check => check.ok).length
  return {checks, done, total: checks.length, percent: Math.round((done / checks.length) * 100), ready: checks.every(check => check.ok)}
}

function SignatureStep({title, note, signed, icon: Icon}) {
  return <div className={signed ? 'signed' : ''}>
    {signed?.image ? <img src={signed.image} alt={`Tanda tangan ${title}`}/> : <i>{signed ? <CheckCircle2/> : <Icon/>}</i>}
    <span><b>{title}</b><small>{signed ? `${signed.name} · ${dateTime(signed.at)}` : note}</small></span>
  </div>
}

export default function CreditApplicationsPage() {
  const {user} = useAuth()
  const [params, setSearchParams] = useSearchParams()
  const canvasRef = useRef(null)
  const drawing = useRef(false)
  const [items, setItems] = useState([])
  const [signaturePad, setSignaturePad] = useState(null)
  const [signatureDrawn, setSignatureDrawn] = useState(false)
  const [query, setQuery] = useState('')
  const [borrowerQuery, setBorrowerQuery] = useState('')
  const [borrowerFilter, setBorrowerFilter] = useState('Semua')
  const [filter, setFilter] = useState('Semua')
  const [listPage, setListPage] = useState(1)
  const [expandedId, setExpandedId] = useState('')
  const [showCreate, setShowCreate] = useState(false)
  const [manualForm, setManualForm] = useState(manualInitial)
  const [manualMessage, setManualMessage] = useState('')
  const [manualDocuments, setManualDocuments] = useState(emptyManualDocuments)
  const [manualDocumentChoice, setManualDocumentChoice] = useState('')
  const [paymentTarget, setPaymentTarget] = useState(null)
  const [paymentMethod, setPaymentMethod] = useState('')
  const [paymentProof, setPaymentProof] = useState(null)
  const [proofPreview, setProofPreview] = useState(null)
  const [decisionNote, setDecisionNote] = useState('')
  const isMarketing = user?.role === 'marketing'
  const isAnalis = user?.role === 'analis'
  const isAdmin = ['master', 'admin'].includes(user?.role)
  const view = params.get('view') || 'overview'
  const isDetail = view === 'detail'
  const isInstallmentDetail = view === 'angsuran-detail'
  const isStandaloneDetail = isDetail || isInstallmentDetail
  const goToView = (nextView, id = '', nextFilter = '') => setSearchParams(nextView ? {view: nextView, ...(id ? {id} : {}), ...(nextFilter ? {filter: nextFilter} : {}), ...(nextView === 'detail' ? {from: view} : {})} : {})
  const closeDetailView = () => {
    const targetView = isInstallmentDetail ? 'angsuran' : isDetail ? (params.get('from') || (isAnalis ? 'verifikasi' : 'peminjam')) : 'verifikasi'
    setExpandedId('')
    setSignaturePad(null)
    setDecisionNote('')
    setSearchParams(targetView ? {view: targetView, ...(targetView === 'verifikasi' && filter ? {filter} : {})} : {})
    window.scrollTo({top: 0, behavior: 'smooth'})
  }
  // Used immediately after a local UI action. The periodic server refresh below
  // replaces this short-lived cache with the saved server response.
  const refresh = () => setItems(readAll())
  const refreshRemote = () => request('/agent-credit/applications').then(remote => {
    if (!Array.isArray(remote)) return
    // Server data wins. This prevents stale browser cache from overwriting
    // signatures, documents, status and repayments from other users.
    setItems(remote.map(normalizeApplication))
  }).catch(() => setItems(readAll()))

  useEffect(() => {
    const sync = () => refreshRemote()
    window.addEventListener('storage', sync)
    window.addEventListener('kuotakita-credit-sync', sync)
    refreshRemote()
    const timer = window.setInterval(sync, 1500)
    return () => {
      window.removeEventListener('storage', sync)
      window.removeEventListener('kuotakita-credit-sync', sync)
      window.clearInterval(timer)
    }
  }, [])

  useEffect(() => {
    if (view === 'input') {
      setShowCreate(true)
      setFilter('Semua')
      setExpandedId('')
      setQuery('')
      window.scrollTo({top: 0, behavior: 'smooth'})
      return
    }
    if (view === 'agent-input') {
      setShowCreate(false)
      setFilter('Semua')
      setExpandedId('')
      setQuery('')
      window.scrollTo({top: 0, behavior: 'smooth'})
      return
    }
    if (view === 'verifikasi') {
      setShowCreate(false)
      setFilter(params.get('filter') || 'Review')
      setExpandedId(params.get('id') || '')
      setQuery('')
      window.scrollTo({top: 0, behavior: 'smooth'})
      return
    }
    if (view === 'detail') {
      setShowCreate(false)
      setFilter(params.get('filter') || 'Semua')
      setExpandedId(params.get('id') || '')
      setQuery('')
      window.scrollTo({top: 0, behavior: 'smooth'})
      return
    }
    if (view === 'angsuran-detail') {
      setShowCreate(false)
      setFilter('Disetujui')
      setExpandedId(params.get('id') || '')
      setQuery('')
      window.scrollTo({top: 0, behavior: 'smooth'})
      return
    }
    if (view === 'peminjam') {
      setShowCreate(false)
      setFilter('Semua')
      setExpandedId('')
      setQuery('')
      window.scrollTo({top: 0, behavior: 'smooth'})
      return
    }
    if (view === 'pembayaran' || view === 'angsuran' || view === 'pelunasan') {
      setShowCreate(false)
      setFilter('Disetujui')
      setExpandedId('')
      setQuery('')
      window.scrollTo({top: 0, behavior: 'smooth'})
      return
    }
    if (view === 'laporan') {
      setShowCreate(false)
      setFilter('Semua')
      setExpandedId('')
      setQuery('')
      window.scrollTo({top: 0, behavior: 'smooth'})
      return
    }
    if (view === 'panduan') {
      setShowCreate(false)
      setFilter('Semua')
      setExpandedId('')
      setQuery('')
      window.scrollTo({top: 0, behavior: 'smooth'})
      return
    }
    setShowCreate(false)
    setFilter('Semua')
    setExpandedId('')
    setQuery('')
    window.scrollTo({top: 0, behavior: 'smooth'})
  }, [view])
  const signAnalis = (item, image) => {
    saveApplication(item, {analisSignature: stampPayload({...user, role: 'analis'}, image), status: 'Menunggu keputusan analis'})
    refresh()
  }
  const decide = (item, status) => {
    if (isAnalis && (!item.analisSignature || (status === 'Ditolak' && !decisionNote.trim()))) return
    const profile = creditProfile(items, item)
    const amount = Number(item.form?.amount || 0)
    if (status === 'Disetujui' && (amount < 50000 || amount > profile.limit)) {
      setDecisionNote(`Nominal ${rupiah(amount)} melewati limit aktif ${rupiah(profile.limit)} untuk agent ini.`)
      return
    }
    const changes = {
      status,
      decidedAt: new Date().toISOString(),
      analysisDecision: {by: reviewerName(user), at: new Date().toISOString(), note: decisionNote.trim()},
    }
    if (status === 'Disetujui') Object.assign(changes, {
      creditLimit: profile.limit,
      creditTier: profile.name,
      paidCreditCycles: profile.paidCycles,
      creditOriginalAmount: amount,
      creditBalance: amount,
      creditOutstanding: amount,
      creditStatus: 'Aktif',
      paymentStatus: 'Menunggu pelunasan',
      repayments: [],
    })
    saveApplication(item, changes)
    setDecisionNote('')
    refresh()
  }
  const createManual = event => {
    event.preventDefault()
    if (!isMarketing && !isAdmin) return
    if (!manualForm.agentName.trim() || !manualForm.storeName.trim() || !manualForm.whatsapp.trim() || !manualForm.amount) {
      return setManualMessage('Lengkapi nama agent, toko, WA, dan nominal pinjaman dulu.')
    }
    if (coreDocumentTypes.some(doc => !manualDocuments[doc.key])) return setManualMessage('Lengkapi Foto KTP, Foto Toko, dan Selfie Pegang KTP dulu.')
    const amount = Math.min(500000, Math.max(50000, Number(String(manualForm.amount).replace(/\D/g, '') || 0)))
    const application = {
      id: `KSA-${Date.now().toString().slice(-8)}`,
      status: 'Menunggu analis',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      verifyUntil: Date.now(),
      source: 'marketing',
      userId: `manual-${Date.now()}`,
      userName: manualForm.agentName.trim(),
      paymentStatus: 'Belum ada pembayaran',
      creditLimit: 500000,
      creditBalance: 0,
      creditOutstanding: 0,
      creditOriginalAmount: 0,
      form: {...manualForm, amount},
      documents: Object.fromEntries(coreDocumentTypes.map(doc => [doc.key, {name: manualDocuments[doc.key].name, dataUrl: manualDocuments[doc.key].dataUrl || ''}])),
      repayments: [],
      createdBy: {role: user.role, name: reviewerName(user), at: new Date().toISOString()},
      forwardedAt: new Date().toISOString(),
    }
    const all = readAll()
    localStorage.setItem(allKey, JSON.stringify([application, ...all].slice(0, 50)))
    localStorage.setItem(userKey(application.userId), JSON.stringify([application]))
    request('/me/agent-credit', {method: 'POST', body: JSON.stringify(application)}).catch(() => {})
    setManualForm(manualInitial)
    setManualDocuments(emptyManualDocuments)
    setManualMessage('Pengajuan tersimpan dan langsung masuk ke antrean pemeriksaan operator.')
    setShowCreate(false)
    setExpandedId(application.id)
    refresh()
  }
  const chooseManualDocument = (key, event) => {
    const file = event.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) return setManualMessage('Dokumen harus berupa foto/gambar.')
    if (file.size > 8 * 1024 * 1024) return setManualMessage('Ukuran foto maksimal 8 MB.')
    const previewUrl = URL.createObjectURL(file)
    const image = new Image()
    image.onload = () => {
      const max = 1200
      const ratio = Math.min(1, max / Math.max(image.naturalWidth, image.naturalHeight))
      const canvas = document.createElement('canvas')
      canvas.width = Math.max(1, Math.round(image.naturalWidth * ratio))
      canvas.height = Math.max(1, Math.round(image.naturalHeight * ratio))
      canvas.getContext('2d').drawImage(image, 0, 0, canvas.width, canvas.height)
      const dataUrl = canvas.toDataURL('image/jpeg', .82)
      URL.revokeObjectURL(previewUrl)
      setManualDocuments(current => ({...current, [key]: {name: file.name, dataUrl}}))
      setManualMessage('')
    }
    image.onerror = () => { URL.revokeObjectURL(previewUrl); setManualDocuments(current => ({...current, [key]: {name: file.name}})); setManualMessage('') }
    image.src = previewUrl
  }
  const updateManual = event => setManualForm({...manualForm, [event.target.name]: event.target.name === 'amount' ? event.target.value.replace(/\D/g, '').slice(0, 8) : event.target.value})
  const markPayment = (item, row) => {
    if (row.paid || item.status !== 'Disetujui' || !paymentMethod || !paymentProof) return
    const repayments = [{key: row.key, applicationId: item.id, label: row.label, amount: row.amount, status: 'Lunas', paidAt: new Date().toISOString(), receivedBy: reviewerName(user), method: paymentMethod, paymentReference: row.key.toUpperCase(), proof: paymentProof}, ...(item.repayments || []).filter(pay => pay.key !== row.key)]
    const offlineCollection = paymentMethod === 'offline' ? {status: 'Lunas', collectedAt: new Date().toISOString(), collectedBy: reviewerName(user), amount: row.amount, proof: paymentProof} : item.offlineCollection
    saveApplication(item, {repayments, offlineCollection, paymentStatus: 'Lunas', creditStatus: 'Lunas', creditBalance: 0, creditOutstanding: 0, settledAt: new Date().toISOString()})
    refresh()
    setPaymentTarget(null)
    setPaymentMethod('')
    setPaymentProof(null)
  }
  const choosePaymentProof = async event => {
    const file = event.target.files?.[0]
    if (!file) return
    const dataUrl = file.type.startsWith('image/') ? await compressDocumentPreview(file) : ''
    setPaymentProof({name: file.name, type: file.type, dataUrl})
    event.target.value = ''
  }
  const replaceBorrowerDocument = async (item, key, event) => {
    const file = event.target.files?.[0]
    if (!file || !file.type.startsWith('image/')) return
    const dataUrl = await compressDocumentPreview(file)
    if (!dataUrl) return
    const documents = {...(item.documents || {}), [key]: {name: file.name, dataUrl}}
    const meeting = key === 'selfieMarketing' ? {at: new Date().toISOString(), by: reviewerName(user), selfieName: file.name} : item.marketingMeeting
    saveApplication(item, {documents, marketingMeeting: meeting, status: normalizeCreditStatus(item.status), forwardedAt: item.forwardedAt || new Date().toISOString()})
    refresh()
  }
  const openSignature = (item, role) => {
    setSignaturePad({item, role})
    setSignatureDrawn(false)
    setTimeout(clearSignaturePad, 20)
  }
  const closeSignature = () => {
    setSignaturePad(null)
    setSignatureDrawn(false)
  }
  const point = event => {
    const canvas = canvasRef.current
    const rect = canvas.getBoundingClientRect()
    return {
      x: (event.clientX - rect.left) * (canvas.width / rect.width),
      y: (event.clientY - rect.top) * (canvas.height / rect.height),
    }
  }
  const startSignature = event => {
    event.preventDefault()
    event.currentTarget.setPointerCapture?.(event.pointerId)
    drawing.current = true
    const ctx = canvasRef.current.getContext('2d')
    const {x, y} = point(event)
    ctx.beginPath()
    ctx.moveTo(x, y)
  }
  const moveSignature = event => {
    if (!drawing.current) return
    event.preventDefault()
    const ctx = canvasRef.current.getContext('2d')
    const {x, y} = point(event)
    ctx.lineWidth = 3
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    ctx.strokeStyle = '#21156d'
    ctx.lineTo(x, y)
    ctx.stroke()
    setSignatureDrawn(true)
  }
  const stopSignature = event => {
    event?.currentTarget?.releasePointerCapture?.(event.pointerId)
    drawing.current = false
  }
  const clearSignaturePad = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    setSignatureDrawn(false)
  }
  const saveSignature = () => {
    if (!signaturePad || !signatureDrawn) return
    const image = canvasRef.current.toDataURL('image/png')
    if (signaturePad.role === 'analis') signAnalis(signaturePad.item, image)
    closeSignature()
  }
  const sortedItems = [...items].sort((a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt))
  const visibleItems = sortedItems.filter(item => {
    const matchDetail = !isStandaloneDetail || item.id === params.get('id')
    const text = `${item.id} ${item.form.agentName} ${item.userName} ${item.form.storeName} ${item.form.whatsapp} ${item.form.nik}`.toLowerCase()
    const matchQuery = text.includes(query.toLowerCase().trim())
    const group = statusGroup(item)
    const matchFilter = view === 'angsuran' || view === 'pembayaran' ? ['Disetujui', 'Lunas'].includes(group) : filter === 'Semua' || group === filter
    const analystArchiveFilter = ['Ditolak', 'Disetujui', 'Lunas'].includes(filter)
    const matchRoleQueue = !isAnalis || isStandaloneDetail || (analystArchiveFilter ? group === filter : ['Menunggu analis', 'Menunggu keputusan analis'].includes(item.status))
    return matchDetail && matchQuery && matchFilter && matchRoleQueue
  })
  const listPageSize = 20
  const listPageCount = Math.max(1, Math.ceil(visibleItems.length / listPageSize))
  const safeListPage = Math.min(listPage, listPageCount)
  const listStart = (safeListPage - 1) * listPageSize
  const pagedItems = isStandaloneDetail ? visibleItems : visibleItems.slice(listStart, listStart + listPageSize)
  const summary = {
    total: items.length,
    review: items.filter(item => statusGroup(item) === 'Review').length,
    approved: items.filter(item => statusGroup(item) === 'Disetujui').length,
    paid: items.filter(item => statusGroup(item) === 'Lunas').length,
  }
  const marketingQueue = sortedItems.filter(item => ['Menunggu analis', 'Menunggu keputusan analis'].includes(item.status))
  const meetingQueue = marketingQueue.filter(item => !marketingReadiness(item).meetingReady)
  const marketingReadyForAnalysis = marketingQueue.filter(item => marketingReadiness(item).readyForAnalysis)
  const offlineCollectionQueue = sortedItems.filter(item => item.status === 'Disetujui' && item.paymentStatus === 'Menunggu penagihan offline')
  const analystQueue = sortedItems.filter(item => ['Menunggu analis', 'Menunggu keputusan analis'].includes(item.status))
  const analystPendingSignature = analystQueue.filter(item => !item.analisSignature)
  const analystReadyToDecide = analystQueue.filter(item => Boolean(item.analisSignature))
  const analystDecidedToday = sortedItems.filter(item => finalStatus.includes(item.status) && new Date(item.decidedAt || 0).toDateString() === new Date().toDateString())
  const analystApprovedActive = sortedItems.filter(item => item.status === 'Disetujui' && item.paymentStatus !== 'Lunas')
  const approvedActive = sortedItems.filter(item => item.status === 'Disetujui' && item.paymentStatus !== 'Lunas')
  const borrowerRows = sortedItems.map(item => ({item, pay: paymentSummary(item), next: firstUnpaidRow(item), score: dataScore(item)}))
  const approvedBorrowerRows = borrowerRows.filter(({item}) => ['Disetujui', 'Lunas'].includes(statusGroup(item)))
  const directoryRows = approvedBorrowerRows.filter(({item}) => {
    const text = `${item.form.agentName || item.userName} ${item.form.storeName} ${item.form.whatsapp} ${item.id}`.toLowerCase()
    return text.includes(borrowerQuery.toLowerCase().trim()) && (borrowerFilter === 'Semua' || statusGroup(item) === borrowerFilter)
  })
  const directoryGroups = Object.values(directoryRows.reduce((groups, row) => {
    const key = row.item.userId || row.item.userName || row.item.form.agentName || 'agent-tanpa-nama'
    if (!groups[key]) groups[key] = {key, agent: row.item.userName || row.item.form.agentName || 'Agent KuotaKita', rows: []}
    groups[key].rows.push(row)
    return groups
  }, {}))
  const installmentRows = borrowerRows.filter(row => row.item.status === 'Disetujui' || row.item.paymentStatus === 'Lunas')
  const installmentActive = installmentRows.filter(({item}) => item.paymentStatus !== 'Lunas')
  const installmentFinished = installmentRows.filter(({item}) => item.paymentStatus === 'Lunas')
  const paidProofRows = installmentFinished.map(({item, pay}) => {
    const payment = (item.repayments || []).find(row => row.status === 'Lunas') || {}
    return {item, pay, payment, proof: payment.proof || item.offlineCollection?.proof || null}
  }).sort((a, b) => new Date(b.payment.paidAt || b.item.settledAt || 0) - new Date(a.payment.paidAt || a.item.settledAt || 0))
  const installmentPaidAmount = installmentRows.reduce((sum, {pay}) => sum + pay.totalPaid, 0)
  const installmentRemainingAmount = installmentRows.reduce((sum, {item, pay}) => sum + Math.max(0, Number(item.creditOriginalAmount || item.form.amount || 0) - pay.totalPaid), 0)
  const marketingCards = [
    {title: 'Perlu Pendampingan', value: meetingQueue.length, note: 'Selfie bersama agent belum ada', icon: Camera},
    {title: 'Siap Diperiksa Operator', value: marketingReadyForAnalysis.length, note: 'Data dan pertemuan sudah lengkap', icon: ClipboardCheck},
    {title: 'Tagihan Offline', value: offlineCollectionQueue.length, note: 'Perlu dikunjungi marketing', icon: HandCoins},
    {title: 'Kredit Aktif', value: approvedActive.length, note: 'Sudah diterima, belum lunas', icon: Banknote},
  ]
  const activeView = viewInfo[view] || viewInfo.overview
  const isRejectedArchive = isAnalis && view === 'verifikasi' && filter === 'Ditolak'
  const rejectedItems = sortedItems.filter(item => statusGroup(item) === 'Ditolak')
  const totalLoan = items.reduce((sum, item) => sum + Number(item.form.amount || 0), 0)
  const totalPaidAmount = items.reduce((sum, item) => sum + paymentSummary(item).totalPaid, 0)
  const remainingLoan = Math.max(0, totalLoan - totalPaidAmount)
  const recentManual = sortedItems.filter(item => item.source === 'marketing').slice(0, 5)
  const paymentToday = approvedActive.filter(item => Boolean(firstUnpaidRow(item)))
  const showCreateArea = (isMarketing || isAdmin) && view === 'input'
  // Setiap menu punya satu tujuan: daftar detail hanya muncul di Antrean Verifikasi.
  // Ringkasan, Direktori Peminjam, dan Angsuran memakai panel khusus masing-masing.
  const showMainList = view === 'verifikasi' || isStandaloneDetail
  const exportReport = () => {
    const header = ['ID', 'Agent', 'Toko', 'WA', 'Status', 'Nominal', 'Terbayar', 'Sisa']
    const rows = sortedItems.map(item => {
      const pay = paymentSummary(item)
      return [item.id, item.form.agentName || item.userName || '', item.form.storeName || '', item.form.whatsapp || '', item.status, item.form.amount || 0, pay.totalPaid, Math.max(0, Number(item.form.amount || 0) - pay.totalPaid)]
    })
    const csv = [header, ...rows].map(row => row.map(value => `"${String(value).replaceAll('"', '""')}"`).join(',')).join('\n')
    const blob = new Blob([csv], {type: 'text/csv;charset=utf-8'})
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `laporan-kredit-kuotakita-${new Date().toISOString().slice(0, 10)}.csv`
    link.click()
    URL.revokeObjectURL(link.href)
  }

  return <>
    {!isStandaloneDetail && view === 'overview' && <PageHeader eyebrow={isAnalis ? 'OPERATOR KREDIT' : 'MARKETING KREDIT'} title={isAnalis ? 'Keputusan Akhir Kredit Agent' : 'Pendampingan Kredit Agent'} description={isAnalis ? 'Operator memeriksa seluruh data, menandatangani, lalu memberi keputusan akhir.' : 'Marketing mendaftarkan agent, membimbing pengajuan, mengambil selfie pertemuan, dan menangani pelunasan offline.'}/>}
    <section className={`panel credit-review-panel ${isStandaloneDetail ? 'detail-mode' : ''} ${(isMarketing || isAdmin) ? 'marketing-review' : ''} ${isAnalis ? 'analyst-review' : ''}`}>
      {view === 'overview' && <div className="credit-review-hero">
        <div>
          <span>{isAnalis ? 'RUANG KEPUTUSAN OPERATOR' : 'RUANG DATA PEMINJAM'}</span>
          <h2>{isAnalis ? 'Kontrol Keputusan Kredit' : 'Monitoring Kredit Agent'}</h2>
          <p>{isAnalis ? 'Fokus hanya pada pengajuan yang sudah diverifikasi Marketing. Operator mengecek kelayakan, tanda tangan, lalu menerima atau menolak.' : 'Semua pengajuan tersusun rapi dari yang terbaru. Marketing, operator, dan admin bisa cek data agent, tanda tangan, keputusan, sampai pembayaran.'}</p>
        </div>
        <i><WalletCards/></i>
      </div>}
      {view === 'overview' && <div className="credit-review-stats">
        <article><span>Total Peminjam</span><strong>{summary.total}</strong><small>Seluruh pengajuan</small></article>
        <article><span>Butuh Review</span><strong>{summary.review}</strong><small>Menunggu keputusan</small></article>
        <article><span>Sudah Diterima</span><strong>{summary.approved}</strong><small>Aktif dipantau</small></article>
        <article><span>Lunas</span><strong>{summary.paid}</strong><small>Pembayaran selesai</small></article>
      </div>}
      {view !== 'overview' && <section className={`credit-mode-panel view-${view}`}>
        <span>{activeView.label}</span>
        <h2>{activeView.title}</h2>
        <p>{activeView.desc}</p>
      </section>}
      {(isMarketing || isAdmin) && view === 'agent-input' && <AgentAccountForm onClose={() => goToView('overview')}/>}
      {(isMarketing || isAdmin) && view === 'overview' && <section className="marketing-workspace">
        <header>
          <div><span>MEJA KERJA MARKETING</span><h2>Kerjakan yang paling penting</h2><p>Daftarkan agent, bantu pengajuan, ambil selfie pertemuan, lalu pantau pelunasan. Keputusan kredit tetap dilakukan Operator.</p></div>
        </header>
        <div className="marketing-task-grid">
          {marketingCards.map(({title, value, note, icon: Icon}) => <article key={title}><i><Icon/></i><span>{title}</span><strong>{value}</strong><small>{note}</small></article>)}
        </div>
        <div className="marketing-quick-actions" aria-label="Aksi cepat marketing">
          <button type="button" className="primary" onClick={() => goToView('agent-input')}><UserPlus/><span><b>Daftar agent baru</b><small>Buat akun login agent resmi</small></span><strong>→</strong></button>
          <button type="button" onClick={() => meetingQueue[0] ? goToView('detail', meetingQueue[0].id, 'Review') : goToView('verifikasi')}><Camera/><span><b>Pertemuan &amp; selfie</b><small>{meetingQueue.length ? `${meetingQueue.length} agent perlu didampingi` : 'Tidak ada pertemuan tertunda'}</small></span><strong>→</strong></button>
          <button type="button" onClick={() => offlineCollectionQueue[0] ? goToView('angsuran-detail', offlineCollectionQueue[0].id, 'Disetujui') : goToView('angsuran')}><HandCoins/><span><b>Pelunasan offline</b><small>{offlineCollectionQueue.length ? `${offlineCollectionQueue.length} agent perlu dikunjungi` : 'Tidak ada penagihan tertunda'}</small></span><strong>→</strong></button>
          <button type="button" onClick={() => goToView('peminjam')}><Banknote/><span><b>Kredit aktif</b><small>{paymentToday.length ? `${paymentToday.length} kredit menunggu lunas` : 'Tidak ada kredit aktif'}</small></span><strong>→</strong></button>
        </div>
        <div className="marketing-section-label focus-label"><span>PEKERJAAN TERDEKAT</span><small>Daftar yang membutuhkan perhatian lebih dulu</small></div>
        <div className="marketing-focus-grid">
          <div>
            <h3>Perlu selfie pertemuan</h3>
            {meetingQueue.slice(0, 4).length ? meetingQueue.slice(0, 4).map(item => <button type="button" key={item.id} onClick={() => goToView('detail', item.id, 'Review')}>
              <span><b>{item.form.agentName || item.userName}</b><small>{item.form.storeName || item.id}</small></span>
              <strong>{rupiah(item.form.amount)}</strong>
            </button>) : <p>Tidak ada agent yang menunggu pertemuan.</p>}
          </div>
          <div>
            <h3>Siap diperiksa Operator</h3>
            {marketingReadyForAnalysis.slice(0, 4).length ? marketingReadyForAnalysis.slice(0, 4).map(item => <button type="button" key={item.id} onClick={() => goToView('detail', item.id, 'Review')}>
              <span><b>{item.form.agentName || item.userName}</b><small>Data dan selfie pertemuan lengkap</small></span>
              <strong>{rupiah(item.form.amount)}</strong>
            </button>) : <p>Belum ada berkas pendampingan yang lengkap.</p>}
          </div>
        </div>
      </section>}
      {(isAnalis || isAdmin) && view === 'overview' && <section className="marketing-workspace analyst-workspace">
        <header>
          <div><span>MEJA KEPUTUSAN OPERATOR</span><h2>Kontrol Kelayakan &amp; Keputusan Akhir</h2><p>Semua pengajuan masuk ke Operator. Periksa identitas, dokumen inti, selfie pertemuan marketing, persetujuan ketentuan, tanda tangan agent, dan nominal sebelum menerima atau menolak.</p></div>
        </header>
        <div className="marketing-task-grid">
          <article><i><ClipboardCheck/></i><span>Berkas Masuk</span><strong>{analystQueue.length}</strong><small>Menunggu pemeriksaan akhir</small></article>
          <article><i><PenLine/></i><span>Perlu TTD Operator</span><strong>{analystPendingSignature.length}</strong><small>Cek kelayakan sebelum tanda tangan</small></article>
          <article><i><Stamp/></i><span>Siap Keputusan</span><strong>{analystReadyToDecide.length}</strong><small>TTD operator sudah tersimpan</small></article>
          <article><i><CheckCircle2/></i><span>Diterima Aktif</span><strong>{analystApprovedActive.length}</strong><small>Menunggu pelunasan</small></article>
        </div>
        <div className="marketing-quick-actions" aria-label="Aksi cepat operator">
          <button type="button" className="primary" onClick={() => goToView('verifikasi')}><ClipboardCheck/><span><b>Buka antrean operator</b><small>{analystQueue.length ? `${analystQueue.length} berkas siap diperiksa` : 'Tidak ada berkas baru'}</small></span><strong>→</strong></button>
          <button type="button" onClick={() => goToView('laporan')}><BarChart3/><span><b>Lihat rekap keputusan</b><small>Riwayat kredit dan keputusan</small></span><strong>→</strong></button>
        </div>
        <div className="marketing-section-label focus-label"><span>BERKAS PRIORITAS</span><small>Periksa kelayakan dan kelengkapan sebelum memberi keputusan</small></div>
        <div className="marketing-focus-grid">
          <div><h3>Menunggu tanda tangan operator</h3>{analystQueue.filter(item => !item.analisSignature).slice(0, 4).map(item => <button type="button" key={item.id} onClick={() => goToView('verifikasi', item.id, 'Review')}><span><b>{item.form.agentName || item.userName}</b><small>{item.form.storeName || item.id}</small></span><strong>{rupiah(item.form.amount)}</strong></button>)}{!analystQueue.some(item => !item.analisSignature) && <p>Tidak ada berkas yang menunggu tanda tangan operator.</p>}</div>
          <div><h3>Siap diberi keputusan</h3>{analystReadyToDecide.slice(0, 4).map(item => <button type="button" key={item.id} onClick={() => goToView('verifikasi', item.id, 'Review')}><span><b>{item.form.agentName || item.userName}</b><small>TTD operator sudah tersimpan</small></span><strong>{rupiah(item.form.amount)}</strong></button>)}{!analystReadyToDecide.length && <p>Belum ada berkas yang siap diberi keputusan.</p>}</div>
        </div>
      </section>}
      {(isMarketing || isAnalis || isAdmin) && view === 'verifikasi' && <section className="marketing-action-panel">
        <header>{isRejectedArchive ? <XCircle/> : <ClipboardCheck/>}<div><span>{isRejectedArchive ? 'ARSIP PENOLAKAN' : isAnalis ? 'FOKUS OPERATOR' : 'FOKUS PENDAMPINGAN'}</span><h2>{isRejectedArchive ? `${rejectedItems.length} keputusan ditolak` : `${isAnalis ? analystQueue.length : marketingQueue.length} pengajuan perlu ditangani`}</h2><p>{isRejectedArchive ? 'Buka detail untuk membaca alasan keputusan dan jejak pemeriksaan operator. Data di halaman ini hanya arsip, bukan antrean aktif.' : isAnalis ? 'Cek nominal, batas kredit, data, dokumen, selfie pertemuan, ketentuan, dan tanda tangan agent. Setelah lengkap, tanda tangani lalu terima atau tolak.' : 'Buka detail pengajuan untuk membantu melengkapi data dan mengambil selfie bersama agent. Keputusan akhir dilakukan Operator.'}</p></div></header>
      </section>}
      {(isMarketing || isAnalis || isAdmin) && view === 'peminjam' && <section className="borrower-directory-panel">
        <header><div><span>DIREKTORI PEMINJAM</span><h2>Data peminjam diterima</h2><p>Hanya pengajuan yang sudah diterima dan sedang berjalan atau lunas. Data review dan ditolak tidak ditampilkan di sini.</p></div><strong className="directory-total">{approvedBorrowerRows.length}<small>Data diterima</small></strong></header>
        <div className="directory-stats">
          <article><b>{approvedBorrowerRows.length}</b><span>Total Diterima</span></article><article><b>{summary.approved}</b><span>Aktif dipantau</span></article><article><b>{summary.paid}</b><span>Sudah lunas</span></article><article><b>{approvedBorrowerRows.filter(row => row.score.percent < 100).length}</b><span>Data perlu dilengkapi</span></article>
        </div>
        <div className="directory-tools"><label><Search/><input value={borrowerQuery} onChange={event => setBorrowerQuery(event.target.value)} placeholder="Cari nama, toko, WA, atau ID..."/></label><div>{['Semua', 'Disetujui', 'Lunas'].map(name => <button type="button" className={borrowerFilter === name ? 'active' : ''} onClick={() => setBorrowerFilter(name)} key={name}>{name}</button>)}</div></div>
        <div className="directory-agent-list">
          {directoryGroups.length ? directoryGroups.map(group => <details className="directory-agent" key={group.key}>
            <summary><span><b>{group.agent}</b><small>{group.rows.length} peminjam diterima</small></span><strong>{rupiah(group.rows.reduce((sum, row) => sum + Number(row.item.form.amount || 0), 0))}</strong></summary>
            <div className="directory-agent-borrowers">{group.rows.map(({item, pay, score}) => <article key={item.id}><span><b>{item.form.storeName || item.form.agentName || item.id}</b><small>{item.id} · {statusGroup(item) === 'Lunas' ? 'Lunas' : 'Saldo kredit aktif'}</small></span><em><i style={{width: `${score.percent}%`}}/></em><strong>{pay.paid ? 'Lunas' : 'Belum lunas'}</strong><small>{rupiah(item.creditOutstanding || item.form.amount)}</small><button type="button" onClick={() => goToView('detail', item.id, 'Semua')}><Eye/>Cek data</button></article>)}</div>
          </details>) : <p>Data peminjam diterima belum ada.</p>}
        </div>
        <div className="directory-list">
          {directoryRows.length ? directoryRows.map(({item, pay, score}) => <button type="button" key={item.id} onClick={() => goToView('detail', item.id, 'Semua')}>
            <span><b>{item.form.agentName || item.userName}</b><small>{item.form.storeName || item.id} · {item.status}</small></span>
            <em><i style={{width: `${score.percent}%`}}/></em>
            <strong>{pay.paid ? 'Lunas' : 'Belum lunas'}</strong>
            <small>{rupiah(item.form.amount)}</small>
          </button>) : <p>Data peminjam tidak ditemukan.</p>}
        </div>
      </section>}
      {(isMarketing || isAnalis || isAdmin) && (view === 'pembayaran' || view === 'angsuran') && <section className="marketing-action-panel payment">
        <header><Banknote/><div><span>MONITOR SALDO KREDIT</span><h2>Pelunasan Kredit Agent</h2><p>Setiap kredit dibayar satu kali penuh. Buka data untuk melihat nominal, Bank/QRIS, dan bukti transfer.</p></div></header>
        <div className="payment-overview-stats"><article><small>Kredit aktif</small><strong>{installmentActive.length}</strong><span>Menunggu pelunasan</span></article><article><small>Sudah lunas</small><strong>{installmentFinished.length}</strong><span>Pembayaran selesai</span></article><article><small>Total dilunasi</small><strong>{rupiah(installmentPaidAmount)}</strong><span>Pembayaran tercatat</span></article><article><small>Saldo tertagih</small><strong>{rupiah(installmentRemainingAmount)}</strong><span>Perlu dipantau</span></article></div>
        <div className="quick-payment-list">
          {installmentRows.slice(0, 8).map(({item, pay, next}) => {
            return <button type="button" key={item.id} onClick={() => goToView('angsuran-detail', item.id, 'Disetujui')}>
              <span><b>{item.form.agentName || item.userName}</b><small>{pay.paid ? 'Sudah lunas' : 'Menunggu pelunasan penuh'}</small></span>
              <strong>{next ? rupiah(next.amount) : 'Lunas'}</strong>
            </button>
          })}
          {!installmentRows.length && <p>Belum ada kredit diterima yang perlu dipantau.</p>}
        </div>
      </section>}
      {(isAnalis || isAdmin) && view === 'pelunasan' && <section className="analyst-payment-proof-panel">
        <header className="payment-proof-heading">
          <i><FileCheck2/></i>
          <div><span>ARSIP PELUNASAN</span><h2>Bukti pembayaran kredit agent</h2><p>Setiap pelunasan tersusun dari yang terbaru. Operator dapat melihat nominal, jalur pembayaran, penerima, referensi, dan bukti transfer tanpa bercampur dengan antrean aktif.</p></div>
        </header>
        <div className="payment-proof-summary">
          <article><small>Kredit lunas</small><strong>{paidProofRows.length}</strong><span>Pembayaran selesai</span></article>
          <article><small>Total diterima</small><strong>{rupiah(paidProofRows.reduce((sum, row) => sum + Number(row.payment.amount || row.pay.totalPaid || 0), 0))}</strong><span>Nominal terverifikasi</span></article>
          <article><small>Bukti tersedia</small><strong>{paidProofRows.filter(row => row.proof?.dataUrl).length}</strong><span>File dapat diperiksa</span></article>
        </div>
        <div className="payment-proof-list">
          {paidProofRows.length ? paidProofRows.map(({item, payment, proof}) => <article key={item.id} className="payment-proof-card">
            <div className="payment-proof-identity"><i><CheckCircle2/></i><span><b>{item.form.agentName || item.userName}</b><small>{item.form.storeName || item.id} · {item.id}</small></span><em>LUNAS</em></div>
            <dl>
              <div><dt>Nominal</dt><dd>{rupiah(payment.amount || item.creditOriginalAmount || item.form.amount)}</dd></div>
              <div><dt>Metode</dt><dd>{payment.method === 'bank' ? 'Transfer Bank' : payment.method === 'qris' ? 'QRIS' : payment.method === 'offline' ? 'Penagihan Offline' : 'Pembayaran'}</dd></div>
              <div><dt>Waktu</dt><dd>{dateTime(payment.paidAt || item.settledAt)}</dd></div>
              <div><dt>Diterima oleh</dt><dd>{payment.receivedBy || item.offlineCollection?.collectedBy || 'Sistem KuotaKita'}</dd></div>
              <div><dt>Referensi</dt><dd>{payment.paymentReference || payment.key || item.id}</dd></div>
            </dl>
            {proof?.dataUrl ? <button type="button" className="payment-proof-file" onClick={() => setProofPreview({source: proof.dataUrl, name: proof.name || `Bukti ${item.id}`, item})}><img src={proof.dataUrl} alt={`Bukti pembayaran ${item.id}`}/><span><b>Lihat bukti pembayaran</b><small>{proof.name || 'Foto bukti transfer'}</small></span><Eye/></button> : <div className="payment-proof-empty"><Images/><span><b>Bukti gambar tidak tersedia</b><small>{proof?.name || 'Data lama belum menyimpan pratinjau file'}</small></span></div>}
          </article>) : <div className="payment-proof-zero"><FileCheck2/><b>Belum ada kredit yang lunas</b><span>Bukti pembayaran akan otomatis masuk ke sini setelah pelunasan dikonfirmasi.</span></div>}
        </div>
      </section>}
      {(isMarketing || isAnalis || isAdmin) && view === 'laporan' && <>
        <section className="marketing-report-panel">
          <article><span>Total Pinjaman</span><strong>{rupiah(totalLoan)}</strong><small>Akumulasi nominal pengajuan</small></article>
          <article><span>Pembayaran Masuk</span><strong>{rupiah(totalPaidAmount)}</strong><small>Pelunasan yang sudah dicatat</small></article>
          <article><span>Sisa Tagihan</span><strong>{rupiah(remainingLoan)}</strong><small>Estimasi belum dibayar</small></article>
          <article><span>Rasio Lunas</span><strong>{items.length ? Math.round((summary.paid / items.length) * 100) : 0}%</strong><small>Dari seluruh peminjam</small></article>
        </section>
        <section className="marketing-report-table">
          <header><div><span>LAPORAN DETAIL</span><h2>Rekap peminjam & pembayaran</h2><p>{isAnalis ? 'Gunakan rekap ini untuk memantau keputusan akhir dan kesehatan kredit yang sudah berjalan.' : 'Data ini berguna buat kontrol tagihan, lihat sisa pembayaran, dan arsip kerja marketing.'}</p></div><button type="button" onClick={exportReport}><Banknote/>Export CSV</button></header>
          <div>{sortedItems.length ? sortedItems.map(item => {
            const pay = paymentSummary(item)
            return <article key={item.id}>
              <span><b>{item.form.agentName || item.userName}</b><small>{item.id} · {item.form.storeName || 'Tanpa toko'}</small></span>
              <strong>{rupiah(item.form.amount)}</strong>
              <em>{item.status}</em>
              <i><small>Terbayar</small>{rupiah(pay.totalPaid)}</i>
              <i><small>Sisa</small>{rupiah(Math.max(0, Number(item.form.amount || 0) - pay.totalPaid))}</i>
            </article>
          }) : <p>Belum ada data laporan kredit.</p>}</div>
        </section>
      </>}
      {(isMarketing || isAdmin) && view === 'panduan' && <section className="marketing-guide-panel">
        <header><CircleHelp/><div><span>PANDUAN MARKETING</span><h2>Alur kerja yang benar</h2></div></header>
        <ol>
          <li><b>Input peminjaman</b><small>Masukkan data agent jika pengajuan dilakukan lewat marketing.</small></li>
          <li><b>Dampingi pengajuan</b><small>Cek WA, NIK, alamat toko, kontak keluarga, dan bantu agent memahami proses kredit.</small></li>
          <li><b>Selfie pertemuan</b><small>Ambil bukti selfie bersama agent. Berkas otomatis tersedia untuk pemeriksaan Operator.</small></li>
          <li><b>Catat pelunasan</b><small>Untuk online, periksa bukti Bank/QRIS. Untuk offline, datang menagih dan unggah bukti penerimaan penuh.</small></li>
        </ol>
      </section>}
      {showMainList && <div className="panel-header">
        <div><h2>{isRejectedArchive ? 'Riwayat Pengajuan Ditolak' : isAnalis ? 'Berkas Siap Diperiksa' : 'Pengajuan Masuk'}</h2><p>{isRejectedArchive ? 'Setiap keputusan menyimpan alasan penolakan agar mudah ditinjau kembali dan dijelaskan kepada agent.' : isMarketing ? 'Tugas marketing: daftarkan dan dampingi agent, lengkapi selfie pertemuan, serta tangani penagihan offline.' : isAnalis ? 'Tugas operator: cek seluruh data, tanda tangan, lalu terima atau tolak.' : 'Pantau seluruh alur pengajuan kredit agent dari satu panel.'}</p></div>
        <span className="review-role-badge">{isMarketing ? 'MARKETING' : isAnalis ? 'OPERATOR' : 'ADMIN'}</span>
      </div>}
      {showCreateArea && <section className={`credit-create-box ${view === 'input' ? 'focus' : ''}`}>
        <button type="button" className="credit-create-toggle" onClick={() => setShowCreate(value => !value)}><PlusCircle/>{showCreate ? 'Tutup Form Peminjaman' : 'Input Peminjaman'}</button>
        {manualMessage && <p>{manualMessage}</p>}
        {showCreate && <form onSubmit={createManual}>
          <label>Nama Agent<input name="agentName" value={manualForm.agentName} onChange={updateManual} placeholder="Nama peminjam"/></label>
          <label>Nama Toko<input name="storeName" value={manualForm.storeName} onChange={updateManual} placeholder="Nama toko/usaha"/></label>
          <label>NIK<input name="nik" value={manualForm.nik} onChange={updateManual} inputMode="numeric" maxLength="16" placeholder="16 digit NIK"/></label>
          <label>Nomor WA<input name="whatsapp" value={manualForm.whatsapp} onChange={updateManual} inputMode="tel" placeholder="08xxxxxxxxxx"/></label>
          <label>Email<input name="email" value={manualForm.email} onChange={updateManual} type="email" placeholder="Opsional"/></label>
          <label>Transaksi/Bulan<input name="monthlyTransactions" value={manualForm.monthlyTransactions} onChange={updateManual} inputMode="numeric" placeholder="Contoh: 150"/></label>
          <label>Nominal Pinjaman<input name="amount" value={manualForm.amount} onChange={updateManual} inputMode="numeric" placeholder="500000"/></label>
          <label>Kontak Keluarga<input name="familyName" value={manualForm.familyName} onChange={updateManual} placeholder="Nama keluarga"/></label>
          <label>Hubungan<input name="familyRelation" value={manualForm.familyRelation} onChange={updateManual} placeholder="Orang tua / saudara"/></label>
          <label>WA Keluarga<input name="familyWhatsapp" value={manualForm.familyWhatsapp} onChange={updateManual} inputMode="tel" placeholder="08xxxxxxxxxx"/></label>
          <label className="wide">Alamat Rumah<textarea name="homeAddress" value={manualForm.homeAddress} onChange={updateManual} placeholder="Alamat rumah"/></label>
          <label className="wide">Alamat Toko<textarea name="storeAddress" value={manualForm.storeAddress} onChange={updateManual} placeholder="Alamat toko/usaha"/></label>
          <fieldset className="marketing-document-upload wide"><legend>Dokumen Peminjam</legend><p>Klik kartu untuk mengambil foto dari kamera atau mengunggah file. Pastikan foto jelas dan tidak terpotong.</p><div>{coreDocumentTypes.map(doc => <article role="button" tabIndex="0" key={doc.key} className={manualDocuments[doc.key] ? 'uploaded' : ''} onClick={() => setManualDocumentChoice(doc.key)} onKeyDown={event => event.key === 'Enter' && setManualDocumentChoice(doc.key)}><i>{manualDocuments[doc.key] ? <CheckCircle2/> : <Camera/>}</i><span><b>{doc.label}</b><small>{manualDocuments[doc.key]?.name || doc.hint}</small></span><strong>{manualDocuments[doc.key] ? 'Siap dicek' : 'Klik untuk memilih'}</strong></article>)}</div></fieldset>
          <button type="submit"><PlusCircle/>Simpan Peminjam</button>
        </form>}
      </section>}
      {showCreate && manualDocumentChoice && <section className="marketing-document-choice" onMouseDown={event => event.target === event.currentTarget && setManualDocumentChoice('')}><div><header><div><span>UPLOAD DOKUMEN</span><h3>{manualDocumentTypes.find(doc => doc.key === manualDocumentChoice)?.label}</h3><p>Pilih cara pengambilan dokumen.</p></div><button type="button" onClick={() => setManualDocumentChoice('')}><X/></button></header><div className="marketing-document-choice-actions"><label><Camera/><b>Ambil dari Kamera</b><small>Gunakan kamera perangkat</small><input type="file" accept="image/*" capture="environment" onChange={event => {chooseManualDocument(manualDocumentChoice, event); setManualDocumentChoice('')}}/></label><label><Images/><b>Unggah File</b><small>Pilih foto dari perangkat</small><input type="file" accept="image/*" onChange={event => {chooseManualDocument(manualDocumentChoice, event); setManualDocumentChoice('')}}/></label></div></div></section>}
      {(isMarketing || isAdmin) && view === 'input' && <section className="marketing-input-history">
        <header><ClipboardCheck/><div><span>RIWAYAT INPUT MARKETING</span><h2>Data yang baru ditambahkan</h2><p>Supaya marketing bisa cepat cek ulang data input peminjaman tanpa masuk daftar besar.</p></div></header>
        <div>{recentManual.length ? recentManual.map(item => <button type="button" key={item.id} onClick={() => goToView('verifikasi', item.id, 'Review')}>
          <span><b>{item.form.agentName || item.userName}</b><small>{item.form.storeName || item.id} · {dateTime(item.createdAt)}</small></span>
          <strong>{rupiah(item.form.amount)}</strong>
        </button>) : <p>Belum ada input peminjaman dari marketing.</p>}</div>
      </section>}
      {showMainList && <>{view === 'verifikasi' && <div className="credit-review-tools">
        <label><Search/><input value={query} onChange={event => {setQuery(event.target.value); setListPage(1)}} placeholder="Cari nama agent, toko, WA, NIK, atau ID pengajuan"/></label>
        <div><Filter/>{filters.map(name => <button type="button" className={filter === name ? 'active' : ''} onClick={() => {setFilter(name); setListPage(1)}} key={name}>{name}</button>)}</div>
      </div>}
      {items.length === 0 ? <div className="credit-review-empty"><ShieldCheck/><strong>Belum ada pengajuan</strong><span>Pengajuan kredit saldo dari aplikasi agent akan tampil di sini.</span></div> : visibleItems.length === 0 ? <div className="credit-review-empty"><Search/><strong>Data tidak ditemukan</strong><span>Coba ubah kata pencarian atau filter status.</span></div> : <div className="credit-review-list">
        {pagedItems.map(item => {
          const done = finalStatus.includes(item.status)
          const analisSigned = Boolean(item.analisSignature)
          const pay = paymentSummary(item)
          const score = dataScore(item)
          const readiness = marketingReadiness(item)
          const analysis = analystReadiness(item)
          const expanded = expandedId === item.id
          const meetingSelfieReady = readiness.meetingReady
          const canAnalisSign = !done && ['Menunggu analis', 'Menunggu keputusan analis'].includes(item.status) && analysis.ready && !analisSigned && (isAnalis || isAdmin)
          const canApprove = !done && analisSigned && analysis.ready && (isAnalis || isAdmin)
          const canReject = !done && (isAdmin || (isAnalis && analisSigned && Boolean(decisionNote.trim())))
          return <article className={`credit-review-card status-${item.status.toLowerCase().replaceAll(' ', '-')}`} key={item.id}>
            <header>
              <div><span>{item.id}</span><h3>{item.form.agentName || item.userName}</h3><p>{item.form.storeName} · {item.form.whatsapp}</p></div>
              <b>{rupiah(item.form.amount)}</b>
            </header>
            {!isStandaloneDetail && expanded && <div className="credit-review-grid">
              <span><small>NIK</small><strong>{item.form.nik}</strong></span>
              <span><small>Transaksi/Bulan</small><strong>{item.form.monthlyTransactions}</strong></span>
              <span><small>Status</small><strong>{item.status}</strong></span>
              <span><small>Dokumen</small><strong>{Object.values(item.documents || {}).length} foto</strong></span>
            </div>}
            {!isStandaloneDetail && expanded && <div className="credit-payment-summary">
              <div><CreditCard/><span><b>{item.paymentStatus || (pay.paid ? 'Lunas' : 'Menunggu pelunasan')}</b><small>{rupiah(pay.totalPaid)} sudah dibayar</small></span></div>
              <strong>{pay.percent}%</strong>
              <em><i style={{width: `${pay.percent}%`}}/></em>
            </div>}
            {!isStandaloneDetail && expanded && <p className="credit-review-address">{item.form.homeAddress}</p>}
            {!isStandaloneDetail && expanded && <div className="credit-review-signatures">
              <SignatureStep title="Agent" note="Ditandatangani saat pengajuan dikirim" signed={item.agentSignature || {name: item.form.agentName || item.userName || 'Agent', at: item.createdAt}} icon={PenLine}/>
              <SignatureStep title="Pertemuan Marketing" note="Menunggu selfie pertemuan" signed={item.marketingMeeting ? {name: item.marketingMeeting.by || 'Marketing KuotaKita', at: item.marketingMeeting.at} : null} icon={UserCheck}/>
              <SignatureStep title="Operator" note="Menunggu tanda tangan operator" signed={item.analisSignature} icon={Stamp}/>
            </div>}
            <footer>
              {item.status === 'Disetujui' ? <><span className="approved"><CheckCircle2/>Sudah Diterima operator</span><button type="button" className="detail" onClick={() => expanded ? closeDetailView() : goToView('detail', item.id, filter)}><Eye/>{expanded ? 'Tutup' : 'Detail'}</button></> : item.status === 'Ditolak' ? <><span className="rejected"><XCircle/>Ditolak</span><button type="button" className="detail" onClick={() => expanded ? closeDetailView() : goToView('detail', item.id, filter)}><Eye/>{expanded ? 'Tutup' : 'Detail'}</button></> : <>
                <span><Clock3/>{meetingSelfieReady ? 'Menunggu keputusan operator' : 'Menunggu pendampingan marketing'}</span>
                <button type="button" className="detail" onClick={() => expanded ? closeDetailView() : goToView('detail', item.id, filter)}><Eye/>{expanded ? 'Tutup' : 'Detail'}</button>
                {expanded && (isMarketing || isAdmin) && score.percent < 100 && <span className="meeting-required"><AlertCircle/>Data agent atau 3 dokumen inti belum lengkap</span>}
                {expanded && (isMarketing || isAdmin) && score.percent === 100 && !meetingSelfieReady && <span className="meeting-required"><Camera/>Ambil selfie pertemuan dengan agent</span>}
                {expanded && canAnalisSign && <button type="button" className="sign" onClick={() => openSignature(item, 'analis')}><PenLine/>TTD Operator</button>}
                {expanded && canReject && <button type="button" className="reject" onClick={() => decide(item, 'Ditolak')}><XCircle/>Tolak</button>}
                {expanded && canApprove && <button type="button" className="approve" onClick={() => decide(item, 'Disetujui')}><CheckCircle2/>Terima Pengajuan</button>}
              </>}
            </footer>
            {expanded && <section className="credit-borrower-detail">
              <div className="credit-detail-block">
                <h4>Data Peminjam</h4>
                <dl>
                  <span><dt>Nama Agent</dt><dd>{item.form.agentName || item.userName}</dd></span>
                  <span><dt>Nama Toko</dt><dd>{item.form.storeName}</dd></span>
                  <span><dt>Nomor WA</dt><dd>{item.form.whatsapp}</dd></span>
                  <span><dt>Email</dt><dd>{item.form.email || '-'}</dd></span>
                  <span><dt>NIK</dt><dd>{item.form.nik || '-'}</dd></span>
                  <span><dt>Transaksi/Bulan</dt><dd>{item.form.monthlyTransactions || '-'}</dd></span>
                  <span><dt>Status Pengajuan</dt><dd>{item.status}</dd></span>
                  <span><dt>Dokumen</dt><dd>{Object.values(item.documents || {}).length} foto terunggah</dd></span>
                  <span><dt>Pertemuan Marketing</dt><dd>{item.marketingMeeting ? `Sudah selfie ${dateTime(item.marketingMeeting.at)}` : 'Menunggu selfie pertemuan'}</dd></span>
                  <span><dt>Alamat Toko</dt><dd>{item.form.storeAddress}</dd></span>
                  <span><dt>Keluarga</dt><dd>{item.form.familyName} · {item.form.familyRelation} · {item.form.familyWhatsapp}</dd></span>
                </dl>
              </div>
              {isDetail && <div className="credit-detail-block credit-finance-summary">
                <h4>Ringkasan Kredit Sebelum Keputusan</h4>
                <div><span><small>Nominal kredit</small><b>{rupiah(item.form.amount)}</b></span><span><small>Sudah dibayar</small><b>{rupiah(pay.totalPaid)}</b></span><span><small>Sisa tagihan</small><b>{rupiah(Math.max(0, Number(item.form.amount || 0) - pay.totalPaid))}</b></span></div>
                <p>Marketing mendampingi dan mengambil selfie pertemuan. Seluruh pemeriksaan serta keputusan akhir dilakukan oleh operator.</p>
              </div>}
              {isDetail && (isAnalis || isAdmin) && (() => {
                const analysis = analystReadiness(item)
                const isWaitingDecision = item.status === 'Menunggu keputusan analis'
                return <div className="credit-detail-block analyst-checklist">
                  <header><div><span>CHECKLIST KEPUTUSAN</span><h4>Kelayakan sebelum keputusan</h4></div><strong>{analysis.percent}%</strong></header>
                  <p>Operator memeriksa data, tiga dokumen inti, selfie pertemuan, persetujuan syarat, nominal, dan tanda tangan agent sebelum memberi keputusan akhir.</p>
                  <ul>{analysis.checks.map(check => <li className={check.ok ? 'ok' : ''} key={check.label}>{check.ok ? <CheckCircle2/> : <AlertCircle/>}<span>{check.label}</span></li>)}</ul>
                  {isWaitingDecision && <label className="analysis-note"><span>Catatan keputusan <small>(wajib bila ditolak)</small></span><textarea value={decisionNote} onChange={event => setDecisionNote(event.target.value)} placeholder="Contoh: data toko belum memenuhi kebijakan kredit."/></label>}
                  {item.analysisDecision?.note && <div className="analysis-saved-note"><b>Catatan Operator</b><span>{item.analysisDecision.note}</span></div>}
                </div>
              })()}
              {isDetail && <div className="credit-detail-block borrower-document-gallery">
                <h4>Dokumen Peminjam</h4>
                <div>{manualDocumentTypes.map(doc => { const value = item.documents?.[doc.key]; const file = typeof value === 'string' ? {name: value} : value || {}; const source = file.dataUrl || file.preview || ''; const needsMeeting = doc.key === 'selfieMarketing' && !source; return <figure key={doc.key}>{source ? <img src={source} alt={doc.label}/> : needsMeeting && (isMarketing || isAdmin) ? <label className="missing-document meeting-upload"><Camera/><b>Ambil selfie bersama agent</b><small>Wajib sebagai bukti pendampingan marketing</small><input type="file" accept="image/*" capture="user" onChange={event => replaceBorrowerDocument(item, doc.key, event)}/></label> : <label className="missing-document"><Images/><b>Foto belum tersinkron</b><small>Pengajuan lama tanpa data foto</small></label>}<figcaption><b>{doc.label}</b><small>{file.name || (needsMeeting ? 'Menunggu pertemuan marketing' : 'Dokumen tersimpan')}</small></figcaption></figure> })}</div>
              </div>}
              {!isStandaloneDetail && <div className="credit-detail-block marketing-checklist">
                <h4>Kelengkapan Pendampingan</h4>
                <div className="data-score"><strong>{score.percent}%</strong><span><i style={{width: `${score.percent}%`}}/></span></div>
                <ul>
                  {score.checks.map(check => <li className={check.ok ? 'ok' : ''} key={check.label}>{check.ok ? <CheckCircle2/> : <AlertCircle/>}<span>{check.label}</span></li>)}
                </ul>
                <a href={`https://wa.me/${String(item.form.whatsapp || '').replace(/\D/g, '').replace(/^0/, '62')}`} target="_blank" rel="noreferrer"><PhoneCall/>Hubungi via WhatsApp</a>
              </div>}
              {isInstallmentDetail && <div className="credit-detail-block installment-detail-block">
                <h4>Pelunasan Saldo Kredit</h4>
                <div className="credit-payment-list">
                  {paymentRows(item).map(row => <article className={row.paid ? 'paid' : ''} key={row.key}>
                    <i>{row.paid ? <CheckCircle2/> : <CalendarDays/>}</i>
                    <span><b>{row.label}</b><small>{row.paid ? `Lunas ${dateTime(row.paid.paidAt)}` : 'Bayar satu kali penuh sesuai saldo kredit'}</small></span>
                    <strong>{rupiah(row.amount)}</strong>
                    {item.status === 'Disetujui' && (isMarketing || isAdmin) && <button type="button" disabled={Boolean(row.paid)} onClick={() => {setPaymentTarget({item, row}); setPaymentMethod(''); setPaymentProof(null)}}><Banknote/>{row.paid ? 'Lunas' : 'Bayar Kredit'}</button>}
                  </article>)}
                </div>
              </div>}
            </section>}
          </article>
        })}
        {!isStandaloneDetail && visibleItems.length > listPageSize && <nav className="credit-list-pagination" aria-label="Halaman antrean">
          <span>Menampilkan <b>{listStart + 1}-{Math.min(listStart + listPageSize, visibleItems.length)}</b> dari <b>{visibleItems.length}</b> pengajuan</span>
          <div>
            <button type="button" disabled={safeListPage === 1} onClick={() => {setListPage(page => Math.max(1, page - 1)); window.scrollTo({top: 0, behavior: 'smooth'})}} aria-label="Halaman sebelumnya">‹</button>
            <strong>{safeListPage} / {listPageCount}</strong>
            <button type="button" disabled={safeListPage === listPageCount} onClick={() => {setListPage(page => Math.min(listPageCount, page + 1)); window.scrollTo({top: 0, behavior: 'smooth'})}} aria-label="Halaman berikutnya">›</button>
          </div>
        </nav>}
      </div>}</>}
    </section>
    {paymentTarget && <section className="review-payment-backdrop" aria-label="Bayar kredit">
      <div className="review-payment-sheet">
        <header><div><span>PELUNASAN KREDIT</span><h2>{paymentTarget.row.label}</h2><p>{paymentTarget.item.form.agentName || paymentTarget.item.userName}</p></div><button type="button" onClick={() => setPaymentTarget(null)} aria-label="Tutup"><X/></button></header>
        <div className="review-payment-amount"><small>Total yang harus dibayar</small><strong>{rupiah(paymentTarget.row.amount)}</strong></div>
        <div className="review-payment-methods">
          <button type="button" className={paymentMethod === 'bank' ? 'active' : ''} onClick={() => setPaymentMethod('bank')}><Landmark/><span><b>Transfer Bank</b><small>BCA · 1234567890 a.n. KuotaKita</small></span>{paymentMethod === 'bank' && <Check/>}</button>
          <button type="button" className={paymentMethod === 'qris' ? 'active' : ''} onClick={() => setPaymentMethod('qris')}><QrCode/><span><b>QRIS / Barcode</b><small>Nominal otomatis sesuai pelunasan</small></span>{paymentMethod === 'qris' && <Check/>}</button>
          <button type="button" className={paymentMethod === 'offline' ? 'active' : ''} onClick={() => setPaymentMethod('offline')}><HandCoins/><span><b>Penagihan Offline</b><small>Marketing menerima pembayaran langsung dari agent</small></span>{paymentMethod === 'offline' && <Check/>}</button>
        </div>
        {paymentMethod === 'bank' && <div className="review-bank-detail"><span>Transfer tepat sebesar</span><strong>{rupiah(paymentTarget.row.amount)}</strong><small>Kode referensi: {paymentTarget.row.key.toUpperCase()}</small></div>}
        {paymentMethod === 'qris' && <div className="review-qr-detail"><QRCodeSVG value={`${window.location.origin}/pay?ref=${encodeURIComponent(paymentTarget.row.key)}&amount=${paymentTarget.row.amount}`} size={210} level="H" includeMargin/><strong>{rupiah(paymentTarget.row.amount)}</strong><small>QR memuat referensi dan nominal pelunasan ini.</small></div>}
        {paymentMethod === 'offline' && <div className="review-bank-detail"><span>Nominal yang wajib diterima marketing</span><strong>{rupiah(paymentTarget.row.amount)}</strong><small>Pelunasan harus dibayar penuh, tidak dicicil.</small></div>}
        <label className="review-payment-proof"><Upload/><span><b>{paymentMethod === 'offline' ? 'Bukti penerimaan wajib' : 'Bukti transfer wajib'}</b><small>{paymentProof?.name || (paymentMethod === 'offline' ? 'Unggah foto kuitansi atau bukti serah-terima' : 'Unggah bukti transfer atau screenshot pembayaran')}</small></span><input type="file" accept="image/*,.pdf" onChange={choosePaymentProof}/></label>
        <button type="button" className="review-payment-confirm" disabled={!paymentMethod || !paymentProof} onClick={() => markPayment(paymentTarget.item, paymentTarget.row)}>{paymentMethod === 'offline' ? 'Konfirmasi Pelunasan Offline' : 'Konfirmasi Pembayaran'} <ArrowRight/></button>
      </div>
    </section>}
    {proofPreview && <section className="proof-preview-backdrop" aria-label="Pratinjau bukti pembayaran" onClick={() => setProofPreview(null)}>
      <div className="proof-preview-sheet" onClick={event => event.stopPropagation()}>
        <header><div><span>BUKTI PELUNASAN</span><h2>{proofPreview.item.form.agentName || proofPreview.item.userName}</h2><p>{proofPreview.name}</p></div><button type="button" onClick={() => setProofPreview(null)} aria-label="Tutup"><X/></button></header>
        <img src={proofPreview.source} alt={proofPreview.name}/>
      </div>
    </section>}
    {signaturePad && <section className="review-signature-backdrop" aria-label="Tanda tangan reviewer">
      <div className="review-signature-sheet">
        <header>
          <button type="button" onClick={closeSignature} aria-label="Tutup"><X/></button>
          <div><span>Tanda Tangan Operator</span><strong>{signaturePad.item.form.agentName || signaturePad.item.userName}</strong></div>
          <b>OPERATOR</b>
        </header>
        <div className="review-signature-pad">
          <canvas ref={canvasRef} width="760" height="330" onPointerDown={startSignature} onPointerMove={moveSignature} onPointerUp={stopSignature} onPointerCancel={stopSignature} onPointerLeave={stopSignature}/>
          {!signatureDrawn && <span>Gunakan jari untuk tanda tangan di area ini</span>}
        </div>
        <p>Tanda tangan ini akan tersimpan di pengajuan kredit agent sebagai bukti verifikasi tim.</p>
        <footer>
          <button type="button" className="clear" onClick={clearSignaturePad}><Trash2/>Hapus</button>
          <button type="button" className="save" disabled={!signatureDrawn} onClick={saveSignature}><CheckCircle2/>Simpan TTD</button>
        </footer>
      </div>
    </section>}
  </>
}
