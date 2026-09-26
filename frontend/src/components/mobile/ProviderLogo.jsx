import bca from '../../assets/providers/official/bca-vector.svg'
import bri from '../../assets/providers/official/bri.png'
import bni from '../../assets/providers/official/bni.png'
import mandiri from '../../assets/providers/official/mandiri.png'
import cimb from '../../assets/providers/official/cimb-niaga.svg'
import bsi from '../../assets/providers/official/bsi-vector.svg'
import danamon from '../../assets/providers/official/danamon.svg'
import permatabank from '../../assets/providers/official/permatabank.svg'
import seabank from '../../assets/providers/official/seabank.svg'
import jago from '../../assets/providers/official/jago.svg'
import fif from '../../assets/providers/official/fif.png'
import spotify from '../../assets/providers/official/spotify.png'
import vidio from '../../assets/providers/official/vidio.png'
import voucherBrand from '../../assets/service-emblems-hd/voucher.webp'
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
import valorantPremium from '../../assets/providers/valorant-premium.svg'
import genshinPremium from '../../assets/providers/genshin-premium.svg'
import freefire from '../../assets/providers/freefire.png'
import robloxPremium from '../../assets/providers/roblox-premium.svg'
import steamPremium from '../../assets/providers/steam-premium.svg'
import aovPremium from '../../assets/providers/aov-premium.svg'
import bpjs from '../../assets/providers/bpjs.png'
import bpjsKetenagakerjaan from '../../assets/providers/official/bpjs-ketenagakerjaan.svg'
import biznet from '../../assets/providers/biznet.png'
import prudential from '../../assets/providers/official/prudential.png'
import allianz from '../../assets/providers/official/allianz.png'
import manulife from '../../assets/providers/official/manulife.png'
import myrepublic from '../../assets/providers/official/myrepublic.png'
import cbn from '../../assets/providers/official/cbn.png'
import indihome from '../../assets/providers/official/indihome.png'
import googleplay from '../../assets/providers/official/googleplay.png'
import apple from '../../assets/providers/official/apple.png'
import garuda from '../../assets/providers/official/garuda.png'
import kemendikbud from '../../assets/providers/official/kemendikbud.png'
import astrapay from '../../assets/providers/official/astrapay.svg'
import isaku from '../../assets/providers/official/isaku.svg'
import byu from '../../assets/providers/official/byu.svg'
import smartfren from '../../assets/providers/official/smartfren.svg'
import grab from '../../assets/providers/official/grab.svg'
import kaspro from '../../assets/providers/official/kaspro.png'
import maxim from '../../assets/providers/official/maxim.png'
import sakuku from '../../assets/providers/official/sakuku.png'
import minecraft from '../../assets/providers/official/minecraft.png'
import magicChessGoGo from '../../assets/providers/official/magic-chess-go-go.png'
import fcMobile from '../../assets/providers/official/fc-mobile.png'
import wildRift from '../../assets/providers/official/wild-rift.png'
import callOfDutyMobile from '../../assets/providers/official/call-of-duty-mobile.png'
import honkaiImpact3 from '../../assets/providers/official/honkai-impact-3.png'
import honorOfKings from '../../assets/providers/official/honor-of-kings.png'
import mncvisionOfficial from '../../assets/providers/official/auto/mnc-vision-official.png'
import kvisionBrand from '../../assets/providers/official/auto/k-vision-brand.png'
import nexParabolaBrand from '../../assets/providers/official/auto/nex-parabola-brand.webp'
import transvisionBrand from '../../assets/providers/official/auto/transvision-brand.png'
import jneOfficial from '../../assets/providers/official/auto/jne-official.svg'
import anterajaOfficial from '../../assets/providers/official/auto/anteraja-official.png'
import pgnOfficial from '../../assets/providers/official/pgn-official.svg'
import indihomeOfficial from '../../assets/providers/official/indihome-official.svg'
import telkomOfficial from '../../assets/providers/official/telkom-official.svg'
import pdamSvg from 'idn-finlogos/icons/pdam.svg?raw'
import { BadgeCheck, Banknote, BookOpenCheck, Building2, Bus, Car, CircleParking, Clapperboard, CreditCard, Cross, Droplets, Earth, Flame, Gamepad2, GraduationCap, HandHeart, HeartPulse, Landmark, MapPin, MonitorPlay, Plane, QrCode, Radio, ReceiptText, ShieldCheck, Smartphone, Store, TrainFront, Truck, Wallet, Wifi, Zap } from 'lucide-react'

// The package SVG lacks the XML namespace required when used as an <img> source.
// Embed a corrected copy so PDAM logos never depend on a separate asset request.
const pdamLogo=`data:image/svg+xml;charset=utf-8,${encodeURIComponent(pdamSvg.replace('<svg ', '<svg xmlns="http://www.w3.org/2000/svg" '))}`

const imageLogos={BCA:bca,'Bank BCA':bca,BRI:bri,'Bank BRI':bri,BNI:bni,'Bank BNI':bni,Mandiri:mandiri,'Bank Mandiri':mandiri,'CIMB Niaga':cimb,'Bank Syariah Indonesia':bsi,'Syariah Indonesia':bsi,BSI:bsi,Danamon:danamon,'Bank Danamon':danamon,PermataBank:permatabank,'Bank Permata':permatabank,Permata:permatabank,SeaBank:seabank,'Sea Bank':seabank,'Bank Jago':jago,Jago:jago,AstraPay:astrapay,'i.saku':isaku,Grab:grab,KasPro:kaspro,Maxim:maxim,Sakuku:sakuku,'FIF Group':fif,Spotify:spotify,Vidio:vidio,Telkomsel:telkomsel,'by.U':byu,byU:byu,Smartfren:smartfren,BRIZZI:bri,'BNI TapCash':bni,'BCA Flazz':bca,'Mandiri e-Money':mandiri,'Internet Pascabayar':indihome,Indosat:indosat,XL:xl,Tri:tri,Axis:axis,AXIS:axis,DANA:dana,GoPay:gopay,OVO:ovo,ShopeePay:shopeepay,'Shopee Food Driver':shopeepay,LinkAja:linkaja,'Free Fire':freefire,'Mobile Legend':mobilelegendsPremium,'Mobile Legends':mobilelegendsPremium,Roblox:robloxPremium,Valorant:valorantPremium,'Valorant Points':valorantPremium,'Genshin Impact':genshinPremium,'Genshin Impact Genesis Crystals':genshinPremium,'Steam Wallet ID':steamPremium,'Arena of Valor':aovPremium,'Arena of Valor Voucher':aovPremium,Minecraft:minecraft,'Magic Chess: Go Go':magicChessGoGo,'FC Mobile':fcMobile,'League of Legends: Wild Rift':wildRift,'Call of Duty Mobile':callOfDutyMobile,'Honkai Impact 3':honkaiImpact3,'Honor of King':honorOfKings,'Honor of Kings':honorOfKings,'BPJS Kesehatan':bpjs,'BPJS Ketenagakerjaan':bpjsKetenagakerjaan,'BPJS Tenaga Kerja':bpjsKetenagakerjaan,'BPJS TK':bpjsKetenagakerjaan,Biznet:biznet,Prudential:prudential,Allianz:allianz,Manulife:manulife,MyRepublic:myrepublic,CBN:cbn,IndiHome:indihome,'MNC Vision':mncvisionOfficial,'K-Vision':kvisionBrand,'Nex Parabola':nexParabolaBrand,Transvision:transvisionBrand,'JNE':jneOfficial,AnterAja:anterajaOfficial,'Google Play':googleplay,'Apple Gift Card':apple,Pesawat:garuda,Sekolah:kemendikbud,Universitas:kemendikbud,Bimbel:kemendikbud,'PBB Kota/Kabupaten':pajak,'DJP Online':pajak}

// Wordmark resolusi tinggi untuk bank yang aset katalog lamanya hanya favicon
// kecil. Sumber Wikimedia mempertahankan bentuk logo, sedangkan Sumsel Babel
// dilayani langsung dari situs resmi bank.
const highResolutionBankLogos={
  Maybank:'https://upload.wikimedia.org/wikipedia/commons/1/1a/Logo_wordmark_Bank_Maybank_Indonesia.png',
  UOB:'https://upload.wikimedia.org/wikipedia/commons/e/e0/UOB_Logo_%282022%29.svg',
  Muamalat:'https://upload.wikimedia.org/wikipedia/commons/8/81/Muamalat_Logo.png',
  'Bank Jatim':'https://upload.wikimedia.org/wikipedia/commons/3/3b/Bank-Jatim-Logo.svg',
  'Bank Sumut':'https://upload.wikimedia.org/wikipedia/commons/3/31/Logo_Bank_Sumut.png',
  'Bank Kalbar':'https://upload.wikimedia.org/wikipedia/commons/3/35/Logo_Bank_Kalbar.png',
  'Bank Sulselbar':'https://upload.wikimedia.org/wikipedia/commons/c/c0/Logo_Bank_Sulselbar.png',
  'Bank Sumsel Babel':'https://www.banksumselbabel.com/img/logo.png',
}

const officialInsuranceLogos={
  CAR:'data:image/png;base64,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',
  'IFG Life':'https://ifg-life.id/api/cms/preview/logo_ifg_life_v2_7d5e4bd8.jpg',
  Jiwasraya:'https://timlikuidasi.jiwasraya.co.id/wp-content/uploads/2019/09/Jiwasraya_2026.png',
  'Tokio Marine':'https://www.tokiomarine.com/content/dam/tokiomarine/indonesia/shared-landing/images/TokioMarineLogo-Horizontal@2x.png',
  Prudential:'https://www.prudential.co.id/content/dam/prudential-aem-common/header/Prudential-Logo.svg',
}

const svgLogos={
	MotionPay:{type:'motionpay'},
  'Mobile Legends':{type:'mlbb'},'Free Fire':{type:'freefire'},'PUBG Mobile':{type:'pubg'},'Point Blank':{type:'pointblank'},Roblox:{type:'roblox'},'Genshin Impact':{type:'genshin'},'Genshin Impact Genesis Crystals':{type:'genshin'},Valorant:{type:'valorant'},'Valorant Points':{type:'valorant'},'Steam Wallet ID':{type:'steam'},'Arena of Valor Voucher':{type:'aov'},
  Netflix:{type:'netflix'},'YouTube Premium':{type:'youtube'},'Disney+ Hotstar':{type:'disney'},
  PLN:{type:'pln'},PGN:{type:'gas'},PDAM:{type:'water'},Telkom:{type:'telkom'},
  'QRIS Nasional':{type:'qris'},'QRIS UMKM':{type:'qris'},'QRIS Dinamis':{type:'qris'},
  'Mandiri e-Money':{type:'card'},'BCA Flazz':{type:'card'},'BNI TapCash':{type:'card'},BRIZZI:{type:'card'},'Mandiri e-Toll':{type:'card'},
  Halodoc:{type:'health'},'Klinik Digital':{type:'health'},Laboratorium:{type:'lab'},Apotek:{type:'pharmacy'},
  'Home Credit':{type:'finance'},Kredivo:{type:'finance'},Akulaku:{type:'finance'},'Mega Finance':{type:'finance'},'Adira Finance':{type:'adira'},'WOM Finance':{type:'wom'},
  'DJP Online':{type:'tax'},'Pajak Daerah':{type:'tax'},'Samsat Digital':{type:'tax'},'Penerimaan Negara':{type:'tax'},
  BAZNAS:{type:'donation'},'Dompet Dhuafa':{type:'donation'},'Rumah Zakat':{type:'donation'},Kitabisa:{type:'donation'},
  Parkee:{type:'parking'},CentrePark:{type:'parking'},'Sky Parking':{type:'parking'},'Secure Parking':{type:'parking'},
  JNE:{type:'delivery'},'J&T Express':{type:'delivery'},SiCepat:{type:'delivery'},'Pos Indonesia':{type:'delivery'},AnterAja:{type:'delivery'},'Kereta Api':{type:'train'},'Bus & Travel':{type:'busTravel'},
}

const normalize=name=>String(name||'').replace(/ Card$/,'')
const slug=name=>String(name||'').toLowerCase().replace(/[^a-z0-9]+/g,'-')
const findLogoMatch=(name,source)=>Object.entries(source)
  .sort(([left],[right])=>right.length-left.length)
  .find(([key])=>{const value=name.toLocaleLowerCase('id-ID'),candidate=key.toLocaleLowerCase('id-ID');return value===candidate||value.startsWith(`${candidate} `)||value.startsWith(`${candidate} -`)})
// Aset provider tambahan disimpan per nama provider. Dengan ini provider baru
// tetap memakai logo brand asli tanpa perlu kembali ke ikon placeholder.
const automaticLogos=import.meta.glob([
  '../../assets/providers/official/auto/*.png',
  '../../assets/providers/official/auto/*.jpg',
  '../../assets/providers/official/auto/*.jpeg',
  '../../assets/providers/official/auto/*.svg',
  '../../assets/providers/official/auto/*.webp',
],{eager:true,query:'?url',import:'default'})
// Nama di layanan tidak selalu sama dengan nama file aset resmi. Alias ini
// memastikan provider tersebut tetap mengambil gambar brand, bukan ikon teks.
const automaticAliases={
  // Bank: label katalog H2H memakai beberapa variasi nama, sementara aset
  // resmi disimpan menggunakan nama brand yang lebih pendek. Semua variasi
  // diarahkan ke aset brand asli supaya tidak pernah turun ke ikon teks.
  'Bank Aceh':'aceh',Aceh:'aceh',
  'Bank Aladin Syariah':'aladin-syariah','Aladin Syariah':'aladin-syariah',
  'Allo Bank':'allo-bank','Allo':'allo-bank',
  'Bank Artha Graha':'artha-graha','Artha Graha':'artha-graha',
  'Bank Banten':'banten',Banten:'banten',
  'Bank Bengkulu':'bengkulu',Bengkulu:'bengkulu',
  'Bank BJB':'bjb',BJB:'bjb',
  'blu by BCA Digital':'blu-bca-digital','BCA Digital':'blu-bca-digital',blu:'blu-bca-digital',
  'BPD Bali':'bpd-bali','Bank BPD Bali':'bpd-bali',
  BTN:'btn','Bank BTN':'btn',
  BTPN:'btpn','Bank BTPN':'btpn',
  Bukopin:'bukopin','KB Bukopin':'bukopin','Bank KB Bukopin':'bukopin',
  'Bank Bumi Arta':'bumi-arta','Bumi Arta':'bumi-arta',
  'Bank Capital':'capital',Capital:'capital',
  'China Construction Bank':'china-construction-bank',CCB:'china-construction-bank',
  'Bank China Construction':'china-construction-bank',
  Citibank:'citibank','Citi Bank':'citibank',
  Commonwealth:'commonwealth','Bank Commonwealth':'commonwealth',
  'CTBC Bank':'ctbc','CTBC Indonesia':'ctbc',
  'Bank CTBC':'ctbc',
  DBS:'dbs','Bank DBS':'dbs',
  'Bank DKI':'dki','DKI Jakarta':'dki',
  'Bank DIY':'diy','BPD DIY':'diy',
  'Bank Ganesha':'ganesha',Ganesha:'ganesha',
  'Bank Hana':'hana',Hana:'hana',
  'Hibank Indonesia':'hibank',Hibank:'hibank',
  HSBC:'hsbc','HSBC Indonesia':'hsbc',
  'IBK Bank':'ibk','Bank IBK':'ibk',
  'Bank INA Perdana':'ina-perdana','Bank Ina Perdana':'ina-perdana','INA Perdana':'ina-perdana',
  'Bank Index':'index',Index:'index',
  'Bank Jambi':'jambi',Jambi:'jambi','Bank Jateng':'jateng',Jateng:'jateng',
  'Bank Jatim':'jatim',Jatim:'jatim','Bank Kalbar':'kalbar',Kalbar:'kalbar',
  'Bank Kalsel':'kalsel',Kalsel:'kalsel','Bank Kalteng':'kalteng',Kalteng:'kalteng',
  'Bank Kaltimtara':'kaltim','Bank Kaltim':'kaltim',Kaltimtara:'kaltim','Bank Lampung':'lampung',Lampung:'lampung',
  'Bank Maluku Malut':'maluku-malut','Maluku Malut':'maluku-malut',
  'Bank Mandiri Taspen':'mandiri-taspen','Mandiri Taspen':'mandiri-taspen',
  'Bank Maspion':'maspion',Maspion:'maspion',Maybank:'maybank','Maybank Indonesia':'maybank','Bank Mayora':'mayora',Mayora:'mayora',
  'Bank Mega':'mega',Mega:'mega','Bank Mestika':'mestika',Mestika:'mestika',
  'Bank MNC':'mnc','MNC Bank':'mnc',
  'Bank Muamalat':'muamalat',Muamalat:'muamalat','Bank Nagari':'nagari',Nagari:'nagari',
  'Bank Neo Commerce':'neo-commerce','Neo Commerce':'neo-commerce',Neo:'neo-commerce',
  'Nobu Bank':'nobu','Bank Nobu':'nobu',Nobu:'nobu','Bank NTB Syariah':'ntb','Bank NTB':'ntb','NTB Syariah':'ntb',
  'Bank NTT':'ntt',NTT:'ntt','OCBC NISP':'ocbc-nisp','Bank OCBC NISP':'ocbc-nisp',
  'Panin Bank':'panin','Bank Panin':'panin',Panin:'panin','Bank Papua':'papua',Papua:'papua',
  'QNB Indonesia':'qnb','Bank QNB Indonesia':'qnb','Bank QNB':'qnb',QNB:'qnb','Bank Raya':'raya','Bank Raya (BRI Agro)':'raya',Raya:'raya',
  'Bank Resona Perdania':'resona-perdania','Resona Perdania':'resona-perdania',
  'Bank Riau Kepri':'riau-kepri','Riau Kepri':'riau-kepri',
  'Bank Sahabat Sampoerna':'sahabat-sampoerna','Sahabat Sampoerna':'sahabat-sampoerna',
  'Shinhan Bank':'shinhan','Bank Shinhan':'shinhan',Shinhan:'shinhan',
  'Bank Sinarmas':'sinarmas',Sinarmas:'sinarmas','Bank Sulselbar':'sulselbar',Sulselbar:'sulselbar',
  'Bank Sulteng':'sulteng',Sulteng:'sulteng','Bank Sultra':'sultra',Sultra:'sultra',
  'Bank SulutGo':'sulut','Bank Sulut':'sulut',SulutGo:'sulut','Bank Sumsel Babel':'sumsel-babel','Sumsel Babel':'sumsel-babel',
  'Bank Sumut':'sumut',Sumut:'sumut',Superbank:'superbank','UOB Indonesia':'uob',UOB:'uob',
  'Bank Victoria':'victoria',Victoria:'victoria','Bank Woori Saudara':'woori-saudara','Woori Saudara':'woori-saudara',
  'Blu (BCA Digital)':'blu-bca-digital',
  PLN:'pln-pascabayar',
  'PDAM Jakarta':'pdam-indonesia','PDAM Bandung':'pdam-indonesia','PDAM Surabaya':'pdam-indonesia',
  'WOM Finance':'wom-finance','J&T Express':'j-t-express','SIGNAL Samsat':'signal-samsat',
  'Pajak Daerah':'pajak-daerah','Penerimaan Negara':'penerimaan-negara',
  'CentrePark':'centrepark','Sky Parking':'sky-parking','Secure Parking':'secure-parking',
  'Pos Indonesia':'pos-indonesia','Canva Pro':'canva-pro','Apple Gift Card':'apple',
  'YouTube Premium':'youtube','Disney+ Hotstar':'disney-hotstar',
  // Jawara Vision adalah paket MNC Vision; gunakan merek induknya saat
  // tidak ada berkas logo Jawara tersendiri yang dapat diverifikasi.
  'Jawara Vision':'mnc-vision-official',
  'Telkomsel Halo':'telkomsel','Indosat Postpaid':'indosat','XL Prioritas':'xl',
  'DELTA FORCE - STEAM':'delta-force-garena',
  'POINT BLANK - CASH':'point-blank',
  'NARUTO SHIPPUDEN':'naruto-shippuden-mobile',
  'PUBG NEW STATE MOBILE':'new-state-mobile',
  'CRYSTAL OF ALTLAN':'crystal-of-atlan',
  // Multifinance: katalog H2HR memakai banyak variasi nama untuk perusahaan
  // yang sama. Semua variasi diarahkan ke satu aset logo brand yang tajam.
  'ACC FINANCE':'finance-acc','ASTRA CREDIT COMPANIES':'finance-acc',
  'ADIRA FINANCE':'finance-adira-finance','ADIRA FINANCE (MOTORDURABLE GOOD DAN SYARIAH)':'finance-adira-finance',
  'AEON CICILAN':'finance-aeon-credit-service','AEON CREDIT SERVICE INDONESIA':'finance-aeon-credit-service','PT AEON CREDIT SERVICE INDONESIA':'finance-aeon-credit-service',
  'BCA FINANCE':'finance-bca-finance','BCA FINANCE BCAF':'finance-bca-finance','BCA MULTIFINANCE':'finance-bca-finance',
  'BFI FINANCE':'finance-bfi-finance','PT. BFI FINANCE INDONESIA':'finance-bfi-finance',
  'BLIBLI.COM TAGIHAN DIATAS 1JT':'finance-blibli','BTN KPR BTN':'finance-btn',
  'BUSAN AUTO FINANCE':'finance-bussan-auto-finance','BUSSAN AUTO FINANCE (BAF)':'finance-bussan-auto-finance','BUSSAN AUTO FINANCE BAF':'finance-bussan-auto-finance',
  'FIF ANGSURAN':'finance-fif-astra','FIF FINANCE':'finance-fif-astra','FIF GROUP':'finance-fif-astra','FIF SYARIAH':'finance-fif-astra',
  'HOME CREDIT':'finance-home-credit','HOME CREDIT INDONESIA':'finance-home-credit',
  'ANGSURAN KREDIT PLUS(FINANSIA)':'finance-kreditplus','KREDIT PLUS (FINANSIA)':'finance-kreditplus','KREDITPLUS/FINANSIA':'finance-kreditplus',
  KREDIVO:'finance-kredivo','PEGADAIAN CICIL MIKRO':'finance-pegadaian','PEGADAIAN GADAI ULANG':'finance-pegadaian','PEGADAIAN TEBUS GADAI':'finance-pegadaian',
  'PEMBA PT. TOYOTA ASTRA FINANCIAL SERVICES':'finance-toyota-financial-service','TOYOTA ASTRA FINANCIAL SERVICES':'finance-toyota-financial-service','TOYOTA ASTRA FINANCIAL SERVICES (TAF) TAF':'finance-toyota-financial-service',
  'WOM FINANCE':'finance-wom-finance',
}
const findAutomaticLogo=name=>{
  const key=automaticAliases[name]||slug(name)
  return Object.entries(automaticLogos).find(([path])=>path.includes(`/${key}.`))?.[1]
}

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

function MultifinanceWordmark({name}){
  const label=String(name||'MULTIFINANCE').replace(/\([^)]*\)/g,' ').replace(/\s+/g,' ').trim().toUpperCase().slice(0,30)
  return <svg className="provider-svg-logo provider-svg-finance-wordmark" viewBox="0 0 160 52" aria-hidden="true"><rect x="2" y="2" width="156" height="48" rx="8" fill="#fff" stroke="#e8e3f8"/><path fill="#5b42c9" d="M14 13h5v26h-5z"/><text x="28" y="30" fill="#27324a" fontSize="10" fontWeight="900" fontFamily="Arial, sans-serif">{label}</text><text x="28" y="40" fill="#7665cc" fontSize="6" fontWeight="700" fontFamily="Arial, sans-serif">PENYEDIA H2HR</text></svg>
}

function ProviderSvgLogo({spec}){
	if(spec.type==='motionpay')return <svg className="provider-svg-logo" viewBox="0 0 80 80" aria-hidden="true"><circle cx="40" cy="40" r="29" fill="#6432a8"/><path d="M22 48V31c0-5 4-9 9-9h7l7 12 7-12h3c5 0 9 4 9 9v17c0 6-5 10-10 10H32c-6 0-10-4-10-10z" fill="#fff"/><path d="M31 31v18M55 31v18M38 34l7 11 7-11" fill="none" stroke="#6432a8" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/></svg>
  if(spec.type==='freefire')return <svg className="provider-svg-logo provider-svg-freefire provider-svg-game-banner" viewBox="0 0 420 108" aria-hidden="true"><defs><linearGradient id="ffKnife" x1="0" x2="0" y1="0" y2="1"><stop stopColor="#ffd45a"/><stop offset=".5" stopColor="#ff9f05"/><stop offset="1" stopColor="#e86800"/></linearGradient></defs><rect width="420" height="108" rx="5" fill="#020202"/><g fontFamily="Impact, Haettenschweiler, 'Arial Black', sans-serif" fontSize="64" fontWeight="900" letterSpacing="1"><text x="26" y="72" fill="#f8fafc">FREE</text><text x="238" y="72" fill="#f8fafc">FIRE</text></g><path d="M219 18c11 11 9 25 2 39l-8 18 16-8-5 27-25-1 8-31c-10 3-17 6-25 12 8-22 20-40 37-56z" fill="url(#ffKnife)"/><path d="M217 29c4 8 1 15-3 23l-4 11 8-5-2 12-9 1 4-18c-5 2-9 4-13 7 5-13 11-23 19-31z" fill="#fff4b0" opacity=".35"/></svg>
  if(spec.type==='pubg')return <svg className="provider-svg-logo provider-svg-game provider-svg-game-banner" viewBox="0 0 160 90" aria-hidden="true"><defs><linearGradient id="pubgGameBg" x1="0" y1="0" x2="160" y2="90"><stop stopColor="#050505"/><stop offset=".55" stopColor="#17120a"/><stop offset="1" stopColor="#070707"/></linearGradient></defs><rect width="160" height="90" rx="14" fill="url(#pubgGameBg)"/><rect x="24" y="12" width="112" height="66" rx="9" fill="none" stroke="#f2b233" strokeWidth="5"/><path d="M66 21h28c5 0 8 3 8 8v7H58v-7c0-5 3-8 8-8z" fill="#fff"/><path d="M59 36h43v8c0 11-8 19-21 19h-1c-13 0-21-8-21-19z" fill="#f8fafc"/><path d="M46 78c4-17 16-25 34-25s30 8 34 25z" fill="#f8fafc"/><path d="M47 24v44M113 24v44" stroke="#fff" strokeWidth="6" strokeLinecap="round"/></svg>
  if(spec.type==='mlbb')return <svg className="provider-svg-logo provider-svg-game provider-svg-game-banner" viewBox="0 0 160 90" aria-hidden="true"><defs><linearGradient id="mlGameBg" x1="9" y1="8" x2="151" y2="82"><stop stopColor="#06152f"/><stop offset=".52" stopColor="#0f1b3f"/><stop offset="1" stopColor="#020617"/></linearGradient><linearGradient id="mlGold" x1="42" y1="8" x2="118" y2="82"><stop stopColor="#fff4a3"/><stop offset=".48" stopColor="#f5b82e"/><stop offset="1" stopColor="#9b5b08"/></linearGradient></defs><rect width="160" height="90" rx="14" fill="url(#mlGameBg)"/><path d="M80 8l42 18-8 42-34 14-34-14-8-42z" fill="url(#mlGold)"/><path d="M51 28l19 30 10-35 10 35 19-30-9 39H60z" fill="#111827" opacity=".78"/><path d="M48 69h64" stroke="#fff0ad" strokeWidth="5" strokeLinecap="round"/></svg>
  if(spec.type==='roblox')return <svg className="provider-svg-logo provider-svg-game provider-svg-game-banner" viewBox="0 0 160 90" aria-hidden="true"><defs><linearGradient id="rbxGameBg" x1="0" y1="0" x2="160" y2="90"><stop stopColor="#0f172a"/><stop offset="1" stopColor="#020617"/></linearGradient></defs><rect width="160" height="90" rx="14" fill="url(#rbxGameBg)"/><rect x="50" y="17" width="60" height="60" rx="9" fill="#fff" transform="rotate(12 80 47)"/><rect x="72" y="39" width="16" height="16" rx="3" fill="#0f172a" transform="rotate(12 80 47)"/></svg>
  if(spec.type==='genshin')return <svg className="provider-svg-logo provider-svg-game provider-svg-game-banner" viewBox="0 0 160 90" aria-hidden="true"><defs><linearGradient id="giGameBg" x1="0" y1="0" x2="160" y2="90"><stop stopColor="#0b1027"/><stop offset=".55" stopColor="#4153a8"/><stop offset="1" stopColor="#f6d78f"/></linearGradient></defs><rect width="160" height="90" rx="14" fill="url(#giGameBg)"/><circle cx="80" cy="44" r="31" fill="#ffffff24"/><path d="M80 10l12 24 27 4-20 19 5 27-24-13-24 13 5-27-20-19 27-4z" fill="#fff7cc"/><path d="M80 24l6 16 17 3-12 11 4 17-15-9-15 9 4-17-12-11 17-3z" fill="#8b5cf6"/></svg>
  if(spec.type==='valorant')return <svg className="provider-svg-logo provider-svg-game provider-svg-game-banner" viewBox="0 0 160 90" aria-hidden="true"><defs><linearGradient id="valGameBg" x1="0" y1="0" x2="160" y2="90"><stop stopColor="#111827"/><stop offset=".52" stopColor="#2b1118"/><stop offset="1" stopColor="#050505"/></linearGradient></defs><rect width="160" height="90" rx="14" fill="url(#valGameBg)"/><path d="M38 20l34 48H53L24 20zM122 20L88 68h19l29-48z" fill="#ff4655"/><path d="M58 72h44" stroke="#fff" strokeWidth="6" strokeLinecap="round"/></svg>
  if(spec.type==='steam')return <svg className="provider-svg-logo provider-svg-game provider-svg-game-banner" viewBox="0 0 160 90" aria-hidden="true"><defs><linearGradient id="steamGameBg" x1="0" y1="0" x2="160" y2="90"><stop stopColor="#06192f"/><stop offset=".55" stopColor="#0f3460"/><stop offset="1" stopColor="#020617"/></linearGradient></defs><rect width="160" height="90" rx="14" fill="url(#steamGameBg)"/><circle cx="67" cy="47" r="26" fill="none" stroke="#fff" strokeWidth="8"/><circle cx="67" cy="47" r="11" fill="#fff"/><circle cx="108" cy="27" r="14" fill="none" stroke="#fff" strokeWidth="7"/><path d="M87 38l13-6M49 61l-20 13" stroke="#fff" strokeWidth="8" strokeLinecap="round"/></svg>
  if(spec.type==='simple')return <svg className="provider-svg-logo provider-svg-simple" viewBox="0 0 120 64" aria-hidden="true"><rect width="120" height="64" rx="8" fill="#0f172a"/><path transform="translate(44 16) scale(1.35)" fill="#fff" d={spec.icon.path}/></svg>
  if(spec.type==='pointblank')return <svg className="provider-svg-logo provider-svg-game" viewBox="0 0 120 64" aria-hidden="true"><defs><linearGradient id="pbLogo" x1="8" y1="6" x2="112" y2="58"><stop stopColor="#111827"/><stop offset=".55" stopColor="#164e63"/><stop offset="1" stopColor="#0f172a"/></linearGradient></defs><rect width="120" height="64" rx="8" fill="url(#pbLogo)"/><circle cx="32" cy="32" r="17" fill="#0ea5e9" opacity=".18"/><path d="M21 44l15-28h22c12 0 20 7 20 17 0 11-8 18-21 18H45l-4 7H25l5-10z" fill="#e2e8f0"/><circle cx="57" cy="33" r="8" fill="#06b6d4"/><path d="M79 21h21M79 32h17M79 43h24" stroke="#38bdf8" strokeWidth="5" strokeLinecap="round"/></svg>
  if(spec.type==='aov')return <svg className="provider-svg-logo provider-svg-game provider-svg-game-banner" viewBox="0 0 160 90" aria-hidden="true"><defs><linearGradient id="aovLogo" x1="6" y1="5" x2="154" y2="84"><stop stopColor="#07112d"/><stop offset=".5" stopColor="#1d4ed8"/><stop offset="1" stopColor="#f59e0b"/></linearGradient></defs><rect width="160" height="90" rx="14" fill="url(#aovLogo)"/><path d="M80 12l43 20v17c0 17-15 28-43 38-28-10-43-21-43-38V32z" fill="#ffffff18" stroke="#fff" strokeWidth="4"/><path d="M58 62l22-39 22 39H87l-7-14-7 14z" fill="#fff"/><text x="80" y="82" textAnchor="middle" fontFamily="Arial Black,Arial,sans-serif" fontSize="18" fontWeight="900" fill="#fff" letterSpacing="2">AOV</text></svg>
  if(spec.type==='adira')return <svg className="provider-svg-logo" viewBox="0 0 80 80" aria-hidden="true"><rect x="10" y="10" width="60" height="60" rx="17" fill="#fff7e8"/><path d="M18 55l20-35h25L43 55z" fill="#f59e0b"/><path d="M36 55l15-26h13L49 55z" fill="#233a8b"/><circle cx="26" cy="56" r="5" fill="#233a8b"/><circle cx="55" cy="56" r="5" fill="#233a8b"/></svg>
  if(spec.type==='wom')return <svg className="provider-svg-logo" viewBox="0 0 80 80" aria-hidden="true"><rect x="10" y="10" width="60" height="60" rx="17" fill="#fff1f1"/><path d="M18 30h11l6 21 7-21h10l7 21 5-21h9L62 61H51l-5-18-6 18H29z" fill="#e11d2e"/><path d="M18 22h44" stroke="#111827" strokeWidth="4" strokeLinecap="round"/></svg>
  if(spec.type==='busTravel')return <svg className="provider-svg-logo" viewBox="0 0 80 80" aria-hidden="true"><rect x="10" y="14" width="60" height="46" rx="13" fill="#eaf9ff"/><path d="M20 23h40c6 0 10 5 10 11v17c0 5-4 9-9 9H19c-5 0-9-4-9-9V34c0-6 4-11 10-11z" fill="#0891b2"/><path d="M20 31h40v14H20z" fill="#e0f7ff"/><path d="M22 50h36" stroke="#fff" strokeWidth="4" strokeLinecap="round"/><circle cx="25" cy="61" r="5" fill="#0f172a"/><circle cx="55" cy="61" r="5" fill="#0f172a"/></svg>
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

export default function ProviderLogo({name,className='',priority=false,service=''}){
  const clean=normalize(name)
  const automatic=findAutomaticLogo(clean)
  const bundled=(clean==='Voucher'?voucherBrand:null)||findLogoMatch(clean,imageLogos)?.[1]||automatic
  const telkomImage=/indihome/i.test(clean)?indihomeOfficial:/\btelkom\b/i.test(clean)&&!/telkomsel/i.test(clean)?telkomOfficial:null
  // Daftar transfer bank harus selalu memakai aset yang sudah dibundel agar
  // logo langsung tampil, tajam, dan tidak bergantung pada host gambar luar.
  const remoteBankLogo=service==='bank'?null:findLogoMatch(clean,highResolutionBankLogos)?.[1]
  const image=telkomImage||(service==='gas'&&/pgn|perusahaan gas negara/i.test(clean)?pgnOfficial:null)||(service==='pdam'?pdamLogo:null)||(service==='tax'?pajak:null)||findLogoMatch(clean,officialInsuranceLogos)?.[1]||bundled||remoteBankLogo
  const useBundledFallback=event=>{if(bundled&&event.currentTarget.src!==bundled)event.currentTarget.src=bundled}
  if(image)return <i className={`${className} provider-logo-rendered provider-logo-image`} data-brand={slug(clean)}><img src={image} alt={`Logo ${name}`} loading={priority?'eager':'lazy'} fetchPriority={priority?'high':'auto'} decoding="async" onError={useBundledFallback}/></i>
  if(automatic)return <i className={`${className} provider-logo-rendered provider-logo-image`} data-brand={slug(clean)}><img src={automatic} alt={`Logo ${name}`} loading={priority?'eager':'lazy'} fetchPriority={priority?'high':'auto'} decoding="async"/></i>
  if(service==='multifinance')return <i className={`${className} provider-logo-rendered provider-logo-vector`} data-brand={slug(clean)} role="img" aria-label={`Logo ${name}`}><MultifinanceWordmark name={clean}/></i>
  const spec=findLogoMatch(clean,svgLogos)?.[1]
  if(spec)return <i className={`${className} provider-logo-rendered provider-logo-vector`} data-brand={slug(clean)} role="img" aria-label={`Logo ${name}`}><ProviderSvgLogo spec={spec}/></i>
  return <i className={`${className} provider-logo-rendered provider-wordmark`} data-brand={slug(clean)} role="img" aria-label={`Logo ${name}`}><ProviderSymbol name={clean}/></i>
}
