import {useState} from 'react'
import {Bell,MessageCircle,Eye,EyeOff,Plus} from 'lucide-react'
import {useAuth} from '../../context/AuthContext'
import {rupiah} from '../../utils/currency'
import heroImage from '../../assets/images/fastpay-ppob-hero.png'
import fastPayLogo from '../../assets/images/fastpay-logo-header.png'
export default function MobileHeader(){const{user}=useAuth(),[visible,setVisible]=useState(true);return <section className="reference-top"><header className="reference-header"><div className="dashboard-brand"><img src={fastPayLogo} alt="FastPay - Pulsa Cepat, Transaksi Hebat"/></div><nav><button><Bell/><b>3</b></button><button><MessageCircle/></button></nav></header><section className="reference-banner" style={{backgroundImage:`url(${heroImage})`}}><div className="banner-copy"><span>FASTPAY PPOB</span><h1>Semua transaksi<br/>jadi lebih mudah.</h1><p>Pulsa, paket data, dan pembayaran digital dalam satu aplikasi.</p><button>Mulai Transaksi</button></div></section><section className="reference-balance"><div><span>Saldo Anda <button onClick={()=>setVisible(value=>!value)}>{visible?<EyeOff/>:<Eye/>}</button></span><strong>{visible?rupiah(user.balance):'Rp •••••••'}</strong></div><button className="topup-button"><Plus/> Isi Saldo</button></section></section>}
