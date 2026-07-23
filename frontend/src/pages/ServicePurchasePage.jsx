import {useMemo,useState} from 'react'
import {useParams,useNavigate} from 'react-router-dom'
import {ArrowLeft,ShieldCheck,CheckCircle2,ChevronRight,Zap,LockKeyhole,Clock3} from 'lucide-react'
import {useAsync} from '../hooks/useAsync'
import {getProducts} from '../services/productService'
import {rupiah} from '../utils/currency'
import {serviceConfig} from '../constants/services'
import {detectOperator} from '../constants/operators'
import {fallbackProducts} from '../constants/fallbackProducts'
import MobileNav from '../components/mobile/MobileNav'
import ServiceEmblem from '../components/mobile/ServiceEmblem'
import ProviderLogo from '../components/mobile/ProviderLogo'
import communicationHero from '../assets/service-heroes/communication.png'
import financeHero from '../assets/service-heroes/finance.png'
import healthHero from '../assets/service-heroes/health.png'
import utilitiesHero from '../assets/service-heroes/utilities.png'
import entertainmentHero from '../assets/service-heroes/entertainment.png'
import educationHero from '../assets/service-heroes/education.png'
import vehicleHero from '../assets/service-heroes/vehicle.png'
import propertyHero from '../assets/service-heroes/property.png'
import travelHero from '../assets/service-heroes/travel.png'
import dataHero from '../assets/service-heroes/data.png'
import pascabayarHero from '../assets/service-heroes/pascabayar.png'
import bankHero from '../assets/service-heroes/bank.png'
import insuranceHero from '../assets/service-heroes/insurance.png'
import pdamHero from '../assets/service-heroes/pdam.png'
import gasHero from '../assets/service-heroes/gas.png'
import internetHero from '../assets/service-heroes/internet.png'
import telkomHero from '../assets/service-heroes/telkom.png'
import tvHero from '../assets/service-heroes/tv.png'
import voucherHero from '../assets/service-heroes/voucher.png'

const automatic=['pulsa','data']
const custom=['pulsa','ewallet']
const phoneServices=['pulsa','data','ewallet','pascabayar']
const textInputServices=['game','voucher','streaming','esim','parking','qris']
const serviceHeroes={
 pulsa:communicationHero,data:dataHero,pascabayar:pascabayarHero,
 ewallet:financeHero,bank:bankHero,insurance:insuranceHero,
 bpjs:healthHero,
 pln:utilitiesHero,pdam:pdamHero,gas:gasHero,internet:internetHero,telkom:telkomHero,tv:tvHero,
 game:entertainmentHero,voucher:voucherHero,
 school:educationHero,vehicle:vehicleHero,property:propertyHero,travel:travelHero,
 qris:financeHero,emoney:financeHero,toll:travelHero,streaming:entertainmentHero,
 esim:dataHero,health:healthHero,creditcard:bankHero,multifinance:financeHero,
 tax:propertyHero,zakat:healthHero,parking:vehicleHero,delivery:travelHero,
}

export default function ServicePurchasePage(){
 const {type}=useParams(),navigate=useNavigate(),config=serviceConfig[type]||serviceConfig.pulsa,{data=[]}=useAsync(getProducts)
 const [target,setTarget]=useState(''),[provider,setProvider]=useState(''),[catalog,setCatalog]=useState(false),[mode,setMode]=useState('product'),[selected,setSelected]=useState(null),[freeAmount,setFreeAmount]=useState('')
 const products=useMemo(()=>{const normalize=value=>String(value||'').trim().toLocaleLowerCase('id-ID'),remote=Array.isArray(data)?data.filter(product=>normalize(product.category)===normalize(config.category)&&normalize(product.operator)===normalize(provider)):[],local=fallbackProducts(config.category,provider),seen=new Set();return [...remote,...local].filter(product=>{const key=[normalize(product.category),normalize(product.operator),normalize(product.name),Number(product.nominal||product.price||0)].join('|');if(seen.has(key))return false;seen.add(key);return true})},[data,config.category,provider])
 const amount=mode==='custom'?Number(freeAmount):selected?.price||0
 const providerIndex=Math.max(0,config.providers.indexOf(provider))
 const changeTarget=value=>{setTarget(value);setCatalog(false);setSelected(null);if(automatic.includes(type))setProvider(detectOperator(value)?.name||'')}
 const checkout=()=>navigate('/app/checkout',{state:{type,title:config.title,target,provider,product:selected?.name||(mode==='custom'?`${config.title} ${rupiah(amount)}`:config.title),amount}})
 if(catalog)return <main className={`mobile-app product-catalog-page service-${type} catalog-provider-${providerIndex}`}>
  <header className="catalog-page-head"><button onClick={()=>setCatalog(false)}><ArrowLeft/></button><div><strong>Produk {provider}</strong><small>{config.title} · {products.length} pilihan tersedia</small></div></header>
  <section className="catalog-provider-hero"><div><span>PROVIDER TERPILIH</span><h1>{provider}</h1><p>Pilih produk atau nominal yang paling sesuai dengan kebutuhanmu.</p></div><ProviderLogo name={provider} className="catalog-provider-logo"/></section>
  <section className="catalog-page-body">
   {custom.includes(type)&&<div className="modern-tabs catalog-tabs"><button className={mode==='product'?'active':''} onClick={()=>setMode('product')}>Pilihan Nominal</button><button className={mode==='custom'?'active':''} onClick={()=>setMode('custom')}>Nominal Lain</button></div>}
   <div className="catalog-summary"><span><CheckCircle2/>Produk resmi</span><span><Zap/>Proses instan</span><span><ShieldCheck/>Pembayaran aman</span></div>
   {mode==='product'?<div className="modern-product-grid living-product-grid">{products.map((product,index)=><button className={`product-card ${selected?.id===product.id?'selected':''}`} onClick={()=>setSelected(product)} key={product.id}><ProviderLogo name={provider} className="catalog-provider-logo product-watermark"/><div className="product-card-brand"><ProviderLogo name={provider} className="catalog-provider-logo"/><span>{provider}</span></div><b className="product-sequence">{String(index+1).padStart(2,'0')}</b><span>{product.name}</span><strong>{rupiah(product.price)}</strong><small>Aktif · Proses instan</small>{selected?.id===product.id&&<CheckCircle2/>}</button>)}{!products.length&&<p>Produk {provider} sedang diperbarui.</p>}</div>:<section className="modern-free-amount catalog-free-amount"><span>Masukkan nominal lain</span><label><b>Rp</b><input value={freeAmount} onChange={event=>setFreeAmount(event.target.value.replace(/\D/g,''))} placeholder="0" inputMode="numeric"/></label><small>Minimum Rp5.000 · Maksimum Rp2.000.000</small></section>}
  </section>
  {amount>=5000&&<footer className="catalog-payment"><div><small>Total pembayaran</small><strong>{rupiah(amount)}</strong></div><button onClick={checkout}>Lanjut Pembayaran <ChevronRight/></button></footer>}
  <MobileNav/>
 </main>
 return <main className={`mobile-app modern-purchase service-${type}`}>
  <header className="purchase-head modern"><button onClick={()=>navigate(-1)}><ArrowLeft/></button><div><strong>{config.title}</strong><small>Layanan resmi PulsaPrime</small></div><i><ShieldCheck/></i></header>
  <section className="service-intro service-person-hero"><img src={serviceHeroes[type]||communicationHero} alt="" aria-hidden="true"/><div className="service-person-shade"/><div className="service-intro-copy"><span>{config.title}</span><h1>Transaksi lebih praktis dan aman</h1><p>Masukkan data tujuan, pilih penyedia, lalu tentukan produk yang kamu inginkan.</p></div></section>
  <section className="modern-purchase-body">
   <section className="number-panel"><div className="number-title"><i className="service-input-emblem"><ServiceEmblem type={type} label={config.title}/></i><div><strong>{config.input}</strong><small>Pastikan data tujuan sudah benar</small></div><span className="verified-service"><ShieldCheck/> Resmi</span></div><label><span>{phoneServices.includes(type)?'+62':'ID'}</span><input value={target} onChange={event=>changeTarget(event.target.value)} placeholder={config.placeholder} inputMode={textInputServices.includes(type)?'text':'numeric'}/>{provider&&automatic.includes(type)&&<CheckCircle2/>}</label>{automatic.includes(type)&&<p>{provider?<>Nomor terdeteksi sebagai <b>{provider}</b></>:'Operator terpilih otomatis berdasarkan nomor.'}</p>}</section>
   <section className="service-confidence"><div><Zap/><span><b>Proses instan</b><small>Diproses otomatis</small></span></div><div><LockKeyhole/><span><b>Data aman</b><small>Terenkripsi</small></span></div><div><Clock3/><span><b>Aktif 24 jam</b><small>Setiap hari</small></span></div></section>
   <section className="provider-panel"><header><div><strong>Pilih Penyedia</strong><small>Pilih layanan yang sesuai</small></div>{provider&&<span>Terpilih</span>}</header><div className="modern-provider-grid">{config.providers.map((name,index)=><button className={`${provider===name?'active':''} tone-${index%5}`} onClick={()=>{setProvider(name);setCatalog(false);setSelected(null)}} key={name}><ProviderLogo name={name}/><span>{name}</span>{provider===name&&<CheckCircle2/>}</button>)}</div><button className="show-products" onClick={()=>{setCatalog(true);window.scrollTo({top:0,behavior:'smooth'})}} disabled={target.length<4||!provider}>Lihat Produk & Nominal <ChevronRight/></button></section>
   <p className="modern-secure"><ShieldCheck/>Transaksi dilindungi sistem keamanan PulsaPrime</p>
  </section><MobileNav/>
 </main>
}
