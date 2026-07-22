import {DeviceMobile,WifiHigh,Wallet,Lightning,GameController,Drop,ShieldPlus,SquaresFour} from '@phosphor-icons/react'
import {ChevronRight} from 'lucide-react'
import {useNavigate} from 'react-router-dom'

const services=[
  {label:'Pulsa',type:'pulsa',icon:DeviceMobile,tone:'violet',hint:'Semua operator'},
  {label:'Paket Data',type:'data',icon:WifiHigh,tone:'blue',hint:'Internet hemat'},
  {label:'E-Wallet',type:'ewallet',icon:Wallet,tone:'mint',hint:'DANA, OVO, GoPay'},
  {label:'Token PLN',type:'pln',icon:Lightning,tone:'amber',hint:'Token & tagihan'},
  {label:'Voucher Game',type:'game',icon:GameController,tone:'rose',hint:'ML, FF, PUBG'},
  {label:'PDAM',type:'pdam',icon:Drop,tone:'cyan',hint:'Tagihan air'},
  {label:'BPJS',type:'bpjs',icon:ShieldPlus,tone:'orange',hint:'Kesehatan'},
  {label:'Lainnya',type:'services',icon:SquaresFour,tone:'slate',hint:'Semua layanan'}
]

function ServiceLogo({service}){
  const Icon=service.icon
  return Icon?<span className="service-category-mark"><Icon weight="duotone"/></span>:null
}

export default function ServiceGrid(){
  const navigate=useNavigate(),open=type=>navigate(type==='services'?'/app/services':`/app/buy/${type}`)
  return <section className="service-section modern-services"><div className="mobile-section-title"><div><h2>Mau transaksi apa?</h2><small>Pilih layanan yang kamu butuhkan</small></div><button onClick={()=>navigate('/app/services')}>Semua <ChevronRight/></button></div><div className="service-grid">{services.map(service=><button key={service.type} onClick={()=>open(service.type)}><i className={`${service.tone} branded-service-icon`}><ServiceLogo service={service}/></i><strong>{service.label}</strong><small>{service.hint}</small></button>)}</div></section>
}
