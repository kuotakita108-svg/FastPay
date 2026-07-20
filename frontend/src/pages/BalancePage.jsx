import {useState} from 'react'
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
 const{user}=useAuth(),[visible,setVisible]=useState(true),{data:transactions=[],loading}=useAsync(getTransactions)
 return <main className="mobile-app balance-page"><SubPageHeader title="Saldo FastPay" description="Kelola saldo dan mutasi"/><section className="wallet-hero"><span>Saldo tersedia</span><strong>{visible?rupiah(user.balance):'Rp •••••••'}</strong><button onClick={()=>setVisible(v=>!v)}>{visible?'Sembunyikan':'Tampilkan'} saldo</button><div><button><Plus/>Isi Saldo</button><button><ArrowUpRight/>Kirim Saldo</button></div></section><section className="payment-source"><header><h2>Metode Isi Saldo</h2><button>Lihat semua</button></header><button><i><Building2/></i><div><strong>Transfer Bank</strong><small>BCA, BRI, BNI, Mandiri</small></div><ChevronRight/></button><button><i><WalletCards/></i><div><strong>Virtual Account</strong><small>Verifikasi otomatis 24 jam</small></div><ChevronRight/></button></section><section className="mutation-section"><header><h2>Mutasi Saldo</h2>{transactions.length>0&&<button>Unduh</button>}</header>{loading?<LoadingState cards={2}/>:transactions.map(item=><article key={item.id}><i className="out"><ArrowUpRight/></i><div><strong>{item.method}</strong><small>{item.customer} · {relativeTime(item.created_at)}</small></div><b className="out">-{rupiah(item.amount)}</b></article>)}{!loading&&!transactions.length&&<div className="mutation-empty"><WalletCards/><strong>Belum ada mutasi saldo</strong><small>Riwayat saldo muncul setelah transaksi pertamamu.</small></div>}</section><MobileNav/></main>
}
