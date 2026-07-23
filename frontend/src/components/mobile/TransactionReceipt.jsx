import {useState} from 'react'
import {Bluetooth, Copy, Printer, ReceiptText, X} from 'lucide-react'
import {rupiah} from '../../utils/currency'
import {formatDate} from '../../utils/date'
import {printThermalBluetooth} from '../../services/thermalPrinter'

const clean = value => value || '-'

function line(label, value) {
  return <div><span>{label}</span><b>{clean(value)}</b></div>
}

export default function TransactionReceipt({transaction, order = {}, user = {}, printMode = false, onClose}) {
  const [printing, setPrinting] = useState(false)
  const [message, setMessage] = useState('')
  const [printerOpen, setPrinterOpen] = useState(printMode)
  if (!transaction) return null
  const provider = transaction.provider || order.provider || (transaction.method || '').split('Â·')[0]?.trim()
  const service = transaction.title || order.title || (transaction.method || '').split('Â·')[1]?.trim() || 'KuotaKita'
  const product = transaction.product || order.product || service
  const target = transaction.target || order.target || transaction.customer
  const customerName = transaction.customer_name || order.customer_name || transaction.customerName || 'Pelanggan KuotaKita'
  const orderNumber = transaction.order_number || transaction.orderNumber || transaction.id
  const serial = transaction.sn || transaction.serial || `SN-${String(transaction.id || '0000000000').replace(/\D/g, '').slice(-10)}`
  const print = () => window.print()
  const copy = () => navigator.clipboard?.writeText(`${transaction.id} ${serial}`)
  const bluetoothPrint = async () => {
    setPrinting(true)
    setMessage('Mencari printer Bluetooth...')
    try {
      const name = await printThermalBluetooth({transaction, order, user})
      setMessage(`Struk dikirim ke ${name}.`)
    } catch (error) {
      setMessage(error.name === 'NotFoundError' ? 'Printer tidak dipilih. Pastikan printer menyala dan sudah pairing Bluetooth.' : error.message)
    } finally {
      setPrinting(false)
    }
  }

  return <section className="receipt-modal">
    {printerOpen && <article className="receipt-print-panel no-print">
      <button className="receipt-close-mini" type="button" onClick={onClose}><X/></button>
      <i><Bluetooth/></i>
      <div>
        <small>Cetak Struk</small>
        <h2>Hubungkan printer thermal</h2>
        <p>Nyalakan printer, pastikan sudah pairing Bluetooth di HP, lalu pilih tombol Bluetooth Printer.</p>
      </div>
      <button type="button" className="bluetooth-main" disabled={printing} onClick={bluetoothPrint}><Bluetooth/>{printing ? 'Mencari printer...' : 'Bluetooth Printer'}</button>
      <button type="button" className="browser-print" onClick={print}><Printer/>Cetak dari Browser</button>
    </article>}
    <div className={`receipt-actions no-print ${printerOpen ? 'receipt-actions-view-only' : ''}`}>
      <button type="button" onClick={onClose}><X/>Tutup</button>
      <button type="button" onClick={copy}><Copy/>Salin SN</button>
      {!printerOpen && <button type="button" className="print" onClick={() => setPrinterOpen(true)}><Printer/>Cetak Struk</button>}
    </div>
    {message && <div className="receipt-printer-message no-print">{message}</div>}
    <article className="thermal-receipt">
      <header>
        <i><ReceiptText/></i>
        <h2>KuotaKita</h2>
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
        {line('Metode', transaction.payment_method || 'Saldo KuotaKita')}
        {line('Agen', user.name || user.username || 'Agen KuotaKita')}
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
