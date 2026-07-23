export default function KuotaKitaLogo({ className = '', compact = false }) {
  return (
    <div className={`pp-title-logo ${compact ? 'compact' : ''} ${className}`} aria-label="KuotaKita - Pulsa Cepat, Transaksi Hebat">
      <span className="pp-title-mark">K</span>
      <span className="pp-title-main">
        <span className="pp-title-word">
          <b>Kuota</b><strong>Kita</strong>
        </span>
        <small>PULSA CEPAT - TRANSAKSI HEBAT</small>
      </span>
      <span className="pp-title-bolt" aria-hidden="true">⚡</span>
    </div>
  )
}
