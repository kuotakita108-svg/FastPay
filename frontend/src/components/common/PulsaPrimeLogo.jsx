export default function PulsaPrimeLogo({ className = '', compact = false }) {
  return (
    <div className={`pp-title-logo ${compact ? 'compact' : ''} ${className}`} aria-label="PulsaPrime - Pulsa Cepat, Transaksi Hebat">
      <span className="pp-title-mark">P</span>
      <span className="pp-title-main">
        <span className="pp-title-word">
          <b>Pulsa</b><strong>Prime</strong>
        </span>
        <small>PULSA CEPAT - TRANSAKSI HEBAT</small>
      </span>
      <span className="pp-title-bolt" aria-hidden="true">⚡</span>
    </div>
  )
}
