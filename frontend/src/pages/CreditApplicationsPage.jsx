import {useRef, useState} from 'react'
import {Banknote, CalendarDays, CheckCircle2, Clock3, CreditCard, Eye, Filter, PenLine, PlusCircle, Search, ShieldCheck, Stamp, Trash2, UserCheck, WalletCards, X, XCircle} from 'lucide-react'
import PageHeader from '../components/common/PageHeader'
import {useAuth} from '../context/AuthContext'
import {rupiah} from '../utils/currency'

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
  try { return JSON.parse(localStorage.getItem(allKey)) || [] } catch { return [] }
}

function saveApplication(target, changes) {
  const next = {...target, ...changes, updatedAt: new Date().toISOString()}
  const all = readAll()
  localStorage.setItem(allKey, JSON.stringify([next, ...all.filter(item => item.id !== target.id)].slice(0, 50)))
  const own = JSON.parse(localStorage.getItem(userKey(target.userId)) || '[]')
  localStorage.setItem(userKey(target.userId), JSON.stringify([next, ...own.filter(item => item.id !== target.id)].slice(0, 10)))
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

function SignatureStep({title, note, signed, icon: Icon}) {
  return <div className={signed ? 'signed' : ''}>
    {signed?.image ? <img src={signed.image} alt={`Tanda tangan ${title}`}/> : <i>{signed ? <CheckCircle2/> : <Icon/>}</i>}
    <span><b>{title}</b><small>{signed ? `${signed.name} · ${dateTime(signed.at)}` : note}</small></span>
  </div>
}

export default function CreditApplicationsPage() {
  const {user} = useAuth()
  const canvasRef = useRef(null)
  const drawing = useRef(false)
  const [items, setItems] = useState(readAll)
  const [signaturePad, setSignaturePad] = useState(null)
  const [signatureDrawn, setSignatureDrawn] = useState(false)
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState('Semua')
  const [expandedId, setExpandedId] = useState('')
  const [showCreate, setShowCreate] = useState(false)
  const [manualForm, setManualForm] = useState(manualInitial)
  const [manualMessage, setManualMessage] = useState('')
  const isMarketing = user?.role === 'marketing'
  const isAnalis = user?.role === 'analis'
  const isAdmin = ['master', 'admin'].includes(user?.role)
  const refresh = () => setItems(readAll())
  const signMarketing = (item, image) => {
    saveApplication(item, {marketingSignature: stampPayload({...user, role: 'marketing'}, image), status: 'Menunggu analis'})
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
    const text = `${item.id} ${item.form.agentName} ${item.userName} ${item.form.storeName} ${item.form.whatsapp} ${item.form.nik}`.toLowerCase()
    const matchQuery = text.includes(query.toLowerCase().trim())
    const matchFilter = filter === 'Semua' || statusGroup(item) === filter
    return matchQuery && matchFilter
  })
  const summary = {
    total: items.length,
    review: items.filter(item => statusGroup(item) === 'Review').length,
    approved: items.filter(item => statusGroup(item) === 'Disetujui').length,
    paid: items.filter(item => statusGroup(item) === 'Lunas').length,
  }

  return <>
    <PageHeader eyebrow="Pihak Atas" title="Review Kredit Saldo Agent" description="Marketing verifikasi dan tanda tangan dulu, lalu analis memberi keputusan akhir."/>
    <section className="panel credit-review-panel">
      <div className="credit-review-hero">
        <div>
          <span>RUANG DATA PEMINJAM</span>
          <h2>Monitoring Kredit Agent</h2>
          <p>Semua pengajuan tersusun rapi dari yang terbaru. Marketing, analis, dan admin bisa cek data agent, tanda tangan, keputusan, sampai pembayaran.</p>
        </div>
        <i><WalletCards/></i>
      </div>
      <div className="credit-review-stats">
        <article><span>Total Peminjam</span><strong>{summary.total}</strong><small>Seluruh pengajuan</small></article>
        <article><span>Butuh Review</span><strong>{summary.review}</strong><small>Menunggu pihak atas</small></article>
        <article><span>Sudah ACC</span><strong>{summary.approved}</strong><small>Aktif dipantau</small></article>
        <article><span>Lunas</span><strong>{summary.paid}</strong><small>Pembayaran selesai</small></article>
      </div>
      <div className="panel-header">
        <div><h2>Pengajuan Masuk</h2><p>{isMarketing ? 'Tugas marketing: cek data agent, tanda tangan, atau tolak jika data tidak layak.' : isAnalis ? 'Tugas analis: cek hasil marketing, tanda tangan, lalu ACC atau tolak.' : 'Pantau seluruh alur pengajuan kredit agent dari satu panel.'}</p></div>
        <span className="review-role-badge">{isMarketing ? 'MARKETING' : isAnalis ? 'ANALIS' : 'ADMIN'}</span>
      </div>
      {(isMarketing || isAdmin) && <section className="credit-create-box">
        <button type="button" className="credit-create-toggle" onClick={() => setShowCreate(value => !value)}><PlusCircle/>{showCreate ? 'Tutup Form Peminjam' : 'Tambah Peminjam Manual'}</button>
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
      <div className="credit-review-tools">
        <label><Search/><input value={query} onChange={event => setQuery(event.target.value)} placeholder="Cari nama agent, toko, WA, NIK, atau ID pengajuan"/></label>
        <div><Filter/>{filters.map(name => <button type="button" className={filter === name ? 'active' : ''} onClick={() => setFilter(name)} key={name}>{name}</button>)}</div>
      </div>
      {items.length === 0 ? <div className="credit-review-empty"><ShieldCheck/><strong>Belum ada pengajuan</strong><span>Pengajuan kredit saldo dari aplikasi agent akan tampil di sini.</span></div> : visibleItems.length === 0 ? <div className="credit-review-empty"><Search/><strong>Data tidak ditemukan</strong><span>Coba ubah kata pencarian atau filter status.</span></div> : <div className="credit-review-list">
        {visibleItems.map(item => {
          const done = finalStatus.includes(item.status)
          const marketingSigned = Boolean(item.marketingSignature)
          const analisSigned = Boolean(item.analisSignature)
          const pay = paymentSummary(item)
          const expanded = expandedId === item.id
          const canMarketingSign = !done && !marketingSigned && (isMarketing || isAdmin)
          const canAnalisSign = !done && marketingSigned && !analisSigned && (isAnalis || isAdmin)
          const canApprove = !done && marketingSigned && analisSigned && (isAnalis || isAdmin)
          const canReject = !done && (isMarketing || isAnalis || isAdmin)
          return <article className={`credit-review-card status-${item.status.toLowerCase().replaceAll(' ', '-')}`} key={item.id}>
            <header>
              <div><span>{item.id}</span><h3>{item.form.agentName || item.userName}</h3><p>{item.form.storeName} · {item.form.whatsapp}</p></div>
              <b>{rupiah(item.form.amount)}</b>
            </header>
            <div className="credit-review-grid">
              <span><small>NIK</small><strong>{item.form.nik}</strong></span>
              <span><small>Transaksi/Bulan</small><strong>{item.form.monthlyTransactions}</strong></span>
              <span><small>Status</small><strong>{item.status}</strong></span>
              <span><small>Dokumen</small><strong>{Object.values(item.documents || {}).length} foto</strong></span>
            </div>
            <div className="credit-payment-summary">
              <div><CreditCard/><span><b>{item.paymentStatus || `${pay.paid}/${pay.total} cicilan`}</b><small>{rupiah(pay.totalPaid)} sudah dibayar</small></span></div>
              <strong>{pay.percent}%</strong>
              <em><i style={{width: `${pay.percent}%`}}/></em>
            </div>
            <p className="credit-review-address">{item.form.homeAddress}</p>
            <div className="credit-review-signatures">
              <SignatureStep title="Agent" note="Ditandatangani saat pengajuan dikirim" signed={{name: item.form.agentName || item.userName || 'Agent', at: item.createdAt}} icon={PenLine}/>
              <SignatureStep title="Marketing" note="Menunggu tanda tangan marketing" signed={item.marketingSignature} icon={UserCheck}/>
              <SignatureStep title="Analis" note="Menunggu tanda tangan analis" signed={item.analisSignature} icon={Stamp}/>
            </div>
            <footer>
              {item.status === 'Disetujui' ? <><span className="approved"><CheckCircle2/>Sudah ACC analis</span><button type="button" className="detail" onClick={() => setExpandedId(expanded ? '' : item.id)}><Eye/>{expanded ? 'Tutup' : 'Detail'}</button></> : item.status === 'Ditolak' ? <><span className="rejected"><XCircle/>Ditolak pihak atas</span><button type="button" className="detail" onClick={() => setExpandedId(expanded ? '' : item.id)}><Eye/>{expanded ? 'Tutup' : 'Detail'}</button></> : <>
                <span><Clock3/>{marketingSigned ? 'Menunggu keputusan analis' : 'Menunggu verifikasi marketing'}</span>
                {canMarketingSign && <button type="button" className="sign" onClick={() => openSignature(item, 'marketing')}><PenLine/>TTD Marketing</button>}
                {canAnalisSign && <button type="button" className="sign" onClick={() => openSignature(item, 'analis')}><PenLine/>TTD Analis</button>}
                {canReject && <button type="button" className="reject" onClick={() => decide(item, 'Ditolak')}><XCircle/>Tolak</button>}
                {canApprove && <button type="button" className="approve" onClick={() => decide(item, 'Disetujui')}><CheckCircle2/>ACC</button>}
                <button type="button" className="detail" onClick={() => setExpandedId(expanded ? '' : item.id)}><Eye/>{expanded ? 'Tutup' : 'Detail'}</button>
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
                  <span><dt>Alamat Toko</dt><dd>{item.form.storeAddress}</dd></span>
                  <span><dt>Keluarga</dt><dd>{item.form.familyName} · {item.form.familyRelation} · {item.form.familyWhatsapp}</dd></span>
                </dl>
              </div>
              <div className="credit-detail-block">
                <h4>Jalur Pembayaran</h4>
                <div className="credit-payment-list">
                  {paymentRows(item).map(row => <article className={row.paid ? 'paid' : ''} key={row.key}>
                    <i>{row.paid ? <CheckCircle2/> : <CalendarDays/>}</i>
                    <span><b>{row.label}</b><small>Jatuh tempo {row.due.toLocaleDateString('id-ID', {day: '2-digit', month: 'short', year: 'numeric'})}{row.paid ? ` · lunas ${dateTime(row.paid.paidAt)}` : ''}</small></span>
                    <strong>{rupiah(row.amount)}</strong>
                    {(isMarketing || isAdmin) && item.status === 'Disetujui' && <button type="button" disabled={Boolean(row.paid)} onClick={() => markPayment(item, row)}><Banknote/>{row.paid ? 'Lunas' : 'Catat Bayar'}</button>}
                  </article>)}
                </div>
              </div>
            </section>}
          </article>
        })}
      </div>}
    </section>
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
