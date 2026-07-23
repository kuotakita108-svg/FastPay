import {useState} from 'react'
import {CheckCircle2, Clock3, ShieldCheck, XCircle} from 'lucide-react'
import PageHeader from '../components/common/PageHeader'
import {rupiah} from '../utils/currency'

const allKey = 'pulsaprime_agent_credit_all'
const userKey = userId => `pulsaprime_agent_credit_${userId || 'guest'}`

const readAll = () => {
  try { return JSON.parse(localStorage.getItem(allKey)) || [] } catch { return [] }
}

function updateApplication(target, status) {
  const decidedAt = new Date().toISOString()
  const next = {...target, status, decidedAt}
  const all = readAll()
  localStorage.setItem(allKey, JSON.stringify([next, ...all.filter(item => item.id !== target.id)].slice(0, 50)))
  const own = JSON.parse(localStorage.getItem(userKey(target.userId)) || '[]')
  localStorage.setItem(userKey(target.userId), JSON.stringify([next, ...own.filter(item => item.id !== target.id)].slice(0, 10)))
  return next
}

export default function CreditApplicationsPage() {
  const [items, setItems] = useState(readAll)
  const decide = (item, status) => {
    updateApplication(item, status)
    setItems(readAll())
  }

  return <>
    <PageHeader eyebrow="Pihak Atas" title="Review Kredit Saldo Agent" description="ACC atau tolak pengajuan tanam saldo setelah data agent diverifikasi."/>
    <section className="panel credit-review-panel">
      <div className="panel-header"><div><h2>Pengajuan Masuk</h2><p>Status sukses hanya muncul setelah pihak atas menekan ACC.</p></div></div>
      {items.length === 0 ? <div className="credit-review-empty"><ShieldCheck/><strong>Belum ada pengajuan</strong><span>Pengajuan kredit saldo dari aplikasi user akan tampil di sini.</span></div> : <div className="credit-review-list">
        {items.map(item => <article className={`credit-review-card status-${item.status.toLowerCase().replaceAll(' ', '-')}`} key={item.id}>
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
          <footer>
            {item.status === 'Disetujui' ? <span className="approved"><CheckCircle2/>Sudah ACC</span> : item.status === 'Ditolak' ? <span className="rejected"><XCircle/>Ditolak</span> : <>
              <span><Clock3/>Menunggu keputusan</span>
              <button type="button" className="reject" onClick={() => decide(item, 'Ditolak')}><XCircle/>Tolak</button>
              <button type="button" className="approve" onClick={() => decide(item, 'Disetujui')}><CheckCircle2/>ACC</button>
            </>}
          </footer>
        </article>)}
      </div>}
    </section>
  </>
}
