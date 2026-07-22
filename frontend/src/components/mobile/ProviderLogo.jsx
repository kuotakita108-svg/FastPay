import bca from '../../assets/providers/official/bca.png'
import bri from '../../assets/providers/official/bri.png'
import bni from '../../assets/providers/official/bni.png'
import mandiri from '../../assets/providers/official/mandiri.png'
import cimb from '../../assets/providers/official/cimb-niaga.svg'
import bsi from '../../assets/providers/official/bsi.png'
import danamon from '../../assets/providers/official/danamon.svg'
import permatabank from '../../assets/providers/official/permatabank.svg'
import seabank from '../../assets/providers/official/seabank.svg'
import jago from '../../assets/providers/official/jago.svg'
import fif from '../../assets/providers/official/fif.png'
import spotify from '../../assets/providers/official/spotify.png'
import vidio from '../../assets/providers/official/vidio.png'
import pajak from '../../assets/providers/official/pajak.png'
import telkomsel from '../../assets/providers/telkomsel.png'
import indosat from '../../assets/providers/indosat.png'
import xl from '../../assets/providers/xl.png'
import tri from '../../assets/providers/tri.png'
import axis from '../../assets/providers/axis.png'
import dana from '../../assets/providers/dana.png'
import gopay from '../../assets/providers/gopay.png'
import ovo from '../../assets/providers/ovo.svg'
import shopeepay from '../../assets/providers/shopeepay.png'
import linkaja from '../../assets/providers/linkaja.svg'
import mobilelegends from '../../assets/providers/mobilelegends.png'
import freefire from '../../assets/providers/freefire.png'
import pubg from '../../assets/providers/pubg.png'
import valorant from '../../assets/providers/valorant.png'
import genshin from '../../assets/providers/genshin.png'
import bpjs from '../../assets/providers/bpjs.png'
import biznet from '../../assets/providers/biznet.png'
import prudential from '../../assets/providers/official/prudential.png'
import allianz from '../../assets/providers/official/allianz.png'
import manulife from '../../assets/providers/official/manulife.png'
import myrepublic from '../../assets/providers/official/myrepublic.png'
import cbn from '../../assets/providers/official/cbn.png'
import indihome from '../../assets/providers/official/indihome.png'
import mncvision from '../../assets/providers/official/mncvision.png'
import transvision from '../../assets/providers/official/transvision.png'
import googleplay from '../../assets/providers/official/googleplay.png'
import apple from '../../assets/providers/official/apple.png'
import garuda from '../../assets/providers/official/garuda.png'
import redbus from '../../assets/providers/official/redbus.png'
import kemendikbud from '../../assets/providers/official/kemendikbud.png'
import astrapay from '../../assets/providers/official/astrapay.svg'
import isaku from '../../assets/providers/official/isaku.svg'
import { BadgeCheck, Banknote, BookOpenCheck, Building2, Bus, Car, CircleParking, Clapperboard, CreditCard, Cross, Droplets, Earth, Flame, Gamepad2, GraduationCap, HandHeart, HeartPulse, Landmark, MapPin, MonitorPlay, Plane, QrCode, Radio, ReceiptText, ShieldCheck, Smartphone, Store, TrainFront, Truck, Wallet, Wifi, Zap } from 'lucide-react'

const imageLogos={BCA:bca,BRI:bri,BNI:bni,Mandiri:mandiri,'CIMB Niaga':cimb,'Bank Syariah Indonesia':bsi,BSI:bsi,Danamon:danamon,PermataBank:permatabank,SeaBank:seabank,'Bank Jago':jago,AstraPay:astrapay,'i.saku':isaku,'FIF Group':fif,Spotify:spotify,Vidio:vidio,Telkomsel:telkomsel,Indosat:indosat,XL:xl,Tri:tri,AXIS:axis,DANA:dana,GoPay:gopay,OVO:ovo,ShopeePay:shopeepay,LinkAja:linkaja,'Mobile Legends':mobilelegends,'Free Fire':freefire,'PUBG Mobile':pubg,Valorant:valorant,'Genshin Impact':genshin,'BPJS Kesehatan':bpjs,Biznet:biznet,Prudential:prudential,Allianz:allianz,Manulife:manulife,MyRepublic:myrepublic,CBN:cbn,IndiHome:indihome,'MNC Vision':mncvision,Transvision:transvision,'Google Play':googleplay,'Apple Gift Card':apple,Pesawat:garuda,'Bus & Travel':redbus,Sekolah:kemendikbud,Universitas:kemendikbud,Bimbel:kemendikbud,'PBB Kota/Kabupaten':pajak}

const svgLogos={
  Netflix:{type:'netflix'},'YouTube Premium':{type:'youtube'},'Disney+ Hotstar':{type:'disney'},'K-Vision':{text:'K-VISION',fg:'#0a8ddf'},
  PLN:{type:'pln'},PGN:{text:'PGN',fg:'#0f9f5f'},PDAM:{text:'PDAM',fg:'#0ea5e9'},Telkom:{text:'telkom',fg:'#e11d48'},
  'QRIS Nasional':{text:'QRIS',fg:'#111827'},'QRIS UMKM':{text:'QRIS',sub:'UMKM',fg:'#111827'},'QRIS Dinamis':{text:'QRIS',sub:'DINAMIS',fg:'#111827'},
  'Mandiri e-Money':{text:'e-money',fg:'#0b4ea2'},'BCA Flazz':{text:'Flazz',fg:'#0f4caa'},'BNI TapCash':{text:'TapCash',fg:'#f97316'},BRIZZI:{text:'BRIZZI',fg:'#00529b'},'Mandiri e-Toll':{text:'e-Toll',fg:'#0b4ea2'},
  Halodoc:{text:'halodoc',fg:'#ef4056'},'Klinik Digital':{text:'Klinik',sub:'Digital',fg:'#16a34a'},Laboratorium:{text:'Lab',sub:'Medika',fg:'#2563eb'},Apotek:{text:'Apotek',fg:'#dc2626'},
  'Home Credit':{text:'Home',sub:'Credit',fg:'#f58220'},Kredivo:{text:'kredivo',fg:'#ff6b00'},Akulaku:{text:'Akulaku',fg:'#10a8e6'},'Mega Finance':{text:'Mega',sub:'Finance',fg:'#1d4ed8'},'Adira Finance':{text:'Adira',sub:'Finance',fg:'#f59e0b'},'WOM Finance':{text:'WOM',sub:'Finance',fg:'#0ea5e9'},
  'DJP Online':{text:'DJP',sub:'Online',fg:'#f59e0b'},'Pajak Daerah':{text:'Pajak',sub:'Daerah',fg:'#f97316'},'Samsat Digital':{text:'SAMSAT',sub:'Digital',fg:'#1d4ed8'},'Penerimaan Negara':{text:'MPN',sub:'Negara',fg:'#0f766e'},
  BAZNAS:{text:'BAZNAS',fg:'#16a34a'},'Dompet Dhuafa':{text:'DD',sub:'Dhuafa',fg:'#16a34a'},'Rumah Zakat':{text:'RZ',sub:'Zakat',fg:'#0ea5e9'},Kitabisa:{text:'Kitabisa',fg:'#00aeef'},
  Parkee:{text:'Parkee',fg:'#2563eb'},CentrePark:{text:'Centre',sub:'Park',fg:'#1d4ed8'},'Sky Parking':{text:'Sky',sub:'Parking',fg:'#0284c7'},'Secure Parking':{text:'Secure',sub:'Parking',fg:'#475569'},
  JNE:{text:'JNE',fg:'#1646a0',accent:'#ef4444'},'J&T Express':{text:'J&T',sub:'Express',fg:'#dc2626'},SiCepat:{text:'SiCepat',fg:'#ef4444'},'Pos Indonesia':{text:'POS',sub:'Indonesia',fg:'#f97316'},AnterAja:{text:'AnterAja',fg:'#7c3aed'},'Kereta Api':{text:'KAI',fg:'#0f4caa',accent:'#f97316'},
}

const normalize=name=>String(name||'').replace(/ Card$/,'')
const slug=name=>String(name||'').toLowerCase().replace(/[^a-z0-9]+/g,'-')
const findLogoMatch=(name,source)=>Object.entries(source).find(([key])=>name.startsWith(key))

function ProviderSymbol({name}){
  const value=name.toLowerCase()
  if(value.includes('pulsa')||value.includes('halo')||value.includes('postpaid')||value.includes('prioritas'))return <Smartphone/>
  if(value.includes('esim')||value.includes('global')||value.includes('asia'))return <Earth/>
  if(value.includes('roaming')||value.includes('pesawat'))return <Plane/>
  if(value.includes('kereta'))return <TrainFront/>
  if(value.includes('bus'))return <Bus/>
  if(value.includes('qris'))return <QrCode/>
  if(value.includes('pln')||value.includes('token'))return <Zap/>
  if(value.includes('pdam'))return <Droplets/>
  if(value.includes('pgn')||value.includes('gas'))return <Flame/>
  if(value.includes('telkom')||value.includes('internet')||value.includes('wifi'))return <Wifi/>
  if(value.includes('money')||value.includes('flazz')||value.includes('tapcash')||value.includes('brizzi')||value.includes('toll'))return <Radio/>
  if(value.includes('wallet')||value.includes('pay')||value.includes('sakuku'))return <Wallet/>
  if(value.includes('game')||value.includes('voucher'))return <Gamepad2/>
  if(value.includes('netflix')||value.includes('youtube')||value.includes('disney')||value.includes('vision')||value.includes('vidio'))return <Clapperboard/>
  if(value.includes('tv')||value.includes('k-vision'))return <MonitorPlay/>
  if(value.includes('klinik')||value.includes('halodoc')||value.includes('laboratorium')||value.includes('apotek'))return <HeartPulse/>
  if(value.includes('credit')||value.includes('card')||value.includes('kredivo')||value.includes('akulaku'))return <CreditCard/>
  if(value.includes('finance')||value.includes('home credit')||value.includes('adira')||value.includes('wom'))return <Car/>
  if(value.includes('pajak')||value.includes('djp')||value.includes('samsat')||value.includes('penerimaan'))return <ReceiptText/>
  if(value.includes('zakat')||value.includes('donasi')||value.includes('dhuafa')||value.includes('kitabisa')||value.includes('baznas'))return <HandHeart/>
  if(value.includes('park'))return <CircleParking/>
  if(value.includes('jne')||value.includes('j&t')||value.includes('sicepat')||value.includes('pos ')||value.includes('anteraja'))return <Truck/>
  if(value.includes('sekolah')||value.includes('universitas')||value.includes('bimbel'))return <BookOpenCheck/>
  if(value.includes('bank')||value.includes('bca')||value.includes('bri')||value.includes('bni')||value.includes('mandiri'))return <Building2/>
  if(value.includes('bpjs')||value.includes('asuransi')||value.includes('prudential')||value.includes('allianz')||value.includes('manulife'))return <ShieldCheck/>
  if(value.includes('indonesia'))return <MapPin/>
  if(value.includes('resmi')||value.includes('nasional'))return <BadgeCheck/>
  if(value.includes('bayar')||value.includes('uang'))return <Banknote/>
  if(value.includes('klinik'))return <Cross/>
  if(value.includes('kampus'))return <GraduationCap/>
  if(value.includes('bank'))return <Landmark/>
  return <Store/>
}

function ProviderSvgLogo({spec}){
  if(spec.type==='netflix')return <svg className="provider-svg-logo provider-svg-netflix" viewBox="0 0 80 80" aria-hidden="true"><rect width="80" height="80" rx="18" fill="#191414"/><path d="M25 16h11v48H25z" fill="#e50914"/><path d="M44 16h11v48H44z" fill="#b20710"/><path d="M25 16h11l19 48H44z" fill="#f40612"/></svg>
  if(spec.type==='youtube')return <svg className="provider-svg-logo provider-svg-youtube" viewBox="0 0 80 80" aria-hidden="true"><rect x="10" y="20" width="60" height="40" rx="12" fill="#ff0000"/><path d="M35 30v20l18-10z" fill="#fff"/></svg>
  if(spec.type==='disney')return <svg className="provider-svg-logo provider-svg-disney" viewBox="0 0 100 80" aria-hidden="true"><path d="M18 29c16-18 48-20 66-4" fill="none" stroke="#1d4ed8" strokeWidth="4" strokeLinecap="round"/><text x="50" y="48" textAnchor="middle" fill="#123c8c" fontSize="22" fontWeight="900" fontFamily="Arial, sans-serif">Disney+</text><text x="50" y="63" textAnchor="middle" fill="#ef4444" fontSize="11" fontWeight="800" fontFamily="Arial, sans-serif">Hotstar</text></svg>
  if(spec.type==='pln')return <svg className="provider-svg-logo provider-svg-pln" viewBox="0 0 80 80" aria-hidden="true"><rect x="14" y="12" width="52" height="56" rx="10" fill="#facc15"/><path d="M28 44h14l-7 17 20-25H41l7-17z" fill="#2563eb"/><path d="M24 25h32" stroke="#ef4444" strokeWidth="4" strokeLinecap="round"/></svg>
  const sub=spec.sub||''
  const accent=spec.accent||spec.fg
  return <svg className="provider-svg-logo provider-svg-wordmark" viewBox="0 0 100 80" aria-hidden="true"><rect x="10" y="14" width="80" height="52" rx="13" fill="#fff"/><path d="M22 24h56" stroke={accent} strokeWidth="4" strokeLinecap="round" opacity=".18"/><text x="50" y={sub?42:48} textAnchor="middle" fill={spec.fg} fontSize={spec.text.length>8?14:20} fontWeight="900" fontFamily="Arial, sans-serif">{spec.text}</text>{sub&&<text x="50" y="57" textAnchor="middle" fill="#64748b" fontSize="10" fontWeight="800" fontFamily="Arial, sans-serif">{sub}</text>}</svg>
}

export default function ProviderLogo({name,className=''}){
  const clean=normalize(name)
  const image=findLogoMatch(clean,imageLogos)?.[1]
  if(image)return <i className={`${className} provider-logo-rendered`}><img src={image} alt={`Logo ${name}`}/></i>
  const spec=findLogoMatch(clean,svgLogos)?.[1]
  if(spec)return <i className={`${className} provider-logo-rendered provider-logo-vector`} data-brand={slug(clean)} role="img" aria-label={`Logo ${name}`}><ProviderSvgLogo spec={spec}/></i>
  return <i className={`${className} provider-logo-rendered provider-wordmark`} data-brand={slug(clean)} role="img" aria-label={`Logo ${name}`}><ProviderSymbol name={clean}/></i>
}
