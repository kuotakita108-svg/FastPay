import {Activity, ArrowRight, BarChart3, Boxes, CalendarDays, CheckCircle2, CreditCard, Landmark, Settings, ShieldCheck, Users, WalletCards} from 'lucide-react'
import {useNavigate} from 'react-router-dom'
import PageHeader from '../components/common/PageHeader'
import LoadingState from '../components/common/LoadingState'
import ErrorState from '../components/common/ErrorState'
import StatCard from '../components/dashboard/StatCard'
import RevenueChart from '../components/dashboard/RevenueChart'
import PaymentDonut from '../components/dashboard/PaymentDonut'
import TransactionTable from '../components/transactions/TransactionTable'
import QuickTopUp from '../components/topup/QuickTopUp'
import {useAsync} from '../hooks/useAsync'
import {useAuth} from '../context/AuthContext'
import {getDashboard} from '../services/dashboardService'
import {getProducts} from '../services/productService'
import {getCustomers} from '../services/customerService'
import {getPulsa24Balance,getPulsa24Operations} from '../services/transactionService'
import {rupiah,shortRupiah} from '../utils/currency'

const loadOwnerDashboard=async()=>{
  const results=await Promise.allSettled([getDashboard(),getProducts(),getCustomers(),getPulsa24Balance(),getPulsa24Operations()])
  const value=index=>results[index].status==='fulfilled'?results[index].value:null
  return {business:value(0)||{},products:Array.isArray(value(1))?value(1):[],accounts:Array.isArray(value(2))?value(2):[],provider:value(3),operations:value(4)||{}}
}

function OwnerApplicationDashboard({data}){
  const navigate=useNavigate()
  const {user}=useAuth()
  const orders=Array.isArray(data.operations?.orders)?data.operations.orders:[]
  const success=orders.filter(order=>String(order.Status).toLowerCase()==='success').length
  const pending=orders.filter(order=>String(order.Status).toLowerCase()==='pending').length
  const memberBalance=data.accounts.reduce((total,account)=>total+Number(account.balance||0),0)
  const providers=new Set(data.products.map(product=>product.provider||product.operator||product.category).filter(Boolean))
  const metrics=[
    ['Akun terdaftar',data.accounts.length,'Seluruh role aplikasi',Users,'cyan','/customers'],
    ['Saldo seluruh member',rupiah(memberBalance),'Dompet pengguna dan agent',WalletCards,'emerald','/transactions?scope=member-wallet'],
    ['Provider aktif',providers.size,`${data.products.length} produk tersedia`,Boxes,'violet','/products'],
    ['Nilai transaksi',rupiah(data.business.revenue||0),`${data.business.transactions||orders.length} transaksi tercatat`,Activity,'blue','/transactions'],
    ['Saldo provider H2H',data.provider?rupiah(data.provider.balance||0):'Belum terhubung','Saldo Pulsa24Jam',Landmark,'amber','/admin/h2h'],
    ['Transaksi berhasil',success,`${pending} transaksi diproses`,CheckCircle2,'emerald','/admin/h2h'],
  ]
  const controls=[
    ['Operasional Transaksi','Pantau retail, fulfillment, refund, dan H2H.',Activity,'/transactions'],
    ['Akun & Role','Kelola akses seluruh akun KuotaKita.',Users,'/customers'],
    ['Keuangan & Deposit','Pantau deposit, VA, wallet, dan kanal pembayaran.',CreditCard,'/payment-methods'],
    ['Produk & Harga','Kelola katalog produk dan harga jual.',Boxes,'/products'],
    ['Laporan Bisnis','Rekap transaksi nyata dan ekspor laporan.',BarChart3,'/admin/business-report'],
    ['Audit & Sistem','Periksa log, komplain, dan konfigurasi.',Settings,'/settings'],
  ]
  return <div className="owner-dashboard owner-app-dashboard">
    <section className="owner-profile"><div><span>SUPER ADMIN KUOTAKITA</span><h1>{user?.name||'Super Admin'}</h1><p>Pusat kendali seluruh aplikasi KuotaKita: akun, transaksi, wallet, provider, produk, keuangan, kredit, audit, dan sistem.</p><footer><b><ShieldCheck/>Akses penuh</b><b>Data server aktif</b></footer></div><i><ShieldCheck/></i></section>
    <section className="owner-metric-grid owner-summary-metrics">{metrics.map(([label,value,note,Icon,tone,to])=><button type="button" className={tone} onClick={()=>navigate(to)} key={label}><i><Icon/></i><span>{label}</span><strong>{value}</strong><small>{note}</small><ArrowRight/></button>)}</section>
    <section className="owner-section owner-control"><header><div><span>KONTROL APLIKASI</span><h2>Seluruh operasional dalam satu panel</h2><p>Kredit Retail tetap tersedia sebagai bagian tersendiri di sidebar.</p></div></header><div className="owner-action-grid">{controls.map(([title,note,Icon,to])=><button type="button" onClick={()=>navigate(to)} key={title}><i><Icon/></i><span><b>{title}</b><small>{note}</small></span><ArrowRight/></button>)}</div></section>
    <section className="owner-system-strip"><ShieldCheck/><span><b>Panel Super Admin berfokus pada seluruh aplikasi</b><small>Gunakan kelompok menu di kiri untuk bisnis, keuangan, transaksi, produk, kredit, audit, dan pengaturan tanpa mencampur tugas operator.</small></span><button type="button" onClick={()=>navigate('/admin/audit-transactions')}><Activity/>Buka audit</button></section>
  </div>
}

export default function DashboardPage(){
  const {user}=useAuth()
  const isOwner=user?.role==='master'
  const {data,loading,error,reload}=useAsync(isOwner?loadOwnerDashboard:getDashboard)
  if(loading)return <LoadingState/>
  if(error)return <ErrorState message={error} onRetry={reload}/>
  if(isOwner)return <OwnerApplicationDashboard data={data||{business:{},products:[],accounts:[],operations:{}}}/>
  const payload=data&&typeof data==='object'?data:{}
  const stats=[['Pendapatan Tercatat',shortRupiah(payload.revenue||0),0,WalletCards,'violet'],['Transaksi',Number(payload.transactions||0).toLocaleString('id-ID'),0,Activity,'green'],['Pelanggan Aktif',Number(payload.customers||0).toLocaleString('id-ID'),0,Users,'orange'],['Transaksi Sukses',`${payload.success_rate||0}%`,0,ShieldCheck,'blue']]
  return <><PageHeader eyebrow="KuotaKita PPOB" title="Ringkasan transaksi" description="Data akan muncul setelah transaksi nyata berhasil diproses." action={<div className="date-chip"><CalendarDays size={16}/>{new Date().toLocaleDateString('id-ID',{day:'numeric',month:'long',year:'numeric'})}</div>}/><QuickTopUp/><div className="stats-grid">{stats.map(item=><StatCard key={item[0]} label={item[0]} value={item[1]} growth={item[2]} icon={item[3]} tone={item[4]}/>)}</div><div className="dashboard-grid"><RevenueChart data={payload.chart}/><PaymentDonut methods={payload.payment_methods}/></div><section className="panel"><div className="panel-header"><div><h2>Transaksi Terbaru</h2><p>Riwayat transaksi asli akunmu akan tampil di sini.</p></div></div><TransactionTable items={payload.recent}/></section></>
}
