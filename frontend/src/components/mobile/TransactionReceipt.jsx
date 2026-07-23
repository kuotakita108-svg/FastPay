import {Copy, Printer, ReceiptText, X} from 'lucide-react'
import {rupiah} from '../../utils/currency'
import {formatDate} from '../../utils/date'

const clean = value => value || '-'

function line(label, value) {
  return <div><span>{label}</span><b>{clean(value)}</b></div>
}

export default function TransactionReceipt({transaction, order = {}, user = {}, onClose}) {
  if (!transaction) return null
  const provider = transaction.provider || order.provider || (transaction.method || '').split('·')[0]?.trim()
  const service = transaction.title || order.title || (transaction.method || '').split('·')[1]?.trim() || 'PulsaPrime'
  const product = transaction.product || order.product || service
  const target = transaction.target || order.target || transaction.customer
  const customerName = transaction.customer_name || order.customer_name || transaction.customerName || 'Pelanggan PulsaPrime'
  const orderNumber = transaction.order_number || transaction.orderNumber || transaction.id
  const serial = transaction.sn || transaction.serial || `SN-${String(transaction.id || '0000000000').replace(/\D/g, '').slice(-10)}`
  const print = () => window.print()
  const copy = () => navigator.clipboard?.writeText(`${transaction.id} ${serial}`)

  return <section className="receipt-modal">
    <div className="receipt-actions no-print">
      <button type="button" onClick={onClose}><X/>Tutup</button>
      <button type="button" onClick={copy}><Copy/>Salin SN</button>
      <button type="button" className="print" onClick={print}><Printer/>Cetak Struk</button>
    </div>
    <article className="thermal-receipt">
      <header>
        <i><ReceiptText/></i>
        <h2>PulsaPrime</h2>
        <p>Struk Transaksi Resmi Agen</p>
      </header>
      <section className="receipt-status">
        <strong>{transaction.status || 'Berhasil'}</strong>
        <span>{formatDate(transaction.created_at || new Date().toISOString())}</span>
      </section>
      <section className="receipt-lines">
        {line('No. Pesanan', orderNumber)}
        {line('ID Transaksi', transaction.id)}
        {line('SN / Ref', serial)}
        {line('Layanan', service)}
        {line('Provider', provider)}
        {line('Produk', product)}
        {line('Nama Tujuan', customerName)}
        {line('Nomor Tujuan', target)}
        {line('Metode', transaction.payment_method || 'Saldo PulsaPrime')}
        {line('Agen', user.name || user.username || 'Agen PulsaPrime')}
      </section>
      <section className="receipt-total">
        <span>Total Bayar</span>
        <strong>{rupiah(transaction.amount || order.amount || 0)}</strong>
      </section>
      <footer>
        <p>Terima kasih sudah bertransaksi.</p>
        <small>Simpan struk ini sebagai bukti pembayaran yang sah.</small>
      </footer>
    </article>
  </section>
}
