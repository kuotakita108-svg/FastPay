import pulsa from '../../assets/service-emblems-hd/pulsa.webp'
import data from '../../assets/service-emblems-hd/data.webp'
import ewallet from '../../assets/service-emblems-hd/ewallet.webp'
import pln from '../../assets/service-emblems-hd/pln.webp'
import game from '../../assets/service-emblems-hd/game.webp'
import pdam from '../../assets/service-emblems-hd/pdam.webp'
import bpjs from '../../assets/service-emblems-hd/bpjs.webp'
import services from '../../assets/service-emblems-hd/services.webp'
import pascabayar from '../../assets/service-emblems-hd/pascabayar.webp'
import bank from '../../assets/service-emblems-hd/bank.webp'
import gas from '../../assets/service-emblems-hd/gas.webp'
import internet from '../../assets/service-emblems-hd/internet.webp'
import tv from '../../assets/service-emblems-hd/tv.webp'
import voucher from '../../assets/service-emblems-hd/voucher.webp'
import school from '../../assets/service-emblems-hd/school.webp'
import insurance from '../../assets/service-emblems-hd/insurance.webp'
import vehicle from '../../assets/service-emblems-hd/vehicle.webp'
import property from '../../assets/service-emblems-hd/property.webp'
import travel from '../../assets/service-emblems-hd/travel.webp'
import qris from '../../assets/service-emblems-hd-v2/qris.webp'
import emoney from '../../assets/service-emblems-hd-v2/emoney.webp'
import toll from '../../assets/service-emblems-hd-v2/toll.webp'
import streaming from '../../assets/service-emblems-hd-v2/streaming.webp'
import esim from '../../assets/service-emblems-hd-v2/esim.webp'
import health from '../../assets/service-emblems-hd-v2/health.webp'
import creditcard from '../../assets/service-emblems-hd-v2/creditcard.webp'
import multifinance from '../../assets/service-emblems-hd-v2/multifinance.webp'
import tax from '../../assets/service-emblems-hd-v2/tax.webp'
import zakat from '../../assets/service-emblems-hd-v2/zakat.webp'
import parking from '../../assets/service-emblems-hd-v2/parking.webp'
import delivery from '../../assets/service-emblems-hd-v2/delivery.webp'

const emblems={
  pulsa,data,ewallet,pln,game,pdam,bpjs,services,pascabayar,bank,gas,internet,tv,voucher,school,insurance,vehicle,property,travel,qris,emoney,toll,streaming,esim,health,creditcard,multifinance,tax,zakat,parking,delivery,agentcredit:multifinance,
}

export default function ServiceEmblem({type,label}){
  return <img className="service-emblem-image" src={emblems[type]||services} alt={label?`Logo ${label}`:''} loading="eager" decoding="async"/>
}
