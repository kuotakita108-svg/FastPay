import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Bell, Eye, EyeOff, MessageCircle, Plus } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { rupiah } from '../../utils/currency'
import heroImage from '../../assets/images/fastpay-ppob-hero.png'

export default function MobileHeader() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [visible, setVisible] = useState(true)

  return <section className="reference-top"><header className="reference-header"><div className="dashboard-brand" aria-label="FastPay - Pulsa Cepat, Transaksi Hebat"><div className="brand-word"><span className="brand-mark">F</span><span className="brand-fast">Fast</span><span className="brand-pay">Pay</span></div><small>PULSA CEPAT · TRANSAKSI HEBAT</small></div><nav><button type="button" onClick={() => navigate('/app/history')} aria-label="Riwayat transaksi"><Bell /></button><button type="button" onClick={() => navigate('/app/profile')} aria-label="Bantuan dan akun"><MessageCircle /></button></nav></header><section className="reference-banner" style={{ backgroundImage: `url(${heroImage})` }}><div className="banner-copy"><span>FASTPAY PPOB</span><h1>Semua transaksi<br />jadi lebih mudah.</h1><p>Pulsa, paket data, dan pembayaran digital dalam satu aplikasi.</p><button type="button" onClick={() => navigate('/app/services')}>Mulai Transaksi</button></div></section><section className="reference-balance"><div><span>Saldo Anda <button type="button" onClick={() => setVisible(value => !value)}>{visible ? <EyeOff /> : <Eye />}</button></span><strong>{visible ? rupiah(user.balance) : 'Rp •••••••'}</strong></div><button className="topup-button" type="button" onClick={() => navigate('/app/balance/topup')}><Plus /> Isi Saldo</button></section></section>
}
