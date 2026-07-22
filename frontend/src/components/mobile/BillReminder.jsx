import { CalendarClock, ChevronRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { rupiah } from '../../utils/currency'
import ServiceEmblem from './ServiceEmblem'

export default function BillReminder({ items = [] }) {
  const navigate = useNavigate()
  const bills = items.filter(item => item.status === 'Belum dibayar' || item.status === 'Menunggu Pembayaran')

  return (
    <section className="bill-section">
      <div className="mobile-section-title">
        <div><h2>Tagihan Bulan Ini</h2><small>Tagihan aktif milik akunmu</small></div>
        {bills.length > 0 && <button type="button" onClick={() => navigate('/app/history')}>Lihat semua</button>}
      </div>
      {bills.length > 0 ? (
        <div className="bill-card">
          {bills.slice(0, 2).map(item => (
            <article key={item.id}>
              <i className="dashboard-hd-emblem small"><ServiceEmblem type="pascabayar" label="Tagihan"/></i>
              <div><strong>{item.method}</strong><small>{item.customer}</small></div>
              <span><b>{rupiah(item.amount)}</b><small>{item.status}</small></span>
            </article>
          ))}
          <button type="button" onClick={() => navigate('/app/history')}><CalendarClock />Lihat semua tagihan <ChevronRight /></button>
        </div>
      ) : (
        <div className="dashboard-empty-card">
          <i className="dashboard-hd-emblem"><ServiceEmblem type="pascabayar" label="Tagihan bulanan"/></i>
          <div><strong>Belum ada tagihan</strong><p>Tagihan yang kamu cek atau simpan nanti akan tampil di sini.</p></div>
          <button type="button" onClick={() => navigate('/app/services')}>Cek Tagihan</button>
        </div>
      )}
    </section>
  )
}
