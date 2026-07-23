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
import mobilelegendsPremium from '../../assets/providers/mobilelegends-premium.svg'
import freefirePremium from '../../assets/providers/freefire-premium.png'
import pubgPremium from '../../assets/providers/pubg-premium.png'
import valorantPremium from '../../assets/providers/valorant-premium.svg'
import genshinPremium from '../../assets/providers/genshin-premium.svg'
import pointblank from '../../assets/providers/pointblank.png'
import robloxPremium from '../../assets/providers/roblox-premium.svg'
import steamPremium from '../../assets/providers/steam-premium.svg'
import aovPremium from '../../assets/providers/aov-premium.svg'
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

const imageLogos={BCA:bca,BRI:bri,BNI:bni,Mandiri:mandiri,'CIMB Niaga':cimb,'Bank Syariah Indonesia':bsi,BSI:bsi,Danamon:danamon,PermataBank:permatabank,SeaBank:seabank,'Bank Jago':jago,AstraPay:astrapay,'i.saku':isaku,'FIF Group':fif,Spotify:spotify,Vidio:vidio,Telkomsel:telkomsel,Indosat:indosat,XL:xl,Tri:tri,AXIS:axis,DANA:dana,GoPay:gopay,OVO:ovo,ShopeePay:shopeepay,LinkAja:linkaja,'Mobile Legends':mobilelegendsPremium,'Free Fire':freefirePremium,'PUBG Mobile':pubgPremium,Roblox:robloxPremium,Valorant:valorantPremium,'Valorant Points':valorantPremium,'Genshin Impact':genshinPremium,'Genshin Impact Genesis Crystals':genshinPremium,'Steam Wallet ID':steamPremium,'Arena of Valor Voucher':aovPremium,'Point Blank':pointblank,'BPJS Kesehatan':bpjs,Biznet:biznet,Prudential:prudential,Allianz:allianz,Manulife:manulife,MyRepublic:myrepublic,CBN:cbn,IndiHome:indihome,'MNC Vision':mncvision,Transvision:transvision,'Google Play':googleplay,'Apple Gift Card':apple,Pesawat:garuda,'Bus & Travel':redbus,Sekolah:kemendikbud,Universitas:kemendikbud,Bimbel:kemendikbud,'PBB Kota/Kabupaten':pajak}

const svgLogos={
  'Mobile Legends':{type:'mlbb'},Roblox:{type:'roblox'},'Genshin Impact':{type:'genshin'},'Genshin Impact Genesis Crystals':{type:'genshin'},Valorant:{type:'valorant'},'Valorant Points':{type:'valorant'},'Steam Wallet ID':{type:'steam'},'Arena of Valor Voucher':{type:'aov'},
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
  if(spec.type==='freefire')return <svg className="provider-svg-logo provider-svg-game provider-svg-game-banner" viewBox="0 0 160 90" aria-hidden="true"><defs><linearGradient id="ffGameBg" x1="8" y1="10" x2="152" y2="80"><stop stopColor="#050505"/><stop offset=".52" stopColor="#241006"/><stop offset="1" stopColor="#0a0a0a"/></linearGradient><linearGradient id="ffFlame" x1="64" y1="8" x2="101" y2="80"><stop stopColor="#fff7ad"/><stop offset=".45" stopColor="#ff9f1c"/><stop offset="1" stopColor="#f04410"/></linearGradient></defs><rect width="160" height="90" rx="14" fill="url(#ffGameBg)"/><path d="M18 67C51 10 96 19 142 13c-26 13-38 28-43 46 17-7 30-4 43 5-32-1-50 10-70 15-21 5-39 1-54-12z" fill="#ff7a18" opacity=".3"/><path d="M83 9c12 22-9 28 12 50 7 7 7 16 1 23-8 8-25 7-33-4-8-11-1-22 8-31 8-9 14-18 12-38z" fill="url(#ffFlame)"/><path d="M89 31l10 2-7 17 12-1-25 29 8-21-13 2z" fill="#fff8ca"/></svg>
  if(spec.type==='pubg')return <svg className="provider-svg-logo provider-svg-game provider-svg-game-banner" viewBox="0 0 160 90" aria-hidden="true"><defs><linearGradient id="pubgGameBg" x1="0" y1="0" x2="160" y2="90"><stop stopColor="#050505"/><stop offset=".55" stopColor="#17120a"/><stop offset="1" stopColor="#070707"/></linearGradient></defs><rect width="160" height="90" rx="14" fill="url(#pubgGameBg)"/><rect x="24" y="12" width="112" height="66" rx="9" fill="none" stroke="#f2b233" strokeWidth="5"/><path d="M66 21h28c5 0 8 3 8 8v7H58v-7c0-5 3-8 8-8z" fill="#fff"/><path d="M59 36h43v8c0 11-8 19-21 19h-1c-13 0-21-8-21-19z" fill="#f8fafc"/><path d="M46 78c4-17 16-25 34-25s30 8 34 25z" fill="#f8fafc"/><path d="M47 24v44M113 24v44" stroke="#fff" strokeWidth="6" strokeLinecap="round"/></svg>
  if(spec.type==='mlbb')return <svg className="provider-svg-logo provider-svg-game provider-svg-game-banner" viewBox="0 0 160 90" aria-hidden="true"><defs><linearGradient id="mlGameBg" x1="9" y1="8" x2="151" y2="82"><stop stopColor="#06152f"/><stop offset=".52" stopColor="#0f1b3f"/><stop offset="1" stopColor="#020617"/></linearGradient><linearGradient id="mlGold" x1="42" y1="8" x2="118" y2="82"><stop stopColor="#fff4a3"/><stop offset=".48" stopColor="#f5b82e"/><stop offset="1" stopColor="#9b5b08"/></linearGradient></defs><rect width="160" height="90" rx="14" fill="url(#mlGameBg)"/><path d="M80 8l42 18-8 42-34 14-34-14-8-42z" fill="url(#mlGold)"/><path d="M51 28l19 30 10-35 10 35 19-30-9 39H60z" fill="#111827" opacity=".78"/><path d="M48 69h64" stroke="#fff0ad" strokeWidth="5" strokeLinecap="round"/></svg>
  if(spec.type==='roblox')return <svg className="provider-svg-logo provider-svg-game provider-svg-game-banner" viewBox="0 0 160 90" aria-hidden="true"><defs><linearGradient id="rbxGameBg" x1="0" y1="0" x2="160" y2="90"><stop stopColor="#0f172a"/><stop offset="1" stopColor="#020617"/></linearGradient></defs><rect width="160" height="90" rx="14" fill="url(#rbxGameBg)"/><rect x="50" y="17" width="60" height="60" rx="9" fill="#fff" transform="rotate(12 80 47)"/><rect x="72" y="39" width="16" height="16" rx="3" fill="#0f172a" transform="rotate(12 80 47)"/></svg>
  if(spec.type==='genshin')return <svg className="provider-svg-logo provider-svg-game provider-svg-game-banner" viewBox="0 0 160 90" aria-hidden="true"><defs><linearGradient id="giGameBg" x1="0" y1="0" x2="160" y2="90"><stop stopColor="#0b1027"/><stop offset=".55" stopColor="#4153a8"/><stop offset="1" stopColor="#f6d78f"/></linearGradient></defs><rect width="160" height="90" rx="14" fill="url(#giGameBg)"/><circle cx="80" cy="44" r="31" fill="#ffffff24"/><path d="M80 10l12 24 27 4-20 19 5 27-24-13-24 13 5-27-20-19 27-4z" fill="#fff7cc"/><path d="M80 24l6 16 17 3-12 11 4 17-15-9-15 9 4-17-12-11 17-3z" fill="#8b5cf6"/></svg>
  if(spec.type==='valorant')return <svg className="provider-svg-logo provider-svg-game provider-svg-game-banner" viewBox="0 0 160 90" aria-hidden="true"><defs><linearGradient id="valGameBg" x1="0" y1="0" x2="160" y2="90"><stop stopColor="#111827"/><stop offset=".52" stopColor="#2b1118"/><stop offset="1" stopColor="#050505"/></linearGradient></defs><rect width="160" height="90" rx="14" fill="url(#valGameBg)"/><path d="M38 20l34 48H53L24 20zM122 20L88 68h19l29-48z" fill="#ff4655"/><path d="M58 72h44" stroke="#fff" strokeWidth="6" strokeLinecap="round"/></svg>
  if(spec.type==='steam')return <svg className="provider-svg-logo provider-svg-game provider-svg-game-banner" viewBox="0 0 160 90" aria-hidden="true"><defs><linearGradient id="steamGameBg" x1="0" y1="0" x2="160" y2="90"><stop stopColor="#06192f"/><stop offset=".55" stopColor="#0f3460"/><stop offset="1" stopColor="#020617"/></linearGradient></defs><rect width="160" height="90" rx="14" fill="url(#steamGameBg)"/><circle cx="67" cy="47" r="26" fill="none" stroke="#fff" strokeWidth="8"/><circle cx="67" cy="47" r="11" fill="#fff"/><circle cx="108" cy="27" r="14" fill="none" stroke="#fff" strokeWidth="7"/><path d="M87 38l13-6M49 61l-20 13" stroke="#fff" strokeWidth="8" strokeLinecap="round"/></svg>
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
  const image=findLogoMatch(clean,imageLogos)?.[1]
  if(image)return <i className={`${className} provider-logo-rendered provider-logo-image`} data-brand={slug(clean)}><img src={image} alt={`Logo ${name}`}/></i>
  const spec=findLogoMatch(clean,svgLogos)?.[1]
  if(spec)return <i className={`${className} provider-logo-rendered provider-logo-vector`} data-brand={slug(clean)} role="img" aria-label={`Logo ${name}`}><ProviderSvgLogo spec={spec}/></i>
  return <i className={`${className} provider-logo-rendered provider-wordmark`} data-brand={slug(clean)} role="img" aria-label={`Logo ${name}`}><ProviderSymbol name={clean}/></i>
}
