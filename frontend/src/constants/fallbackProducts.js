const money = [10000, 15000, 20000, 25000, 50000, 75000, 100000, 150000, 200000]
const data = [['Paket Hemat 2 GB · 7 Hari', 12000], ['Paket Harian 3 GB · 7 Hari', 18000], ['Paket Bulanan 6 GB · 30 Hari', 32000], ['Paket Bulanan 12 GB · 30 Hari', 52000], ['Paket Combo 25 GB · 30 Hari', 85000], ['Paket Jumbo 50 GB · 30 Hari', 135000]]
const game = [['Paket Starter', 15000], ['Paket Bronze', 30000], ['Paket Silver', 50000], ['Paket Gold', 100000], ['Paket Platinum', 200000], ['Paket Ultimate', 500000]]
const pack = (unit, values, rate, prefix = '') => values.map(value => [`${prefix}${value.toLocaleString('id-ID')} ${unit}`, Math.round(value * rate)])

const gameProducts = {
  'Free Fire': [...pack('Diamonds', [5, 12, 50, 70, 100, 140, 210, 355, 500, 720, 1000, 1450, 2180, 3640, 5000], 145), ['Membership Mingguan', 30000], ['Membership Bulanan', 85000], ['Level Up Pass', 18000], ['BP Card', 45000]],
  'PUBG Mobile': [...pack('UC', [30, 60, 120, 180, 325, 385, 660, 985, 1320, 1800, 2125, 3850, 5650, 8100], 225), ['Royale Pass', 160000], ['Elite Pass Plus', 420000], ['Prime Plus', 150000]],
  'Mobile Legends': [...pack('Diamonds', [5, 12, 19, 28, 36, 44, 59, 74, 86, 110, 148, 172, 222, 257, 284, 344, 408, 568, 706, 875, 1050, 1412, 2010, 2400, 3000, 4000, 5000], 285), ['Weekly Diamond Pass', 30000], ['2x Weekly Diamond Pass', 60000], ['Twilight Pass', 150000]],
  Roblox: [...pack('Robux', [80, 160, 240, 400, 800, 1200, 1700, 2250, 4500, 10000], 185), ['Premium 450', 85000], ['Premium 1000', 170000], ['Premium 2200', 360000]],
  'Point Blank': [...pack('PB Cash', [1200, 2400, 3600, 6000, 12000, 24000, 36000, 60000, 120000], 10), ['Battle Pass', 75000], ['Premium Pack', 150000], ['Weapon Pack', 99000]],
  'Genshin Impact Genesis Crystals': [['60 Genesis Crystals', 15000], ['300 + 30 Genesis Crystals', 79000], ['980 + 110 Genesis Crystals', 249000], ['1980 + 260 Genesis Crystals', 479000], ['3280 + 600 Genesis Crystals', 799000], ['6480 + 1600 Genesis Crystals', 1599000], ['Blessing Welkin Moon', 79000], ['Battle Pass Gnostic Hymn', 159000], ['Battle Pass Gnostic Chorus', 329000]],
  'Valorant Points': [['125 VP', 15000], ['420 VP', 49000], ['475 VP', 55000], ['700 VP', 77000], ['1000 VP', 110000], ['1375 VP', 149000], ['2050 VP', 220000], ['2400 VP', 259000], ['3650 VP', 385000], ['5350 VP', 550000], ['8150 VP', 825000], ['11000 VP', 1100000]],
  'Steam Wallet ID': [12000, 45000, 60000, 90000, 120000, 250000, 400000, 600000, 1000000, 1500000, 2000000].map(value => [`Steam Wallet Rp${value.toLocaleString('id-ID')}`, value]),
  'Arena of Valor Voucher': [...pack('Vouchers', [40, 90, 230, 470, 950, 1430, 2390, 4800, 5000], 220), ['Weekly Card', 35000], ['Monthly Card', 99000], ['Battle Pass', 149000]],
}
const bills = [['Cek Tagihan', 2500], ['Pembayaran Rp50.000', 50000], ['Pembayaran Rp100.000', 100000], ['Pembayaran Rp250.000', 250000], ['Pembayaran Rp500.000', 500000], ['Pembayaran Rp1.000.000', 1000000]]

const specialized = {
  QRIS: money.map(value => [`Pembayaran QRIS ${value.toLocaleString('id-ID')}`, value]),
  'Uang Elektronik': money.map(value => [`Top Up ${value.toLocaleString('id-ID')}`, value]),
  'Kartu Tol': money.map(value => [`Isi Saldo Tol ${value.toLocaleString('id-ID')}`, value]),
  'Hiburan Digital': [['Paket 7 Hari', 25000], ['Paket Mobile 30 Hari', 54000], ['Paket Individual 30 Hari', 79000], ['Paket Premium 30 Hari', 159000], ['Paket Keluarga 30 Hari', 199000]],
  'Paket eSIM': [['Starter 3 GB · 7 Hari', 35000], ['Hemat 10 GB · 30 Hari', 85000], ['Combo 25 GB · 30 Hari', 135000], ['Premium 50 GB · 30 Hari', 225000]],
  Kesehatan: [['Konsultasi Dokter', 35000], ['Voucher Apotek Rp50.000', 50000], ['Pemeriksaan Dasar', 99000], ['Paket Laboratorium', 249000]],
  'Kartu Kredit': bills,
  Multifinance: bills,
  'Pajak Negara': [['Cek Kode Billing', 2500], ['Bayar Rp100.000', 100000], ['Bayar Rp250.000', 250000], ['Bayar Rp500.000', 500000], ['Bayar Rp1.000.000', 1000000]],
  Donasi: money.map(value => [`Donasi ${value.toLocaleString('id-ID')}`, value]),
  Parkir: [['Parkir 1 Jam', 5000], ['Parkir 3 Jam', 15000], ['Saldo Parkir Rp25.000', 25000], ['Saldo Parkir Rp50.000', 50000]],
  Pengiriman: [['Reguler', 15000], ['Hemat', 10000], ['Next Day', 25000], ['Same Day', 40000], ['Kargo', 75000]],
}

export function fallbackProducts(category, provider) {
  const items = category === 'Voucher Game' && gameProducts[provider] ? gameProducts[provider] : specialized[category]
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
