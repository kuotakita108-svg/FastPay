import {useEffect, useMemo, useState} from 'react'
import {Clock3, QrCode, ReceiptText, RefreshCw, ShieldCheck} from 'lucide-react'
import SubPageHeader from '../components/mobile/SubPageHeader'
import MobileNav from '../components/mobile/MobileNav'
import {rupiah} from '../utils/currency'
import {getTransactions} from '../services/transactionService'

const QRIS_AVAILABLE = false
const MINIMUM_TOPUP = 10000

export default function WalletTopUpPage(){
  const [amount,setAmount]=useState('')
  const [transactions,setTransactions]=useState([])
  const [historyLoading,setHistoryLoading]=useState(true)
  const [historyError,setHistoryError]=useState('')
  const nominal=Number(amount||0)
  const fee=0
  const total=useMemo(()=>nominal+fee,[nominal])
  const nominalValid=nominal>=MINIMUM_TOPUP
  const canCreate=QRIS_AVAILABLE&&nominalValid
  const loadHistory=()=>{
    setHistoryLoading(true);setHistoryError('')
    getTransactions().then(data=>setTransactions((Array.isArray(data)?data:[]).filter(item=>String(item?.id||'').startsWith('TOPUP-')||/top\s?up|isi saldo/i.test(`${item?.method||''} ${item?.customer||''}`)))).catch(error=>setHistoryError(error.message)).finally(()=>setHistoryLoading(false))
  }
  useEffect(loadHistory,[])

  return <main className="mobile-app wallet-topup-page qris-topup-page">
    <SubPageHeader title="Isi Saldo" description="Topup saldo akun melalui QRIS" back/>

    <section className="qris-builder-card">
      <header><i><QrCode/></i><div><h2>Buat QRIS Topup</h2><p>Masukkan nominal lalu buat QRIS untuk menambah saldo akun.</p></div></header>

      <label className="qris-amount-field">
        <span>Nominal topup</span>
        <div><b>Rp</b><input inputMode="numeric" value={amount} onChange={event=>setAmount(event.target.value.replace(/\D/g,'').slice(0,9))} placeholder="Minimal Rp 10.000"/></div>
      </label>

      <dl className="qris-topup-summary">
        <div><dt>Saldo masuk</dt><dd>{rupiah(nominalValid?nominal:0)}</dd></div>
        <div><dt>Fee admin</dt><dd>{rupiah(fee)}</dd></div>
        <div className="total"><dt>Total bayar QRIS</dt><dd>{rupiah(nominalValid?total:0)}</dd></div>
      </dl>

      {!QRIS_AVAILABLE&&<div className="qris-waiting-note"><Clock3/><span><b>QRIS segera tersedia</b><small>Tombol akan aktif setelah barcode pembayaran resmi terhubung.</small></span></div>}
      <button className="qris-create-button" type="button" disabled={!canCreate}><QrCode/>Buat QRIS Topup</button>
      {!nominalValid&&amount&&<small className="qris-amount-error">Minimal topup {rupiah(MINIMUM_TOPUP)}</small>}
    </section>

    <section className="qris-history-card">
      <header><i><ReceiptText/></i><div><h2>Riwayat Topup QRIS</h2><p>Riwayat topup akun ini dari server KuotaKita.</p></div><button type="button" className="qris-history-refresh" onClick={loadHistory} disabled={historyLoading} aria-label="Muat ulang riwayat"><RefreshCw/></button></header>
      {historyLoading&&<div className="qris-history-empty"><span className="mutation-loader"/><strong>Memuat riwayat topup...</strong></div>}
      {!historyLoading&&historyError&&<div className="qris-history-empty"><RefreshCw/><strong>Riwayat belum dapat dimuat</strong><span>{historyError}</span><button type="button" onClick={loadHistory}>Coba lagi</button></div>}
      {!historyLoading&&!historyError&&transactions.length===0&&<div className="qris-history-empty"><ShieldCheck/><strong>Belum ada topup QRIS</strong><span>Riwayat akan muncul setelah pembayaran QRIS resmi berhasil diverifikasi.</span></div>}
      {!historyLoading&&!historyError&&transactions.map(item=><article className="qris-history-row" key={item.id}><i><QrCode/></i><div><strong>{rupiah(item.amount||0)}</strong><small>{item.id} · {new Date(item.created_at).toLocaleString('id-ID')}</small></div><b>{item.status||'Tercatat'}</b></article>)}
    </section>
    <MobileNav/>
  </main>
}
