import {useMemo,useState} from 'react'
import {useNavigate} from 'react-router-dom'
import {ArrowLeft,Search,Sparkles,ShieldCheck,X} from 'lucide-react'
import {allServices,serviceConfig} from '../constants/services'
import MobileNav from '../components/mobile/MobileNav'

export default function AllServicesPage(){
  const navigate=useNavigate()
  const [query,setQuery]=useState('')
  const [category,setCategory]=useState('Semua')
  const groups=['Semua',...new Set(allServices.map(item=>item[3]))]
  const filtered=useMemo(()=>allServices.filter(([label,, ,group])=>
    (category==='Semua'||group===category)&&label.toLowerCase().includes(query.trim().toLowerCase())
  ),[query,category])
  const visibleGroups=groups.slice(1).filter(group=>filtered.some(item=>item[3]===group))
  const open=type=>navigate(serviceConfig[type]?`/app/buy/${type}`:'/app/buy/pulsa')

  return <main className="mobile-app services-page">
    <header className="services-head"><button type="button" onClick={()=>navigate(-1)}><ArrowLeft/></button><div><strong>Semua Layanan</strong><small>Pilih kebutuhan transaksimu</small></div><i><ShieldCheck/></i></header>
    <section className="services-hero"><span><Sparkles/> FASTPAY SERVICES</span><h1>Semua kebutuhan,<br/>cukup satu aplikasi.</h1><p>Transaksi cepat, aman, dan tersedia 24 jam setiap hari.</p><b>{allServices.length}+ layanan tersedia</b></section>
    <section className="all-services modern-all-services">
      <label className="service-search"><Search/><input value={query} onChange={event=>setQuery(event.target.value)} placeholder="Cari pulsa, tagihan, voucher..."/>{query&&<button type="button" onClick={()=>setQuery('')}><X/></button>}</label>
      <div className="service-categories">{groups.map(group=><button type="button" className={category===group?'active':''} onClick={()=>setCategory(group)} key={group}>{group}</button>)}</div>
      <div className="service-highlight"><Sparkles/><div><strong>Transaksi makin praktis</strong><p>Pilih layanan, masukkan data, lalu selesaikan pembayaran.</p></div></div>
      {visibleGroups.map(group=><section className="service-group service-icon-group" key={group}><header><div><span>{group}</span><small>{filtered.filter(item=>item[3]===group).length} layanan</small></div></header><div className="service-group-grid">{filtered.filter(item=>item[3]===group).map(([label,type,Icon])=><button type="button" key={label} onClick={()=>open(type)} aria-label={`Buka ${label}`}><i className={`service-mark mark-${type}`}><Icon/><b/></i><strong>{label}</strong></button>)}</div></section>)}
      {!filtered.length&&<div className="services-empty"><Search/><strong>Layanan tidak ditemukan</strong><p>Coba kata kunci atau kategori yang berbeda.</p><button type="button" onClick={()=>{setQuery('');setCategory('Semua')}}>Tampilkan Semua</button></div>}
    </section>
    <MobileNav/>
  </main>
}
