import {useEffect, useRef, useState} from 'react'
import {useSearchParams} from 'react-router-dom'
import {AlertCircle, ArrowRight, Ban, Banknote, BarChart3, CalendarDays, Camera, Check, CheckCircle2, CircleHelp, ClipboardCheck, Clock3, CreditCard, Eye, FileCheck2, Filter, Gauge, HandCoins, Images, Landmark, LockKeyhole, PenLine, PhoneCall, PlusCircle, Printer, QrCode, Search, ShieldCheck, Stamp, Trash2, TrendingUp, Upload, UserCheck, UserPlus, WalletCards, X, XCircle} from 'lucide-react'
import {QRCodeSVG} from 'qrcode.react'
import PageHeader from '../components/common/PageHeader'
import {useAuth} from '../context/AuthContext'
import {rupiah} from '../utils/currency'
import {request} from '../services/http'
import AgentAccountForm from '../components/credit/AgentAccountForm'

const allKey = 'kuotakita_agent_credit_all'
const userKey = userId => `kuotakita_agent_credit_${userId || 'guest'}`
const finalStatus = ['Disetujui', 'Ditolak']
// Limit bertumbuh otomatis dari riwayat pelunasan. Operator tetap dapat
// menetapkan limit manual bila kondisi toko/agent membutuhkan keputusan khusus.
const automaticCreditLevels = [
  {name: 'Agent Pemula', limit: 500000, badge: 'BRONZE', minPaid: 0},
  {name: 'Agent Berkembang', limit: 1000000, badge: 'SILVER', minPaid: 3},
  {name: 'Agent Prioritas', limit: 2000000, badge: 'GOLD', minPaid: 5},
]
const defaultCreditTier = automaticCreditLevels[0]
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
  {key: 'selfieMarketing', label: 'Selfie Agen bersama Marketing', hint: 'Wajah agen dan marketing terlihat jelas'},
]
const manualDocumentTypes = coreDocumentTypes
// Seluruh bukti lapangan diambil Marketing saat kunjungan. Agen tidak dapat
// mengunggah dokumen dari galeri untuk pengajuan kredit.
const emptyManualDocuments = {ktp: null, store: null, selfieMarketing: null}

// Pengajuan lama yang sudah tersimpan di browser/server bisa belum memiliki
// seluruh field terbaru. Normalisasi ini menjaga satu data lama tidak membuat
// seluruh halaman kredit gagal dimuat.
const normalizeCreditStatus = status => {
  const aliases = {
    'Menunggu analis': 'Menunggu keputusan operator',
    'Menunggu keputusan analis': 'Menunggu keputusan operator',
    'Siap dikirim ke analis': 'Menunggu keputusan operator',
  }
  return aliases[status] || status || 'Menunggu verifikasi marketing'
}
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
  const payment = (item.repayments || []).find(row => row.key === key)
  const paid = payment?.status === 'Lunas' ? payment : (item.paymentStatus === 'Lunas' ? {key, paidAt: item.settledAt || item.updatedAt || item.decidedAt} : null)
  return [{key, paid, label: 'Pelunasan Saldo Kredit', dueAt: item.dueAt || '', amount: Number(item.creditOriginalAmount || item.form?.amount || item.creditOutstanding || 0)}]
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
  const sameAgent = items.filter(item => agentIdentity(item) === key)
  const settled = sameAgent.filter(item => item.paymentStatus === 'Lunas')
  const settledCount = settled.length
  const onTimeSettled = settled.filter(item => {
    const paidAt = new Date(item.settledAt || item.updatedAt || item.decidedAt || 0).getTime()
    const dueAt = new Date(item.dueAt || 0).getTime()
    return !dueAt || (paidAt && paidAt <= dueAt)
  })
  const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000)
  const onTimeThisMonth = onTimeSettled.filter(item => new Date(item.settledAt || item.updatedAt || 0).getTime() >= thirtyDaysAgo).length
  const turnover = sameAgent.reduce((total, item) => total + Number(item.form?.monthlyTurnover || item.form?.transactionTurnover || 0), 0)
  const hasArrears = sameAgent.some(item => item.status === 'Disetujui' && item.paymentStatus !== 'Lunas' && item.dueAt && new Date(item.dueAt).getTime() < Date.now())
  const automatic = turnover >= 5000000 && !hasArrears
    ? automaticCreditLevels[2]
    : onTimeThisMonth >= 3
      ? automaticCreditLevels[1]
      : defaultCreditTier
  const manual = [...sameAgent]
    .filter(item => Number(item.manualCreditLimit || 0) > 0)
    .sort((a, b) => new Date(b.manualLimitAt || b.updatedAt || b.createdAt) - new Date(a.manualLimitAt || a.updatedAt || a.createdAt))[0]
  return {
    automatic,
    settledCount,
    onTimeThisMonth,
    turnover,
    hasArrears,
    manual: Boolean(manual),
    source: manual ? 'Manual Operator' : 'Otomatis',
    name: manual?.manualCreditTier || automatic.name,
    limit: Number(manual?.manualCreditLimit || automatic.limit),
    badge: manual?.manualCreditBadge || automatic.badge,
  }
}
const tierForLimit = limit => [...automaticCreditLevels].reverse().find(level => limit >= level.limit) || defaultCreditTier
const viewInfo = {
  overview: {label: 'Ringkasan Kerja', title: 'Prioritas marketing hari ini', desc: 'Daftarkan agent, dampingi pengajuan, lengkapi bukti pertemuan, dan pantau pelunasan penuh.'},
  peminjam: {label: 'Kredit Aktif', title: 'Agent dengan kredit diterima', desc: 'Hanya menampilkan kredit yang sudah diterima, masih aktif, atau sudah lunas.'},
  input: {label: 'Pengajuan Kredit', title: 'Pengajuan saldo kredit agent', desc: 'Agen mengajukan nominal sesuai limit. Marketing melengkapi survei lapangan sebelum berkas dikirim ke Operator.'},
  verifikasi: {label: 'Survei Lapangan', title: 'Validasi lapangan marketing', desc: 'Ambil tiga foto langsung dari kamera: KTP, toko, dan selfie agen bersama marketing. Setelah lengkap, Operator dapat memutuskan.'},
  pembayaran: {label: 'Pelunasan Kredit', title: 'Pelunasan saldo kredit', desc: 'Bayar satu kali penuh melalui Bank, QRIS, atau penagihan langsung oleh marketing.'},
  angsuran: {label: 'Pelunasan Kredit', title: 'Monitor pelunasan penuh', desc: 'Pantau transfer Bank, QRIS, penagihan offline, bukti pembayaran, dan hak refill setelah lunas.'},
  pelunasan: {label: 'Bukti Pelunasan', title: 'Arsip bukti pelunasan', desc: 'Periksa kredit yang sudah lunas beserta nominal, metode, waktu, referensi, penerima, dan bukti pembayarannya.'},
  laporan: {label: 'Laporan Kredit', title: 'Rekap kinerja kredit', desc: 'Lihat total nominal pinjaman, pembayaran masuk, sisa tagihan, dan status seluruh peminjam.'},
  rekomendasi: {label: 'Rekomendasi Limit', title: 'Rekomendasikan kenaikan limit', desc: 'Marketing memberi catatan lapangan untuk agent binaan. Keputusan limit tetap di tangan Operator.'},
  komisi: {label: 'Kantong Komisi', title: 'Insentif marketing', desc: 'Komisi hanya tercatat dari transaksi H2H sukses yang sudah dikirim oleh sistem pusat.'},
  limit: {label: 'Tier & Limit Agent', title: 'Manajemen tier dan limit', desc: 'Operator dapat melihat rekomendasi marketing dan menyesuaikan limit secara manual tanpa menghapus aturan otomatis.'},
  suspend: {label: 'Suspend & Tunggakan', title: 'Kontrol akses agent', desc: 'Akses agent yang menunggak atau tokonya tutup dapat dihentikan sementara sampai diselesaikan.'},
  h2h: {label: 'Monitor Saldo H2H', title: 'Kesiapan bridge Pulsa24Jam', desc: 'Pantau kesiapan saldo induk sebelum transaksi agent diteruskan ke API H2H Pulsa24Jam.'},
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
    {label: 'Dokumen survei', ok: ['ktp', 'store', 'selfieMarketing'].every(key => Boolean(item.documents?.[key]))},
  ]
  const done = checks.filter(check => check.ok).length
  return {checks, done, total: checks.length, percent: Math.round((done / checks.length) * 100)}
}

// Tiga dokumen survei merupakan tanggung jawab Marketing saat mendampingi agent.
const marketingReadiness = item => {
  const score = dataScore(item)
  const meetingReady = Boolean(item.documents?.selfieMarketing?.dataUrl || item.documents?.selfieMarketing?.preview || item.documents?.selfieMarketing)
  return {
    score,
    meetingReady,
    readyForAnalysis: score.percent === 100,
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
  const [operatorDrafts, setOperatorDrafts] = useState({})
  const [operatorMessage, setOperatorMessage] = useState('')
  const isMarketing = user?.role === 'marketing'
  // Existing "analis" accounts are the legacy name for Operator. Keeping the
  // alias prevents existing staff from being locked out during the migration.
  const isOperator = ['operator', 'analis'].includes(user?.role)
  const isAdmin = ['master', 'admin'].includes(user?.role)
  const view = params.get('view') || 'overview'
  const isDetail = view === 'detail'
  const isInstallmentDetail = view === 'angsuran-detail'
  const isStandaloneDetail = isDetail || isInstallmentDetail
  const goToView = (nextView, id = '', nextFilter = '') => setSearchParams(nextView ? {view: nextView, ...(id ? {id} : {}), ...(nextFilter ? {filter: nextFilter} : {}), ...(nextView === 'detail' ? {from: view} : {})} : {})
  const closeDetailView = () => {
    const targetView = isInstallmentDetail ? 'angsuran' : isDetail ? (params.get('from') || (isOperator ? 'verifikasi' : 'peminjam')) : 'verifikasi'
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
    // Cukup berkala, bukan setiap 1,5 detik. Aksi penting tetap langsung
    // disimpan ke server lewat saveApplication.
    const timer = window.setInterval(sync, 6000)
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
    if (['panduan', 'rekomendasi', 'komisi', 'limit', 'suspend', 'h2h'].includes(view)) {
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
  const signOperator = (item, image) => {
    const signature = stampPayload({...user, role: 'operator'}, image)
    saveApplication(item, {analisSignature: signature, operatorSignature: signature, status: 'Menunggu keputusan operator'})
    refresh()
  }
  const decide = (item, status) => {
    if (isOperator && (!(item.operatorSignature || item.analisSignature) || (status === 'Ditolak' && !decisionNote.trim()))) return
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
      creditBadge: profile.badge,
      automaticCreditLimit: profile.automatic.limit,
      automaticCreditTier: profile.automatic.name,
      paidCreditCycles: profile.settledCount,
      creditLimitSource: profile.source,
      // Credit is a separate wallet. A new approved agent gets usable credit
      // up to the approved limit; debt only grows when a transaction actually
      // consumes that wallet after Saldo Utama is empty.
      creditOriginalAmount: amount,
      creditBalance: profile.limit,
      creditOutstanding: 0,
      creditStatus: 'Aktif',
      paymentStatus: 'Tidak ada tagihan',
      repayments: [],
      // Kredit agent bukan cicilan. Satu tagihan penuh jatuh tempo 14 hari
      // setelah Operator menerima pengajuan.
      dueAt: new Date(Date.now() + (14 * 24 * 60 * 60 * 1000)).toISOString(),
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
    if (coreDocumentTypes.some(doc => !manualDocuments[doc.key])) return setManualMessage('Lengkapi Foto KTP, Foto Toko, dan Selfie Agen bersama Marketing dulu.')
    const amount = Math.min(500000, Math.max(50000, Number(String(manualForm.amount).replace(/\D/g, '') || 0)))
    const application = {
      id: `KSA-${Date.now().toString().slice(-8)}`,
      status: 'Menunggu verifikasi marketing',
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
      marketingOwnerId: user?.id || '',
      marketingOwnerName: reviewerName(user),
    }
    // Gunakan satu jalur simpan agar data tidak berbeda antar panel dan tab.
    saveApplication(application, {})
    setManualForm(manualInitial)
    setManualDocuments(emptyManualDocuments)
    setManualMessage('Pengajuan tersimpan. Lanjutkan dengan ambil selfie pertemuan sebelum berkas dikirim ke Operator.')
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
    const submittedAt = new Date().toISOString()
    const repayments = [{key: row.key, applicationId: item.id, label: row.label, amount: row.amount, status: 'Menunggu verifikasi', submittedAt, submittedBy: reviewerName(user), method: paymentMethod, paymentReference: row.key.toUpperCase(), proof: paymentProof}, ...(item.repayments || []).filter(pay => pay.key !== row.key)]
    const offlineCollection = paymentMethod === 'offline' ? {status: 'Menunggu verifikasi', submittedAt, collectedBy: reviewerName(user), amount: row.amount, proof: paymentProof} : item.offlineCollection
    saveApplication(item, {repayments, offlineCollection, paymentStatus: 'Menunggu verifikasi pembayaran', creditStatus: 'Menunggu pelunasan'})
    refresh()
    setPaymentTarget(null)
    setPaymentMethod('')
    setPaymentProof(null)
  }
  const confirmFullPayment = item => {
    if (!isOperator && !isAdmin) return
    const repayment = (item.repayments || []).find(row => row.status === 'Menunggu verifikasi')
    if (!repayment) return
    const paidAt = new Date().toISOString()
    const repayments = (item.repayments || []).map(row => row.key === repayment.key ? {...row, status: 'Lunas', paidAt, receivedBy: reviewerName(user), verifiedBy: reviewerName(user), verifiedAt: paidAt} : row)
    const profile = creditProfile(items, item)
    saveApplication(item, {repayments, paymentStatus: 'Lunas', creditStatus: 'Aktif', creditBalance: profile.limit, creditOutstanding: 0, settledAt: paidAt, lastFullPaymentAt: paidAt, paymentVerification: {by: reviewerName(user), at: paidAt}})
    setOperatorMessage(`Pelunasan ${item.form.agentName || item.userName} telah diverifikasi. Saldo kredit kembali ke ${rupiah(profile.limit)}.`)
    refresh()
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
    saveApplication(item, {documents, marketingMeeting: meeting, marketingOwnerId: user?.id || item.marketingOwnerId || '', marketingOwnerName: reviewerName(user), status: item.status === 'Menunggu verifikasi marketing' ? 'Sedang diverifikasi marketing' : normalizeCreditStatus(item.status)})
    refresh()
  }
  const forwardToOperator = item => {
    const readiness = marketingReadiness(item)
    if (!readiness.readyForAnalysis) return
    saveApplication(item, {
      status: 'Menunggu keputusan operator',
      forwardedAt: new Date().toISOString(),
      marketingOwnerId: user?.id || item.marketingOwnerId || '',
      marketingOwnerName: reviewerName(user),
      marketingVerification: {by: reviewerName(user), at: new Date().toISOString()},
    })
    refresh()
  }
  const saveOperatorLimit = item => {
    if (!isOperator && !isAdmin) return
    const profile = creditProfile(items, item)
    // The displayed limit is the effective limit. Using it as the default means
    // the operator can save an unchanged value without first retyping it.
    const raw = Number(String(operatorDrafts[item.id] ?? profile.limit).replace(/\D/g, ''))
    if (raw < profile.automatic.limit || raw > 2000000) {
      setOperatorMessage(`Limit manual minimal ${rupiah(profile.automatic.limit)} dan maksimal Rp2.000.000.`)
      return
    }
    const tier = tierForLimit(raw)
    saveApplication(item, {
      manualCreditLimit: raw,
      manualCreditTier: tier.name,
      manualCreditBadge: tier.badge,
      manualLimitAt: new Date().toISOString(),
      manualLimitBy: reviewerName(user),
      creditLimit: raw,
      creditTier: tier.name,
      creditBadge: tier.badge,
      creditLimitSource: 'Manual Operator',
      automaticCreditLimit: profile.automatic.limit,
      automaticCreditTier: profile.automatic.name,
    })
    setOperatorMessage(`Limit ${item.form.agentName || item.userName} diperbarui menjadi ${rupiah(raw)}.`)
    refresh()
  }
  const setAgentAccess = async (item, suspended) => {
    if (!isOperator && !isAdmin) return
    if (!item.userId || String(item.userId).startsWith('manual-')) {
      setOperatorMessage('Akun agent belum ditautkan. Daftarkan agent melalui menu Tambah Agent agar aksesnya dapat dikontrol.')
      return
    }
    const reason = suspended ? window.prompt('Alasan penghentian akses agent:', item.agentAccessReason || 'Tunggakan atau toko tutup') : ''
    if (suspended && reason === null) return
    try {
      await request(`/auth/agents/${encodeURIComponent(item.userId)}/access`, {method: 'PATCH', body: JSON.stringify({suspended, reason: reason || ''})})
      saveApplication(item, {agentAccessStatus: suspended ? 'suspended' : 'active', agentAccessReason: suspended ? reason : '', agentAccessUpdatedAt: new Date().toISOString()})
      setOperatorMessage(suspended ? 'Akses agent dihentikan. Agent tidak dapat login sampai diaktifkan kembali.' : 'Akses agent sudah diaktifkan kembali.')
      refresh()
    } catch (error) { setOperatorMessage(error.message || 'Status akses agent gagal diubah.') }
  }
  const saveMarketingRecommendation = item => {
    if (!isMarketing && !isAdmin) return
    const note = window.prompt('Catatan rekomendasi marketing untuk Operator:', item.marketingRecommendation?.note || '')
    if (note === null) return
    saveApplication(item, {
      marketingOwnerId: user?.id || item.marketingOwnerId || '',
      marketingOwnerName: reviewerName(user),
      marketingRecommendation: {
        by: reviewerName(user),
        at: new Date().toISOString(),
        note: note.trim() || 'Marketing merekomendasikan peninjauan limit berdasarkan aktivitas konter.',
      },
    })
    setOperatorMessage('Rekomendasi marketing tersimpan dan dapat dilihat Operator.')
    refresh()
  }
  const printApplication = item => {
    const profile = creditProfile(items, item)
    const amount = Number(item.creditOriginalAmount || item.form?.amount || 0)
    const outstanding = Number(item.creditOutstanding ?? item.creditBalance ?? amount)
    const win = window.open('', '_blank', 'noopener,noreferrer')
    if (!win) return setOperatorMessage('Izinkan pop-up browser agar dokumen dapat dicetak.')
    const esc = value => String(value ?? '').replace(/[&<>"']/g, char => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;'}[char]))
    win.document.write(`<!doctype html><html><head><title>Pengajuan ${esc(item.id)}</title><style>body{font-family:Arial,sans-serif;max-width:720px;margin:32px auto;color:#172033}h1{margin:0;color:#30218b}p{color:#59657a}.grid{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin:20px 0}.row{border:1px solid #dfe4ef;border-radius:10px;padding:12px}.row small{display:block;color:#657187}.row b{display:block;margin-top:4px}.status{padding:7px 10px;background:#e6faf0;color:#087650;border-radius:999px;font-weight:bold;display:inline-block}</style></head><body><h1>KuotaKita · Pengajuan Kredit Agent</h1><p>ID ${esc(item.id)} · Dicetak ${new Date().toLocaleString('id-ID')}</p><span class="status">${esc(item.status)}</span><div class="grid"><div class="row"><small>Agent / Toko</small><b>${esc(item.form.agentName || item.userName)}</b>${esc(item.form.storeName)}</div><div class="row"><small>Nomor WhatsApp</small><b>${esc(item.form.whatsapp)}</b></div><div class="row"><small>Nominal kredit</small><b>${rupiah(amount)}</b></div><div class="row"><small>Sisa saldo kredit</small><b>${rupiah(outstanding)}</b></div><div class="row"><small>Limit efektif</small><b>${rupiah(profile.limit)} · ${esc(profile.source)}</b></div><div class="row"><small>Status akses agent</small><b>${item.agentAccessStatus === 'suspended' ? 'Dinonaktifkan' : 'Aktif'}</b></div></div><p>Dokumen, selfie marketing, dan riwayat keputusan tersimpan pada panel Operator KuotaKita.</p><script>window.print()</script></body></html>`)
    win.document.close()
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
    if (signaturePad.role === 'analis' || signaturePad.role === 'operator') signOperator(signaturePad.item, image)
    closeSignature()
  }
  const sortedItems = [...items].sort((a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt))
  // Halaman utama Operator adalah daftar kerja yang bisa menampung banyak
  // pengajuan. Semua status tetap berada di satu tabel; filter hanya dipakai
  // saat Operator ingin mempersempit pencarian.
  const operatorTableMode = isOperator && !isStandaloneDetail && (view === 'overview' || view === 'verifikasi')
  const visibleItems = sortedItems.filter(item => {
    const matchDetail = !isStandaloneDetail || item.id === params.get('id')
    const text = `${item.id} ${item.form.agentName} ${item.userName} ${item.form.storeName} ${item.form.whatsapp} ${item.form.nik}`.toLowerCase()
    const matchQuery = text.includes(query.toLowerCase().trim())
    const group = statusGroup(item)
    const matchFilter = view === 'angsuran' || view === 'pembayaran' ? ['Disetujui', 'Lunas'].includes(group) : filter === 'Semua' || group === filter
    const analystArchiveFilter = ['Ditolak', 'Disetujui', 'Lunas'].includes(filter)
    const matchRoleQueue = !isOperator || isStandaloneDetail || operatorTableMode || (analystArchiveFilter ? group === filter : item.status === 'Menunggu keputusan operator')
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
  const marketingOwnedItems = sortedItems.filter(item => !isMarketing || !item.marketingOwnerId || item.marketingOwnerId === user?.id)
  const marketingQueue = marketingOwnedItems.filter(item => ['Menunggu verifikasi marketing', 'Sedang diverifikasi marketing'].includes(item.status))
  const meetingQueue = marketingQueue.filter(item => !marketingReadiness(item).meetingReady)
  const marketingReadyForAnalysis = marketingQueue.filter(item => marketingReadiness(item).readyForAnalysis)
  const offlineCollectionQueue = sortedItems.filter(item => item.status === 'Disetujui' && item.paymentStatus === 'Menunggu penagihan offline')
  const analystQueue = sortedItems.filter(item => item.status === 'Menunggu keputusan operator')
  const analystPendingSignature = analystQueue.filter(item => !item.analisSignature)
  const analystReadyToDecide = analystQueue.filter(item => Boolean(item.analisSignature))
  const analystDecidedToday = sortedItems.filter(item => finalStatus.includes(item.status) && new Date(item.decidedAt || 0).toDateString() === new Date().toDateString())
  const analystApprovedActive = sortedItems.filter(item => item.status === 'Disetujui' && item.paymentStatus !== 'Lunas')
  const operatorIssuedAmount = analystApprovedActive.reduce((sum, item) => sum + Number(item.creditOriginalAmount || item.form.amount || 0), 0)
  const operatorRemainingAmount = analystApprovedActive.reduce((sum, item) => sum + Number(item.creditOutstanding ?? item.creditBalance ?? item.creditOriginalAmount ?? item.form.amount ?? 0), 0)
  const operatorSuspended = [...new Map(sortedItems.filter(item => item.agentAccessStatus === 'suspended').map(item => [agentIdentity(item), item])).values()]
  const overdueItems = sortedItems.filter(item => item.status === 'Disetujui' && item.paymentStatus !== 'Lunas' && item.dueAt && new Date(item.dueAt).getTime() < Date.now())
  const operatorLimitRows = sortedItems.filter(item => ['Disetujui', 'Lunas'].includes(statusGroup(item)))
  const marketingRecommendations = marketingOwnedItems.filter(item => item.marketingRecommendation)
  const marketingCommission = marketingOwnedItems.reduce((sum, item) => sum + Number(item.marketingCommission || 0), 0)
  const marketingActiveAgents = marketingOwnedItems.filter(item => item.status === 'Disetujui')
  const operatorSuspendRows = [...new Map([...overdueItems, ...operatorSuspended].map(item => [item.id, item])).values()]
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
  const pendingProofRows = installmentRows.map(({item}) => {
    const payment = (item.repayments || []).find(row => row.status === 'Menunggu verifikasi')
    return payment ? {item, payment, proof: payment.proof || item.offlineCollection?.proof || null} : null
  }).filter(Boolean)
  const installmentPaidAmount = installmentRows.reduce((sum, {pay}) => sum + pay.totalPaid, 0)
  const installmentRemainingAmount = installmentRows.reduce((sum, {item, pay}) => sum + Math.max(0, Number(item.creditOriginalAmount || item.form.amount || 0) - pay.totalPaid), 0)
  const marketingCards = [
    {title: 'Perlu Pendampingan', value: meetingQueue.length, note: 'Selfie bersama agent belum ada', icon: Camera},
    {title: 'Siap Diperiksa Operator', value: marketingReadyForAnalysis.length, note: 'Data dan pertemuan sudah lengkap', icon: ClipboardCheck},
    {title: 'Tagihan Offline', value: offlineCollectionQueue.length, note: 'Perlu dikunjungi marketing', icon: HandCoins},
    {title: 'Kredit Aktif', value: approvedActive.length, note: 'Sudah diterima, belum lunas', icon: Banknote},
  ]
  const activeView = viewInfo[view] || viewInfo.overview
  const isRejectedArchive = isOperator && view === 'verifikasi' && filter === 'Ditolak'
  const rejectedItems = sortedItems.filter(item => statusGroup(item) === 'Ditolak')
  const totalLoan = items.reduce((sum, item) => sum + Number(item.form.amount || 0), 0)
  const totalPaidAmount = items.reduce((sum, item) => sum + paymentSummary(item).totalPaid, 0)
  const remainingLoan = Math.max(0, totalLoan - totalPaidAmount)
  const recentManual = sortedItems.filter(item => item.source === 'marketing').slice(0, 5)
  const paymentToday = approvedActive.filter(item => Boolean(firstUnpaidRow(item)))
  const showCreateArea = (isMarketing || isAdmin) && view === 'input'
  // Setiap menu punya satu tujuan: daftar detail hanya muncul di Antrean Verifikasi.
  // Ringkasan, Direktori Peminjam, dan Angsuran memakai panel khusus masing-masing.
  const showMainList = view === 'verifikasi' || isStandaloneDetail || operatorTableMode
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
    {!isStandaloneDetail && view === 'overview' && <PageHeader eyebrow={isOperator ? 'OPERATOR KREDIT' : 'MARKETING KREDIT'} title={isOperator ? 'Keputusan Akhir Kredit Agent' : 'Pendampingan Kredit Agent'} description={isOperator ? 'Operator memeriksa seluruh data, menandatangani, lalu memberi keputusan akhir.' : 'Marketing mendaftarkan agent, membimbing pengajuan, mengambil selfie pertemuan, dan menangani pelunasan offline.'}/>}
    <section className={`panel credit-review-panel ${isStandaloneDetail ? 'detail-mode' : ''} ${(isMarketing || isAdmin) ? 'marketing-review' : ''} ${isOperator ? 'analyst-review operator-review' : ''}`}>
      {view === 'overview' && !operatorTableMode && <div className="credit-review-hero">
        <div>
          <span>{isOperator ? 'RUANG KEPUTUSAN OPERATOR' : 'RUANG DATA PEMINJAM'}</span>
          <h2>{isOperator ? 'Kontrol Keputusan Kredit' : 'Monitoring Kredit Agent'}</h2>
          <p>{isOperator ? 'Fokus hanya pada pengajuan yang sudah diverifikasi Marketing. Operator mengecek kelayakan, tanda tangan, lalu menerima atau menolak.' : 'Semua pengajuan tersusun rapi dari yang terbaru. Marketing, operator, dan admin bisa cek data agent, tanda tangan, keputusan, sampai pembayaran.'}</p>
        </div>
        <i><WalletCards/></i>
      </div>}
      {view === 'overview' && !operatorTableMode && <div className="credit-review-stats">
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
        <div className="marketing-flow-strip" aria-label="Alur kerja marketing">
          <button type="button" onClick={() => goToView('agent-input')}><b>1</b><span><strong>Daftarkan Agent</strong><small>Buat akun login resmi</small></span></button>
          <button type="button" onClick={() => goToView('input')}><b>2</b><span><strong>Data & Dokumen</strong><small>Ambil KTP, toko, dan selfie</small></span></button>
          <button type="button" onClick={() => goToView('verifikasi')}><b>3</b><span><strong>Kirim ke Operator</strong><small>Pastikan berkas lengkap</small></span></button>
          <button type="button" onClick={() => goToView('angsuran')}><b>4</b><span><strong>Pantau Pelunasan</strong><small>Tagihan dan kunjungan offline</small></span></button>
        </div>
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
      {(isOperator || isAdmin) && view === 'overview' && !operatorTableMode && <section className="marketing-workspace analyst-workspace operator-workspace">
        <header>
          <div><span>MEJA KERJA OPERATOR</span><h2>Kontrol limit, akses, dan keputusan</h2><p>Daftar dibuat ringkas untuk banyak agent. Buka detail hanya saat perlu memeriksa berkas, mengubah limit, menghentikan akses, atau mencetak pengajuan.</p></div>
        </header>
        <div className="marketing-task-grid">
          <article><i><ClipboardCheck/></i><span>Perlu diperiksa</span><strong>{analystQueue.length}</strong><small>Pengajuan proses</small></article>
          <article><i><Banknote/></i><span>Kredit berjalan</span><strong>{rupiah(operatorIssuedAmount)}</strong><small>Nominal diterima</small></article>
          <article><i><Stamp/></i><span>Sisa saldo kredit</span><strong>{rupiah(operatorRemainingAmount)}</strong><small>Belum dilunasi</small></article>
          <article><i><Ban/></i><span>Akses dihentikan</span><strong>{operatorSuspended.length}</strong><small>Perlu tindak lanjut</small></article>
        </div>
        <div className="marketing-quick-actions" aria-label="Aksi cepat operator">
          <button type="button" className="primary" onClick={() => goToView('verifikasi')}><ClipboardCheck/><span><b>Buka antrean operator</b><small>{analystQueue.length ? `${analystQueue.length} berkas siap diperiksa` : 'Tidak ada berkas baru'}</small></span><strong>→</strong></button>
          <button type="button" onClick={() => goToView('laporan')}><BarChart3/><span><b>Rekap kredit agent</b><small>Nominal diterima, sisa, lunas, dan status</small></span><strong>→</strong></button>
          <button type="button" onClick={() => goToView('peminjam')}><Ban/><span><b>Kontrol akses agent</b><small>{operatorSuspended.length ? `${operatorSuspended.length} akses sedang dihentikan` : 'Semua akses agent aktif'}</small></span><strong>→</strong></button>
        </div>
        {operatorMessage && <p className="operator-feedback" role="status">{operatorMessage}</p>}
        <div className="marketing-section-label focus-label"><span>BERKAS PRIORITAS</span><small>Periksa kelayakan dan kelengkapan sebelum memberi keputusan</small></div>
        <div className="marketing-focus-grid">
          <div><h3>Menunggu tanda tangan operator</h3>{analystQueue.filter(item => !item.analisSignature).slice(0, 4).map(item => <button type="button" key={item.id} onClick={() => goToView('verifikasi', item.id, 'Review')}><span><b>{item.form.agentName || item.userName}</b><small>{item.form.storeName || item.id}</small></span><strong>{rupiah(item.form.amount)}</strong></button>)}{!analystQueue.some(item => !item.analisSignature) && <p>Tidak ada berkas yang menunggu tanda tangan operator.</p>}</div>
          <div><h3>Siap diberi keputusan</h3>{analystReadyToDecide.slice(0, 4).map(item => <button type="button" key={item.id} onClick={() => goToView('verifikasi', item.id, 'Review')}><span><b>{item.form.agentName || item.userName}</b><small>TTD operator sudah tersimpan</small></span><strong>{rupiah(item.form.amount)}</strong></button>)}{!analystReadyToDecide.length && <p>Belum ada berkas yang siap diberi keputusan.</p>}</div>
        </div>
      </section>}
      {(isMarketing || isOperator || isAdmin) && view === 'verifikasi' && !operatorTableMode && <section className="marketing-action-panel">
        <header>{isRejectedArchive ? <XCircle/> : <ClipboardCheck/>}<div><span>{isRejectedArchive ? 'ARSIP PENOLAKAN' : isOperator ? 'FOKUS OPERATOR' : 'FOKUS PENDAMPINGAN'}</span><h2>{isRejectedArchive ? `${rejectedItems.length} keputusan ditolak` : `${isOperator ? analystQueue.length : marketingQueue.length} pengajuan perlu ditangani`}</h2><p>{isRejectedArchive ? 'Buka detail untuk membaca alasan keputusan dan jejak pemeriksaan operator. Data di halaman ini hanya arsip, bukan antrean aktif.' : isOperator ? 'Cek nominal, batas kredit, data, dokumen, selfie pertemuan, ketentuan, dan tanda tangan agent. Setelah lengkap, tanda tangani lalu terima atau tolak.' : 'Buka detail pengajuan untuk membantu melengkapi data dan mengambil selfie bersama agent. Keputusan akhir dilakukan Operator.'}</p></div></header>
      </section>}
      {(isMarketing || isOperator || isAdmin) && view === 'peminjam' && <section className="borrower-directory-panel">
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
      {(isMarketing || isOperator || isAdmin) && (view === 'pembayaran' || view === 'angsuran') && <section className="marketing-action-panel payment">
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
      {(isOperator || isAdmin) && view === 'pelunasan' && <section className="analyst-payment-proof-panel">
        <header className="payment-proof-heading">
          <i><FileCheck2/></i>
          <div><span>ARSIP PELUNASAN</span><h2>Bukti pembayaran kredit agent</h2><p>Setiap pelunasan tersusun dari yang terbaru. Operator dapat melihat nominal, jalur pembayaran, penerima, referensi, dan bukti transfer tanpa bercampur dengan antrean aktif.</p></div>
        </header>
        <div className="payment-proof-summary">
          <article><small>Perlu verifikasi</small><strong>{pendingProofRows.length}</strong><span>Bukti baru masuk</span></article>
          <article><small>Kredit lunas</small><strong>{paidProofRows.length}</strong><span>Pembayaran selesai</span></article>
          <article><small>Total diterima</small><strong>{rupiah(paidProofRows.reduce((sum, row) => sum + Number(row.payment.amount || row.pay.totalPaid || 0), 0))}</strong><span>Nominal terverifikasi</span></article>
          <article><small>Bukti tersedia</small><strong>{paidProofRows.filter(row => row.proof?.dataUrl).length}</strong><span>File dapat diperiksa</span></article>
        </div>
        <div className="payment-proof-list">
          {pendingProofRows.map(({item, payment, proof}) => <article key={`pending-${item.id}`} className="payment-proof-card pending">
            <div className="payment-proof-identity"><i><Clock3/></i><span><b>{item.form.agentName || item.userName}</b><small>{item.form.storeName || item.id} · menunggu verifikasi</small></span><em>CEK BUKTI</em></div>
            <dl><div><dt>Nominal</dt><dd>{rupiah(payment.amount)}</dd></div><div><dt>Metode</dt><dd>{payment.method === 'qris' ? 'QRIS' : payment.method === 'offline' ? 'Penagihan Offline' : 'Transfer Bank'}</dd></div><div><dt>Dikirim</dt><dd>{dateTime(payment.submittedAt)}</dd></div></dl>
            {proof?.dataUrl && <button type="button" className="payment-proof-file" onClick={() => setProofPreview({source: proof.dataUrl, name: proof.name || `Bukti ${item.id}`, item})}><img src={proof.dataUrl} alt={`Bukti pembayaran ${item.id}`}/><span><b>Lihat bukti pembayaran</b><small>{proof.name || 'Foto bukti transfer'}</small></span><Eye/></button>}
            <button type="button" className="approve" onClick={() => confirmFullPayment(item)}><CheckCircle2/>Verifikasi pelunasan</button>
          </article>)}
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
      {(isMarketing || isOperator || isAdmin) && view === 'laporan' && <>
        <section className="marketing-report-panel">
          <article><span>Total Pinjaman</span><strong>{rupiah(totalLoan)}</strong><small>Akumulasi nominal pengajuan</small></article>
          <article><span>Pembayaran Masuk</span><strong>{rupiah(totalPaidAmount)}</strong><small>Pelunasan yang sudah dicatat</small></article>
          <article><span>Sisa Tagihan</span><strong>{rupiah(remainingLoan)}</strong><small>Estimasi belum dibayar</small></article>
          <article><span>Rasio Lunas</span><strong>{items.length ? Math.round((summary.paid / items.length) * 100) : 0}%</strong><small>Dari seluruh peminjam</small></article>
        </section>
        <section className="marketing-report-table">
          <header><div><span>LAPORAN DETAIL</span><h2>Rekap peminjam & pembayaran</h2><p>{isOperator ? 'Gunakan rekap ini untuk memantau keputusan akhir dan kesehatan kredit yang sudah berjalan.' : 'Data ini berguna buat kontrol tagihan, lihat sisa pembayaran, dan arsip kerja marketing.'}</p></div><button type="button" onClick={exportReport}><Banknote/>Export CSV</button></header>
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
      {(isMarketing || isAdmin) && view === 'rekomendasi' && <section className="credit-command-panel marketing-command-panel">
        <header><div><span>REKOMENDASI LAPANGAN</span><h2>Usulkan kenaikan limit agent binaan</h2><p>Marketing hanya memberi catatan kondisi toko dan aktivitas lapangan. Operator tetap memutuskan limit akhir secara manual atau melalui aturan otomatis.</p></div><TrendingUp/></header>
        <div className="command-summary"><article><small>Agent kredit aktif</small><strong>{marketingActiveAgents.length}</strong><span>Siap dipantau</span></article><article><small>Rekomendasi terkirim</small><strong>{marketingRecommendations.length}</strong><span>Tercatat ke Operator</span></article><article><small>Menunggu keputusan</small><strong>{marketingRecommendations.filter(item => !item.operatorLimit?.updatedAt).length}</strong><span>Belum diatur Operator</span></article></div>
        <div className="command-list">{marketingActiveAgents.length ? marketingActiveAgents.map(item => { const profile = creditProfile(items, item); return <article key={item.id}><div><b>{item.form.agentName || item.userName}</b><small>{item.form.storeName || item.id} · limit saat ini {rupiah(profile.limit)}</small>{item.marketingRecommendation?.note && <em>Catatan: {item.marketingRecommendation.note}</em>}</div><button type="button" onClick={() => saveMarketingRecommendation(item)}><TrendingUp/>{item.marketingRecommendation ? 'Ubah rekomendasi' : 'Beri rekomendasi'}</button></article> }) : <p>Belum ada agent binaan dengan kredit aktif.</p>}</div>
      </section>}
      {(isMarketing || isAdmin) && view === 'komisi' && <section className="credit-command-panel marketing-command-panel">
        <header><div><span>KANTONG KOMISI</span><h2>Insentif dari agent binaan</h2><p>Komisi hanya bertambah dari transaksi H2H yang sukses dan telah dikirim oleh server pusat. Tidak ada komisi contoh atau saldo palsu di halaman ini.</p></div><WalletCards/></header>
        <div className="command-summary"><article><small>Komisi tercatat</small><strong>{rupiah(marketingCommission)}</strong><span>Transaksi H2H sukses</span></article><article><small>Agent binaan aktif</small><strong>{marketingActiveAgents.length}</strong><span>Bisa menghasilkan komisi</span></article><article><small>Status sinkronisasi</small><strong>Belum aktif</strong><span>Butuh API H2H Pulsa24Jam</span></article></div>
        <div className="command-empty"><WalletCards/><b>Komisi akan masuk otomatis setelah bridge H2H aktif</b><span>Setelah API Pulsa24Jam terhubung, setiap transaksi sukses agent binaan dapat dihitung sesuai aturan komisi pusat.</span></div>
      </section>}
      {(isOperator || isAdmin) && view === 'limit' && <section className="credit-command-panel operator-command-panel">
        <header><div><span>MANAJEMEN TIER & LIMIT</span><h2>Atur plafon kredit tanpa menghapus aturan otomatis</h2><p>Operator dapat menaikkan, menurunkan, atau mempertahankan limit tiap agent. Riwayat pelunasan tetap dipakai sistem untuk rekomendasi tier otomatis.</p></div><Gauge/></header>
        <div className="command-list">{operatorLimitRows.length ? operatorLimitRows.map(item => { const profile = creditProfile(items, item); const outstanding = Number(item.creditOutstanding ?? item.creditBalance ?? item.creditOriginalAmount ?? item.form.amount ?? 0); return <article className="limit-row" key={item.id}><div><b>{item.form.agentName || item.userName}</b><small>{item.form.storeName || item.id} · {profile.automatic.name} · kredit berjalan {rupiah(outstanding)}</small>{item.marketingRecommendation?.note && <em>Rekomendasi Marketing: {item.marketingRecommendation.note}</em>}</div><label><span>Limit manual</span><input inputMode="numeric" value={operatorDrafts[item.id] ?? String(profile.limit)} onChange={event => setOperatorDrafts(current => ({...current, [item.id]: event.target.value.replace(/\D/g, '')}))}/></label><button type="button" onClick={() => saveOperatorLimit(item)}><CheckCircle2/>Simpan</button></article> }) : <p>Belum ada agent yang sudah diterima untuk diatur limitnya.</p>}</div>
      </section>}
      {(isOperator || isAdmin) && view === 'suspend' && <section className="credit-command-panel operator-command-panel">
        <header><div><span>PENGAMANAN AKSES</span><h2>Suspend agent menunggak atau toko tidak aktif</h2><p>Akses transaksi dapat dihentikan sementara. Sebelum suspend, pastikan ada catatan lapangan atau tagihan yang benar agar agent tidak salah diblokir.</p></div><LockKeyhole/></header>
        <div className="command-summary"><article><small>Lewat jatuh tempo</small><strong>{overdueItems.length}</strong><span>Butuh tindak lanjut</span></article><article><small>Akses dihentikan</small><strong>{operatorSuspended.length}</strong><span>Menunggu aktivasi</span></article><article><small>Kredit berjalan</small><strong>{rupiah(operatorRemainingAmount)}</strong><span>Total belum lunas</span></article></div>
        <div className="command-list">{operatorSuspendRows.length ? operatorSuspendRows.map(item => <article key={item.id}><div><b>{item.form.agentName || item.userName}</b><small>{item.form.storeName || item.id} · {item.agentAccessStatus === 'suspended' ? 'Akses sedang dihentikan' : 'Lewat jatuh tempo'}</small><em>Sisa tagihan {rupiah(Number(item.creditOutstanding ?? item.creditBalance ?? item.form.amount ?? 0))}</em></div><button type="button" className={item.agentAccessStatus === 'suspended' ? 'safe' : 'danger'} onClick={() => setAgentAccess(item, item.agentAccessStatus === 'suspended')}><Ban/>{item.agentAccessStatus === 'suspended' ? 'Aktifkan akses' : 'Suspend akses'}</button></article>) : <p>Tidak ada agent menunggak atau akses yang sedang dihentikan.</p>}</div>
        {operatorMessage && <output className="operator-feedback" aria-live="polite">{operatorMessage}</output>}
      </section>}
      {(isOperator || isAdmin) && view === 'h2h' && <section className="credit-command-panel operator-command-panel">
        <header><div><span>PULSA24JAM BRIDGE</span><h2>Monitor modal kredit dan saldo induk H2H</h2><p>Nilai kredit di bawah berasal dari data KuotaKita. Saldo deposit Pulsa24Jam baru dapat tampil real-time setelah API key H2H resmi dimasukkan ke backend.</p></div><Landmark/></header>
        <div className="command-summary"><article><small>Kredit diterima</small><strong>{rupiah(operatorIssuedAmount)}</strong><span>Modal yang sudah diberikan</span></article><article><small>Tagihan berjalan</small><strong>{rupiah(operatorRemainingAmount)}</strong><span>Belum dibayar lunas</span></article><article><small>Saldo induk H2H</small><strong>Belum tersinkron</strong><span>API Pulsa24Jam diperlukan</span></article></div>
        <div className="command-empty"><Landmark/><b>Bridge H2H belum diaktifkan</b><span>Hubungkan endpoint saldo dan transaksi Pulsa24Jam di backend. Setelah itu sistem dapat mengecek saldo induk sebelum memotong Saldo Utama atau Saldo Kredit agent.</span></div>
      </section>}
      {showMainList && <div className="panel-header">
        <div><h2>{isRejectedArchive ? 'Riwayat Pengajuan Ditolak' : isOperator ? 'Berkas Siap Diperiksa' : 'Pengajuan Masuk'}</h2><p>{isRejectedArchive ? 'Setiap keputusan menyimpan alasan penolakan agar mudah ditinjau kembali dan dijelaskan kepada agent.' : isMarketing ? 'Tugas marketing: daftarkan dan dampingi agent, lengkapi selfie pertemuan, serta tangani pelunasan offline.' : isOperator ? 'Tugas operator: cek seluruh data, tanda tangan, lalu terima atau tolak.' : 'Pantau seluruh alur pengajuan kredit agent dari satu panel.'}</p></div>
        <span className="review-role-badge">{isMarketing ? 'MARKETING' : isOperator ? 'OPERATOR' : 'ADMIN'}</span>
      </div>}
      {showCreateArea && <section className={`credit-create-box ${view === 'input' ? 'focus' : ''}`}>
        <button type="button" className="credit-create-toggle" onClick={() => setShowCreate(value => !value)}><PlusCircle/>{showCreate ? 'Tutup Form Peminjaman' : 'Input Peminjaman'}</button>
        {manualMessage && <p>{manualMessage}</p>}
        {showCreate && <form onSubmit={createManual}>
          <label>Nama Agent<input name="agentName" value={manualForm.agentName} onChange={updateManual} placeholder="Nama lengkap agent"/></label>
          <label>Nama Toko<input name="storeName" value={manualForm.storeName} onChange={updateManual} placeholder="Nama toko/usaha"/></label>
          <label>NIK<input name="nik" value={manualForm.nik} onChange={updateManual} inputMode="numeric" maxLength="16" placeholder="16 digit NIK"/></label>
          <label>Nomor WA<input name="whatsapp" value={manualForm.whatsapp} onChange={updateManual} inputMode="tel" placeholder="08xxxxxxxxxx"/></label>
          <label>Email<input name="email" value={manualForm.email} onChange={updateManual} type="email" placeholder="Opsional"/></label>
          <label>Transaksi/Bulan<input name="monthlyTransactions" value={manualForm.monthlyTransactions} onChange={updateManual} inputMode="numeric" placeholder="Contoh: 150"/></label>
          <label>Nominal Kredit Diajukan<input name="amount" value={manualForm.amount} onChange={updateManual} inputMode="numeric" placeholder="500000"/></label>
          <label>Kontak Keluarga<input name="familyName" value={manualForm.familyName} onChange={updateManual} placeholder="Nama keluarga"/></label>
          <label>Hubungan<input name="familyRelation" value={manualForm.familyRelation} onChange={updateManual} placeholder="Orang tua / saudara"/></label>
          <label>WA Keluarga<input name="familyWhatsapp" value={manualForm.familyWhatsapp} onChange={updateManual} inputMode="tel" placeholder="08xxxxxxxxxx"/></label>
          <label className="wide">Alamat Rumah<textarea name="homeAddress" value={manualForm.homeAddress} onChange={updateManual} placeholder="Alamat rumah"/></label>
          <label className="wide">Alamat Toko<textarea name="storeAddress" value={manualForm.storeAddress} onChange={updateManual} placeholder="Alamat toko/usaha"/></label>
          <fieldset className="marketing-document-upload wide"><legend>Dokumen Peminjam</legend><p>Ketuk kartu untuk membuka kamera. Foto harus diambil langsung saat kunjungan, jelas, dan tidak terpotong.</p><div>{coreDocumentTypes.map(doc => <article role="button" tabIndex="0" key={doc.key} className={manualDocuments[doc.key] ? 'uploaded' : ''} onClick={() => setManualDocumentChoice(doc.key)} onKeyDown={event => event.key === 'Enter' && setManualDocumentChoice(doc.key)}><i>{manualDocuments[doc.key] ? <CheckCircle2/> : <Camera/>}</i><span><b>{doc.label}</b><small>{manualDocuments[doc.key]?.name || doc.hint}</small></span><strong>{manualDocuments[doc.key] ? 'Siap dicek' : 'Buka kamera'}</strong></article>)}</div></fieldset>
          <button type="submit"><PlusCircle/>Simpan Pengajuan</button>
        </form>}
      </section>}
      {showCreate && manualDocumentChoice && <section className="marketing-document-choice" onMouseDown={event => event.target === event.currentTarget && setManualDocumentChoice('')}><div><header><div><span>AMBIL DOKUMEN</span><h3>{coreDocumentTypes.find(doc => doc.key === manualDocumentChoice)?.label}</h3><p>Kamera akan dibuka untuk mengambil foto langsung.</p></div><button type="button" onClick={() => setManualDocumentChoice('')}><X/></button></header><div className="marketing-document-choice-actions one-action"><label><Camera/><b>Buka Kamera</b><small>Foto langsung saat pendampingan</small><input type="file" accept="image/*" capture={manualDocumentChoice === 'selfieMarketing' ? 'user' : 'environment'} onChange={event => {chooseManualDocument(manualDocumentChoice, event); setManualDocumentChoice('')}}/></label></div></div></section>}
      {(isMarketing || isAdmin) && view === 'input' && <section className="marketing-input-history">
        <header><ClipboardCheck/><div><span>RIWAYAT INPUT MARKETING</span><h2>Data yang baru ditambahkan</h2><p>Supaya marketing bisa cepat cek ulang data input peminjaman tanpa masuk daftar besar.</p></div></header>
        <div>{recentManual.length ? recentManual.map(item => <button type="button" key={item.id} onClick={() => goToView('verifikasi', item.id, 'Review')}>
          <span><b>{item.form.agentName || item.userName}</b><small>{item.form.storeName || item.id} · {dateTime(item.createdAt)}</small></span>
          <strong>{rupiah(item.form.amount)}</strong>
        </button>) : <p>Belum ada input peminjaman dari marketing.</p>}</div>
      </section>}
      {showMainList && <>{(view === 'verifikasi' || operatorTableMode) && <div className="credit-review-tools">
        <label><Search/><input value={query} onChange={event => {setQuery(event.target.value); setListPage(1)}} placeholder="Cari nama agent, toko, WA, NIK, atau ID pengajuan"/></label>
        <div><Filter/>{filters.map(name => <button type="button" className={filter === name ? 'active' : ''} onClick={() => {setFilter(name); setListPage(1)}} key={name}>{name}</button>)}</div>
      </div>}
      {items.length === 0 ? <div className="credit-review-empty"><ShieldCheck/><strong>Belum ada pengajuan</strong><span>Pengajuan kredit saldo dari aplikasi agent akan tampil di sini.</span></div> : visibleItems.length === 0 ? <div className="credit-review-empty"><Search/><strong>Data tidak ditemukan</strong><span>Coba ubah kata pencarian atau filter status.</span></div> : operatorTableMode ? <section className="operator-queue-table">
        <header>
          <div><span>ANTREAN KERJA OPERATOR</span><h3>Daftar pengajuan kredit agent</h3><p>Gunakan filter, lalu buka detail hanya untuk berkas yang akan diperiksa.</p></div>
          <b>{visibleItems.length} data</b>
        </header>
        <div className="operator-table-scroll">
          <table>
            <thead><tr><th>No</th><th>Waktu</th><th>Agent / Toko</th><th>Nominal</th><th>Limit</th><th>Sisa kredit</th><th>Status</th><th>Aksi</th></tr></thead>
            <tbody>{pagedItems.map((item, index) => {
              const profile = creditProfile(items, item)
              const requestedAmount = Number(item.creditOriginalAmount || item.form.amount || 0)
              const outstandingAmount = Number(item.creditOutstanding ?? item.creditBalance ?? requestedAmount)
              const signed = Boolean(item.analisSignature)
              const statusLabel = item.status === 'Menunggu keputusan operator' ? (signed ? 'Siap diputuskan' : 'Menunggu TTD') : item.status
              return <tr key={item.id}>
                <td>{listStart + index + 1}</td>
                <td><small>{dateTime(item.updatedAt || item.createdAt)}</small></td>
                <td><b>{item.form.agentName || item.userName || 'Agent KuotaKita'}</b><small>{item.form.storeName || '-'} · {item.form.whatsapp || '-'}</small></td>
                <td><strong>{rupiah(requestedAmount)}</strong></td>
                <td>{rupiah(profile.limit)}</td>
                <td>{rupiah(outstandingAmount)}</td>
                <td><span className={`operator-status ${signed ? 'ready' : 'waiting'}`}>{statusLabel}</span></td>
                <td>
                  <div className="operator-row-actions">
                    <button type="button" className="detail" onClick={() => goToView('detail', item.id, filter)}><Eye/>Cek detail</button>
                    <button type="button" className="print" onClick={() => printApplication(item)}><Printer/>Cetak</button>
                    {(item.status === 'Disetujui' || item.agentAccessStatus === 'suspended') && <button type="button" className={item.agentAccessStatus === 'suspended' ? 'restore' : 'suspend'} onClick={() => setAgentAccess(item, item.agentAccessStatus !== 'suspended')}><Ban/>{item.agentAccessStatus === 'suspended' ? 'Aktifkan' : 'Hentikan'}</button>}
                  </div>
                </td>
              </tr>
            })}</tbody>
          </table>
        </div>
        {visibleItems.length > listPageSize && <nav className="credit-list-pagination" aria-label="Halaman antrean operator">
          <span>Menampilkan <b>{listStart + 1}-{Math.min(listStart + listPageSize, visibleItems.length)}</b> dari <b>{visibleItems.length}</b> pengajuan</span>
          <div><button type="button" disabled={safeListPage === 1} onClick={() => {setListPage(page => Math.max(1, page - 1)); window.scrollTo({top: 0, behavior: 'smooth'})}} aria-label="Halaman sebelumnya">‹</button><strong>{safeListPage} / {listPageCount}</strong><button type="button" disabled={safeListPage === listPageCount} onClick={() => {setListPage(page => Math.min(listPageCount, page + 1)); window.scrollTo({top: 0, behavior: 'smooth'})}} aria-label="Halaman berikutnya">›</button></div>
        </nav>}
      </section> : <div className="credit-review-list">
        {pagedItems.map(item => {
          const done = finalStatus.includes(item.status)
          const operatorSigned = Boolean(item.operatorSignature || item.analisSignature)
          const pay = paymentSummary(item)
          const profile = creditProfile(items, item)
          const requestedAmount = Number(item.creditOriginalAmount || item.form.amount || 0)
          const outstandingAmount = Number(item.creditOutstanding ?? item.creditBalance ?? requestedAmount)
          const score = dataScore(item)
          const readiness = marketingReadiness(item)
          const analysis = analystReadiness(item)
          const expanded = expandedId === item.id
          const meetingSelfieReady = readiness.meetingReady
          const canOperatorSign = !done && item.status === 'Menunggu keputusan operator' && analysis.ready && !operatorSigned && (isOperator || isAdmin)
          const canApprove = !done && operatorSigned && analysis.ready && (isOperator || isAdmin)
          const canReject = !done && (isAdmin || (isOperator && operatorSigned && Boolean(decisionNote.trim())))
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
                <span><Clock3/>{item.status === 'Menunggu keputusan operator' ? 'Menunggu keputusan operator' : 'Menunggu verifikasi marketing'}</span>
                <button type="button" className="detail" onClick={() => expanded ? closeDetailView() : goToView('detail', item.id, filter)}><Eye/>{expanded ? 'Tutup' : 'Detail'}</button>
                {expanded && (isMarketing || isAdmin) && score.percent < 100 && <span className="meeting-required"><AlertCircle/>Lengkapi data dan tiga dokumen inti oleh marketing</span>}
                {expanded && (isMarketing || isAdmin) && score.percent === 100 && !meetingSelfieReady && <span className="meeting-required"><Camera/>Ambil selfie pertemuan bersama agent</span>}
                {expanded && (isMarketing || isAdmin) && readiness.readyForAnalysis && item.status !== 'Menunggu keputusan operator' && <button type="button" className="approve" onClick={() => forwardToOperator(item)}><ArrowRight/>Kirim ke Operator</button>}
                {expanded && canOperatorSign && <button type="button" className="sign" onClick={() => openSignature(item, 'operator')}><PenLine/>TTD Operator</button>}
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
                <h4>Ringkasan Saldo Kredit</h4>
                <div><span><small>Nominal diajukan</small><b>{rupiah(requestedAmount)}</b></span><span><small>Limit efektif</small><b>{rupiah(profile.limit)}</b></span><span><small>Sisa saldo kredit</small><b>{rupiah(outstandingAmount)}</b></span></div>
                <p>Marketing mendampingi dan mengambil selfie pertemuan. Operator memeriksa kelayakan serta menetapkan keputusan akhir.</p>
              </div>}
              {isDetail && (isOperator || isAdmin) && <div className="credit-detail-block operator-control-block">
                <header><div><span>KONTROL OPERATOR</span><h4>Limit dan akses agent</h4></div><b className={item.agentAccessStatus === 'suspended' ? 'suspended' : 'active'}>{item.agentAccessStatus === 'suspended' ? 'AKSES DIHENTIKAN' : 'AKSES AKTIF'}</b></header>
                <div className="operator-credit-snapshot"><span><small>Limit otomatis</small><b>{rupiah(profile.automatic.limit)}</b><em>{profile.automatic.name}</em></span><span><small>Limit efektif</small><b>{rupiah(profile.limit)}</b><em>{profile.source}</em></span><span><small>Sisa saldo kredit</small><b>{rupiah(outstandingAmount)}</b><em>{item.paymentStatus === 'Lunas' ? 'Lunas' : 'Berjalan'}</em></span></div>
                <div className="operator-limit-editor"><label><span>Limit manual</span><input inputMode="numeric" value={operatorDrafts[item.id] ?? String(profile.limit)} onChange={event => setOperatorDrafts(current => ({...current, [item.id]: event.target.value.replace(/\D/g, '')}))}/></label><button type="button" onClick={() => saveOperatorLimit(item)}><CheckCircle2/>Simpan limit</button></div>
                <p>Limit otomatis tetap mengikuti riwayat pelunasan. Penyesuaian manual operator tidak menghapus riwayat tersebut.</p>
                {operatorMessage && <output className="operator-feedback" aria-live="polite">{operatorMessage}</output>}
              </div>}
              {isDetail && (isOperator || isAdmin) && (() => {
                const analysis = analystReadiness(item)
                const isWaitingDecision = item.status === 'Menunggu keputusan operator'
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
                <div>{manualDocumentTypes.map(doc => { const value = item.documents?.[doc.key]; const file = typeof value === 'string' ? {name: value} : value || {}; const source = file.dataUrl || file.preview || ''; const missing = !source; return <figure key={doc.key}>{source ? <img src={source} alt={doc.label}/> : missing && (isMarketing || isAdmin) ? <label className="missing-document meeting-upload"><Camera/><b>{doc.key === 'selfieMarketing' ? 'Ambil selfie bersama agent' : `Ambil ${doc.label}`}</b><small>Diunggah Marketing saat pendampingan</small><input type="file" accept="image/*" capture={doc.key === 'selfieMarketing' ? 'user' : 'environment'} onChange={event => replaceBorrowerDocument(item, doc.key, event)}/></label> : <label className="missing-document"><Images/><b>Dokumen belum diunggah</b><small>Menunggu Marketing melengkapi foto</small></label>}<figcaption><b>{doc.label}</b><small>{file.name || 'Menunggu unggahan Marketing'}</small></figcaption></figure> })}</div>
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
                    <span><b>{row.label}</b><small>{row.paid ? `Lunas ${dateTime(row.paid.paidAt)}` : row.dueAt ? `Pelunasan penuh · jatuh tempo ${dateTime(row.dueAt)}` : 'Bayar satu kali penuh sesuai saldo kredit'}</small></span>
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
