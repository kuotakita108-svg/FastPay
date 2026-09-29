import {useState} from 'react'
import {Activity, AlertTriangle, ArrowRight, BarChart3, Boxes, Landmark, ShieldCheck, TrendingUp, Users, WalletCards} from 'lucide-react'
import {rupiah} from '../../utils/currency'
import {useAsync} from '../../hooks/useAsync'
import {getDashboard} from '../../services/dashboardService'
import {getProducts} from '../../services/productService'
import {getCustomers} from '../../services/customerService'

const statusOf=order=>String(order?.Status||'pending').toLowerCase()

const loadOwnerSnapshot=async()=>{
  const [dashboard,products,customers]=await Promise.allSettled([getDashboard(),getProducts(),getCustomers()])
  return {dashboard:dashboard.status==='fulfilled'?dashboard.value:{},products:products.status==='fulfilled'?products.value:[],customers:customers.status==='fulfilled'?customers.value:[]}
}

export default function SuperAdminOverview({user,items=[],agents=[],accounts=[],marketingPerformance=[],h2h={},onOpen}){
  const {data:snapshot}=useAsync(loadOwnerSnapshot)
  const [snapshotTime]=useState(()=>Date.now())
  const business=snapshot?.dashboard||{}
  const products=Array.isArray(snapshot?.products)?snapshot.products:[]
  const customers=Array.isArray(snapshot?.customers)?snapshot.customers:[]
  const activeCredits=items.filter(item=>item.status==='Disetujui'&&item.paymentStatus!=='Lunas')
  const overdue=activeCredits.filter(item=>item.dueAt&&new Date(item.dueAt).getTime()<snapshotTime)
  const outstanding=activeCredits.reduce((total,item)=>total+Number(item.creditOutstanding??item.creditBalance??item.creditOriginalAmount??item.form?.amount??0),0)
  const orders=Array.isArray(h2h.orders)?h2h.orders:[]
  const success=orders.filter(order=>statusOf(order)==='success').length
  const failed=orders.filter(order=>statusOf(order)==='failed').length
  const pending=orders.filter(order=>statusOf(order)==='pending').length
  const knownAccounts=accounts.length?accounts:customers
  const retailAccounts=knownAccounts.filter(account=>['user','agent'].includes(String(account.role||'').toLowerCase()))
  const memberBalance=knownAccounts.reduce((total,account)=>total+Number(account.balance||0),0)
  const activeProducts=products.filter(product=>!['inactive','nonaktif','disabled','off'].includes(String(product.status||'').toLowerCase())&&Number(product.stock??1)!==0)
  const cards=[
    {label:'Jumlah akun H2H',value:agents.length,note:'Agent KuotaKita terdaftar',icon:Users,tone:'cyan',route:'/customers'},
    {label:'Jumlah akun retail',value:retailAccounts.length,note:'User dan agent aktif',icon:Users,tone:'emerald',route:'/customers'},
    {label:'Produk aktif',value:activeProducts.length,note:`${products.length} produk dalam katalog`,icon:Boxes,tone:'violet',route:'/products'},
    {label:'Nilai transaksi',value:rupiah(business.revenue||0),note:`${business.transactions||orders.length} transaksi tercatat`,icon:Activity,tone:'cyan',route:'/transactions'},
    {label:'Total saldo member',value:rupiah(memberBalance),note:`${knownAccounts.length} akun terpantau`,icon:WalletCards,tone:'emerald',route:'/customers'},
    {label:'Saldo H2H Pulsa24Jam',value:h2h.balance==null?'Belum tersambung':rupiah(h2h.balance),note:h2h.connected?'Saldo transaksi provider utama':'Periksa koneksi H2H',icon:Landmark,tone:'amber',view:'h2h'},
    {label:'Kredit berjalan',value:rupiah(outstanding),note:`${activeCredits.length} agent aktif`,icon:WalletCards,tone:'violet',view:'peminjam'},
    {label:'Transaksi H2H berhasil',value:success,note:`${pending} diproses · ${failed} gagal`,icon:TrendingUp,tone:'blue',view:'h2h'},
    {label:'Tagihan berisiko',value:overdue.length,note:overdue.length?`${overdue.length} agent lewat jatuh tempo`:'Tidak ada tunggakan',icon:AlertTriangle,tone:'rose',view:'jatuh-tempo'},
  ]
  const actions=[
    {title:'Komisi & Laporan',note:'Rekap transaksi harian tiga bulan terakhir',icon:BarChart3,view:'laporan-bisnis'},
    {title:'Aktivitas Wallet',note:'Pantau saldo dan transaksi member',icon:WalletCards,route:'/transactions'},
    {title:'Log Status Member',note:'Lihat akun dan status akses member',icon:Users,route:'/customers'},
  ]
  const topMarketing=[...marketingPerformance].sort((a,b)=>b.approved-a.approved||b.registered-a.registered).slice(0,4)

  return <div className="owner-dashboard">
    <section className="owner-profile">
      <div><span>PROFIL AKTIF</span><h1>{user?.name||'Super Admin KuotaKita'}</h1><p>Akun admin aktif dengan akses penuh ke operasional, audit, wallet, provider, dan master data KuotaKita.</p><footer><b><ShieldCheck/>Super Admin</b><b>Role aktif di sesi ini</b></footer></div>
      <i><ShieldCheck/></i>
    </section>

    <section className="owner-metric-grid owner-summary-metrics">{cards.map(({label,value,note,icon:Icon,tone,view,route})=><button type="button" className={tone} onClick={()=>onOpen(route||view)} key={label}><i><Icon/></i><span>{label}</span><strong>{value}</strong><small>{note}</small><ArrowRight/></button>)}</section>

    <section className="owner-section owner-control">
      <header><div><span>PUSAT PEMANTAUAN</span><h2>Kontrol utama Super Admin</h2><p>Buka laporan, aktivitas wallet, dan status member langsung dari ringkasan.</p></div></header>
      <div className="owner-action-grid">{actions.map(({title,note,icon:Icon,view,route})=><button type="button" onClick={()=>onOpen(route||view)} key={title}><i><Icon/></i><span><b>{title}</b><small>{note}</small></span><ArrowRight/></button>)}</div>
    </section>

    <div className="owner-bottom-grid">
      <section className="owner-section owner-provider">
        <header><div><span>OPERASIONAL H2H</span><h2>Ringkasan transaksi provider</h2></div><button type="button" onClick={()=>onOpen('h2h')}>Buka monitor</button></header>
        <div><span><b>{success}</b><small>Berhasil</small></span><span><b>{pending}</b><small>Diproses</small></span><span><b>{failed}</b><small>Gagal</small></span></div>
        <p><TrendingUp/> Refund hanya tersedia untuk transaksi yang benar-benar berstatus gagal dari provider.</p>
      </section>
      <section className="owner-section owner-team">
        <header><div><span>TIM LAPANGAN</span><h2>Kinerja marketing terbaru</h2></div><button type="button" onClick={()=>onOpen('kinerja-marketing')}>Lihat semua</button></header>
        <div>{topMarketing.map(row=><article key={row.name}><i><Users/></i><span><b>{row.name}</b><small>{row.registered} agent · {row.visits} survei</small></span><strong>{row.approvalRate}%<small>approval</small></strong></article>)}{!topMarketing.length&&<p>Belum ada aktivitas marketing yang tercatat.</p>}</div>
      </section>
    </div>

    <section className="owner-system-strip"><ShieldCheck/><span><b>Pemisahan tugas tetap aktif</b><small>Marketing mengumpulkan data, Operator memutuskan dan menindaklanjuti kredit, sedangkan Super Admin memantau hasil, risiko, keuangan, dan kesehatan sistem.</small></span><button type="button" onClick={()=>onOpen('kinerja-marketing')}><BarChart3/>Lihat kinerja</button></section>
  </div>
}
