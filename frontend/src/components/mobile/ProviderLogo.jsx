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
import pointblank from '../../assets/providers/pointblank.png'
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

const imageLogos={BCA:bca,BRI:bri,BNI:bni,Mandiri:mandiri,'CIMB Niaga':cimb,'Bank Syariah Indonesia':bsi,BSI:bsi,Danamon:danamon,PermataBank:permatabank,SeaBank:seabank,'Bank Jago':jago,AstraPay:astrapay,'i.saku':isaku,'FIF Group':fif,Spotify:spotify,Vidio:vidio,Telkomsel:telkomsel,Indosat:indosat,XL:xl,Tri:tri,AXIS:axis,DANA:dana,GoPay:gopay,OVO:ovo,ShopeePay:shopeepay,LinkAja:linkaja,'Mobile Legends':mobilelegends,'Free Fire':freefire,'PUBG Mobile':pubg,Valorant:valorant,'Valorant Points':valorant,'Genshin Impact':genshin,'Genshin Impact Genesis Crystals':genshin,'Point Blank':pointblank,'BPJS Kesehatan':bpjs,Biznet:biznet,Prudential:prudential,Allianz:allianz,Manulife:manulife,MyRepublic:myrepublic,CBN:cbn,IndiHome:indihome,'MNC Vision':mncvision,Transvision:transvision,'Google Play':googleplay,'Apple Gift Card':apple,Pesawat:garuda,'Bus & Travel':redbus,Sekolah:kemendikbud,Universitas:kemendikbud,Bimbel:kemendikbud,'PBB Kota/Kabupaten':pajak}

const svgLogos={
  'Free Fire':{type:'freefire'},'PUBG Mobile':{type:'pubg'},'Mobile Legends':{type:'mlbb'},Roblox:{type:'roblox'},'Genshin Impact':{type:'genshin'},'Genshin Impact Genesis Crystals':{type:'genshin'},Valorant:{type:'valorant'},'Valorant Points':{type:'valorant'},'Steam Wallet ID':{type:'steam'},'Arena of Valor Voucher':{type:'aov'},
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
  if(spec.type==='freefire')return <svg className="provider-svg-logo provider-svg-game provider-svg-game-banner" viewBox="0 0 160 90" aria-hidden="true"><defs><linearGradient id="ffGameBg" x1="8" y1="10" x2="152" y2="80"><stop stopColor="#050505"/><stop offset=".52" stopColor="#241006"/><stop offset="1" stopColor="#0a0a0a"/></linearGradient><linearGradient id="ffFlame" x1="70" y1="16" x2="100" y2="72"><stop stopColor="#fff7ad"/><stop offset=".45" stopColor="#ff9f1c"/><stop offset="1" stopColor="#f04410"/></linearGradient></defs><rect width="160" height="90" rx="14" fill="url(#ffGameBg)"/><path d="M21 65C52 10 92 23 138 15c-25 12-38 26-42 43 16-7 29-4 42 5-31-1-48 9-68 14-20 5-35 0-49-12z" fill="#ff7a18" opacity=".26"/><path d="M82 12c10 19-8 24 11 43 6 6 8 15 3 24-6 10-22 10-31 2-11-10-6-24 5-35 8-8 14-15 12-34z" fill="url(#ffFlame)"/><text x="80" y="55" textAnchor="middle" fontFamily="Arial Black,Arial,sans-serif" fontSize="24" fontWeight="900" fill="#fff" letterSpacing="1.5">FREE FIRE</text><path d="M88 35l8 1-5 16 11-1-21 26 6-19-11 1z" fill="#f59e0b"/></svg>
  if(spec.type==='pubg')return <svg className="provider-svg-logo provider-svg-game provider-svg-game-banner" viewBox="0 0 160 90" aria-hidden="true"><defs><linearGradient id="pubgGameBg" x1="0" y1="0" x2="160" y2="90"><stop stopColor="#050505"/><stop offset=".55" stopColor="#17120a"/><stop offset="1" stopColor="#070707"/></linearGradient></defs><rect width="160" height="90" rx="14" fill="url(#pubgGameBg)"/><rect x="18" y="12" width="124" height="66" rx="8" fill="none" stroke="#f2b233" strokeWidth="4"/><path d="M67 25h29c4 0 7 3 7 7v6H60v-6c0-4 3-7 7-7z" fill="#fff"/><path d="M62 38h41v8c0 9-8 16-20 16h-1c-12 0-20-7-20-16z" fill="#f8fafc"/><path d="M50 75c4-16 15-23 31-23s28 7 32 23z" fill="#f8fafc"/><path d="M48 23v43M113 23v43" stroke="#fff" strokeWidth="5" strokeLinecap="round"/><text x="80" y="80" textAnchor="middle" fontFamily="Arial Black,Arial,sans-serif" fontSize="22" fontWeight="900" fill="#fff" letterSpacing="1">PUBG</text></svg>
  if(spec.type==='mlbb')return <svg className="provider-svg-logo provider-svg-game provider-svg-game-banner" viewBox="0 0 160 90" aria-hidden="true"><defs><linearGradient id="mlGameBg" x1="9" y1="8" x2="151" y2="82"><stop stopColor="#06152f"/><stop offset=".52" stopColor="#0f1b3f"/><stop offset="1" stopColor="#020617"/></linearGradient><linearGradient id="mlGold" x1="39" y1="14" x2="120" y2="77"><stop stopColor="#fff4a3"/><stop offset=".48" stopColor="#f5b82e"/><stop offset="1" stopColor="#9b5b08"/></linearGradient></defs><rect width="160" height="90" rx="14" fill="url(#mlGameBg)"/><path d="M80 10l43 18-9 43-34 12-34-12-9-43z" fill="url(#mlGold)"/><path d="M52 30l18 28 10-34 10 34 18-28-9 38H61z" fill="#111827" opacity=".76"/><path d="M36 67h88" stroke="#ffe49a" strokeWidth="4" strokeLinecap="round"/><text x="80" y="82" textAnchor="middle" fontFamily="Arial Black,Arial,sans-serif" fontSize="18" fontWeight="900" fill="#f8fafc" letterSpacing="1.2">MOBILE</text></svg>
  if(spec.type==='roblox')return <svg className="provider-svg-logo provider-svg-game provider-svg-game-banner" viewBox="0 0 160 90" aria-hidden="true"><defs><linearGradient id="rbxGameBg" x1="0" y1="0" x2="160" y2="90"><stop stopColor="#0f172a"/><stop offset="1" stopColor="#020617"/></linearGradient></defs><rect width="160" height="90" rx="14" fill="url(#rbxGameBg)"/><rect x="58" y="17" width="44" height="44" rx="6" fill="#fff" transform="rotate(12 80 39)"/><rect x="74" y="33" width="12" height="12" rx="2" fill="#0f172a" transform="rotate(12 80 39)"/><text x="80" y="78" textAnchor="middle" fontFamily="Arial Black,Arial,sans-serif" fontSize="22" fontWeight="900" fill="#fff" letterSpacing="2">ROBLOX</text></svg>
  if(spec.type==='genshin')return <svg className="provider-svg-logo provider-svg-game provider-svg-game-banner" viewBox="0 0 160 90" aria-hidden="true"><defs><linearGradient id="giGameBg" x1="0" y1="0" x2="160" y2="90"><stop stopColor="#0b1027"/><stop offset=".55" stopColor="#4153a8"/><stop offset="1" stopColor="#f6d78f"/></linearGradient></defs><rect width="160" height="90" rx="14" fill="url(#giGameBg)"/><circle cx="80" cy="37" r="25" fill="#ffffff24"/><path d="M80 8l10 21 23 4-17 16 4 23-20-11-20 11 4-23-17-16 23-4z" fill="#fff7cc"/><path d="M80 22l5 13 14 2-10 9 3 14-12-7-12 7 3-14-10-9 14-2z" fill="#8b5cf6"/><text x="80" y="80" textAnchor="middle" fontFamily="Arial Black,Arial,sans-serif" fontSize="16" fontWeight="900" fill="#fff" letterSpacing=".8">GENESIS</text></svg>
  if(spec.type==='valorant')return <svg className="provider-svg-logo provider-svg-game provider-svg-game-banner" viewBox="0 0 160 90" aria-hidden="true"><defs><linearGradient id="valGameBg" x1="0" y1="0" x2="160" y2="90"><stop stopColor="#111827"/><stop offset=".52" stopColor="#2b1118"/><stop offset="1" stopColor="#050505"/></linearGradient></defs><rect width="160" height="90" rx="14" fill="url(#valGameBg)"/><path d="M36 20l34 44H53L24 20zM126 20L92 64h17l29-44z" fill="#ff4655"/><path d="M61 70h38" stroke="#fff" strokeWidth="5" strokeLinecap="round"/><text x="80" y="84" textAnchor="middle" fontFamily="Arial Black,Arial,sans-serif" fontSize="16" fontWeight="900" fill="#fff" letterSpacing="1.5">VALORANT</text></svg>
  if(spec.type==='steam')return <svg className="provider-svg-logo provider-svg-game provider-svg-game-banner" viewBox="0 0 160 90" aria-hidden="true"><defs><linearGradient id="steamGameBg" x1="0" y1="0" x2="160" y2="90"><stop stopColor="#06192f"/><stop offset=".55" stopColor="#0f3460"/><stop offset="1" stopColor="#020617"/></linearGradient></defs><rect width="160" height="90" rx="14" fill="url(#steamGameBg)"/><circle cx="63" cy="43" r="25" fill="none" stroke="#fff" strokeWidth="7"/><circle cx="63" cy="43" r="10" fill="#fff"/><circle cx="105" cy="28" r="13" fill="none" stroke="#fff" strokeWidth="6"/><path d="M82 35l13-5M46 58l-18 14" stroke="#fff" strokeWidth="7" strokeLinecap="round"/><text x="101" y="70" textAnchor="middle" fontFamily="Arial Black,Arial,sans-serif" fontSize="20" fontWeight="900" fill="#fff">STEAM</text></svg>
  if(spec.type==='simple')return <svg className="provider-svg-logo provider-svg-simple" viewBox="0 0 120 64" aria-hidden="true"><rect width="120" height="64" rx="8" fill="#0f172a"/><path transform="translate(44 16) scale(1.35)" fill="#fff" d={spec.icon.path}/></svg>
  if(spec.type==='pointblank')return <svg className="provider-svg-logo provider-svg-game" viewBox="0 0 120 64" aria-hidden="true"><defs><linearGradient id="pbLogo" x1="8" y1="6" x2="112" y2="58"><stop stopColor="#111827"/><stop offset=".55" stopColor="#164e63"/><stop offset="1" stopColor="#0f172a"/></linearGradient></defs><rect width="120" height="64" rx="8" fill="url(#pbLogo)"/><circle cx="32" cy="32" r="17" fill="#0ea5e9" opacity=".18"/><path d="M21 44l15-28h22c12 0 20 7 20 17 0 11-8 18-21 18H45l-4 7H25l5-10z" fill="#e2e8f0"/><circle cx="57" cy="33" r="8" fill="#06b6d4"/><path d="M79 21h21M79 32h17M79 43h24" stroke="#38bdf8" strokeWidth="5" strokeLinecap="round"/></svg>
  if(spec.type==='aov')return <svg className="provider-svg-logo provider-svg-game provider-svg-game-banner" viewBox="0 0 160 90" aria-hidden="true"><defs><linearGradient id="aovLogo" x1="6" y1="5" x2="154" y2="84"><stop stopColor="#07112d"/><stop offset=".5" stopColor="#1d4ed8"/><stop offset="1" stopColor="#f59e0b"/></linearGradient></defs><rect width="160" height="90" rx="14" fill="url(#aovLogo)"/><path d="M80 12l43 20v17c0 17-15 28-43 38-28-10-43-21-43-38V32z" fill="#ffffff18" stroke="#fff" strokeWidth="4"/><path d="M58 62l22-39 22 39H87l-7-14-7 14z" fill="#fff"/><text x="80" y="82" textAnchor="middle" fontFamily="Arial Black,Arial,sans-serif" fontSize="18" fontWeight="900" fill="#fff" letterSpacing="2">AOV</text></svg>
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
  const prioritySpec=findLogoMatch(clean,svgLogos)?.[1]
  const premiumGameTypes=['freefire','pubg','mlbb','roblox','genshin','valorant','steam','aov']
  if(prioritySpec&&premiumGameTypes.includes(prioritySpec.type))return <i className={`${className} provider-logo-rendered provider-logo-vector provider-logo-game-premium`} data-brand={slug(clean)} role="img" aria-label={`Logo ${name}`}><ProviderSvgLogo spec={prioritySpec}/></i>
  const image=findLogoMatch(clean,imageLogos)?.[1]
  if(image)return <i className={`${className} provider-logo-rendered`} data-brand={slug(clean)}><img src={image} alt={`Logo ${name}`}/></i>
  const spec=findLogoMatch(clean,svgLogos)?.[1]
  if(spec)return <i className={`${className} provider-logo-rendered provider-logo-vector`} data-brand={slug(clean)} role="img" aria-label={`Logo ${name}`}><ProviderSvgLogo spec={spec}/></i>
  return <i className={`${className} provider-logo-rendered provider-wordmark`} data-brand={slug(clean)} role="img" aria-label={`Logo ${name}`}><ProviderSymbol name={clean}/></i>
}
