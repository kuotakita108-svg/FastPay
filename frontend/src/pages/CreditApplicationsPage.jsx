import {useRef, useState} from 'react'
import {CheckCircle2, Clock3, PenLine, ShieldCheck, Stamp, Trash2, UserCheck, X, XCircle} from 'lucide-react'
import PageHeader from '../components/common/PageHeader'
import {useAuth} from '../context/AuthContext'
import {rupiah} from '../utils/currency'

const allKey = 'kuotakita_agent_credit_all'
const userKey = userId => `kuotakita_agent_credit_${userId || 'guest'}`
const finalStatus = ['Disetujui', 'Ditolak']

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

  return <>
    <PageHeader eyebrow="Pihak Atas" title="Review Kredit Saldo Agent" description="Marketing verifikasi dan tanda tangan dulu, lalu analis memberi keputusan akhir."/>
    <section className="panel credit-review-panel">
      <div className="panel-header">
        <div><h2>Pengajuan Masuk</h2><p>{isMarketing ? 'Tugas marketing: cek data agent, tanda tangan, atau tolak jika data tidak layak.' : isAnalis ? 'Tugas analis: cek hasil marketing, tanda tangan, lalu ACC atau tolak.' : 'Pantau seluruh alur pengajuan kredit agent dari satu panel.'}</p></div>
        <span className="review-role-badge">{isMarketing ? 'MARKETING' : isAnalis ? 'ANALIS' : 'ADMIN'}</span>
      </div>
      {items.length === 0 ? <div className="credit-review-empty"><ShieldCheck/><strong>Belum ada pengajuan</strong><span>Pengajuan kredit saldo dari aplikasi agent akan tampil di sini.</span></div> : <div className="credit-review-list">
        {items.map(item => {
          const done = finalStatus.includes(item.status)
          const marketingSigned = Boolean(item.marketingSignature)
          const analisSigned = Boolean(item.analisSignature)
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
            <p className="credit-review-address">{item.form.homeAddress}</p>
            <div className="credit-review-signatures">
              <SignatureStep title="Agent" note="Ditandatangani saat pengajuan dikirim" signed={{name: item.form.agentName || item.userName || 'Agent', at: item.createdAt}} icon={PenLine}/>
              <SignatureStep title="Marketing" note="Menunggu tanda tangan marketing" signed={item.marketingSignature} icon={UserCheck}/>
              <SignatureStep title="Analis" note="Menunggu tanda tangan analis" signed={item.analisSignature} icon={Stamp}/>
            </div>
            <footer>
              {item.status === 'Disetujui' ? <span className="approved"><CheckCircle2/>Sudah ACC analis</span> : item.status === 'Ditolak' ? <span className="rejected"><XCircle/>Ditolak pihak atas</span> : <>
                <span><Clock3/>{marketingSigned ? 'Menunggu keputusan analis' : 'Menunggu verifikasi marketing'}</span>
                {canMarketingSign && <button type="button" className="sign" onClick={() => openSignature(item, 'marketing')}><PenLine/>TTD Marketing</button>}
                {canAnalisSign && <button type="button" className="sign" onClick={() => openSignature(item, 'analis')}><PenLine/>TTD Analis</button>}
                {canReject && <button type="button" className="reject" onClick={() => decide(item, 'Ditolak')}><XCircle/>Tolak</button>}
                {canApprove && <button type="button" className="approve" onClick={() => decide(item, 'Disetujui')}><CheckCircle2/>ACC</button>}
              </>}
            </footer>
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
