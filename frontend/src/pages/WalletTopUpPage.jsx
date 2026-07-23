import {useMemo,useState} from 'react'
import {Building2,Check,ChevronRight,CircleDollarSign,Landmark,ShieldCheck,Sparkles,WalletCards} from 'lucide-react'
import {useNavigate} from 'react-router-dom'
import SubPageHeader from '../components/mobile/SubPageHeader'
import {useAuth} from '../context/AuthContext'
import {useToast} from '../context/ToastContext'
import {rupiah} from '../utils/currency'

const amounts=[20000,50000,100000,200000,500000,1000000]
const methods=[
 {id:'va',title:'Virtual Account',detail:'Otomatis masuk dalam hitungan detik',icon:Landmark,fee:0,badge:'Gratis'},
 {id:'bank',title:'Transfer Bank',detail:'BCA, BRI, BNI dan Mandiri',icon:Building2,fee:2500},
 {id:'wallet',title:'E-Wallet',detail:'DANA, GoPay, OVO dan ShopeePay',icon:WalletCards,fee:1500},
]
export default function WalletTopUpPage(){
 const navigate=useNavigate(),{user,addBalance}=useAuth(),{show}=useToast(),[amount,setAmount]=useState(100000),[custom,setCustom]=useState(''),[method,setMethod]=useState('va'),[success,setSuccess]=useState(false)
 const selected=methods.find(item=>item.id===method),value=custom?Number(custom):amount,total=useMemo(()=>value+(selected?.fee||0),[value,selected])
 const submit=()=>{if(value<10000){show('Minimal isi saldo Rp10.000');return}addBalance(value);setSuccess(true)}
 if(success)return <main className="mobile-app wallet-topup-page"><SubPageHeader title="Isi Saldo Berhasil" description="Saldo KuotaKita sudah diperbarui" back/><section className="topup-success"><i><Check/></i><span>Isi saldo berhasil</span><strong>{rupiah(value)}</strong><p>Saldo terbarumu sekarang {rupiah(user.balance)} dan sudah siap digunakan.</p><button onClick={()=>navigate('/app/balance')}>Lihat Dompet</button><button className="ghost" onClick={()=>{setSuccess(false);setCustom('')}}>Isi Saldo Lagi</button></section></main>
 return <main className="mobile-app wallet-topup-page"><SubPageHeader title="Isi Saldo" description="Tambah saldo KuotaKita dengan mudah" back/><section className="topup-mini-wallet"><div><span>Saldo saat ini</span><strong>{rupiah(user.balance)}</strong></div><i><CircleDollarSign/></i></section><section className="topup-card"><header><div><small>LANGKAH 1</small><h2>Pilih nominal</h2></div><Sparkles/></header><div className="amount-grid">{amounts.map(item=><button className={!custom&&amount===item?'active':''} onClick={()=>{setAmount(item);setCustom('')}} key={item}>{rupiah(item)}</button>)}</div><label className="custom-amount"><span>Nominal lain</span><div><b>Rp</b><input inputMode="numeric" placeholder="Minimal 10.000" value={custom} onChange={e=>setCustom(e.target.value.replace(/\D/g,''))}/></div></label></section><section className="topup-card"><header><div><small>LANGKAH 2</small><h2>Metode pembayaran</h2></div><ShieldCheck/></header><div className="topup-methods">{methods.map(item=>{const Icon=item.icon;return <button key={item.id} className={method===item.id?'active':''} onClick={()=>setMethod(item.id)}><i><Icon/></i><div><strong>{item.title}</strong><small>{item.detail}</small></div>{item.badge&&<em>{item.badge}</em>}<span>{method===item.id?<Check/>:<ChevronRight/>}</span></button>})}</div></section><section className="topup-summary"><h2>Ringkasan</h2><div><span>Nominal isi saldo</span><b>{rupiah(value||0)}</b></div><div><span>Biaya layanan</span><b>{selected?.fee?rupiah(selected.fee):'Gratis'}</b></div><div className="total"><span>Total pembayaran</span><strong>{rupiah(total||0)}</strong></div><small><ShieldCheck/> Pembayaran diproses melalui sistem KuotaKita yang aman.</small></section><footer className="topup-footer"><div><span>Total</span><strong>{rupiah(total||0)}</strong></div><button disabled={!value} onClick={submit}>Lanjut Pembayaran <ChevronRight/></button></footer></main>
}
