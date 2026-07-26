import {useEffect, useRef, useState} from 'react'
import {useSearchParams} from 'react-router-dom'
import {AlertCircle, ArrowRight, Banknote, BarChart3, CalendarDays, Check, CheckCircle2, CircleHelp, ClipboardCheck, Clock3, CreditCard, Eye, Filter, Landmark, PenLine, PhoneCall, PlusCircle, QrCode, Search, ShieldCheck, Stamp, Trash2, UserCheck, WalletCards, X, XCircle} from 'lucide-react'
import {QRCodeSVG} from 'qrcode.react'
import PageHeader from '../components/common/PageHeader'
import {useAuth} from '../context/AuthContext'
import {rupiah} from '../utils/currency'
import {request} from '../services/http'

const allKey = 'kuotakita_agent_credit_all'
const userKey = userId => `kuotakita_agent_credit_${userId || 'guest'}`
const finalStatus = ['Disetujui', 'Ditolak']
const paymentSteps = [
  {label: 'Cicilan 1', day: 7, portion: 0.25},
  {label: 'Cicilan 2', day: 14, portion: 0.25},
  {label: 'Cicilan 3', day: 21, portion: 0.25},
  {label: 'Pelunasan', day: 30, portion: 0.25},
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
        if (item?.id && !merged.has(item.id)) merged.set(item.id, {...item, userId: item.userId || userId})
      })
    }
  } catch {/* abaikan data lokal yang rusak */}
  const list = [...merged.values()].sort((a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt))
  if (list.length) localStorage.setItem(allKey, JSON.stringify(list.slice(0, 50)))
  return list
}

function saveApplication(target, changes) {
  const next = {...target, ...changes, updatedAt: new Date().toISOString()}
  const all = readAll()
  localStorage.setItem(allKey, JSON.stringify([next, ...all.filter(item => item.id !== target.id)].slice(0, 50)))
  const own = JSON.parse(localStorage.getItem(userKey(target.userId)) || '[]')
  localStorage.setItem(userKey(target.userId), JSON.stringify([next, ...own.filter(item => item.id !== target.id)].slice(0, 10)))
  request(`/agent-credit/applications/${encodeURIComponent(target.id)}`, {method: 'PUT', body: JSON.stringify(next)}).catch(() => {})
  return next
}

const reviewerName = user => user?.name || (user?.role === 'analis' ? 'Analis KuotaKita' : 'Marketing KuotaKita')
const stampPayload = (user, image) => ({name: reviewerName(user), role: user?.role || 'reviewer', at: new Date().toISOString(), image})
const dateTime = iso => iso ? new Date(iso).toLocaleString('id-ID', {day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'}) : 'Belum tanda tangan'
const paymentRows = item => {
  const paidRows = item.repayments || []
  return paymentSteps.map((step, index) => {
    const key = `${item.id}-${index}`
    const paid = paidRows.find(row => row.key === key)
    return {
      ...step,
      key,
      paid,
      amount: Math.ceil(Number(item.form.amount || 0) * step.portion),
      due: new Date(new Date(item.createdAt).getTime() + step.day * 86400000),
    }
  })
}
const paymentSummary = item => {
  const rows = paymentRows(item)
  const paid = rows.filter(row => row.paid).length
  const totalPaid = rows.reduce((sum, row) => sum + (row.paid ? row.amount : 0), 0)
  return {paid, total: rows.length, percent: rows.length ? Math.round((paid / rows.length) * 100) : 0, totalPaid}
}
const statusGroup = item => item.paymentStatus === 'Lunas' ? 'Lunas' : item.status === 'Disetujui' ? 'Disetujui' : item.status === 'Ditolak' ? 'Ditolak' : 'Review'
const firstUnpaidRow = item => paymentRows(item).find(row => !row.paid)
const viewInfo = {
  overview: {label: 'Ringkasan Kredit', title: 'Dashboard kredit agent', desc: 'Pantau semua pengajuan, verifikasi, pembayaran, dan status peminjam dari satu halaman.'},
  peminjam: {label: 'Data Peminjam', title: 'Seluruh peminjam agent', desc: 'Lihat semua peminjam, status ACC/tolak, nominal pinjaman, dan progres angsuran mereka.'},
  input: {label: 'Input Peminjaman', title: 'Tambah peminjaman baru', desc: 'Isi data agent yang mengajukan lewat marketing. Setelah disimpan, data masuk antrean verifikasi.'},
  verifikasi: {label: 'Antrean Verifikasi', title: 'Cek pengajuan yang belum diverifikasi', desc: 'Fokus ke data yang masih butuh cek marketing, tanda tangan, atau keputusan awal.'},
  pembayaran: {label: 'Angsuran & Lunas', title: 'Pembayaran dan cicilan aktif', desc: 'Fokus ke pinjaman yang sudah ACC. Marketing bisa mencatat cicilan dari tombol detail.'},
  angsuran: {label: 'Angsuran & Lunas', title: 'Monitor angsuran peminjam', desc: 'Lihat siapa saja yang sudah bayar, berapa cicilan yang lunas, sisa tagihan, dan catat pembayaran berikutnya.'},
  laporan: {label: 'Laporan Kredit', title: 'Rekap kinerja kredit', desc: 'Lihat total nominal pinjaman, pembayaran masuk, sisa tagihan, dan status seluruh peminjam.'},
  panduan: {label: 'Panduan Marketing', title: 'Panduan kerja marketing', desc: 'Ikuti alur input, verifikasi, tanda tangan, dan pencatatan cicilan supaya data rapi.'},
}
const dataScore = item => {
  const checks = [
    {label: 'Nama agent', ok: Boolean(item.form.agentName || item.userName)},
    {label: 'Nomor WA', ok: Boolean(item.form.whatsapp)},
    {label: 'NIK', ok: String(item.form.nik || '').length >= 12},
    {label: 'Alamat toko', ok: Boolean(item.form.storeAddress || item.form.homeAddress)},
    {label: 'Kontak keluarga', ok: Boolean(item.form.familyName && item.form.familyWhatsapp)},
    {label: 'Dokumen/foto', ok: Object.values(item.documents || {}).length > 0 || item.source === 'marketing'},
  ]
  const done = checks.filter(check => check.ok).length
  return {checks, done, total: checks.length, percent: Math.round((done / checks.length) * 100)}
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
  const [items, setItems] = useState(readAll)
  const [signaturePad, setSignaturePad] = useState(null)
  const [signatureDrawn, setSignatureDrawn] = useState(false)
  const [query, setQuery] = useState('')
  const [borrowerQuery, setBorrowerQuery] = useState('')
  const [borrowerFilter, setBorrowerFilter] = useState('Semua')
  const [filter, setFilter] = useState('Semua')
  const [expandedId, setExpandedId] = useState('')
  const [showCreate, setShowCreate] = useState(false)
  const [manualForm, setManualForm] = useState(manualInitial)
  const [manualMessage, setManualMessage] = useState('')
  const [paymentTarget, setPaymentTarget] = useState(null)
  const [paymentMethod, setPaymentMethod] = useState('')
  const isMarketing = user?.role === 'marketing'
  const isAnalis = user?.role === 'analis'
  const isAdmin = ['master', 'admin'].includes(user?.role)
  const view = params.get('view') || 'overview'
  const isDetail = view === 'detail'
  const isInstallmentDetail = view === 'angsuran-detail'
  const isStandaloneDetail = isDetail || isInstallmentDetail
  const goToView = (nextView, id = '', nextFilter = '') => setSearchParams(nextView ? {view: nextView, ...(id ? {id} : {}), ...(nextFilter ? {filter: nextFilter} : {})} : {})
  const refresh = () => setItems(readAll())
  const refreshRemote = () => request('/agent-credit/applications').then(remote => {
    if (!Array.isArray(remote)) return
    const local = readAll()
    const merged = [...remote, ...local.filter(item => !remote.some(row => row.id === item.id))]
    localStorage.setItem(allKey, JSON.stringify(merged.slice(0, 50)))
    merged.forEach(item => {
      if (!item.userId) return
      const own = JSON.parse(localStorage.getItem(userKey(item.userId)) || '[]')
      localStorage.setItem(userKey(item.userId), JSON.stringify([item, ...own.filter(row => row.id !== item.id)].slice(0, 10)))
    })
    setItems(readAll())
  }).catch(() => refresh())

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
    if (view === 'pembayaran' || view === 'angsuran') {
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
  const signMarketing = (item, image) => {
    saveApplication(item, {marketingSignature: stampPayload({...user, role: 'marketing'}, image), status: 'Siap dikirim ke analis'})
    refresh()
  }
  const forwardToAnalis = item => {
    if ((!isMarketing && !isAdmin) || !item.marketingSignature || item.status !== 'Siap dikirim ke analis') return
    saveApplication(item, {status: 'Menunggu analis', forwardedAt: new Date().toISOString()})
    refresh()
  }
  const signAnalis = (item, image) => {
    saveApplication(item, {analisSignature: stampPayload({...user, role: 'analis'}, image), status: 'Menunggu ACC analis'})
    refresh()
  }
  const decide = (item, status) => {
    const changes = {status, decidedAt: new Date().toISOString()}
    saveApplication(item, changes)
    refresh()
  }
  const createManual = event => {
    event.preventDefault()
    if (!isMarketing && !isAdmin) return
    if (!manualForm.agentName.trim() || !manualForm.storeName.trim() || !manualForm.whatsapp.trim() || !manualForm.amount) {
      return setManualMessage('Lengkapi nama agent, toko, WA, dan nominal pinjaman dulu.')
    }
    const amount = Math.min(5000000, Math.max(50000, Number(String(manualForm.amount).replace(/\D/g, '') || 0)))
    const application = {
      id: `KSA-${Date.now().toString().slice(-8)}`,
      status: 'Sedang diverifikasi marketing',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      verifyUntil: Date.now(),
      source: 'marketing',
      userId: `manual-${Date.now()}`,
      userName: manualForm.agentName.trim(),
      paymentStatus: 'Belum ada pembayaran',
      form: {...manualForm, amount},
      documents: {},
      repayments: [],
      createdBy: {role: user.role, name: reviewerName(user), at: new Date().toISOString()},
    }
    const all = readAll()
    localStorage.setItem(allKey, JSON.stringify([application, ...all].slice(0, 50)))
    localStorage.setItem(userKey(application.userId), JSON.stringify([application]))
    request('/me/agent-credit', {method: 'POST', body: JSON.stringify(application)}).catch(() => {})
    setManualForm(manualInitial)
    setManualMessage('Peminjam berhasil ditambahkan. Marketing bisa verifikasi dan tanda tangan.')
    setShowCreate(false)
    setExpandedId(application.id)
    refresh()
  }
  const updateManual = event => setManualForm({...manualForm, [event.target.name]: event.target.name === 'amount' ? event.target.value.replace(/\D/g, '').slice(0, 8) : event.target.value})
  const markPayment = (item, row) => {
    if ((!isMarketing && !isAdmin) || row.paid || item.status !== 'Disetujui') return
    const repayments = [{key: row.key, applicationId: item.id, label: row.label, amount: row.amount, status: 'Lunas', paidAt: new Date().toISOString(), receivedBy: reviewerName(user)}, ...(item.repayments || []).filter(pay => pay.key !== row.key)]
    const paymentStatus = repayments.length >= paymentSteps.length ? 'Lunas' : `Terbayar ${repayments.length}/${paymentSteps.length}`
    saveApplication(item, {repayments, paymentStatus})
    refresh()
    setPaymentTarget(null)
    setPaymentMethod('')
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
    if (signaturePad.role === 'marketing') signMarketing(signaturePad.item, image)
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
    return matchDetail && matchQuery && matchFilter
  })
  const summary = {
    total: items.length,
    review: items.filter(item => statusGroup(item) === 'Review').length,
    approved: items.filter(item => statusGroup(item) === 'Disetujui').length,
    paid: items.filter(item => statusGroup(item) === 'Lunas').length,
  }
  const marketingQueue = sortedItems.filter(item => !finalStatus.includes(item.status) && !item.marketingSignature)
  const approvedActive = sortedItems.filter(item => item.status === 'Disetujui' && item.paymentStatus !== 'Lunas')
  const duePayments = approvedActive.filter(item => {
    const next = firstUnpaidRow(item)
    return next && next.due.getTime() <= Date.now() + 3 * 86400000
  })
  const borrowerRows = sortedItems.map(item => ({item, pay: paymentSummary(item), next: firstUnpaidRow(item), score: dataScore(item)}))
  const directoryRows = borrowerRows.filter(({item}) => {
    const text = `${item.form.agentName || item.userName} ${item.form.storeName} ${item.form.whatsapp} ${item.id}`.toLowerCase()
    return text.includes(borrowerQuery.toLowerCase().trim()) && (borrowerFilter === 'Semua' || statusGroup(item) === borrowerFilter)
  })
  const installmentRows = borrowerRows.filter(row => row.item.status === 'Disetujui' || row.item.paymentStatus === 'Lunas')
  const marketingCards = [
    {title: 'Perlu Verifikasi', value: marketingQueue.length, note: 'Belum TTD marketing', icon: ClipboardCheck},
    {title: 'Tagihan Dekat', value: duePayments.length, note: 'Jatuh tempo <= 3 hari', icon: AlertCircle},
    {title: 'Pinjaman Aktif', value: approvedActive.length, note: 'Sudah ACC belum lunas', icon: CreditCard},
  ]
  const activeView = viewInfo[view] || viewInfo.overview
  const totalLoan = items.reduce((sum, item) => sum + Number(item.form.amount || 0), 0)
  const totalPaidAmount = items.reduce((sum, item) => sum + paymentSummary(item).totalPaid, 0)
  const remainingLoan = Math.max(0, totalLoan - totalPaidAmount)
  const recentManual = sortedItems.filter(item => item.source === 'marketing').slice(0, 5)
  const incompleteData = sortedItems.filter(item => !finalStatus.includes(item.status) && dataScore(item).percent < 100)
  const paymentToday = approvedActive.filter(item => {
    const next = firstUnpaidRow(item)
    return next && next.due.toDateString() === new Date().toDateString()
  })
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
    {!isStandaloneDetail && <PageHeader eyebrow="Pihak Atas" title="Review Kredit Saldo Agent" description="Marketing verifikasi dan tanda tangan dulu, lalu analis memberi keputusan akhir."/>}
    <section className={`panel credit-review-panel ${isStandaloneDetail ? 'detail-mode' : ''}`}>
      {view === 'overview' && <div className="credit-review-hero">
        <div>
          <span>RUANG DATA PEMINJAM</span>
          <h2>Monitoring Kredit Agent</h2>
          <p>Semua pengajuan tersusun rapi dari yang terbaru. Marketing, analis, dan admin bisa cek data agent, tanda tangan, keputusan, sampai pembayaran.</p>
        </div>
        <i><WalletCards/></i>
      </div>}
      {view === 'overview' && <div className="credit-review-stats">
        <article><span>Total Peminjam</span><strong>{summary.total}</strong><small>Seluruh pengajuan</small></article>
        <article><span>Butuh Review</span><strong>{summary.review}</strong><small>Menunggu pihak atas</small></article>
        <article><span>Sudah ACC</span><strong>{summary.approved}</strong><small>Aktif dipantau</small></article>
        <article><span>Lunas</span><strong>{summary.paid}</strong><small>Pembayaran selesai</small></article>
      </div>}
      <section className={`credit-mode-panel view-${view}`}>
        <span>{activeView.label}</span>
        <h2>{activeView.title}</h2>
        <p>{activeView.desc}</p>
      </section>
      {(isMarketing || isAdmin) && view === 'overview' && <section className="marketing-workspace">
        <header>
          <div><span>MEJA KERJA MARKETING</span><h2>Kontrol Verifikasi & Cicilan</h2><p>Kerjakan yang paling penting dulu. Setiap tombol di bawah langsung membuka daftar yang sesuai, jadi marketing tidak perlu mencari manual.</p></div>
        </header>
        <div className="marketing-task-grid">
          {marketingCards.map(({title, value, note, icon: Icon}) => <article key={title}><i><Icon/></i><span>{title}</span><strong>{value}</strong><small>{note}</small></article>)}
        </div>
        <div className="marketing-section-label"><span>AKSI UTAMA</span><small>Pilih pekerjaan yang ingin diselesaikan sekarang</small></div>
        <div className="marketing-quick-actions" aria-label="Aksi cepat marketing">
          <button type="button" className="primary" onClick={() => goToView('verifikasi')}><ClipboardCheck/><span><b>Mulai verifikasi</b><small>{marketingQueue.length ? `${marketingQueue.length} pengajuan menunggu` : 'Antrean sedang kosong'}</small></span><strong>→</strong></button>
          <button type="button" onClick={() => goToView('angsuran')}><Banknote/><span><b>Cek angsuran</b><small>{paymentToday.length ? `${paymentToday.length} jatuh tempo hari ini` : `${approvedActive.length} pinjaman aktif`}</small></span><strong>→</strong></button>
          <button type="button" onClick={() => goToView('peminjam')}><UserCheck/><span><b>Direktori peminjam</b><small>{incompleteData.length ? `${incompleteData.length} data belum lengkap` : 'Semua data lengkap'}</small></span><strong>→</strong></button>
          <button type="button" onClick={() => goToView('laporan')}><BarChart3/><span><b>Lihat laporan</b><small>Rekap pinjaman dan pembayaran</small></span><strong>→</strong></button>
        </div>
        <div className="marketing-section-label focus-label"><span>PEKERJAAN TERDEKAT</span><small>Daftar yang membutuhkan perhatian lebih dulu</small></div>
        <div className="marketing-focus-grid">
          <div>
            <h3>Antrean Verifikasi</h3>
            {marketingQueue.slice(0, 4).length ? marketingQueue.slice(0, 4).map(item => <button type="button" key={item.id} onClick={() => goToView('verifikasi', item.id, 'Review')}>
              <span><b>{item.form.agentName || item.userName}</b><small>{item.form.storeName || item.id}</small></span>
              <strong>{rupiah(item.form.amount)}</strong>
            </button>) : <p>Belum ada antrean verifikasi marketing.</p>}
          </div>
          <div>
            <h3>Pembayaran Perlu Dicek</h3>
            {duePayments.slice(0, 4).length ? duePayments.slice(0, 4).map(item => {
              const due = firstUnpaidRow(item)
              return <button type="button" key={item.id} onClick={() => goToView('verifikasi', item.id, 'Disetujui')}>
                <span><b>{item.form.agentName || item.userName}</b><small>{due.label} · {due.due.toLocaleDateString('id-ID', {day: '2-digit', month: 'short'})}</small></span>
                <strong>{rupiah(due.amount)}</strong>
              </button>
            }) : <p>Belum ada cicilan jatuh tempo dekat.</p>}
          </div>
        </div>
      </section>}
      {(isMarketing || isAdmin) && view === 'verifikasi' && <section className="marketing-action-panel">
        <header><ClipboardCheck/><div><span>FOKUS VERIFIKASI</span><h2>{marketingQueue.length} pengajuan perlu dicek</h2><p>Data di bawah otomatis difilter ke status review. Buka detail untuk cek checklist, hubungi WA, lalu tanda tangan marketing.</p></div></header>
      </section>}
      {(isMarketing || isAdmin) && view === 'peminjam' && <section className="borrower-directory-panel">
        <header><div><span>DIREKTORI PEMINJAM</span><h2>Data peminjam tersusun rapi</h2><p>Cari berdasarkan nama, toko, WA, atau ID. Pilih status untuk melihat kelompok tertentu tanpa membuka semua data sekaligus.</p></div><strong className="directory-total">{items.length}<small>Total data</small></strong></header>
        <div className="directory-stats">
          <article><b>{summary.review}</b><span>Perlu review</span></article><article><b>{summary.approved}</b><span>Aktif / ACC</span></article><article><b>{summary.paid}</b><span>Sudah lunas</span></article><article><b>{incompleteData.length}</b><span>Data belum lengkap</span></article>
        </div>
        <div className="directory-tools"><label><Search/><input value={borrowerQuery} onChange={event => setBorrowerQuery(event.target.value)} placeholder="Cari nama, toko, WA, atau ID..."/></label><div>{['Semua', 'Review', 'Disetujui', 'Lunas', 'Ditolak'].map(name => <button type="button" className={borrowerFilter === name ? 'active' : ''} onClick={() => setBorrowerFilter(name)} key={name}>{name}</button>)}</div></div>
        <div className="directory-list">
          {directoryRows.length ? directoryRows.map(({item, pay, score}) => <button type="button" key={item.id} onClick={() => goToView('verifikasi', item.id, 'Semua')}>
            <span><b>{item.form.agentName || item.userName}</b><small>{item.form.storeName || item.id} · {item.status}</small></span>
            <em><i style={{width: `${score.percent}%`}}/></em>
            <strong>{pay.paid}/{pay.total} cicilan</strong>
            <small>{rupiah(item.form.amount)}</small>
          </button>) : <p>Data peminjam tidak ditemukan.</p>}
        </div>
      </section>}
      {(isMarketing || isAdmin) && (view === 'pembayaran' || view === 'angsuran') && <section className="marketing-action-panel payment">
        <header><Banknote/><div><span>FOKUS ANGSURAN</span><h2>{approvedActive.length} pinjaman aktif</h2><p>Lihat angsuran setiap peminjam, berapa cicilan sudah lunas, sisa tagihan, dan catat pembayaran dari detail.</p></div></header>
        <div className="quick-payment-list">
          {installmentRows.slice(0, 8).map(({item, pay, next}) => {
            return <button type="button" key={item.id} onClick={() => goToView('angsuran-detail', item.id, 'Disetujui')}>
              <span><b>{item.form.agentName || item.userName}</b><small>{pay.paid}/{pay.total} lunas · {next ? `${next.label} ${next.due.toLocaleDateString('id-ID', {day: '2-digit', month: 'short'})}` : 'semua lunas'}</small></span>
              <strong>{next ? rupiah(next.amount) : 'Lunas'}</strong>
            </button>
          })}
          {!installmentRows.length && <p>Belum ada pinjaman ACC yang perlu dicatat cicilannya.</p>}
        </div>
      </section>}
      {(isMarketing || isAdmin) && view === 'laporan' && <>
        <section className="marketing-report-panel">
          <article><span>Total Pinjaman</span><strong>{rupiah(totalLoan)}</strong><small>Akumulasi nominal pengajuan</small></article>
          <article><span>Pembayaran Masuk</span><strong>{rupiah(totalPaidAmount)}</strong><small>Cicilan yang sudah dicatat</small></article>
          <article><span>Sisa Tagihan</span><strong>{rupiah(remainingLoan)}</strong><small>Estimasi belum dibayar</small></article>
          <article><span>Rasio Lunas</span><strong>{items.length ? Math.round((summary.paid / items.length) * 100) : 0}%</strong><small>Dari seluruh peminjam</small></article>
        </section>
        <section className="marketing-report-table">
          <header><div><span>LAPORAN DETAIL</span><h2>Rekap peminjam & pembayaran</h2><p>Data ini berguna buat kontrol tagihan, lihat sisa pembayaran, dan arsip kerja marketing.</p></div><button type="button" onClick={exportReport}><Banknote/>Export CSV</button></header>
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
          <li><b>Verifikasi data</b><small>Cek WA, NIK, alamat toko, kontak keluarga, dan dokumen sebelum tanda tangan.</small></li>
          <li><b>TTD marketing</b><small>Setelah yakin data layak, tanda tangan dari HP dan teruskan ke analis.</small></li>
          <li><b>Catat cicilan</b><small>Jika analis sudah ACC, marketing mencatat pembayaran cicilan yang masuk.</small></li>
        </ol>
      </section>}
      {showMainList && <div className="panel-header">
        <div><h2>Pengajuan Masuk</h2><p>{isMarketing ? 'Tugas marketing: cek data agent, tanda tangan, atau tolak jika data tidak layak.' : isAnalis ? 'Tugas analis: cek hasil marketing, tanda tangan, lalu ACC atau tolak.' : 'Pantau seluruh alur pengajuan kredit agent dari satu panel.'}</p></div>
        <span className="review-role-badge">{isMarketing ? 'MARKETING' : isAnalis ? 'ANALIS' : 'ADMIN'}</span>
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
          <button type="submit"><PlusCircle/>Simpan Peminjam</button>
        </form>}
      </section>}
      {(isMarketing || isAdmin) && view === 'input' && <section className="marketing-input-history">
        <header><ClipboardCheck/><div><span>RIWAYAT INPUT MARKETING</span><h2>Data yang baru ditambahkan</h2><p>Supaya marketing bisa cepat cek ulang data input peminjaman tanpa masuk daftar besar.</p></div></header>
        <div>{recentManual.length ? recentManual.map(item => <button type="button" key={item.id} onClick={() => goToView('verifikasi', item.id, 'Review')}>
          <span><b>{item.form.agentName || item.userName}</b><small>{item.form.storeName || item.id} · {dateTime(item.createdAt)}</small></span>
          <strong>{rupiah(item.form.amount)}</strong>
        </button>) : <p>Belum ada input peminjaman dari marketing.</p>}</div>
      </section>}
      {showMainList && <>{view === 'verifikasi' && <div className="credit-review-tools">
        <label><Search/><input value={query} onChange={event => setQuery(event.target.value)} placeholder="Cari nama agent, toko, WA, NIK, atau ID pengajuan"/></label>
        <div><Filter/>{filters.map(name => <button type="button" className={filter === name ? 'active' : ''} onClick={() => setFilter(name)} key={name}>{name}</button>)}</div>
      </div>}
      {items.length === 0 ? <div className="credit-review-empty"><ShieldCheck/><strong>Belum ada pengajuan</strong><span>Pengajuan kredit saldo dari aplikasi agent akan tampil di sini.</span></div> : visibleItems.length === 0 ? <div className="credit-review-empty"><Search/><strong>Data tidak ditemukan</strong><span>Coba ubah kata pencarian atau filter status.</span></div> : <div className="credit-review-list">
        {visibleItems.map(item => {
          const done = finalStatus.includes(item.status)
          const marketingSigned = Boolean(item.marketingSignature)
          const analisSigned = Boolean(item.analisSignature)
          const pay = paymentSummary(item)
          const score = dataScore(item)
          const expanded = expandedId === item.id
          const canMarketingSign = !done && !marketingSigned && (isMarketing || isAdmin)
          const canAnalisSign = !done && item.status === 'Menunggu analis' && marketingSigned && !analisSigned && (isAnalis || isAdmin)
          const canApprove = !done && marketingSigned && analisSigned && (isAnalis || isAdmin)
          const canReject = !done && (isMarketing || isAnalis || isAdmin)
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
              <div><CreditCard/><span><b>{item.paymentStatus || `${pay.paid}/${pay.total} cicilan`}</b><small>{rupiah(pay.totalPaid)} sudah dibayar</small></span></div>
              <strong>{pay.percent}%</strong>
              <em><i style={{width: `${pay.percent}%`}}/></em>
            </div>}
            {!isStandaloneDetail && expanded && <p className="credit-review-address">{item.form.homeAddress}</p>}
            {!isStandaloneDetail && expanded && <div className="credit-review-signatures">
              <SignatureStep title="Agent" note="Ditandatangani saat pengajuan dikirim" signed={{name: item.form.agentName || item.userName || 'Agent', at: item.createdAt}} icon={PenLine}/>
              <SignatureStep title="Marketing" note="Menunggu tanda tangan marketing" signed={item.marketingSignature} icon={UserCheck}/>
              <SignatureStep title="Analis" note="Menunggu tanda tangan analis" signed={item.analisSignature} icon={Stamp}/>
            </div>}
            <footer>
              {item.status === 'Disetujui' ? <><span className="approved"><CheckCircle2/>Sudah ACC analis</span><button type="button" className="detail" onClick={() => expanded ? goToView('verifikasi', '', filter) : goToView('detail', item.id, filter)}><Eye/>{expanded ? 'Tutup' : 'Detail'}</button></> : item.status === 'Ditolak' ? <><span className="rejected"><XCircle/>Ditolak pihak atas</span><button type="button" className="detail" onClick={() => expanded ? goToView('verifikasi', '', filter) : goToView('detail', item.id, filter)}><Eye/>{expanded ? 'Tutup' : 'Detail'}</button></> : <>
                <span><Clock3/>{item.status === 'Siap dikirim ke analis' ? 'Sudah TTD, siap dikirim ke analis' : marketingSigned ? 'Menunggu keputusan analis' : 'Menunggu verifikasi marketing'}</span>
                <button type="button" className="detail" onClick={() => expanded ? goToView('verifikasi', '', filter) : goToView('detail', item.id, filter)}><Eye/>{expanded ? 'Tutup' : 'Detail'}</button>
                {expanded && canMarketingSign && <button type="button" className="sign" onClick={() => openSignature(item, 'marketing')}><PenLine/>TTD Marketing</button>}
                {expanded && marketingSigned && item.status === 'Siap dikirim ke analis' && (isMarketing || isAdmin) && <button type="button" className="approve" onClick={() => forwardToAnalis(item)}><CheckCircle2/>Verifikasi &amp; Kirim ke Analis</button>}
                {expanded && canAnalisSign && <button type="button" className="sign" onClick={() => openSignature(item, 'analis')}><PenLine/>TTD Analis</button>}
                {expanded && canReject && <button type="button" className="reject" onClick={() => decide(item, 'Ditolak')}><XCircle/>Tolak</button>}
                {expanded && canApprove && <button type="button" className="approve" onClick={() => decide(item, 'Disetujui')}><CheckCircle2/>ACC</button>}
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
                  <span><dt>Alamat Toko</dt><dd>{item.form.storeAddress}</dd></span>
                  <span><dt>Keluarga</dt><dd>{item.form.familyName} · {item.form.familyRelation} · {item.form.familyWhatsapp}</dd></span>
                </dl>
              </div>
              {!isStandaloneDetail && <div className="credit-detail-block marketing-checklist">
                <h4>Checklist Marketing</h4>
                <div className="data-score"><strong>{score.percent}%</strong><span><i style={{width: `${score.percent}%`}}/></span></div>
                <ul>
                  {score.checks.map(check => <li className={check.ok ? 'ok' : ''} key={check.label}>{check.ok ? <CheckCircle2/> : <AlertCircle/>}<span>{check.label}</span></li>)}
                </ul>
                <a href={`https://wa.me/${String(item.form.whatsapp || '').replace(/\D/g, '').replace(/^0/, '62')}`} target="_blank" rel="noreferrer"><PhoneCall/>Hubungi via WhatsApp</a>
              </div>}
              {isInstallmentDetail && <div className="credit-detail-block installment-detail-block">
                <h4>Jalur Pembayaran</h4>
                <div className="credit-payment-list">
                  {paymentRows(item).map(row => <article className={row.paid ? 'paid' : ''} key={row.key}>
                    <i>{row.paid ? <CheckCircle2/> : <CalendarDays/>}</i>
                    <span><b>{row.label}</b><small>Jatuh tempo {row.due.toLocaleDateString('id-ID', {day: '2-digit', month: 'short', year: 'numeric'})}{row.paid ? ` · lunas ${dateTime(row.paid.paidAt)}` : ''}</small></span>
                    <strong>{rupiah(row.amount)}</strong>
                    {(isMarketing || isAdmin) && item.status === 'Disetujui' && <button type="button" disabled={Boolean(row.paid)} onClick={() => {setPaymentTarget({item, row}); setPaymentMethod('')}}><Banknote/>{row.paid ? 'Lunas' : 'Bayar Angsuran'}</button>}
                  </article>)}
                </div>
              </div>}
            </section>}
          </article>
        })}
      </div>}</>}
    </section>
    {paymentTarget && <section className="review-payment-backdrop" aria-label="Bayar angsuran">
      <div className="review-payment-sheet">
        <header><div><span>BAYAR ANGSURAN</span><h2>{paymentTarget.row.label}</h2><p>{paymentTarget.item.form.agentName || paymentTarget.item.userName}</p></div><button type="button" onClick={() => setPaymentTarget(null)} aria-label="Tutup"><X/></button></header>
        <div className="review-payment-amount"><small>Total yang harus dibayar</small><strong>{rupiah(paymentTarget.row.amount)}</strong></div>
        <div className="review-payment-methods">
          <button type="button" className={paymentMethod === 'bank' ? 'active' : ''} onClick={() => setPaymentMethod('bank')}><Landmark/><span><b>Transfer Bank</b><small>BCA · 1234567890 a.n. KuotaKita</small></span>{paymentMethod === 'bank' && <Check/>}</button>
          <button type="button" className={paymentMethod === 'qris' ? 'active' : ''} onClick={() => setPaymentMethod('qris')}><QrCode/><span><b>QRIS / Barcode</b><small>Nominal otomatis sesuai angsuran</small></span>{paymentMethod === 'qris' && <Check/>}</button>
        </div>
        {paymentMethod === 'bank' && <div className="review-bank-detail"><span>Transfer tepat sebesar</span><strong>{rupiah(paymentTarget.row.amount)}</strong><small>Kode referensi: {paymentTarget.row.key.toUpperCase()}</small></div>}
        {paymentMethod === 'qris' && <div className="review-qr-detail"><QRCodeSVG value={`https://kuotakita-app.pages.dev/pay?ref=${encodeURIComponent(paymentTarget.row.key)}&amount=${paymentTarget.row.amount}`} size={210} level="H" includeMargin/><strong>{rupiah(paymentTarget.row.amount)}</strong><small>QR dibuat khusus untuk cicilan ini.</small></div>}
        <button type="button" className="review-payment-confirm" disabled={!paymentMethod} onClick={() => markPayment(paymentTarget.item, paymentTarget.row)}>Konfirmasi Pembayaran <ArrowRight/></button>
      </div>
    </section>}
    {signaturePad && <section className="review-signature-backdrop" aria-label="Tanda tangan reviewer">
      <div className="review-signature-sheet">
        <header>
          <button type="button" onClick={closeSignature} aria-label="Tutup"><X/></button>
          <div><span>{signaturePad.role === 'marketing' ? 'Tanda Tangan Marketing' : 'Tanda Tangan Analis'}</span><strong>{signaturePad.item.form.agentName || signaturePad.item.userName}</strong></div>
          <b>{signaturePad.role === 'marketing' ? 'MARKETING' : 'ANALIS'}</b>
        </header>
        <div className="review-signature-pad">
          <canvas ref={canvasRef} width="760" height="330" onPointerDown={startSignature} onPointerMove={moveSignature} onPointerUp={stopSignature} onPointerCancel={stopSignature} onPointerLeave={stopSignature}/>
          {!signatureDrawn && <span>Gunakan jari untuk tanda tangan di area ini</span>}
        </div>
        <p>Tanda tangan ini akan tersimpan di pengajuan kredit agent sebagai bukti verifikasi pihak atas.</p>
        <footer>
          <button type="button" className="clear" onClick={clearSignaturePad}><Trash2/>Hapus</button>
          <button type="button" className="save" disabled={!signatureDrawn} onClick={saveSignature}><CheckCircle2/>Simpan TTD</button>
        </footer>
      </div>
    </section>}
  </>
}
