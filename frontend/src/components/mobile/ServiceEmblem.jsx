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
import qris from '../../assets/service-emblems-hd-v2/qris.png'
import emoney from '../../assets/service-emblems-hd-v2/emoney.png'
import toll from '../../assets/service-emblems-hd-v2/toll.png'
import streaming from '../../assets/service-emblems-hd-v2/streaming.png'
import esim from '../../assets/service-emblems-hd-v2/esim.png'
import health from '../../assets/service-emblems-hd-v2/health.png'
import creditcard from '../../assets/service-emblems-hd-v2/creditcard.png'
import multifinance from '../../assets/service-emblems-hd-v2/multifinance.png'
import tax from '../../assets/service-emblems-hd-v2/tax.png'
import zakat from '../../assets/service-emblems-hd-v2/zakat.png'
import parking from '../../assets/service-emblems-hd-v2/parking.png'
import delivery from '../../assets/service-emblems-hd-v2/delivery.png'

const emblems={
  pulsa,data,ewallet,pln,game,pdam,bpjs,services,pascabayar,bank,gas,internet,tv,voucher,school,insurance,vehicle,property,travel,qris,emoney,toll,streaming,esim,health,creditcard,multifinance,tax,zakat,parking,delivery,
}

export default function ServiceEmblem({type,label}){
  return <img className="service-emblem-image" src={emblems[type]||services} alt={label?`Logo ${label}`:''}/>
}
