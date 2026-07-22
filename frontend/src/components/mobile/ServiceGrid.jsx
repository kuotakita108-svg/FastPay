import {ChevronRight} from 'lucide-react'
import {useNavigate} from 'react-router-dom'
import ServiceEmblem from './ServiceEmblem'

const services=[
  {label:'Pulsa',type:'pulsa',tone:'violet',hint:'Semua operator'},
  {label:'Paket Data',type:'data',tone:'blue',hint:'Internet hemat'},
  {label:'E-Wallet',type:'ewallet',tone:'mint',hint:'DANA, OVO, GoPay'},
  {label:'Token PLN',type:'pln',tone:'amber',hint:'Token & tagihan'},
  {label:'Voucher Game',type:'game',tone:'rose',hint:'ML, FF, PUBG'},
  {label:'PDAM',type:'pdam',tone:'cyan',hint:'Tagihan air'},
  {label:'BPJS',type:'bpjs',tone:'orange',hint:'Kesehatan'},
  {label:'Lainnya',type:'services',tone:'slate',hint:'Semua layanan'}
]

function ServiceLogo({service}){
  return <span className="premium-service-emblem"><ServiceEmblem type={service.type} label={service.label}/></span>
}

export default function ServiceGrid(){
  const navigate=useNavigate(),open=type=>navigate(type==='services'?'/app/services':`/app/buy/${type}`)
  return <section className="service-section modern-services"><div className="mobile-section-title"><div><h2>Mau transaksi apa?</h2><small>Pilih layanan yang kamu butuhkan</small></div><button onClick={()=>navigate('/app/services')}>Semua <ChevronRight/></button></div><div className="service-grid">{services.map(service=><button key={service.type} onClick={()=>open(service.type)}><i className={`${service.tone} branded-service-icon`}><ServiceLogo service={service}/></i><strong>{service.label}</strong><small>{service.hint}</small></button>)}</div></section>
}
