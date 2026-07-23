import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Bell, Eye, EyeOff, MessageCircle, Plus } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { rupiah } from '../../utils/currency'
import heroImage from '../../assets/images/pulsaprime-ppob-hero-v4.png'

export default function MobileHeader() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [visible, setVisible] = useState(true)

  return <section className="reference-top"><header className="reference-header"><div className="dashboard-brand" aria-label="PulsaPrime - Pulsa Cepat, Transaksi Hebat"><div className="brand-word"><span className="brand-mark">P</span><span className="brand-fast">Pulsa</span><span className="brand-pay">Prime</span></div><small>PULSA CEPAT · TRANSAKSI HEBAT</small></div><nav><button type="button" onClick={() => navigate('/app/history')} aria-label="Riwayat transaksi"><Bell /></button><button type="button" onClick={() => navigate('/app/profile')} aria-label="Bantuan dan akun"><MessageCircle /></button></nav></header><section className="reference-banner" style={{ backgroundImage: `url(${heroImage})` }}><div className="banner-copy"><span>PULSAPRIME PPOB</span><h1>Semua transaksi<br />jadi lebih mudah.</h1><p>Pulsa, paket data, dan pembayaran digital dalam satu aplikasi.</p><button type="button" onClick={() => navigate('/app/services')}>Mulai Transaksi</button></div></section><section className="reference-balance"><div><span>Saldo Anda <button type="button" onClick={() => setVisible(value => !value)}>{visible ? <EyeOff /> : <Eye />}</button></span><strong>{visible ? rupiah(user.balance) : 'Rp •••••••'}</strong></div><button className="topup-button" type="button" onClick={() => navigate('/app/balance/topup')}><Plus /> Isi Saldo</button></section></section>
}
