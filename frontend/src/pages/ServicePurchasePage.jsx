import {useCallback,useEffect,useMemo,useState} from 'react'
import {useParams,useNavigate,useLocation} from 'react-router-dom'
import {ArrowLeft,ShieldCheck,CheckCircle2,ChevronRight,Zap,LockKeyhole,Clock3,ReceiptText,BadgeCheck,ContactRound,Star,Search} from 'lucide-react'
import {useAsync} from '../hooks/useAsync'
import {getProducts} from '../services/productService'
import {inquirePulsa24} from '../services/transactionService'
import {rupiah} from '../utils/currency'
import {serviceConfig} from '../constants/services'
import {detectOperator} from '../constants/operators'
import {fallbackProducts} from '../constants/fallbackProducts'
import MobileNav from '../components/mobile/MobileNav'
import {useAuth} from '../context/AuthContext'
import {useToast} from '../context/ToastContext'
import {getFavoriteContacts,loadFavoriteContacts,normalizeNumber,removeFavoriteContact,saveFavoriteContact} from '../services/contactFavorites'
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
const isVariableProduct=product=>Boolean(product&&(Number(product.price)<=0||String(product.status||'').startsWith('OPEN_AMOUNT')))
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

export default function ServicePurchasePage(){
 const {type}=useParams(),navigate=useNavigate(),location=useLocation(),config=serviceConfig[type]||serviceConfig.pulsa
 const loadProducts=useCallback(()=>getProducts(type),[type])
 const {data=[]}=useAsync(loadProducts)
 const {user}=useAuth(),{show}=useToast()
 const [target,setTarget]=useState(''),[provider,setProvider]=useState(type==='pln'?'PLN':''),[catalog,setCatalog]=useState(false),[mode,setMode]=useState('product'),[selected,setSelected]=useState(null),[freeAmount,setFreeAmount]=useState('')
 const [plnMode,setPlnMode]=useState('token'),[plnBill,setPlnBill]=useState(null)
 const [checkingBill,setCheckingBill]=useState(false),[billError,setBillError]=useState('')
 const [favoriteContacts,setFavoriteContacts]=useState(()=>getFavoriteContacts(user?.id)),[contactHint,setContactHint]=useState('')
 const [providerQuery,setProviderQuery]=useState(''),[providerLimit,setProviderLimit]=useState(18),[productQuery,setProductQuery]=useState(''),[productLimit,setProductLimit]=useState(40),[catalogGroup,setCatalogGroup]=useState('')
 const supportsContacts=type==='pulsa'||type==='ewallet'
 const matchingFavorites=useMemo(()=>favoriteContacts.filter(item=>item.service===type),[favoriteContacts,type])
 const favorite=favoriteContacts.some(item=>item.id===`${normalizeNumber(target)}-${type}`)
 const openCatalog=()=>{setCatalog(true);navigate(location.pathname,{state:{catalog:true}})}
 const closeCatalog=()=>{if(location.state?.catalog){navigate(-1);return}setCatalog(false)}
 useEffect(()=>{setCatalog(Boolean(location.state?.catalog))},[location.state])
 useEffect(()=>{if(user?.id)loadFavoriteContacts(user.id).then(setFavoriteContacts).catch(()=>setContactHint('Favorit belum dapat dimuat dari server.'))},[user?.id])
 const normalize=value=>String(value||'').trim().toLocaleLowerCase('id-ID')
 const serviceProducts=useMemo(()=>Array.isArray(data)?data.filter(item=>item.service?item.service===type:normalize(item.category)===normalize(config.category)):[],[data,type,config.category])
 const availableProviders=useMemo(()=>{const remote=serviceProducts.map(item=>item.operator),seen=new Set();return [...config.providers,...remote].filter(name=>{const key=normalize(name);if(!key||key==='garena'||(type==='tv'&&key==='tv berlangganan')||seen.has(key))return false;seen.add(key);return true})},[config.providers,serviceProducts,type])
 const matchingProviders=useMemo(()=>availableProviders.filter(name=>normalize(name).includes(normalize(providerQuery))),[availableProviders,providerQuery])
 const visibleProviders=matchingProviders.slice(0,providerLimit)
 const products=useMemo(()=>{const remote=serviceProducts.filter(product=>normalize(product.operator)===normalize(provider)),local=remote.length?[]:fallbackProducts(config.category,provider),seen=new Set();return [...remote,...local].filter(product=>{const key=product.sku?`sku:${normalize(product.sku)}`:[normalize(product.category),normalize(product.operator),normalize(product.name),Number(product.nominal||product.price||0)].join('|');if(seen.has(key))return false;seen.add(key);return true})},[serviceProducts,config.category,provider])
 const catalogGroups=useMemo(()=>[...new Set(products.map(product=>product.group).filter(Boolean))].sort((a,b)=>a.localeCompare(b,'id')),[products])
 const filteredProducts=useMemo(()=>products.filter(product=>(!catalogGroup||product.group===catalogGroup)&&normalize(`${product.name} ${product.sku||''} ${product.group||''}`).includes(normalize(productQuery))),[products,productQuery,catalogGroup])
 const visibleProducts=filteredProducts.slice(0,productLimit)
 useEffect(()=>{setProviderQuery('');setProviderLimit(18)},[type])
 useEffect(()=>{setProductQuery('');setProductLimit(40);setCatalogGroup('')},[provider])
 const selectedVariable=isVariableProduct(selected)
 const amount=type==='pln'&&plnMode==='bill'?plnBill?.total||0:(mode==='custom'||selectedVariable)?Number(freeAmount):selected?.price||0
 const [inputPrefix,inputPlaceholder,inputMode]=inputMeta[type]||[phoneServices.includes(type)?'+62':'Akun',config.placeholder,textInputServices.includes(type)?'text':'numeric']
 const providerIndex=Math.max(0,availableProviders.indexOf(provider))
 const changeTarget=value=>{setTarget(value);setContactHint('');closeCatalog();setSelected(null);setPlnBill(null);if(automatic.includes(type))setProvider(detectOperator(value)?.name||'')}
 const toggleFavorite=async()=>{
  if(!normalizeNumber(target)||normalizeNumber(target).length<9){setContactHint('Masukkan nomor yang valid dulu untuk menyimpan favorit.');return}
  try{const next=await(favorite?removeFavoriteContact(target,type,user?.id):saveFavoriteContact({number:target,label:provider||config.title,service:type},user?.id));setFavoriteContacts(next);show(favorite?'Nomor dihapus dari favorit':'Nomor disimpan ke favorit')}catch(error){setContactHint(error.message)}
 }
 const pickContact=async()=>{
  setContactHint('')
  try {
   if(!navigator.contacts?.select){setContactHint('Pemilih kontak belum didukung browser ini. Pilih nomor favorit di bawah atau masukkan manual.');return}
   const contacts=await navigator.contacts.select(['name','tel'],{multiple:false})
   const number=contacts?.[0]?.tel?.[0]
   if(number) changeTarget(number)
  } catch { /* pengguna membatalkan pemilih kontak */ }
 }
 const changePlnMode=value=>{setPlnMode(value);closeCatalog();setSelected(null);setFreeAmount('');setPlnBill(null);if(value==='bill')setProvider('PLN Pascabayar');else setProvider('PLN')}
 const checkPlnBill=async()=>{
  const plnProduct=products.find(item=>/pascabayar|tagihan/i.test(`${item.name} ${item.sku||''}`))
  if(!plnProduct?.sku){setBillError('Produk inquiry PLN belum tersedia dari katalog H2H.');return}
  setCheckingBill(true);setBillError('');setPlnBill(null)
  try {
   const result=await inquirePulsa24({sku:plnProduct.sku,target})
   setPlnBill({...result,data:result.data||{},total:Number(result.amount||0),sku:plnProduct.sku,idpel:target})
  } catch(error) { setBillError(error.message) } finally { setCheckingBill(false) }
 }
 const checkout=()=>navigate('/app/checkout',{state:{type,title:type==='pln'&&plnMode==='bill'?'Bayar Tagihan PLN':config.title,target,provider:type==='pln'&&plnMode==='bill'?'PLN Pascabayar':provider,product:type==='pln'&&plnMode==='bill'?`Tagihan PLN ${plnBill?.idpel}`:selected?.name||((mode==='custom'||selectedVariable)?`${config.title} ${rupiah(amount)}`:config.title),amount,sku:type==='pln'&&plnMode==='bill'?plnBill?.sku:selected?.sku,qty:type==='pln'&&plnMode==='bill'?amount:((mode==='custom'||selectedVariable)?amount:(selected?.nominal||amount)),detail:type==='pln'&&plnMode==='bill'?plnBill:null}})
 if(catalog)return <main className={`mobile-app product-catalog-page service-${type} catalog-provider-${providerIndex}`}>
  <header className="catalog-page-head"><button onClick={closeCatalog}><ArrowLeft/></button><div><strong>Produk {provider}</strong><small>{config.title} · {products.length} pilihan tersedia</small></div></header>
  <section className="catalog-provider-hero"><div><span>PROVIDER TERPILIH</span><h1>{provider}</h1><p>Pilih produk atau nominal yang paling sesuai dengan kebutuhanmu.</p></div><ProviderLogo name={provider} className="catalog-provider-logo"/></section>
  <section className="catalog-page-body">
   {custom.includes(type)&&<div className="modern-tabs catalog-tabs"><button className={mode==='product'?'active':''} onClick={()=>setMode('product')}>Pilihan Nominal</button><button className={mode==='custom'?'active':''} onClick={()=>setMode('custom')}>Nominal Lain</button></div>}
   <div className="catalog-summary"><span><CheckCircle2/>Produk resmi</span><span><Zap/>Proses instan</span><span><ShieldCheck/>Pembayaran aman</span></div>
   {mode==='product'?<><div className="catalog-filter-row"><label className="catalog-search"><Search/><input value={productQuery} onChange={event=>{setProductQuery(event.target.value);setProductLimit(40)}} placeholder="Cari nama produk atau SKU"/><span>{filteredProducts.length}</span></label>{catalogGroups.length>1&&<select className="catalog-group-filter" value={catalogGroup} onChange={event=>{setCatalogGroup(event.target.value);setProductLimit(40)}} aria-label="Kelompok produk"><option value="">Semua jenis</option>{catalogGroups.map(group=><option value={group} key={group}>{group}</option>)}</select>}</div><div className="modern-product-grid living-product-grid">{visibleProducts.map(product=>{const openAmount=String(product.status||'').startsWith('OPEN_AMOUNT');return <button className={`product-card ${selected?.id===product.id?'selected':''}`} onClick={()=>setSelected(product)} key={product.id}><div className="product-card-brand"><ProviderLogo name={provider} className="catalog-provider-logo"/><span>{provider}</span></div><span>{product.name}</span><strong>{openAmount?`Biaya ${rupiah(product.price)}`:rupiah(product.price)}</strong><small>{product.sku?`SKU ${product.sku} · `:''}{openAmount?'Nominal bebas':'Proses instan'}</small>{selected?.id===product.id&&<CheckCircle2/>}</button>})}{!filteredProducts.length&&<p className="catalog-empty">Produk yang dicari belum tersedia.</p>}</div>{visibleProducts.length<filteredProducts.length&&<button className="catalog-load-more" onClick={()=>setProductLimit(limit=>limit+40)}>Muat {Math.min(40,filteredProducts.length-visibleProducts.length)} produk berikutnya <ChevronRight/></button>}</>:<section className="modern-free-amount catalog-free-amount"><span>Masukkan nominal lain</span><label><b>Rp</b><input value={freeAmount} onChange={event=>setFreeAmount(event.target.value.replace(/\D/g,''))} placeholder="0" inputMode="numeric"/></label><small>Minimum Rp5.000 · Maksimum Rp2.000.000</small></section>}
   {mode==='product'&&selectedVariable&&<section className="modern-free-amount catalog-free-amount variable-product-amount"><span>Nominal transaksi untuk {selected.name}</span><label><b>Rp</b><input value={freeAmount} onChange={event=>setFreeAmount(event.target.value.replace(/\D/g,''))} placeholder="Masukkan nominal" inputMode="numeric"/></label><small>Masukkan jumlah sesuai tagihan atau kebutuhan transaksi.</small></section>}
  </section>
  {amount>=5000&&<footer className="catalog-payment"><div><small>Total pembayaran</small><strong>{rupiah(amount)}</strong></div><button onClick={checkout}>Lanjut Pembayaran <ChevronRight/></button></footer>}
  <MobileNav/>
 </main>
 return <main className={`mobile-app modern-purchase service-${type}`}>
  <header className="purchase-head modern"><button onClick={()=>navigate(-1)}><ArrowLeft/></button><div><strong>{config.title}</strong><small>Layanan resmi KuotaKita</small></div><i><ShieldCheck/></i></header>
  <section className="service-intro service-person-hero"><img src={serviceHeroes[type]||communicationHero} alt="" aria-hidden="true" decoding="async" fetchPriority="high"/><div className="service-person-shade"/><div className="service-intro-copy"><span>{config.title}</span><h1>Transaksi lebih praktis dan aman</h1><p>Masukkan data tujuan, pilih penyedia, lalu tentukan produk yang kamu inginkan.</p></div></section>
  <section className="modern-purchase-body">
   {type==='pln'&&<section className="pln-mode-panel"><button type="button" className={plnMode==='token'?'active':''} onClick={()=>changePlnMode('token')}><Zap/><span><b>Beli Token Listrik</b><small>Isi token prabayar PLN</small></span></button><button type="button" className={plnMode==='bill'?'active':''} onClick={()=>changePlnMode('bill')}><ReceiptText/><span><b>Bayar Tagihan PLN</b><small>Cek tagihan pascabayar</small></span></button></section>}
   <section className="number-panel"><div className="number-title"><i className="service-input-emblem"><ServiceEmblem type={type} label={config.title}/></i><div><strong>{type==='pln'&&plnMode==='bill'?'ID Pelanggan / Nomor Meter':config.input}</strong><small>{type==='pln'&&plnMode==='bill'?'Masukkan ID PLN untuk cek tagihan otomatis':'Pastikan data tujuan sudah benar'}</small></div><span className="verified-service"><ShieldCheck/> Resmi</span></div><label><span className="target-prefix">{type==='pln'&&plnMode==='bill'?'IDPEL':inputPrefix}</span><input value={target} onChange={event=>changeTarget(event.target.value)} placeholder={type==='pln'&&plnMode==='bill'?'Contoh: 535123456789':inputPlaceholder} inputMode={inputMode}/>{provider&&automatic.includes(type)&&<CheckCircle2/>}</label>{supportsContacts&&<><div className="contact-target-tools"><button type="button" onClick={pickContact}><ContactRound/> Pilih dari kontak</button><button type="button" className={favorite?'active':''} onClick={toggleFavorite} aria-pressed={favorite}><Star fill={favorite?'currentColor':'none'}/> {favorite?'Tersimpan':'Simpan favorit'}</button></div>{matchingFavorites.length>0&&<div className="contact-favorites"><small>Nomor favorit</small><div>{matchingFavorites.map(item=><button type="button" key={item.id} onClick={()=>changeTarget(item.number)}><span>{item.label}</span><b>{item.number}</b></button>)}</div></div>}{contactHint&&<p className="contact-hint">{contactHint}</p>}</>}{automatic.includes(type)&&<p>{provider?<>Nomor terdeteksi sebagai <b>{provider}</b></>:'Operator terpilih otomatis berdasarkan nomor.'}</p>}{type==='pln'&&plnMode==='bill'&&<><button type="button" className="pln-check-button" onClick={checkPlnBill} disabled={checkingBill||target.replace(/\D/g,'').length<6}><ReceiptText/> {checkingBill?'Memeriksa tagihan...':'Cek Tagihan PLN'}</button>{billError&&<p className="contact-hint">{billError}</p>}</>}</section>
   <section className="service-confidence"><div><Zap/><span><b>Proses instan</b><small>Diproses otomatis</small></span></div><div><LockKeyhole/><span><b>Data aman</b><small>Terenkripsi</small></span></div><div><Clock3/><span><b>Aktif 24 jam</b><small>Setiap hari</small></span></div></section>
   {type==='pln'&&plnMode==='bill'&&plnBill&&<section className="pln-bill-card"><header><div><BadgeCheck/><span>Tagihan ditemukan dari Pulsa24Jam</span></div><strong>{rupiah(plnBill.total)}</strong></header><div className="pln-bill-owner"><ProviderLogo name="PLN"/><div><b>{plnBill.data?.customer_name||plnBill.data?.customer||'Pelanggan PLN'}</b><small>IDPEL {plnBill.idpel}</small></div></div><dl><div><dt>Nominal tagihan</dt><dd>{rupiah(plnBill.total)}</dd></div><div><dt>Status inquiry</dt><dd>{plnBill.status||'pending'}</dd></div><div><dt>Ref cek</dt><dd>{plnBill.refid}</dd></div></dl><button type="button" onClick={checkout}>Lanjut Bayar Tagihan <ChevronRight/></button></section>}
   {!(type==='pln'&&plnMode==='bill')&&<section className="provider-panel"><header><div><strong>{type==='pln'?'Pilih Produk PLN':'Pilih Penyedia'}</strong><small>{type==='pln'?'Token listrik resmi PLN':`${availableProviders.length} penyedia H2H tersedia`}</small></div>{provider&&<span>Terpilih</span>}</header>{availableProviders.length>9&&<label className="provider-search"><Search/><input value={providerQuery} onChange={event=>{setProviderQuery(event.target.value);setProviderLimit(18)}} placeholder="Cari penyedia"/><span>{matchingProviders.length}</span></label>}<div className="modern-provider-grid">{visibleProviders.map((name,index)=><button className={`${provider===name?'active':''} tone-${index%5}`} onClick={()=>{setProvider(name);closeCatalog();setSelected(null)}} key={name}><ProviderLogo name={name}/><span>{name}</span>{provider===name&&<CheckCircle2/>}</button>)}</div>{visibleProviders.length<matchingProviders.length&&<button type="button" className="provider-load-more" onClick={()=>setProviderLimit(limit=>limit+18)}>Tampilkan penyedia lainnya <ChevronRight/></button>}<button className="show-products" onClick={()=>{openCatalog();window.scrollTo({top:0,behavior:'smooth'})}} disabled={target.length<4||!provider}>Lihat Produk & Nominal <ChevronRight/></button></section>}
   <p className="modern-secure"><ShieldCheck/>Transaksi dilindungi sistem keamanan KuotaKita</p>
  </section><MobileNav/>
 </main>
}
