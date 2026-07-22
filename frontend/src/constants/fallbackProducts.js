const money = [10000, 15000, 20000, 25000, 50000, 75000, 100000, 150000, 200000]
const data = [['Paket Hemat 2 GB · 7 Hari', 12000], ['Paket Harian 3 GB · 7 Hari', 18000], ['Paket Bulanan 6 GB · 30 Hari', 32000], ['Paket Bulanan 12 GB · 30 Hari', 52000], ['Paket Combo 25 GB · 30 Hari', 85000], ['Paket Jumbo 50 GB · 30 Hari', 135000]]
const game = [['Paket Starter', 15000], ['Paket Bronze', 30000], ['Paket Silver', 50000], ['Paket Gold', 100000], ['Paket Platinum', 200000], ['Paket Ultimate', 500000]]
const bills = [['Cek Tagihan', 2500], ['Pembayaran Rp50.000', 50000], ['Pembayaran Rp100.000', 100000], ['Pembayaran Rp250.000', 250000], ['Pembayaran Rp500.000', 500000], ['Pembayaran Rp1.000.000', 1000000]]

const specialized = {
  QRIS: money.map(value => [`Pembayaran QRIS ${value.toLocaleString('id-ID')}`, value]),
  'Uang Elektronik': money.map(value => [`Top Up ${value.toLocaleString('id-ID')}`, value]),
  'Kartu Tol': money.map(value => [`Isi Saldo Tol ${value.toLocaleString('id-ID')}`, value]),
  'Hiburan Digital': [['Paket 7 Hari', 25000], ['Paket Mobile 30 Hari', 54000], ['Paket Individual 30 Hari', 79000], ['Paket Premium 30 Hari', 159000], ['Paket Keluarga 30 Hari', 199000]],
  'Paket eSIM': [['Indonesia 3 GB · 7 Hari', 55000], ['Indonesia 10 GB · 30 Hari', 125000], ['Asia 6 GB · 15 Hari', 185000], ['Global 10 GB · 30 Hari', 325000]],
  Kesehatan: [['Konsultasi Dokter', 35000], ['Voucher Apotek Rp50.000', 50000], ['Pemeriksaan Dasar', 99000], ['Paket Laboratorium', 249000]],
  'Kartu Kredit': bills,
  Multifinance: bills,
  'Pajak Negara': [['Cek Kode Billing', 2500], ['Bayar Rp100.000', 100000], ['Bayar Rp250.000', 250000], ['Bayar Rp500.000', 500000], ['Bayar Rp1.000.000', 1000000]],
  Donasi: money.map(value => [`Donasi ${value.toLocaleString('id-ID')}`, value]),
  Parkir: [['Parkir 1 Jam', 5000], ['Parkir 3 Jam', 15000], ['Saldo Parkir Rp25.000', 25000], ['Saldo Parkir Rp50.000', 50000]],
  Pengiriman: [['Reguler', 15000], ['Hemat', 10000], ['Next Day', 25000], ['Same Day', 40000], ['Kargo', 75000]],
}

export function fallbackProducts(category, provider) {
  const items = specialized[category]
    || (category === 'Paket Data' ? data
      : category === 'Voucher Game' ? game
        : ['Pulsa', 'E-Wallet', 'Token PLN'].includes(category)
          ? money.map(value => [`${category} ${value.toLocaleString('id-ID')}`, value])
          : bills)

  return items.map(([name, nominal], index) => ({
    id: `LOCAL-${category}-${provider}-${index}`,
    category,
    operator: provider,
    name: name.includes(category) ? name : `${provider} · ${name}`,
    nominal,
    price: nominal + (nominal > 2500 ? 750 : 0),
    stock: 999,
    fallback: true,
  }))
}
