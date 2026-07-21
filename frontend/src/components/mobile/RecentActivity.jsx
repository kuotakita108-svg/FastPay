import { ChevronRight, ReceiptText, Smartphone, WalletCards, Wifi } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { rupiah } from '../../utils/currency'

const iconMap = { QRIS: Smartphone, 'Virtual Account': Wifi, 'E-Wallet': WalletCards }

export default function RecentActivity({ items = [] }) {
  const navigate = useNavigate()
  return (
    <section className="recent-mobile">
      <div className="mobile-section-title"><h2>Aktivitas Terakhir</h2>{items.length > 0 && <button type="button" onClick={() => navigate('/app/history')}>Riwayat <ChevronRight /></button>}</div>
      {items.length > 0 ? (
        <div className="activity-list">
          {items.slice(0, 3).map(item => {
            const Icon = iconMap[item.method] || Smartphone
            return <article key={item.id}><i><Icon /></i><div><strong>{item.customer}</strong><small>{item.method} · {item.status}</small></div><span><b>{rupiah(item.amount)}</b><small>{item.id}</small></span></article>
          })}
        </div>
      ) : (
        <div className="dashboard-empty-card">
          <i><ReceiptText /></i>
          <div><strong>Belum ada aktivitas</strong><p>Transaksi pertamamu akan tercatat otomatis di sini.</p></div>
          <button type="button" onClick={() => navigate('/app/services')}>Pilih Layanan</button>
        </div>
      )}
    </section>
  )
}
