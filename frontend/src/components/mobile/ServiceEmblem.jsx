import pulsa from '../../assets/service-emblems-hd/pulsa.png'
import data from '../../assets/service-emblems-hd/data.png'
import ewallet from '../../assets/service-emblems-hd/ewallet.png'
import pln from '../../assets/service-emblems-hd/pln.png'
import game from '../../assets/service-emblems-hd/game.png'
import pdam from '../../assets/service-emblems-hd/pdam.png'
import bpjs from '../../assets/service-emblems-hd/bpjs.png'
import services from '../../assets/service-emblems-hd/services.png'
import pascabayar from '../../assets/service-emblems-hd/pascabayar.png'
import bank from '../../assets/service-emblems-hd/bank.png'
import gas from '../../assets/service-emblems-hd/gas.png'
import internet from '../../assets/service-emblems-hd/internet.png'
import tv from '../../assets/service-emblems-hd/tv.png'
import voucher from '../../assets/service-emblems-hd/voucher.png'
import school from '../../assets/service-emblems-hd/school.png'
import insurance from '../../assets/service-emblems-hd/insurance.png'
import vehicle from '../../assets/service-emblems-hd/vehicle.png'
import property from '../../assets/service-emblems-hd/property.png'
import travel from '../../assets/service-emblems-hd/travel.png'

const emblems={
  pulsa,data,ewallet,pln,game,pdam,bpjs,services,pascabayar,bank,gas,internet,tv,voucher,school,insurance,vehicle,property,travel,
  qris:ewallet,emoney:voucher,toll:vehicle,streaming:tv,esim:data,health:bpjs,creditcard:bank,
  multifinance:property,tax:school,zakat:insurance,parking:vehicle,delivery:travel,
}

export default function ServiceEmblem({type,label}){
  return <img className="service-emblem-image" src={emblems[type]||services} alt={label?`Logo ${label}`:''}/>
}
