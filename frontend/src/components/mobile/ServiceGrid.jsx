import {Smartphone,Wifi,WalletCards,Zap,Gamepad2,Droplets,ShieldPlus,LayoutGrid,ChevronRight} from 'lucide-react'
import {useNavigate} from 'react-router-dom'
import bpjs from '../../assets/providers/bpjs.png'

const services=[
  {label:'Pulsa',type:'pulsa',icon:Smartphone,mark:'SIM',tone:'violet',hint:'Semua operator'},
  {label:'Paket Data',type:'data',icon:Wifi,mark:'5G',tone:'blue',hint:'Internet hemat'},
  {label:'E-Wallet',type:'ewallet',icon:WalletCards,mark:'Rp',tone:'mint',hint:'DANA, OVO, GoPay'},
  {label:'Token PLN',type:'pln',icon:Zap,mark:'PLN',tone:'amber',hint:'Token & tagihan'},
  {label:'Voucher Game',type:'game',icon:Gamepad2,mark:'TOP',tone:'rose',hint:'ML, FF, PUBG',badge:'HOT'},
  {label:'PDAM',type:'pdam',icon:Droplets,mark:'AIR',tone:'cyan',hint:'Tagihan air'},
  {label:'BPJS',type:'bpjs',logo:bpjs,tone:'orange',hint:'Kesehatan'},
  {label:'Lainnya',type:'services',icon:LayoutGrid,mark:'18+',tone:'slate',hint:'Semua layanan'}
]

function ServiceLogo({service}){
  const Icon=service.icon
  if(service.logo)return <img className="service-real-logo" src={service.logo} alt={`Logo ${service.label}`}/>
  return Icon?<span className="service-category-mark"><Icon/><em>{service.mark}</em></span>:null
}

export default function ServiceGrid(){
  const navigate=useNavigate(),open=type=>navigate(type==='services'?'/app/services':`/app/buy/${type}`)
  return <section className="service-section modern-services"><div className="mobile-section-title"><div><h2>Mau transaksi apa?</h2><small>Pilih layanan yang kamu butuhkan</small></div><button onClick={()=>navigate('/app/services')}>Semua <ChevronRight/></button></div><div className="service-grid">{services.map(service=><button key={service.type} onClick={()=>open(service.type)}><i className={`${service.tone} branded-service-icon`}><ServiceLogo service={service}/>{service.badge&&<b>{service.badge}</b>}</i><strong>{service.label}</strong><small>{service.hint}</small></button>)}</div></section>
}
