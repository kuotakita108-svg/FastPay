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

const imageLogos={BCA:bca,BRI:bri,BNI:bni,Mandiri:mandiri,'CIMB Niaga':cimb,'Bank Syariah Indonesia':bsi,BSI:bsi,Danamon:danamon,'PermataBank':permatabank,'SeaBank':seabank,'Bank Jago':jago,AstraPay:astrapay,'i.saku':isaku,'FIF Group':fif,Spotify:spotify,Vidio:vidio,Telkomsel:telkomsel,Indosat:indosat,XL:xl,Tri:tri,AXIS:axis,DANA:dana,GoPay:gopay,OVO:ovo,ShopeePay:shopeepay,LinkAja:linkaja,'Mobile Legends':mobilelegends,'Free Fire':freefire,'PUBG Mobile':pubg,Valorant:valorant,'Genshin Impact':genshin,'BPJS Kesehatan':bpjs,Biznet:biznet,Prudential:prudential,Allianz:allianz,Manulife:manulife,MyRepublic:myrepublic,CBN:cbn,IndiHome:indihome,'MNC Vision':mncvision,Transvision:transvision,'Google Play':googleplay,'Apple Gift Card':apple,Pesawat:garuda,'Bus & Travel':redbus,Sekolah:kemendikbud,Universitas:kemendikbud,Bimbel:kemendikbud,'PBB Kota/Kabupaten':pajak}
const brandMarks={
  Netflix:{text:'N',tone:'netflix'},'YouTube Premium':{text:'▶',tone:'youtube'},'Disney+ Hotstar':{text:'D+',tone:'disney'},'K-Vision':{text:'K',tone:'kvision'},
  PLN:{text:'⚡',tone:'pln'},PGN:{text:'PGN',tone:'pgn'},PDAM:{text:'AIR',tone:'pdam'},Telkom:{text:'T',tone:'telkom'},
  'QRIS Nasional':{text:'QR',tone:'qris'},'QRIS UMKM':{text:'UM',tone:'qris'},'QRIS Dinamis':{text:'QD',tone:'qris'},
  'Mandiri e-Money':{text:'eM',tone:'emoney'},'BCA Flazz':{text:'FL',tone:'flazz'},'BNI TapCash':{text:'TC',tone:'tapcash'},BRIZZI:{text:'BR',tone:'brizzi'},'Mandiri e-Toll':{text:'eT',tone:'etoll'},
  Halodoc:{text:'H+',tone:'health'},'Klinik Digital':{text:'KD',tone:'health'},Laboratorium:{text:'LAB',tone:'health'},Apotek:{text:'Rx',tone:'health'},
  'Home Credit':{text:'HC',tone:'credit'},Kredivo:{text:'K',tone:'kredivo'},Akulaku:{text:'AK',tone:'akulaku'},'Mega Finance':{text:'MF',tone:'finance'},'Adira Finance':{text:'AF',tone:'finance'},'WOM Finance':{text:'W',tone:'finance'},
  'DJP Online':{text:'DJP',tone:'tax'},'Pajak Daerah':{text:'PD',tone:'tax'},'Samsat Digital':{text:'SD',tone:'tax'},'Penerimaan Negara':{text:'PN',tone:'tax'},
  BAZNAS:{text:'BZ',tone:'donation'},'Dompet Dhuafa':{text:'DD',tone:'donation'},'Rumah Zakat':{text:'RZ',tone:'donation'},Kitabisa:{text:'K',tone:'donation'},
  Parkee:{text:'P',tone:'parking'},CentrePark:{text:'CP',tone:'parking'},'Sky Parking':{text:'SP',tone:'parking'},'Secure Parking':{text:'SEC',tone:'parking'},
  JNE:{text:'JNE',tone:'delivery'},'J&T Express':{text:'J&T',tone:'delivery'},SiCepat:{text:'Si',tone:'delivery'},'Pos Indonesia':{text:'POS',tone:'pos'},AnterAja:{text:'A',tone:'anteraja'},'Kereta Api':{text:'KAI',tone:'train'},
}

const normalize=name=>String(name||'').replace(/ Card$/,'')
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

function findLogoMatch(name,source){
  return Object.entries(source).find(([key])=>name.startsWith(key))
}

function BrandMark({mark,name}){
  return <span className={`provider-brand-mark provider-brand-${mark.tone}`}><i>{mark.text}</i><ProviderSymbol name={name}/></span>
}

export default function ProviderLogo({name,className=''}){
  const clean=normalize(name)
  const image=findLogoMatch(clean,imageLogos)?.[1]
  if(image)return <i className={`${className} provider-logo-rendered`}><img src={image} alt={`Logo ${name}`}/></i>
  const mark=findLogoMatch(clean,brandMarks)?.[1]
  return <i className={`${className} provider-logo-rendered provider-wordmark`} data-brand={clean.toLowerCase().replace(/[^a-z0-9]+/g,'-')} role="img" aria-label={`Logo ${name}`}>{mark?<BrandMark mark={mark} name={clean}/>:<ProviderSymbol name={clean}/>}</i>
}
