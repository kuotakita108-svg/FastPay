import {useCallback,useEffect,useState} from 'react'
import {Navigate, useLocation, useNavigate} from 'react-router-dom'
import {Check, Clock3, Download, QrCode, RotateCcw, ShieldCheck, WalletCards, X, XCircle} from 'lucide-react'
import {useAuth} from '../context/AuthContext'
import {createPendingPayment,getPendingPaymentStatus,getPulsa24Status, payWithBalance, saveReceipt} from '../services/transactionService'
import {getSecurity,loadSecurity} from '../services/securityService'
import PaymentSecurityModal from '../components/mobile/PaymentSecurityModal'
import TransactionReceipt from '../components/mobile/TransactionReceipt'
import {rupiah} from '../utils/currency'
import {saveFavoriteContact} from '../services/contactFavorites'

export default function CheckoutPage() {
  const {state:locationState} = useLocation()
  const state=locationState?.order||locationState
  const navigate = useNavigate()
  const {user, setBalance} = useAuth()
  const [processing, setProcessing] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')
  const [verifyOpen, setVerifyOpen] = useState(false)
  const [receiptOpen, setReceiptOpen] = useState(false)

  const [security,setSecurity] = useState(()=>getSecurity(user.id))
  useEffect(()=>{loadSecurity(user.id).then(setSecurity).catch(()=>{})},[user.id])
  const protectedPayment = Boolean(security.pinHash || security.biometricEnabled)
  const isAgent=user.role==='agent'
  const directH2H=Boolean(user.h2h_direct)
  const mainPayment=Math.min(Number(user.balance||0),Number(state?.amount||0))
  const creditPayment=isAgent?Math.max(0,Number(state?.amount||0)-Number(user.balance||0)):0
  const balanceEnough=directH2H||isAgent||Number(user.balance||0)>=Number(state?.amount||0)
  const enrichTransaction = useCallback(transaction => ({
    ...transaction,
    id: transaction.id,
    customer: transaction.customer || state.target,
    target: state.target,
    customer_name: transaction.customer_name || state.customer_name || '',
    provider: state.provider,
    title: state.title,
    product: state.product,
    amount: state.amount,
    payment_method: 'Saldo KuotaKita',
    order_number: transaction.order_number || '-',
    sn: transaction.sn || '',
  }),[state])
  const pay = async () => {
    setVerifyOpen(false)
    setProcessing(true)
    setError('')
    try {
      // Seluruh pembayaran wajib melewati backend H2H Pulsa24Jam.
      // Tidak ada transaksi lokal, nama penerima buatan, atau saldo browser.
      const response = await payWithBalance({
        ...state,
        qty: state.qty || state.amount,
        email: user.email || `${user.id}@kuotakita.id`,
      })
      setBalance(response.balance)
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
  const createUnpaidInvoice=async()=>{
    setProcessing(true);setError('')
    try{
      const response=await createPendingPayment({...state,email:user.email||`${user.id}@kuotakita.id`})
      setResult({...response,transaction:enrichTransaction(response.transaction),funding_source:'Menunggu QRIS'})
    }catch(current){setError(current.message)}finally{setProcessing(false)}
  }
  const requestPay = () => !balanceEnough?createUnpaidInvoice():(protectedPayment ? setVerifyOpen(true) : pay())
  const checkPendingPayment=async()=>{
    setProcessing(true)
    try{const next=await getPendingPaymentStatus(result.transaction.id);setResult(current=>({...current,...next,transaction:enrichTransaction(next.transaction)}))}catch(current){setError(current.message)}finally{setProcessing(false)}
  }

  const pendingOrder=result?.transaction?.order_number
  const pendingStatus=result?.transaction?.status
  useEffect(()=>{
    if(pendingStatus!=='Diproses'||!pendingOrder)return
    let active=true,attempts=0
    const check=async()=>{
      try{
        const next=await getPulsa24Status(pendingOrder)
        if(!active)return
        if(Number.isFinite(Number(next.balance)))setBalance(next.balance)
        setResult(current=>({...current,...next,transaction:enrichTransaction(next.transaction)}))
        if(next.status==='success'||next.status==='failed')return
      }catch{/* status tetap pending; percobaan berikutnya aman memakai STATUS-PAY */}
      attempts+=1
      if(active&&attempts<12)timer=setTimeout(check,5000)
    }
    let timer=setTimeout(check,3000)
    return()=>{active=false;clearTimeout(timer)}
  },[pendingOrder,pendingStatus,enrichTransaction,setBalance])

  if (!state?.amount || !state?.sku) return <Navigate to="/app/services" replace/>

  if (result) {
    const failed=result.transaction.status==='Gagal',success=result.transaction.status==='Berhasil',unpaid=['Menunggu Pembayaran','Kedaluwarsa'].includes(result.transaction.status),expired=result.transaction.status==='Kedaluwarsa'
    return <main className="mobile-app checkout-page checkout-overlay">
    <section className={`checkout-sheet checkout-result-sheet ${failed?'is-refunded':success?'is-success':'is-pending'}`}>
      <header className="sheet-heading"><div><small>CHECKOUT</small><h1>{state.product}</h1></div><button onClick={() => navigate(-1)} aria-label="Tutup"><X/></button></header>
      <div className="checkout-result-notice"><i>{failed?<QrCode/>:success?<Check/>:<Clock3/>}</i><strong>{expired?'Invoice kedaluwarsa':unpaid?'Menunggu pembayaran':failed?'Dana dikembalikan ke saldo':success?'Pembayaran berhasil':'Transaksi sedang diproses'}</strong><p>{expired?'Batas pembayaran telah berakhir. Tidak ada saldo yang dipotong dan produk tidak dikirim ke P24.':unpaid?'Invoice tersimpan. QRIS belum tersedia, jadi tidak ada saldo yang dipotong dan produk belum dikirim ke P24.':failed?(result.message||'Transaksi gagal di provider dan dana sudah dikembalikan ke saldo akun Anda.'):success?`${state.product} untuk ${state.target} berhasil diproses.`:'Pesanan sudah diterima Pulsa24Jam. Status final diperbarui melalui callback resmi.'}</p></div>
      <dl className="checkout-result-details">
        <div><dt>Invoice</dt><dd>{result.transaction.order_number||result.transaction.id}</dd></div>
        <div><dt>Tujuan</dt><dd>{state.target}</dd></div>
        <div><dt>Status</dt><dd className={failed||expired?'refund-text':''}>{failed?'Dana dikembalikan':result.transaction.status}</dd></div>
        {directH2H?<div><dt>Sumber dana</dt><dd>Deposit H2H Owner</dd></div>:<><div><dt>{isAgent?'Pakai saldo utama':'Bayar dengan saldo'}</dt><dd>{rupiah(result.main_used||0)}</dd></div>{isAgent&&<div><dt>Pakai saldo kredit</dt><dd>{rupiah(result.credit_used||0)}</dd></div>}</>}
        <div><dt>Total bayar</dt><dd className="money-text">{rupiah(state.amount)}</dd></div>
        <div><dt>Metode bayar</dt><dd>{result.funding_source||'Saldo KuotaKita'}</dd></div>
      </dl>
      {unpaid?<button className="checkout-proof-button pending-check-button" disabled={processing||expired} onClick={checkPendingPayment}><Clock3/> {processing?'Memeriksa...':expired?'Kedaluwarsa':'Cek Status'}</button>:<button className="checkout-proof-button" onClick={() => setReceiptOpen(true)}><Download/> Lihat / Download Bukti Pembayaran</button>}
      {failed&&<button className="checkout-retry-button" onClick={() => navigate(-1)}><RotateCcw/> Pilih produk lain</button>}
    </section>
    {receiptOpen && <TransactionReceipt transaction={result.transaction} order={state} user={user} onClose={() => setReceiptOpen(false)}/>}
  </main>}

  return <main className="mobile-app checkout-page checkout-overlay">
    <section className="checkout-sheet">
      <header className="sheet-heading"><div><small>CHECKOUT</small><h1>{state.product}</h1></div><button onClick={() => navigate(-1)} aria-label="Tutup"><X/></button></header>
      <dl className="checkout-price-box">
        <div><dt>Nominal {state.type==='pulsa'?'pulsa':'produk'}</dt><dd>{rupiah(state.nominal||state.amount)}</dd></div>
        <div><dt>Harga</dt><dd>{rupiah(state.amount)}</dd></div>
        {directH2H?<div><dt>Sumber dana</dt><dd>Deposit H2H Owner</dd></div>:<><div><dt>{isAgent?'Pakai saldo utama':'Bayar dengan saldo'}</dt><dd>{rupiah(mainPayment)}</dd></div>{isAgent&&<div><dt>Pakai saldo kredit</dt><dd>{rupiah(creditPayment)}</dd></div>}</>}
        <div><dt>{state.providerFee?'Biaya layanan':'Fee admin'}</dt><dd>{rupiah(state.providerFee||0)}</dd></div>
        <div><dt>Total bayar</dt><dd>{rupiah(state.amount)}</dd></div>
      </dl>
      <label className="checkout-target"><span>Nomor Tujuan</span><input value={state.target} readOnly/></label>
      {protectedPayment&&<div className="checkout-protected"><ShieldCheck/> PIN atau biometrik akan diminta sebelum pembayaran.</div>}
    {error && <div className="checkout-error"><XCircle/><span>{error}</span>{/saldo/i.test(error) && <button onClick={() => navigate('/app/balance/topup')}>Isi Saldo</button>}</div>}
      <button className="checkout-pay-button" disabled={processing} onClick={requestPay}><WalletCards/>{processing?'Menyiapkan...':!balanceEnough?'Buat Invoice Pembayaran':protectedPayment?'Verifikasi & Bayar':'Bayar'}</button>
      {!balanceEnough&&<div className="checkout-balance-warning"><WalletCards/><span><b>Saldo utama tidak mencukupi</b><small>Buat invoice pending sekarang atau isi saldo agar produk langsung diproses.</small></span><button type="button" onClick={()=>navigate('/app/balance/topup')}>Isi Saldo</button></div>}
      <small className="checkout-provider-note"><ShieldCheck/> Diproses resmi melalui Pulsa24Jam. PAY tidak diulang otomatis agar transaksi tidak ganda.</small>
    </section>
    <PaymentSecurityModal open={verifyOpen} user={user} settings={security} onClose={() => setVerifyOpen(false)} onVerified={pay}/>
  </main>
}
