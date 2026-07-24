import {useState} from 'react'
import {CheckCircle2, Clock3, PenLine, ShieldCheck, Stamp, UserCheck, XCircle} from 'lucide-react'
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
const stampPayload = user => ({name: reviewerName(user), role: user?.role || 'reviewer', at: new Date().toISOString()})
const dateTime = iso => iso ? new Date(iso).toLocaleString('id-ID', {day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'}) : 'Belum tanda tangan'

function SignatureStep({title, note, signed, icon: Icon}) {
  return <div className={signed ? 'signed' : ''}>
    <i>{signed ? <CheckCircle2/> : <Icon/>}</i>
    <span><b>{title}</b><small>{signed ? `${signed.name} · ${dateTime(signed.at)}` : note}</small></span>
  </div>
}

export default function CreditApplicationsPage() {
  const {user} = useAuth()
  const [items, setItems] = useState(readAll)
  const isMarketing = user?.role === 'marketing'
  const isAnalis = user?.role === 'analis'
  const isAdmin = ['master', 'admin'].includes(user?.role)
  const refresh = () => setItems(readAll())
  const signMarketing = item => {
    saveApplication(item, {marketingSignature: stampPayload({...user, role: 'marketing'}), status: 'Menunggu analis'})
    refresh()
  }
  const signAnalis = item => {
    saveApplication(item, {analisSignature: stampPayload({...user, role: 'analis'}), status: 'Menunggu ACC analis'})
    refresh()
  }
  const decide = (item, status) => {
    const changes = {status, decidedAt: new Date().toISOString()}
    if (status === 'Disetujui' && !item.analisSignature) changes.analisSignature = stampPayload({...user, role: 'analis'})
    saveApplication(item, changes)
    refresh()
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
          const canApprove = !done && marketingSigned && (isAnalis || isAdmin)
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
                {canMarketingSign && <button type="button" className="sign" onClick={() => signMarketing(item)}><PenLine/>TTD Marketing</button>}
                {canAnalisSign && <button type="button" className="sign" onClick={() => signAnalis(item)}><PenLine/>TTD Analis</button>}
                {canReject && <button type="button" className="reject" onClick={() => decide(item, 'Ditolak')}><XCircle/>Tolak</button>}
                {canApprove && <button type="button" className="approve" onClick={() => decide(item, 'Disetujui')}><CheckCircle2/>ACC</button>}
              </>}
            </footer>
          </article>
        })}
      </div>}
    </section>
  </>
}
