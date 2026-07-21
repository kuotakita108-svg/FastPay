import { ChevronRight, Heart, Smartphone } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

const serviceType = method => {
  const value = String(method || '').toLowerCase()
  if (value.includes('paket data')) return 'data'
  if (value.includes('e-wallet')) return 'ewallet'
  if (value.includes('token') || value.includes('pln')) return 'pln'
  if (value.includes('game')) return 'game'
  if (value.includes('pdam')) return 'pdam'
  if (value.includes('bpjs')) return 'bpjs'
  return 'pulsa'
}

export default function FavoriteServices({ items = [] }) {
  const navigate = useNavigate()
  const successful = items.filter(item => item.status === 'Berhasil')
  const favorites = Array.from(new Map(successful.map(item => [serviceType(item.method), item])).entries()).slice(0, 4)

  return (
    <section className="favorite-section">
      <div className="mobile-section-title">
        <div><h2>Transaksi Favorit</h2><small>Terbentuk otomatis dari transaksimu</small></div>
      </div>
      {favorites.length > 0 ? (
        <div className="favorite-grid">
          {favorites.map(([type, item]) => (
            <button type="button" onClick={() => navigate(`/app/buy/${type}`)} key={type}>
              <i><Smartphone /></i>
              <div><strong>{item.method}</strong><small>{item.customer}</small></div>
              <ChevronRight />
            </button>
          ))}
        </div>
      ) : (
        <div className="dashboard-empty-card">
          <i><Heart /></i>
          <div><strong>Belum ada transaksi favorit</strong><p>Layanan yang sering kamu gunakan akan muncul otomatis.</p></div>
          <button type="button" onClick={() => navigate('/app/services')}>Mulai Transaksi</button>
        </div>
      )}
    </section>
  )
}
