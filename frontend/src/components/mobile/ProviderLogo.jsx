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
  Netflix:{type:'netflix'},'YouTube Premium':{type:'youtube'},'Disney+ Hotstar':{type:'disney'},'K-Vision':{type:'tv'},
  PLN:{type:'pln'},PGN:{type:'gas'},PDAM:{type:'water'},Telkom:{type:'telkom'},
  'QRIS Nasional':{type:'qris'},'QRIS UMKM':{type:'qris'},'QRIS Dinamis':{type:'qris'},
  'Mandiri e-Money':{type:'card'},'BCA Flazz':{type:'card'},'BNI TapCash':{type:'card'},BRIZZI:{type:'card'},'Mandiri e-Toll':{type:'card'},
  Halodoc:{type:'health'},'Klinik Digital':{type:'health'},Laboratorium:{type:'lab'},Apotek:{type:'pharmacy'},
  'Home Credit':{type:'finance'},Kredivo:{type:'finance'},Akulaku:{type:'finance'},'Mega Finance':{type:'finance'},'Adira Finance':{type:'finance'},'WOM Finance':{type:'finance'},
  'DJP Online':{type:'tax'},'Pajak Daerah':{type:'tax'},'Samsat Digital':{type:'tax'},'Penerimaan Negara':{type:'tax'},
  BAZNAS:{type:'donation'},'Dompet Dhuafa':{type:'donation'},'Rumah Zakat':{type:'donation'},Kitabisa:{type:'donation'},
  Parkee:{type:'parking'},CentrePark:{type:'parking'},'Sky Parking':{type:'parking'},'Secure Parking':{type:'parking'},
  JNE:{type:'delivery'},'J&T Express':{type:'delivery'},SiCepat:{type:'delivery'},'Pos Indonesia':{type:'delivery'},AnterAja:{type:'delivery'},'Kereta Api':{type:'train'},
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
  if(spec.type==='disney')return <svg className="provider-svg-logo provider-svg-disney" viewBox="0 0 80 80" aria-hidden="true"><rect x="10" y="16" width="60" height="48" rx="14" fill="#081a4a"/><path d="M18 31c14-16 42-18 57-2" fill="none" stroke="#55a7ff" strokeWidth="4" strokeLinecap="round"/><circle cx="40" cy="43" r="13" fill="#fff"/><path d="M35 35h9c8 0 13 5 13 11 0 7-6 12-15 12h-7z" fill="#1d4ed8"/></svg>
  if(spec.type==='pln')return <svg className="provider-svg-logo provider-svg-pln" viewBox="0 0 80 80" aria-hidden="true"><rect x="14" y="12" width="52" height="56" rx="10" fill="#facc15"/><path d="M28 44h14l-7 17 20-25H41l7-17z" fill="#2563eb"/><path d="M24 25h32" stroke="#ef4444" strokeWidth="4" strokeLinecap="round"/></svg>
  if(spec.type==='water')return <svg className="provider-svg-logo" viewBox="0 0 80 80" aria-hidden="true"><rect x="12" y="12" width="56" height="56" rx="16" fill="#e0f7ff"/><path d="M40 15c10 14 19 26 19 38 0 11-8 18-19 18s-19-7-19-18c0-12 9-24 19-38z" fill="#0ea5e9"/><path d="M29 52c4 7 13 9 21 3" fill="none" stroke="#fff" strokeWidth="4" strokeLinecap="round"/></svg>
  if(spec.type==='gas')return <svg className="provider-svg-logo" viewBox="0 0 80 80" aria-hidden="true"><rect x="12" y="12" width="56" height="56" rx="16" fill="#e8fff3"/><path d="M43 12c5 12-4 17 6 28 4 5 8 10 8 17 0 10-8 17-17 17s-17-7-17-17c0-11 10-18 15-28 3 8 9 10 5-17z" fill="#16a34a"/><path d="M40 45c5 7 8 10 8 16 0 5-4 9-8 9s-8-4-8-9c0-6 4-9 8-16z" fill="#fff"/></svg>
  if(spec.type==='qris')return <svg className="provider-svg-logo" viewBox="0 0 80 80" aria-hidden="true"><rect x="12" y="12" width="56" height="56" rx="14" fill="#111827"/><path d="M22 22h13v13H22zm23 0h13v13H45zM22 45h13v13H22zm25 2h6v6h-6zm9-9h4v20h-4zM39 39h6v6h-6z" fill="#fff"/></svg>
  if(spec.type==='card')return <svg className="provider-svg-logo" viewBox="0 0 80 80" aria-hidden="true"><rect x="11" y="18" width="58" height="44" rx="12" fill="#0f4caa"/><path d="M17 30h46" stroke="#facc15" strokeWidth="6"/><rect x="22" y="44" width="16" height="7" rx="3" fill="#fff"/><circle cx="55" cy="49" r="6" fill="#38bdf8"/></svg>
  if(spec.type==='health')return <svg className="provider-svg-logo" viewBox="0 0 80 80" aria-hidden="true"><rect x="12" y="12" width="56" height="56" rx="16" fill="#fff1f4"/><path d="M40 25v30M25 40h30" stroke="#ef4056" strokeWidth="10" strokeLinecap="round"/></svg>
  if(spec.type==='lab')return <svg className="provider-svg-logo" viewBox="0 0 80 80" aria-hidden="true"><rect x="12" y="12" width="56" height="56" rx="16" fill="#eef5ff"/><path d="M34 18h12v18l13 22c3 5-1 10-7 10H28c-6 0-10-5-7-10l13-22z" fill="#2563eb"/><path d="M29 54h22" stroke="#fff" strokeWidth="5" strokeLinecap="round"/></svg>
  if(spec.type==='pharmacy')return <svg className="provider-svg-logo" viewBox="0 0 80 80" aria-hidden="true"><rect x="12" y="12" width="56" height="56" rx="16" fill="#fff1f2"/><rect x="22" y="32" width="36" height="20" rx="10" fill="#dc2626"/><path d="M40 32v20" stroke="#fff" strokeWidth="5"/></svg>
  if(spec.type==='finance')return <svg className="provider-svg-logo" viewBox="0 0 80 80" aria-hidden="true"><rect x="12" y="12" width="56" height="56" rx="16" fill="#fff7ed"/><path d="M20 36h40M24 36v22m16-22v22m16-22v22M21 58h38M40 18l24 14H16z" fill="none" stroke="#f97316" strokeWidth="5" strokeLinejoin="round"/></svg>
  if(spec.type==='tax')return <svg className="provider-svg-logo" viewBox="0 0 80 80" aria-hidden="true"><rect x="16" y="10" width="48" height="60" rx="10" fill="#fff7ed"/><path d="M28 30h24M28 42h24M28 54h14" stroke="#f59e0b" strokeWidth="5" strokeLinecap="round"/><path d="M52 10v14h12" fill="#fed7aa"/></svg>
  if(spec.type==='donation')return <svg className="provider-svg-logo" viewBox="0 0 80 80" aria-hidden="true"><rect x="12" y="12" width="56" height="56" rx="16" fill="#ecfdf5"/><path d="M40 60S22 50 22 36c0-8 10-13 18-4 8-9 18-4 18 4 0 14-18 24-18 24z" fill="#16a34a"/></svg>
  if(spec.type==='parking')return <svg className="provider-svg-logo" viewBox="0 0 80 80" aria-hidden="true"><rect x="12" y="12" width="56" height="56" rx="16" fill="#2563eb"/><path d="M31 58V22h15c9 0 15 6 15 14s-6 14-15 14h-5v8z" fill="none" stroke="#fff" strokeWidth="7" strokeLinejoin="round"/></svg>
  if(spec.type==='delivery')return <svg className="provider-svg-logo" viewBox="0 0 80 80" aria-hidden="true"><rect x="10" y="20" width="42" height="32" rx="7" fill="#ef4444"/><path d="M52 30h10l8 10v12H52z" fill="#1646a0"/><circle cx="25" cy="58" r="6" fill="#111827"/><circle cx="59" cy="58" r="6" fill="#111827"/></svg>
  if(spec.type==='train')return <svg className="provider-svg-logo" viewBox="0 0 80 80" aria-hidden="true"><rect x="18" y="12" width="44" height="48" rx="12" fill="#0f4caa"/><rect x="26" y="22" width="28" height="17" rx="4" fill="#fff"/><circle cx="30" cy="50" r="5" fill="#f97316"/><circle cx="50" cy="50" r="5" fill="#f97316"/><path d="M29 66h22" stroke="#0f4caa" strokeWidth="5" strokeLinecap="round"/></svg>
  if(spec.type==='tv')return <svg className="provider-svg-logo" viewBox="0 0 80 80" aria-hidden="true"><rect x="12" y="20" width="56" height="38" rx="10" fill="#0a8ddf"/><path d="M28 14l12 8 12-8" stroke="#0a8ddf" strokeWidth="5" strokeLinecap="round" fill="none"/><path d="M29 39h22" stroke="#fff" strokeWidth="6" strokeLinecap="round"/></svg>
  if(spec.type==='telkom')return <svg className="provider-svg-logo" viewBox="0 0 80 80" aria-hidden="true"><rect x="12" y="12" width="56" height="56" rx="16" fill="#fff1f2"/><circle cx="40" cy="40" r="19" fill="none" stroke="#e11d48" strokeWidth="8"/><path d="M40 21v38M21 40h38" stroke="#e11d48" strokeWidth="6" strokeLinecap="round"/></svg>
  return <svg className="provider-svg-logo" viewBox="0 0 80 80" aria-hidden="true"><rect x="12" y="12" width="56" height="56" rx="16" fill="#eef2ff"/><circle cx="40" cy="40" r="18" fill="#635bff"/></svg>
}

export default function ProviderLogo({name,className=''}){
  const clean=normalize(name)
  const image=findLogoMatch(clean,imageLogos)?.[1]
  if(image)return <i className={`${className} provider-logo-rendered`}><img src={image} alt={`Logo ${name}`}/></i>
  const spec=findLogoMatch(clean,svgLogos)?.[1]
  if(spec)return <i className={`${className} provider-logo-rendered provider-logo-vector`} data-brand={slug(clean)} role="img" aria-label={`Logo ${name}`}><ProviderSvgLogo spec={spec}/></i>
  return <i className={`${className} provider-logo-rendered provider-wordmark`} data-brand={slug(clean)} role="img" aria-label={`Logo ${name}`}><ProviderSymbol name={clean}/></i>
}
