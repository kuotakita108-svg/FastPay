import bca from '../../assets/providers/official/bca.png'
import bri from '../../assets/providers/official/bri.png'
import bni from '../../assets/providers/official/bni.png'
import mandiri from '../../assets/providers/official/mandiri.png'
import cimb from '../../assets/providers/official/cimb-niaga.svg'
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
import { Building2, CircleParking, Clapperboard, CreditCard, Cross, Earth, GraduationCap, HandHeart, Landmark, MapPin, Plane, QrCode, Radio, ReceiptText, ShieldCheck, Store, TrainFront, Truck } from 'lucide-react'

const imageLogos={BCA:bca,BRI:bri,BNI:bni,Mandiri:mandiri,'CIMB Niaga':cimb,'FIF Group':fif,Spotify:spotify,Vidio:vidio,Telkomsel:telkomsel,Indosat:indosat,XL:xl,Tri:tri,AXIS:axis,DANA:dana,GoPay:gopay,OVO:ovo,ShopeePay:shopeepay,LinkAja:linkaja,'Mobile Legends':mobilelegends,'Free Fire':freefire,'PUBG Mobile':pubg,Valorant:valorant,'Genshin Impact':genshin,'BPJS Kesehatan':bpjs,Biznet:biznet,Prudential:prudential,Allianz:allianz,Manulife:manulife,MyRepublic:myrepublic,CBN:cbn,IndiHome:indihome,'MNC Vision':mncvision,Transvision:transvision,'Google Play':googleplay,'Apple Gift Card':apple,Pesawat:garuda,'Bus & Travel':redbus,Sekolah:kemendikbud,Universitas:kemendikbud,Bimbel:kemendikbud,'PBB Kota/Kabupaten':pajak}
const brandCodes={
  'QRIS Nasional':'QR','QRIS UMKM':'UM','QRIS Dinamis':'QD','Mandiri e-Money':'eM','BCA Flazz':'FL','BNI TapCash':'TC',BRIZZI:'BR','Mandiri e-Toll':'eT',Netflix:'N','YouTube Premium':'YT','Disney+ Hotstar':'D+','eSIM Indonesia':'ID','eSIM Asia':'AS','eSIM Global':'GL','Paket Roaming':'RM',Halodoc:'H','Klinik Digital':'KD',Laboratorium:'LAB',Apotek:'A','Home Credit':'HC',Kredivo:'K',Akulaku:'A','Mega Finance':'MF','DJP Online':'DJP','Pajak Daerah':'PD','Samsat Digital':'SD','Penerimaan Negara':'PN',BAZNAS:'BZ','Dompet Dhuafa':'DD','Rumah Zakat':'RZ',Kitabisa:'K','Parkee':'P','CentrePark':'CP','Sky Parking':'SP','Secure Parking':'SEC',JNE:'JNE','J&T Express':'J&T',SiCepat:'Si','Pos Indonesia':'POS',AnterAja:'A',
}

const normalize=name=>String(name||'').replace(/ Card$/,'')
function ProviderSymbol({name}){
  const value=name.toLowerCase()
  if(value.includes('esim')||value.includes('global')||value.includes('asia'))return <Earth/>
  if(value.includes('roaming')||value.includes('pesawat'))return <Plane/>
  if(value.includes('qris'))return <QrCode/>
  if(value.includes('money')||value.includes('flazz')||value.includes('tapcash')||value.includes('brizzi')||value.includes('toll'))return <Radio/>
  if(value.includes('netflix')||value.includes('youtube')||value.includes('disney')||value.includes('vision')||value.includes('vidio'))return <Clapperboard/>
  if(value.includes('klinik')||value.includes('halodoc')||value.includes('laboratorium')||value.includes('apotek'))return <Cross/>
  if(value.includes('credit')||value.includes('card')||value.includes('kredivo')||value.includes('akulaku'))return <CreditCard/>
  if(value.includes('finance')||value.includes('home credit'))return <Landmark/>
  if(value.includes('pajak')||value.includes('djp')||value.includes('samsat')||value.includes('penerimaan'))return <ReceiptText/>
  if(value.includes('zakat')||value.includes('donasi')||value.includes('dhuafa')||value.includes('kitabisa')||value.includes('baznas'))return <HandHeart/>
  if(value.includes('park'))return <CircleParking/>
  if(value.includes('jne')||value.includes('j&t')||value.includes('sicepat')||value.includes('pos ')||value.includes('anteraja'))return <Truck/>
  if(value.includes('kereta'))return <TrainFront/>
  if(value.includes('sekolah')||value.includes('universitas')||value.includes('bimbel'))return <GraduationCap/>
  if(value.includes('bank')||value.includes('bca')||value.includes('bri')||value.includes('bni')||value.includes('mandiri'))return <Building2/>
  if(value.includes('pdam')||value.includes('pgn')||value.includes('pln'))return <ShieldCheck/>
  if(value.includes('indonesia'))return <MapPin/>
  return <Store/>
}

export default function ProviderLogo({name,className=''}){
  const clean=normalize(name)
  const image=Object.entries(imageLogos).find(([key])=>clean.startsWith(key))?.[1]
  if(image)return <i className={`${className} provider-logo-rendered`}><img src={image} alt={`Logo ${name}`}/></i>
  const code=brandCodes[name]||clean.slice(0,3).toUpperCase()
  return <i className={`${className} provider-logo-rendered provider-wordmark`} data-brand={clean.toLowerCase().replace(/[^a-z0-9]+/g,'-')} role="img" aria-label={`Logo ${name}`}><ProviderSymbol name={clean}/><b>{code}</b></i>
}
