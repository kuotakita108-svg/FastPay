import {useState} from 'react'
import {useNavigate} from 'react-router-dom'
import {
  ArrowDownToLine,
  ArrowUpRight,
  Building2,
  ChevronRight,
  Eye,
  EyeOff,
  Gift,
  Plus,
  ReceiptText,
  ShieldCheck,
  WalletCards,
} from 'lucide-react'
import SubPageHeader from '../components/mobile/SubPageHeader'
import MobileNav from '../components/mobile/MobileNav'
import {useAuth} from '../context/AuthContext'
import {rupiah} from '../utils/currency'

export default function BalancePage(){
  const {user} = useAuth()
  const navigate = useNavigate()
  const [visible,setVisible] = useState(true)
  const balance = Number(user?.balance ?? 0)
  const walletId = user?.id || user?.username || 'FASTPAY'
  const topUp = () => navigate('/app/balance/topup')

  return (
    <main className="mobile-app balance-page">
      <SubPageHeader title="Saldo FastPay" description="Kelola uang dan aktivitas dompetmu"/>

      <section className="wallet-hero wallet-hero-rich">
        <div className="wallet-title">
          <span>Saldo tersedia</span>
          <button type="button" aria-label="Tampilkan atau sembunyikan saldo" onClick={()=>setVisible(value=>!value)}>
            {visible ? <EyeOff/> : <Eye/>}
          </button>
        </div>
        <strong>{visible ? rupiah(balance) : 'Rp •••••••'}</strong>
        <small>Siap dipakai untuk semua transaksi FastPay</small>
        <div className="wallet-number">
          <span>FASTPAY WALLET</span>
          <b>{walletId}</b>
        </div>
      </section>

      <section className="wallet-actions" aria-label="Menu saldo">
        <button type="button" onClick={topUp}><i><Plus/></i><strong>Isi Saldo</strong><small>Tambah dana</small></button>
        <button type="button"><i><ArrowUpRight/></i><strong>Kirim</strong><small>Ke pengguna</small></button>
        <button type="button"><i><ArrowDownToLine/></i><strong>Tarik</strong><small>Ke rekening</small></button>
        <button type="button"><i><ReceiptText/></i><strong>Tagihan</strong><small>Bayar cepat</small></button>
      </section>

      <div className="wallet-security">
        <i><ShieldCheck/></i>
        <div><b>Saldo aman dan terlindungi</b><span>Setiap transaksi dijaga dengan PIN dan verifikasi.</span></div>
        <ChevronRight/>
      </div>

      <section className="wallet-insight">
        <header><div><span>Pengeluaran bulan ini</span><strong>{rupiah(0)}</strong></div><i><WalletCards/></i></header>
        <div><span style={{width:'4%'}}/></div>
        <small>Belum ada pengeluaran bulan ini</small>
      </section>

      <section className="wallet-promo">
        <i><Gift/></i>
        <div><b>Bonus FastPoint hingga 2x</b><span>Isi saldo minimal Rp100.000 melalui Virtual Account.</span></div>
        <button type="button" onClick={topUp}>Ambil</button>
      </section>

      <section className="payment-source">
        <header><h2>Cara Isi Saldo</h2><button type="button" onClick={topUp}>Lihat semua</button></header>
        <button type="button" onClick={topUp}><i><Building2/></i><div><strong>Transfer Bank</strong><small>BCA, BRI, BNI, dan Mandiri</small></div><ChevronRight/></button>
        <button type="button" onClick={topUp}><i><WalletCards/></i><div><strong>Virtual Account</strong><small>Verifikasi otomatis selama 24 jam</small></div><ChevronRight/></button>
      </section>

      <section className="mutation-section">
        <header><h2>Aktivitas Dompet</h2></header>
        <div className="mutation-empty">
          <WalletCards/>
          <strong>Belum ada aktivitas</strong>
          <small>Isi saldo atau lakukan transaksi pertamamu. Riwayat dompet akan muncul di sini.</small>
          <button type="button" onClick={topUp}>Isi Saldo Sekarang</button>
        </div>
      </section>

      <MobileNav/>
    </main>
  )
}
