import {Activity,ChartNoAxesCombined,CircleCheck,Users} from 'lucide-react'
import PageHeader from '../components/common/PageHeader'
import LoadingState from '../components/common/LoadingState'
import ErrorState from '../components/common/ErrorState'
import {useAsync} from '../hooks/useAsync'
import {getDashboard} from '../services/dashboardService'
import {shortRupiah} from '../utils/currency'

export default function AnalyticsPage(){
  const{data,loading,error,reload}=useAsync(getDashboard)
  if(loading)return <LoadingState/>
  if(error)return <ErrorState message={error} onRetry={reload}/>
  const stats=[['Nilai transaksi',shortRupiah(data?.revenue||0),'Nominal transaksi tercatat',Activity],['Jumlah transaksi',Number(data?.transactions||0).toLocaleString('id-ID'),'Seluruh transaksi aplikasi',ChartNoAxesCombined],['Pelanggan aktif',Number(data?.customers||0).toLocaleString('id-ID'),'Akun yang tercatat',Users],['Tingkat keberhasilan',`${Number(data?.success_rate||0)}%`,'Transaksi berhasil',CircleCheck]]
  return <><PageHeader eyebrow="Analitik" title="Kinerja Bisnis KuotaKita" description="Angka operasional nyata dari server untuk pemantauan Super Admin."/><div className="owner-analytics-grid">{stats.map(([label,value,note,Icon])=><article key={label}><Icon/><span>{label}</span><strong>{value}</strong><small>{note}</small></article>)}</div><section className="panel owner-analytics-detail"><header><div><span>TREN TRANSAKSI</span><h2>Pergerakan transaksi terbaru</h2></div><ChartNoAxesCombined/></header><div>{Array.isArray(data?.chart)&&data.chart.length?data.chart.map((row,index)=><article key={row.label||row.name||index}><span>{row.label||row.name||`Periode ${index+1}`}</span><strong>{shortRupiah(row.revenue||row.value||row.total||0)}</strong></article>):<p>Grafik akan terisi setelah transaksi berhasil tercatat.</p>}</div></section></>
}
