import {Droplets,ChevronRight} from 'lucide-react'
import {useNavigate} from 'react-router-dom'
import telkomsel from '../../assets/providers/telkomsel.png'
import xl from '../../assets/providers/xl.png'
import dana from '../../assets/providers/dana.png'
import mobileLegends from '../../assets/providers/mobilelegends.png'
import bpjs from '../../assets/providers/bpjs.png'
import indihome from '../../assets/providers/official/indihome.png'
import spotify from '../../assets/providers/official/spotify.png'
import fif from '../../assets/providers/official/fif.png'
import garuda from '../../assets/providers/official/garuda.png'

const services=[
  {label:'Pulsa',type:'pulsa',logo:telkomsel,tone:'violet',hint:'Semua operator'},
  {label:'Paket Data',type:'data',logo:xl,tone:'blue',hint:'Internet hemat'},
  {label:'E-Wallet',type:'ewallet',logo:dana,tone:'mint',hint:'DANA, OVO, GoPay'},
  {label:'Token PLN',type:'pln',brand:'PLN',tone:'amber',hint:'Token & tagihan'},
  {label:'Voucher Game',type:'game',logo:mobileLegends,tone:'rose',hint:'ML, FF, PUBG',badge:'HOT'},
  {label:'PDAM',type:'pdam',icon:Droplets,tone:'cyan',hint:'Tagihan air'},
  {label:'BPJS',type:'bpjs',logo:bpjs,tone:'orange',hint:'Kesehatan'},
  {label:'Lainnya',type:'services',logos:[indihome,spotify,fif,garuda],tone:'slate',hint:'18+ layanan'}
]

function ServiceLogo({service}){
  const Icon=service.icon
  if(service.logos)return <span className="service-logo-collage">{service.logos.map((logo,index)=><img src={logo} alt="" key={logo} className={`mini-logo mini-${index+1}`}/>)}</span>
  if(service.brand)return <span className="pln-brand" aria-label="PLN"><b>⚡</b><strong>PLN</strong></span>
  if(service.logo)return <img className="service-real-logo" src={service.logo} alt={`Logo ${service.label}`}/>
  return Icon?<Icon/>:null
}

export default function ServiceGrid(){
  const navigate=useNavigate(),open=type=>navigate(type==='services'?'/app/services':`/app/buy/${type}`)
  return <section className="service-section modern-services"><div className="mobile-section-title"><div><h2>Mau transaksi apa?</h2><small>Pilih layanan yang kamu butuhkan</small></div><button onClick={()=>navigate('/app/services')}>Semua <ChevronRight/></button></div><div className="service-grid">{services.map(service=><button key={service.type} onClick={()=>open(service.type)}><i className={`${service.tone} branded-service-icon`}><ServiceLogo service={service}/>{service.badge&&<b>{service.badge}</b>}</i><strong>{service.label}</strong><small>{service.hint}</small></button>)}</div></section>
}
