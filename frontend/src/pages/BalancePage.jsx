import {useState} from 'react'
import {useNavigate} from 'react-router-dom'
import {ArrowUpRight,Building2,ChevronRight,Plus,WalletCards} from 'lucide-react'
import SubPageHeader from '../components/mobile/SubPageHeader'
import MobileNav from '../components/mobile/MobileNav'
import LoadingState from '../components/common/LoadingState'
import {useAuth} from '../context/AuthContext'
import {useAsync} from '../hooks/useAsync'
import {getTransactions} from '../services/transactionService'
import {rupiah} from '../utils/currency'
import {relativeTime} from '../utils/date'

export default function BalancePage(){
 const{user}=useAuth(),navigate=useNavigate(),[visible,setVisible]=useState(true),{data:transactions=[],loading}=useAsync(getTransactions)
 return <main className="mobile-app balance-page"><SubPageHeader title="Dompet FastPay" description="Saldo aman, transaksi lebih praktis"/><section className="wallet-hero"><span>Saldo aktif</span><strong>{visible?rupiah(user.balance):'Rp •••••••'}</strong><button onClick={()=>setVisible(v=>!v)}>{visible?'Sembunyikan':'Tampilkan'} saldo</button><div><button onClick={()=>navigate('/app/balance/topup')}><Plus/>Isi Saldo</button><button><ArrowUpRight/>Kirim Saldo</button></div></section><div className="wallet-security"><b>Saldo terlindungi</b><span>PIN dan verifikasi perangkat menjaga setiap transaksi.</span></div><section className="payment-source"><header><h2>Cara Isi Saldo</h2><button onClick={()=>navigate('/app/balance/topup')}>Lihat semua</button></header><button onClick={()=>navigate('/app/balance/topup')}><i><Building2/></i><div><strong>Transfer Bank</strong><small>BCA, BRI, BNI, Mandiri · mulai Rp10.000</small></div><ChevronRight/></button><button onClick={()=>navigate('/app/balance/topup')}><i><WalletCards/></i><div><strong>Virtual Account</strong><small>Nomor unik dan verifikasi otomatis 24 jam</small></div><ChevronRight/></button></section><section className="mutation-section"><header><h2>Aktivitas Dompet</h2>{transactions.length>0&&<button>Unduh</button>}</header>{loading?<LoadingState cards={2}/>:transactions.map(item=><article key={item.id}><i className="out"><ArrowUpRight/></i><div><strong>{item.method}</strong><small>{item.customer} · {relativeTime(item.created_at)}</small></div><b className="out">-{rupiah(item.amount)}</b></article>)}{!loading&&!transactions.length&&<div className="mutation-empty"><WalletCards/><strong>Dompet masih baru</strong><small>Isi saldo atau lakukan transaksi untuk melihat aktivitas di sini.</small><button onClick={()=>navigate('/app/balance/topup')}>Isi Saldo Sekarang</button></div>}</section><MobileNav/></main>
}
