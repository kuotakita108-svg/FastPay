import { ChevronRight, ShieldCheck, Sparkles } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import ServiceEmblem from './ServiceEmblem'

const recommendations = [
  ['data', 'Paket Data', 'Internet untuk semua operator'],
  ['ewallet', 'Isi E-Wallet', 'DANA, OVO, GoPay, dan lainnya'],
  ['pln', 'Token PLN', 'Token listrik proses instan'],
  ['game', 'Voucher Game', 'Top up game favoritmu'],
]

export default function DashboardDiscover() {
  const navigate = useNavigate()
  return (
    <section className="dashboard-discover">
      <div className="mobile-section-title">
        <div><h2>Jelajahi Cepat</h2><small>Layanan populer yang siap digunakan</small></div>
        <button type="button" onClick={() => navigate('/app/services')}>Semua <ChevronRight /></button>
      </div>
      <div className="discover-grid">
        {recommendations.map(([type, title, description]) => (
          <button type="button" onClick={() => navigate(`/app/buy/${type}`)} key={type}>
            <ServiceEmblem type={type} label={title} />
            <span><strong>{title}</strong><small>{description}</small></span>
            <ChevronRight />
          </button>
        ))}
      </div>
      <button type="button" className="dashboard-trust" onClick={() => navigate('/app/profile/security')}>
        <i><ShieldCheck /></i>
        <span><b>Keamanan akun FastPay</b><small>Aktifkan PIN atau sidik jari untuk melindungi pembayaran.</small></span>
        <em><Sparkles /> Atur</em>
      </button>
    </section>
  )
}
