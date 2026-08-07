import {useEffect,useState} from 'react'
import {Navigate, useLocation, useNavigate} from 'react-router-dom'
import {ArrowLeft, Check, ChevronRight, Clock3, ReceiptText, ShieldCheck, WalletCards, XCircle} from 'lucide-react'
import {useAuth} from '../context/AuthContext'
import {payWithBalance, saveReceipt} from '../services/transactionService'
import {getSecurity,loadSecurity} from '../services/securityService'
import PaymentSecurityModal from '../components/mobile/PaymentSecurityModal'
import TransactionReceipt from '../components/mobile/TransactionReceipt'
import {rupiah} from '../utils/currency'
import {saveFavoriteContact} from '../services/contactFavorites'

export default function CheckoutPage() {
  const {state} = useLocation()
  const navigate = useNavigate()
  const {user, setBalance} = useAuth()
  const [processing, setProcessing] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')
  const [verifyOpen, setVerifyOpen] = useState(false)
  const [receiptOpen, setReceiptOpen] = useState(false)

  if (!state?.amount || !state?.sku) return <Navigate to="/app/services" replace/>

  const [security,setSecurity] = useState(()=>getSecurity(user.id))
  useEffect(()=>{loadSecurity(user.id).then(setSecurity).catch(()=>{})},[user.id])
  const protectedPayment = Boolean(security.pinHash || security.biometricEnabled)
  const enrichTransaction = transaction => ({
    ...transaction,
    id: transaction.id,
    customer: transaction.customer || state.target,
    target: state.target,
    customer_name: state.customer_name || transaction.customer_name || 'Pelanggan KuotaKita',
    provider: state.provider,
    title: state.title,
    product: state.product,
    amount: state.amount,
    payment_method: 'Saldo KuotaKita',
    order_number: transaction.order_number || '-',
    sn: transaction.sn || '-',
  })
  const pay = async () => {
    setVerifyOpen(false)
    setProcessing(true)
    setError('')
    try {
      let response
      // Seluruh pembayaran wajib melewati backend H2H, tidak ada lagi transaksi lokal/browser.
      if (false) {
        deductBalance(state.amount)
        const transaction = await createTransaction({
          customer: state.target,
          target: state.target,
          customer_name: state.customer_name || 'Pelanggan KuotaKita',
          email: user.email || `${user.id}@kuotakita.id`,
          method: `${state.provider} Â· ${state.title}`,
          provider: state.provider,
          title: state.title,
          product: state.product,
          amount: state.amount,
          payment_method: 'Saldo KuotaKita',
        })
        response = {transaction, balance: Number(user.balance) - Number(state.amount)}
      } else {
        response = await payWithBalance({...state, qty: state.qty || state.amount, email: user.email || `${user.id}@kuotakita.id`})
        setBalance(response.balance)
      }
      const transaction = enrichTransaction(response.transaction)
      saveReceipt(transaction)
      if (state.type === 'pulsa' || state.type === 'ewallet') {
        await saveFavoriteContact({number: state.target, label: state.provider || state.title, service: state.type}, user.id)
      }
      setResult({...response, transaction})
    } catch (current) {
      setError(current.message)
    } finally {
      setProcessing(false)
    }
  }
  const requestPay = () => protectedPayment ? setVerifyOpen(true) : pay()

  if (result) return <main className="mobile-app checkout-page">
    <section className="payment-result">
      <i>{result.transaction.status === 'Berhasil' ? <Check/> : <Clock3/>}</i>
      <span>{result.transaction.status === 'Berhasil' ? 'PEMBAYARAN BERHASIL' : 'PESANAN SEDANG DIPROSES'}</span>
      <h1>{rupiah(state.amount)}</h1>
      <p>{result.transaction.status === 'Berhasil' ? `${state.product} untuk ${state.target} berhasil diproses.` : `Pesanan ${state.product} sudah dikirim ke Pulsa24Jam. Status final akan diperbarui melalui callback.`}</p>
      <div><small>ID Transaksi</small><strong>{result.transaction.id}</strong></div>
      <button onClick={() => setReceiptOpen(true)}>Cetak / Lihat Struk</button>
      <button className="ghost" onClick={() => navigate('/app/history')}>Lihat Riwayat</button>
    </section>
    {receiptOpen && <TransactionReceipt transaction={result.transaction} order={state} user={user} onClose={() => setReceiptOpen(false)}/>}
  </main>

  return <main className="mobile-app checkout-page">
    <header className="checkout-head">
      <button onClick={() => navigate(-1)}><ArrowLeft/></button>
      <div><strong>Konfirmasi Pembayaran</strong><small>Periksa kembali sebelum membayar</small></div>
      <i><ShieldCheck/></i>
    </header>
    <section className="checkout-status"><Clock3/>Pesananmu siap dibayar</section>
    {protectedPayment && <section className="checkout-security-active"><ShieldCheck/><div><strong>Verifikasi pembayaran aktif</strong><small>PIN atau sidik jari akan diminta saat membayar.</small></div></section>}
    <section className="checkout-card order">
      <header><ReceiptText/><div><small>Produk</small><strong>{state.product}</strong></div></header>
      <dl>
        <div><dt>Layanan</dt><dd>{state.title}</dd></div>
        <div><dt>Penyedia</dt><dd>{state.provider}</dd></div>
        <div><dt>Tujuan</dt><dd>{state.target}</dd></div>
      </dl>
    </section>
    <section className="checkout-card">
      <h2>Metode Pembayaran</h2>
      <button className="payment-method selected"><i><WalletCards/></i><div><strong>Saldo KuotaKita</strong><small>Saldo tersedia {rupiah(user.balance)}</small></div><Check/></button>
      <button className="payment-method disabled" disabled><i><ShieldCheck/></i><div><strong>QRIS & Virtual Account</strong><small>Aktif setelah gateway pembayaran terhubung</small></div><ChevronRight/></button>
    </section>
    <section className="checkout-card summary">
      <h2>Rincian Pembayaran</h2>
      <div><span>Harga produk</span><b>{rupiah(state.amount)}</b></div>
      <div><span>Biaya layanan</span><b>Gratis</b></div>
      <div className="total"><span>Total pembayaran</span><strong>{rupiah(state.amount)}</strong></div>
    </section>
    {error && <div className="checkout-error"><XCircle/><span>{error}</span>{/saldo/i.test(error) && <button onClick={() => navigate('/app/balance/topup')}>Isi Saldo</button>}</div>}
    <footer className="checkout-footer"><div><span>Total</span><strong>{rupiah(state.amount)}</strong></div><button disabled={processing} onClick={requestPay}>{processing ? 'Memproses...' : protectedPayment ? 'Verifikasi & Bayar' : 'Bayar Sekarang'}</button></footer>
    <PaymentSecurityModal open={verifyOpen} user={user} settings={security} onClose={() => setVerifyOpen(false)} onVerified={pay}/>
  </main>
}
