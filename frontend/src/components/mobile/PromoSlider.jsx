import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft, ChevronRight, Gamepad2, Gift, Timer, WalletCards, Wifi, Zap } from 'lucide-react'
import promoPulsa from '../../assets/promos/promo-pulsa.png'
import promoData from '../../assets/promos/promo-data.png'
import promoWallet from '../../assets/promos/promo-wallet.png'
import promoBills from '../../assets/promos/promo-bills.png'
import promoGame from '../../assets/promos/promo-game.png'

const promos = [
  { tag: 'PENGGUNA BARU', title: 'Cashback hingga 10%', text: 'Transaksi pulsa pertamamu jadi lebih hemat.', action: 'Ambil Promo', icon: Gift, tone: 'midnight', image: promoPulsa, position: '76%', to: '/app/buy/pulsa' },
  { tag: 'ISI SALDO', title: 'Bonus PrimePoint 2×', text: 'Top up saldo minimal Rp100.000 hari ini.', action: 'Isi Saldo', icon: WalletCards, tone: 'emerald', image: promoWallet, position: '78%', to: '/app/balance/topup' },
  { tag: 'PAKET DATA', title: 'Hemat sampai Rp15.000', text: 'Internet semua operator tanpa kode promo.', action: 'Beli Paket', icon: Wifi, tone: 'ocean', image: promoData, position: '78%', to: '/app/buy/data' },
  { tag: 'BAYAR TAGIHAN', title: 'Bebas biaya admin', text: 'Bayar listrik, air, dan tagihan pilihanmu.', action: 'Bayar Sekarang', icon: Zap, tone: 'sunset', image: promoBills, position: '79%', to: '/app/services' },
  { tag: 'VOUCHER GAME', title: 'Main lebih untung', text: 'Cashback 5% Mobile Legends dan Free Fire.', action: 'Top Up Game', icon: Gamepad2, tone: 'violet', image: promoGame, position: '79%', to: '/app/buy/game' },
]

export default function PromoSlider() {
  const [index, setIndex] = useState(0)
  const touch = useRef(null)
  const navigate = useNavigate()

  useEffect(() => {
    const timer = setInterval(() => setIndex(value => (value + 1) % promos.length), 4500)
    return () => clearInterval(timer)
  }, [])

  const move = step => setIndex(value => (value + step + promos.length) % promos.length)
  const promo = promos[index]
  const Icon = promo.icon

  return (
    <section className="promo-section premium-promos">
      <div className="mobile-section-title">
        <div><h2>Promo Pilihan</h2><small>Penawaran terbaik untukmu</small></div>
        <span>{index + 1}/{promos.length}</span>
      </div>
      <div
        className="promo-carousel"
        onTouchStart={event => { touch.current = event.touches[0].clientX }}
        onTouchEnd={event => {
          const delta = event.changedTouches[0].clientX - touch.current
          if (Math.abs(delta) > 40) move(delta < 0 ? 1 : -1)
        }}
      >
        <article className={`promo-slide promo-photo-card ${promo.tone}`} key={promo.title}>
          <img
            className="promo-photo"
            src={promo.image}
            alt=""
            aria-hidden="true"
            style={{ objectPosition: `${promo.position} center` }}
          />
          <div className="promo-photo-shade" />
          <div className="promo-content">
            <span><Timer /> {promo.tag}</span>
            <h2>{promo.title}</h2>
            <p>{promo.text}</p>
            <button type="button" onClick={() => navigate(promo.to)}>{promo.action}<ChevronRight /></button>
          </div>
          <div className="promo-service-mark" aria-hidden="true"><Icon /></div>
        </article>
        <button className="carousel-arrow prev" onClick={() => move(-1)} aria-label="Promo sebelumnya"><ChevronLeft /></button>
        <button className="carousel-arrow next" onClick={() => move(1)} aria-label="Promo berikutnya"><ChevronRight /></button>
      </div>
      <div className="promo-dots">
        {promos.map((item, itemIndex) => <button className={itemIndex === index ? 'active' : ''} onClick={() => setIndex(itemIndex)} key={item.title} aria-label={`Promo ${itemIndex + 1}`} />)}
      </div>
      <p className="promo-note"><Zap />Geser untuk melihat promo lainnya.</p>
    </section>
  )
}
