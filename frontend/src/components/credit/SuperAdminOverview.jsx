import {Activity, AlertTriangle, ArrowRight, BarChart3, CheckCircle2, ClipboardCheck, Headphones, Landmark, LockKeyhole, Settings, ShieldCheck, TrendingUp, UserPlus, Users, WalletCards} from 'lucide-react'
import {rupiah} from '../../utils/currency'

const statusOf=order=>String(order?.Status||'pending').toLowerCase()

const dashboardBootTime=Date.now()

export default function SuperAdminOverview({user,items=[],agents=[],marketingPerformance=[],h2h={},onOpen}){
  const activeCredits=items.filter(item=>item.status==='Disetujui'&&item.paymentStatus!=='Lunas')
  const review=items.filter(item=>item.status==='Menunggu keputusan operator').length
  const overdue=activeCredits.filter(item=>item.dueAt&&new Date(item.dueAt).getTime()<dashboardBootTime)
  const outstanding=activeCredits.reduce((total,item)=>total+Number(item.creditOutstanding??item.creditBalance??item.creditOriginalAmount??item.form?.amount??0),0)
  const orders=Array.isArray(h2h.orders)?h2h.orders:[]
  const success=orders.filter(order=>statusOf(order)==='success').length
  const failed=orders.filter(order=>statusOf(order)==='failed').length
  const pending=orders.filter(order=>statusOf(order)==='pending').length
  const cards=[
    {label:'Saldo H2H',value:h2h.balance==null?'Belum tersambung':rupiah(h2h.balance),note:h2h.connected?'Pulsa24Jam terhubung':'Periksa koneksi provider',icon:Landmark,tone:'emerald',view:'h2h'},
    {label:'Transaksi berhasil',value:success,note:`${orders.length} transaksi tercatat`,icon:Activity,tone:'cyan',view:'transaksi-agent'},
    {label:'Kredit berjalan',value:rupiah(outstanding),note:`${activeCredits.length} agent aktif`,icon:WalletCards,tone:'violet',view:'peminjam'},
    {label:'Perlu keputusan',value:review,note:'Berkas siap diperiksa',icon:ClipboardCheck,tone:'amber',view:'verifikasi'},
    {label:'Risiko terlambat',value:overdue.length,note:overdue.length?'Perlu tindakan segera':'Portofolio aman',icon:AlertTriangle,tone:'rose',view:'suspend'},
    {label:'Agent terdaftar',value:agents.length,note:`${marketingPerformance.length} marketing terpantau`,icon:Users,tone:'blue',view:'kinerja-marketing'},
  ]
  const actions=[
    {title:'Keputusan kredit',note:`${review} pengajuan menunggu keputusan`,icon:ClipboardCheck,view:'verifikasi'},
    {title:'Kontrol seluruh kredit',note:`${activeCredits.length} kredit sedang berjalan`,icon:WalletCards,view:'peminjam'},
    {title:'Verifikasi pelunasan',note:'Cocokkan bukti dan nominal pembayaran',icon:CheckCircle2,view:'pelunasan'},
    {title:'Risiko & akses agent',note:`${overdue.length} agent perlu pengawasan`,icon:LockKeyhole,view:'suspend'},
    {title:'Tambah marketing',note:'Buat akun kerja tim lapangan baru',icon:UserPlus,view:'marketing-input'},
    {title:'Helpdesk & refund',note:`${failed+pending} transaksi perlu diperiksa`,icon:Headphones,view:'helpdesk'},
  ]
  const topMarketing=[...marketingPerformance].sort((a,b)=>b.approved-a.approved||b.registered-a.registered).slice(0,4)

  return <div className="owner-dashboard">
    <section className="owner-profile">
      <div><span>PROFIL AKTIF</span><h1>{String(user?.name||'Super Admin KuotaKita').toUpperCase()}</h1><p>Kendali pusat untuk operasional aplikasi, kredit agent, tim lapangan, transaksi, risiko, dan koneksi H2H.</p><footer><b><ShieldCheck/>Super Admin</b><b>Hak akses owner aktif</b></footer></div>
      <i><ShieldCheck/></i>
    </section>

    <section className="owner-section owner-health">
      <header><div><span>KONDISI BISNIS</span><h2>Pantauan pusat secara langsung</h2><p>Semua angka berasal dari data server dan diperbarui otomatis.</p></div><em className={h2h.connected?'online':'offline'}><i/>{h2h.connected?'Sistem terhubung':'Perlu pemeriksaan'}</em></header>
      <div className="owner-metric-grid">{cards.map(({label,value,note,icon:Icon,tone,view})=><button type="button" className={tone} onClick={()=>onOpen(view)} key={label}><i><Icon/></i><span>{label}</span><strong>{value}</strong><small>{note}</small><ArrowRight/></button>)}</div>
    </section>

    <section className="owner-section owner-control">
      <header><div><span>PUSAT TINDAKAN</span><h2>Kerjaan yang membutuhkan kendali owner</h2><p>Buka hanya bagian yang perlu ditangani tanpa menumpuk seluruh data dalam satu layar.</p></div></header>
      <div className="owner-action-grid">{actions.map(({title,note,icon:Icon,view})=><button type="button" onClick={()=>onOpen(view)} key={title}><i><Icon/></i><span><b>{title}</b><small>{note}</small></span><ArrowRight/></button>)}</div>
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

    <section className="owner-system-strip"><ShieldCheck/><span><b>Pemisahan tugas tetap aktif</b><small>Marketing mengumpulkan data, Operator mengambil keputusan, dan Super Admin memantau serta mengendalikan seluruh sistem.</small></span><button type="button" onClick={()=>onOpen('settings')}><Settings/>Pengaturan</button><button type="button" onClick={()=>onOpen('analytics')}><BarChart3/>Analitik</button></section>
  </div>
}
