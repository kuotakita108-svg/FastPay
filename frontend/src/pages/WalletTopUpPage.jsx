import {useMemo, useState} from 'react'
import {Clock3, QrCode, ReceiptText, ShieldCheck} from 'lucide-react'
import SubPageHeader from '../components/mobile/SubPageHeader'
import MobileNav from '../components/mobile/MobileNav'
import {rupiah} from '../utils/currency'

const QRIS_AVAILABLE = false
const MINIMUM_TOPUP = 10000

export default function WalletTopUpPage(){
  const [amount,setAmount]=useState('')
  const nominal=Number(amount||0)
  const fee=0
  const total=useMemo(()=>nominal+fee,[nominal])
  const nominalValid=nominal>=MINIMUM_TOPUP
  const canCreate=QRIS_AVAILABLE&&nominalValid

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
      <header><i><ReceiptText/></i><div><h2>Riwayat Topup QRIS</h2><p>Riwayat topup terbaru dan status pembayaran QRIS.</p></div></header>
      <div className="qris-history-empty"><ShieldCheck/><strong>Belum ada topup QRIS</strong><span>Transaksi akan tampil di sini setelah QRIS tersedia.</span></div>
    </section>
    <MobileNav/>
  </main>
}
