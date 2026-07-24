import {useMemo,useState} from 'react'
import {useParams,useNavigate} from 'react-router-dom'
import {ArrowLeft,ShieldCheck,CheckCircle2,ChevronRight,Zap,LockKeyhole,Clock3,ReceiptText,BadgeCheck} from 'lucide-react'
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
const inputMeta={
 pulsa:['+62','Contoh: 081234567890','numeric'],data:['+62','Contoh: 081234567890','numeric'],ewallet:['HP','Nomor e-wallet aktif','numeric'],pascabayar:['+62','Nomor HP pascabayar','numeric'],
 pln:['Meter','Nomor meter / ID pelanggan PLN','numeric'],pdam:['PDAM','Nomor pelanggan PDAM','numeric'],bpjs:['BPJS','Nomor peserta BPJS Kesehatan','numeric'],gas:['PGN','Nomor pelanggan gas PGN','numeric'],
 internet:['ID','Nomor pelanggan internet','numeric'],telkom:['ID','Nomor pelanggan Telkom / IndiHome','numeric'],tv:['TV','Nomor pelanggan TV berlangganan','numeric'],
 bank:['Rek','Nomor rekening tujuan','numeric'],voucher:['Email','Email atau nomor HP penerima','text'],streaming:['Akun','Email / nomor HP akun pelanggan','text'],esim:['Akun','Email atau nomor HP penerima eSIM','text'],
 game:['ID Game','User ID / server ID game','text'],school:['NIS','Nomor siswa / mahasiswa','numeric'],insurance:['Polis','Nomor polis asuransi','numeric'],vehicle:['Kontrak','Nomor kontrak cicilan','numeric'],multifinance:['Kontrak','Nomor kontrak multifinance','numeric'],
 property:['NOP','Nomor objek pajak','numeric'],tax:['Billing','Kode billing pajak / negara','text'],qris:['QRIS','Kode / ID merchant QRIS','text'],emoney:['Kartu','Nomor kartu uang elektronik','numeric'],toll:['Kartu','Nomor kartu tol','numeric'],
 health:['Pasien','Nomor pasien / booking','numeric'],creditcard:['Kartu','Nomor kartu / pelanggan','numeric'],zakat:['HP','Nomor HP donatur','numeric'],parking:['Plat','Nomor kendaraan, contoh BK1234ABC','text'],delivery:['HP','Nomor HP pengirim','numeric'],travel:['HP','Nomor HP pemesan','numeric'],
}
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

const plnCustomers=['Budi Santoso','Siti Aminah','Rizky Pratama','Anggi Budino','Mikael KuotaKita','Dewi Lestari','Agus Salim','Nur Aisyah']
const makePlnBill=id=>{
 const clean=String(id||'').replace(/\D/g,'')
 if(clean.length<6)return null
 const seed=clean.split('').reduce((sum,char,index)=>sum+(Number(char)||0)*(index+1),0)
 const base=[74500,126800,182400,238900,315600,426700][seed%6]
 const admin=3000
 const period=new Date().toLocaleDateString('id-ID',{month:'long',year:'numeric'})
 return {
  customer:plnCustomers[seed%plnCustomers.length],
  idpel:clean,
  meter:`53${clean.slice(-8).padStart(8,'0')}`,
  tariff:['R1/900VA','R1/1300VA','R1/2200VA','B1/2200VA'][seed%4],
  period,
  stand:`${(seed*17%9000)+1000} - ${(seed*17%9000)+1128}`,
  bill:base,
  admin,
  total:base+admin,
  ref:`PLN-${clean.slice(-6)}-${Date.now().toString().slice(-4)}`
 }
}

export default function ServicePurchasePage(){
 const {type}=useParams(),navigate=useNavigate(),config=serviceConfig[type]||serviceConfig.pulsa,{data=[]}=useAsync(getProducts)
 const [target,setTarget]=useState(''),[provider,setProvider]=useState(type==='pln'?'PLN':''),[catalog,setCatalog]=useState(false),[mode,setMode]=useState('product'),[selected,setSelected]=useState(null),[freeAmount,setFreeAmount]=useState('')
 const [plnMode,setPlnMode]=useState('token'),[plnBill,setPlnBill]=useState(null)
 const products=useMemo(()=>{const normalize=value=>String(value||'').trim().toLocaleLowerCase('id-ID'),remote=Array.isArray(data)?data.filter(product=>normalize(product.category)===normalize(config.category)&&normalize(product.operator)===normalize(provider)):[],local=fallbackProducts(config.category,provider),seen=new Set();return [...remote,...local].filter(product=>{const key=[normalize(product.category),normalize(product.operator),normalize(product.name),Number(product.nominal||product.price||0)].join('|');if(seen.has(key))return false;seen.add(key);return true})},[data,config.category,provider])
 const amount=type==='pln'&&plnMode==='bill'?plnBill?.total||0:mode==='custom'?Number(freeAmount):selected?.price||0
 const [inputPrefix,inputPlaceholder,inputMode]=inputMeta[type]||[phoneServices.includes(type)?'+62':'Akun',config.placeholder,textInputServices.includes(type)?'text':'numeric']
 const providerIndex=Math.max(0,config.providers.indexOf(provider))
 const changeTarget=value=>{setTarget(value);setCatalog(false);setSelected(null);setPlnBill(null);if(automatic.includes(type))setProvider(detectOperator(value)?.name||'')}
 const changePlnMode=value=>{setPlnMode(value);setCatalog(false);setSelected(null);setFreeAmount('');setPlnBill(null);if(value==='bill')setProvider('PLN Pascabayar');else setProvider('PLN')}
 const checkPlnBill=()=>setPlnBill(makePlnBill(target))
 const checkout=()=>navigate('/app/checkout',{state:{type,title:type==='pln'&&plnMode==='bill'?'Bayar Tagihan PLN':config.title,target,provider:type==='pln'&&plnMode==='bill'?'PLN Pascabayar':provider,product:type==='pln'&&plnMode==='bill'?`Tagihan PLN ${plnBill?.period}`:selected?.name||(mode==='custom'?`${config.title} ${rupiah(amount)}`:config.title),amount,detail:type==='pln'&&plnMode==='bill'?plnBill:null}})
 if(catalog)return <main className={`mobile-app product-catalog-page service-${type} catalog-provider-${providerIndex}`}>
  <header className="catalog-page-head"><button onClick={()=>setCatalog(false)}><ArrowLeft/></button><div><strong>Produk {provider}</strong><small>{config.title} Â· {products.length} pilihan tersedia</small></div></header>
  <section className="catalog-provider-hero"><div><span>PROVIDER TERPILIH</span><h1>{provider}</h1><p>Pilih produk atau nominal yang paling sesuai dengan kebutuhanmu.</p></div><ProviderLogo name={provider} className="catalog-provider-logo"/></section>
  <section className="catalog-page-body">
   {custom.includes(type)&&<div className="modern-tabs catalog-tabs"><button className={mode==='product'?'active':''} onClick={()=>setMode('product')}>Pilihan Nominal</button><button className={mode==='custom'?'active':''} onClick={()=>setMode('custom')}>Nominal Lain</button></div>}
   <div className="catalog-summary"><span><CheckCircle2/>Produk resmi</span><span><Zap/>Proses instan</span><span><ShieldCheck/>Pembayaran aman</span></div>
   {mode==='product'?<div className="modern-product-grid living-product-grid">{products.map((product,index)=><button className={`product-card ${selected?.id===product.id?'selected':''}`} onClick={()=>setSelected(product)} key={product.id}><ProviderLogo name={provider} className="catalog-provider-logo product-watermark"/><div className="product-card-brand"><ProviderLogo name={provider} className="catalog-provider-logo"/><span>{provider}</span></div><b className="product-sequence">{String(index+1).padStart(2,'0')}</b><span>{product.name}</span><strong>{rupiah(product.price)}</strong><small>Aktif Â· Proses instan</small>{selected?.id===product.id&&<CheckCircle2/>}</button>)}{!products.length&&<p>Produk {provider} sedang diperbarui.</p>}</div>:<section className="modern-free-amount catalog-free-amount"><span>Masukkan nominal lain</span><label><b>Rp</b><input value={freeAmount} onChange={event=>setFreeAmount(event.target.value.replace(/\D/g,''))} placeholder="0" inputMode="numeric"/></label><small>Minimum Rp5.000 Â· Maksimum Rp2.000.000</small></section>}
  </section>
  {amount>=5000&&<footer className="catalog-payment"><div><small>Total pembayaran</small><strong>{rupiah(amount)}</strong></div><button onClick={checkout}>Lanjut Pembayaran <ChevronRight/></button></footer>}
  <MobileNav/>
 </main>
 return <main className={`mobile-app modern-purchase service-${type}`}>
  <header className="purchase-head modern"><button onClick={()=>navigate(-1)}><ArrowLeft/></button><div><strong>{config.title}</strong><small>Layanan resmi KuotaKita</small></div><i><ShieldCheck/></i></header>
  <section className="service-intro service-person-hero"><img src={serviceHeroes[type]||communicationHero} alt="" aria-hidden="true"/><div className="service-person-shade"/><div className="service-intro-copy"><span>{config.title}</span><h1>Transaksi lebih praktis dan aman</h1><p>Masukkan data tujuan, pilih penyedia, lalu tentukan produk yang kamu inginkan.</p></div></section>
  <section className="modern-purchase-body">
   {type==='pln'&&<section className="pln-mode-panel"><button type="button" className={plnMode==='token'?'active':''} onClick={()=>changePlnMode('token')}><Zap/><span><b>Beli Token Listrik</b><small>Isi token prabayar PLN</small></span></button><button type="button" className={plnMode==='bill'?'active':''} onClick={()=>changePlnMode('bill')}><ReceiptText/><span><b>Bayar Tagihan PLN</b><small>Cek tagihan pascabayar</small></span></button></section>}
   <section className="number-panel"><div className="number-title"><i className="service-input-emblem"><ServiceEmblem type={type} label={config.title}/></i><div><strong>{type==='pln'&&plnMode==='bill'?'ID Pelanggan / Nomor Meter':config.input}</strong><small>{type==='pln'&&plnMode==='bill'?'Masukkan ID PLN untuk cek tagihan otomatis':'Pastikan data tujuan sudah benar'}</small></div><span className="verified-service"><ShieldCheck/> Resmi</span></div><label><span className="target-prefix">{type==='pln'&&plnMode==='bill'?'IDPEL':inputPrefix}</span><input value={target} onChange={event=>changeTarget(event.target.value)} placeholder={type==='pln'&&plnMode==='bill'?'Contoh: 535123456789':inputPlaceholder} inputMode={inputMode}/>{provider&&automatic.includes(type)&&<CheckCircle2/>}</label>{automatic.includes(type)&&<p>{provider?<>Nomor terdeteksi sebagai <b>{provider}</b></>:'Operator terpilih otomatis berdasarkan nomor.'}</p>}{type==='pln'&&plnMode==='bill'&&<button type="button" className="pln-check-button" onClick={checkPlnBill} disabled={target.replace(/\D/g,'').length<6}><ReceiptText/> Cek Tagihan PLN</button>}</section>
   <section className="service-confidence"><div><Zap/><span><b>Proses instan</b><small>Diproses otomatis</small></span></div><div><LockKeyhole/><span><b>Data aman</b><small>Terenkripsi</small></span></div><div><Clock3/><span><b>Aktif 24 jam</b><small>Setiap hari</small></span></div></section>
   {type==='pln'&&plnMode==='bill'&&plnBill&&<section className="pln-bill-card"><header><div><BadgeCheck/><span>Tagihan ditemukan</span></div><strong>{rupiah(plnBill.total)}</strong></header><div className="pln-bill-owner"><ProviderLogo name="PLN"/><div><b>{plnBill.customer}</b><small>IDPEL {plnBill.idpel} • Meter {plnBill.meter}</small></div></div><dl><div><dt>Periode</dt><dd>{plnBill.period}</dd></div><div><dt>Tarif/Daya</dt><dd>{plnBill.tariff}</dd></div><div><dt>Stand meter</dt><dd>{plnBill.stand}</dd></div><div><dt>Tagihan</dt><dd>{rupiah(plnBill.bill)}</dd></div><div><dt>Admin</dt><dd>{rupiah(plnBill.admin)}</dd></div><div><dt>Ref cek</dt><dd>{plnBill.ref}</dd></div></dl><button type="button" onClick={checkout}>Lanjut Bayar Tagihan <ChevronRight/></button></section>}
   {!(type==='pln'&&plnMode==='bill')&&<section className="provider-panel"><header><div><strong>{type==='pln'?'Pilih Produk PLN':'Pilih Penyedia'}</strong><small>{type==='pln'?'Token listrik resmi PLN':'Pilih layanan yang sesuai'}</small></div>{provider&&<span>Terpilih</span>}</header><div className="modern-provider-grid">{config.providers.map((name,index)=><button className={`${provider===name?'active':''} tone-${index%5}`} onClick={()=>{setProvider(name);setCatalog(false);setSelected(null)}} key={name}><ProviderLogo name={name}/><span>{name}</span>{provider===name&&<CheckCircle2/>}</button>)}</div><button className="show-products" onClick={()=>{setCatalog(true);window.scrollTo({top:0,behavior:'smooth'})}} disabled={target.length<4||!provider}>Lihat Produk & Nominal <ChevronRight/></button></section>}
   <p className="modern-secure"><ShieldCheck/>Transaksi dilindungi sistem keamanan KuotaKita</p>
  </section><MobileNav/>
 </main>
}
