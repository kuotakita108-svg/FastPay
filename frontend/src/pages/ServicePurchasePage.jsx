import {useMemo,useState} from 'react'
import {useParams,useNavigate} from 'react-router-dom'
import {ArrowLeft,ShieldCheck,CheckCircle2,ChevronRight,WalletCards,Smartphone,Hash} from 'lucide-react'
import {useAsync} from '../hooks/useAsync'
import {getProducts} from '../services/productService'
import {rupiah} from '../utils/currency'
import {serviceConfig} from '../constants/services'
import {detectOperator} from '../constants/operators'
import MobileNav from '../components/mobile/MobileNav'

const automatic=['pulsa','data']
const custom=['pulsa','ewallet']
const phoneServices=['pulsa','data','ewallet','pascabayar']

export default function ServicePurchasePage(){
 const {type}=useParams(),navigate=useNavigate(),config=serviceConfig[type]||serviceConfig.pulsa,{data=[]}=useAsync(getProducts)
 const [target,setTarget]=useState(''),[provider,setProvider]=useState(''),[catalog,setCatalog]=useState(false),[mode,setMode]=useState('product'),[selected,setSelected]=useState(null),[freeAmount,setFreeAmount]=useState('')
 const products=useMemo(()=>data?.filter(product=>product.category===config.category&&product.operator===provider)||[],[data,config.category,provider])
 const amount=mode==='custom'?Number(freeAmount):selected?.price||0
 const changeTarget=value=>{setTarget(value);setCatalog(false);setSelected(null);if(automatic.includes(type))setProvider(detectOperator(value)?.name||'')}
 const checkout=()=>navigate('/app/checkout',{state:{type,title:config.title,target,provider,product:selected?.name||(mode==='custom'?`${config.title} ${rupiah(amount)}`:config.title),amount}})
 return <main className={`mobile-app modern-purchase service-${type}`}>
  <header className="purchase-head modern"><button onClick={()=>navigate(-1)}><ArrowLeft/></button><div><strong>{config.title}</strong><small>Layanan resmi FastPay</small></div><i><ShieldCheck/></i></header>
  <section className="service-intro"><span>{config.title}</span><h1>Transaksi lebih praktis dan aman</h1><p>Masukkan data tujuan, pilih penyedia, lalu tentukan produk yang kamu inginkan.</p></section>
  <section className="modern-purchase-body">
   <section className="number-panel"><div className="number-title"><i>{phoneServices.includes(type)?<Smartphone/>:<Hash/>}</i><div><strong>{config.input}</strong><small>Pastikan data tujuan sudah benar</small></div></div><label><span>{phoneServices.includes(type)?'+62':'ID'}</span><input value={target} onChange={event=>changeTarget(event.target.value)} placeholder={config.placeholder} inputMode={type==='game'||type==='voucher'?'text':'numeric'}/>{provider&&automatic.includes(type)&&<CheckCircle2/>}</label>{automatic.includes(type)&&<p>{provider?<>Nomor terdeteksi sebagai <b>{provider}</b></>:'Operator terpilih otomatis berdasarkan nomor.'}</p>}</section>
   <section className="provider-panel"><header><div><strong>Pilih Penyedia</strong><small>Pilih layanan yang sesuai</small></div>{provider&&<span>Terpilih</span>}</header><div className="modern-provider-grid">{config.providers.map((name,index)=><button className={`${provider===name?'active':''} tone-${index%5}`} onClick={()=>{setProvider(name);setCatalog(false);setSelected(null)}} key={name}><i>{name.slice(0,2).toUpperCase()}</i><span>{name}</span>{provider===name&&<CheckCircle2/>}</button>)}</div><button className="show-products" onClick={()=>setCatalog(true)} disabled={target.length<4||!provider}>Lihat Produk & Nominal <ChevronRight/></button></section>
   {catalog&&<section className="modern-catalog"><header><div><span>Produk tersedia</span><strong>{provider}</strong></div><button onClick={()=>setCatalog(false)}>Tutup</button></header>{custom.includes(type)&&<div className="modern-tabs"><button className={mode==='product'?'active':''} onClick={()=>setMode('product')}>Pilihan Nominal</button><button className={mode==='custom'?'active':''} onClick={()=>setMode('custom')}>Nominal Lain</button></div>}{mode==='product'?<div className="modern-product-grid">{products.map(product=><button className={selected?.id===product.id?'selected':''} onClick={()=>setSelected(product)} key={product.id}><span>{product.name}</span><strong>{rupiah(product.price)}</strong><small>Aktif · Proses instan</small>{selected?.id===product.id&&<CheckCircle2/>}</button>)}{!products.length&&<p>Produk {provider} sedang diperbarui.</p>}</div>:<section className="modern-free-amount"><span>Masukkan nominal lain</span><label><b>Rp</b><input value={freeAmount} onChange={event=>setFreeAmount(event.target.value.replace(/\D/g,''))} placeholder="0" inputMode="numeric"/></label><small>Minimum Rp5.000 · Maksimum Rp2.000.000</small></section>}{amount>=5000&&<footer className="modern-payment"><div><WalletCards/><span><small>Total pembayaran</small><strong>{rupiah(amount)}</strong></span></div><button onClick={checkout}>Lanjut Pembayaran</button></footer>}</section>}
   <p className="modern-secure"><ShieldCheck/>Transaksi dilindungi sistem keamanan FastPay</p>
  </section><MobileNav/>
 </main>
}
