import {formatDate} from '../utils/date'

const BLE_SERVICES = [
  '000018f0-0000-1000-8000-00805f9b34fb',
  '0000ffe0-0000-1000-8000-00805f9b34fb',
  '49535343-fe7d-4ae5-8fa9-9fafd205e455'
]

const CENTER = '\x1b\x61\x01'
const LEFT = '\x1b\x61\x00'
const BOLD_ON = '\x1b\x45\x01'
const BOLD_OFF = '\x1b\x45\x00'
const INIT = '\x1b\x40'
const CUT = '\n\n\n\x1d\x56\x00'
const WIDTH = 32
const LINE = `${'-'.repeat(WIDTH)}\n`

const strip = value => String(value || '-').replace(/[^\x20-\x7E\n]/g, ' ')
const money = value => `Rp ${Number(value || 0).toLocaleString('id-ID')}`
const chunks = (value, size) => {
  const words = strip(value).split(/\s+/).filter(Boolean)
  const lines = []
  let current = ''
  words.forEach(word => {
    if (word.length > size) {
      if (current) lines.push(current)
      for (let index = 0; index < word.length; index += size) lines.push(word.slice(index, index + size))
      current = ''
    } else if (!current) current = word
    else if (`${current} ${word}`.length <= size) current = `${current} ${word}`
    else {
      lines.push(current)
      current = word
    }
  })
  if (current) lines.push(current)
  return lines.length ? lines : ['-']
}
const centerText = value => chunks(value, WIDTH).map(line => `${' '.repeat(Math.max(0, Math.floor((WIDTH - line.length) / 2)))}${line}\n`).join('')
const pad = (label, value, width = WIDTH) => {
  const left = strip(label).slice(0, 11)
  const right = strip(value)
  const room = width - left.length - 1
  if (right.length <= room) return `${left}${' '.repeat(width - left.length - right.length)}${right}\n`
  return `${left}\n${chunks(right, width - 2).map(line => `  ${line}`).join('\n')}\n`
}

export function buildThermalReceipt({transaction, order = {}, user = {}}) {
  const provider = transaction.provider || order.provider || (transaction.method || '').split('Â·')[0]?.trim()
  const service = transaction.title || order.title || (transaction.method || '').split('Â·')[1]?.trim() || 'KuotaKita'
  const product = transaction.product || order.product || service
  const target = transaction.target || order.target || transaction.customer
  const customerName = transaction.customer_name || order.customer_name || transaction.customerName || '-'
  const orderNumber = transaction.order_number || transaction.orderNumber || transaction.id
  const serial = transaction.sn || transaction.serial || '-'

  return [
    INIT,
    CENTER,
    BOLD_ON,
    'KUOTAKITA\n',
    BOLD_OFF,
    centerText('Struk Transaksi Resmi Agen'),
    centerText('Pulsa Cepat - Transaksi Hebat'),
    LINE,
    LEFT,
    pad('Status', transaction.status || 'Berhasil'),
    pad('Tanggal', formatDate(transaction.created_at || new Date().toISOString())),
    LINE,
    pad('No Pesanan', orderNumber),
    pad('ID Trx', transaction.id),
    pad('SN/Ref', serial),
    pad('Layanan', service),
    pad('Provider', provider),
    pad('Produk', product),
    pad('Nama', customerName),
    pad('Tujuan', target),
    pad('Metode', transaction.payment_method || 'Saldo KuotaKita'),
    pad('Agen', user.name || user.username || 'Agen KuotaKita'),
    LINE,
    BOLD_ON,
    pad('TOTAL', money(transaction.amount || order.amount || 0)),
    BOLD_OFF,
    LINE,
    CENTER,
    centerText('Terima kasih sudah bertransaksi.'),
    centerText('Simpan struk ini sebagai bukti pembayaran yang sah.'),
    CUT
  ].join('')
}

async function findWritableCharacteristic(server) {
  const services = await server.getPrimaryServices()
  for (const service of services) {
    const characteristics = await service.getCharacteristics()
    const writable = characteristics.find(item => item.properties.write || item.properties.writeWithoutResponse)
    if (writable) return writable
  }
  throw new Error('Printer ditemukan, tapi channel cetaknya tidak terbaca.')
}

export async function printThermalBluetooth(payload) {
  if (!navigator.bluetooth) {
    throw new Error('Browser ini belum mendukung Bluetooth printer. Pakai Chrome Android, lalu aktifkan Bluetooth dan izin lokasi.')
  }

  const device = await navigator.bluetooth.requestDevice({
    acceptAllDevices: true,
    optionalServices: BLE_SERVICES
  })
  const server = await device.gatt.connect()
  const characteristic = await findWritableCharacteristic(server)
  const bytes = new TextEncoder().encode(buildThermalReceipt(payload))

  for (let offset = 0; offset < bytes.length; offset += 120) {
    const chunk = bytes.slice(offset, offset + 120)
    if (characteristic.writeValueWithoutResponse) await characteristic.writeValueWithoutResponse(chunk)
    else await characteristic.writeValue(chunk)
  }

  device.gatt.disconnect()
  return device.name || 'Printer Bluetooth'
}
