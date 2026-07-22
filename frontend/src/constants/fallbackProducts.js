const money = [10000, 15000, 20000, 25000, 50000, 75000, 100000, 150000, 200000]
const data = [['Paket Hemat 2 GB · 7 Hari', 12000], ['Paket Harian 3 GB · 7 Hari', 18000], ['Paket Bulanan 6 GB · 30 Hari', 32000], ['Paket Bulanan 12 GB · 30 Hari', 52000], ['Paket Combo 25 GB · 30 Hari', 85000], ['Paket Jumbo 50 GB · 30 Hari', 135000]]
const game = [['Paket Starter', 15000], ['Paket Bronze', 30000], ['Paket Silver', 50000], ['Paket Gold', 100000], ['Paket Platinum', 200000], ['Paket Ultimate', 500000]]
const gameProducts = {
  'Free Fire': [['70 Diamonds', 10000], ['140 Diamonds', 20000], ['355 Diamonds', 50000], ['720 Diamonds', 100000], ['Membership Mingguan', 30000], ['Membership Bulanan', 85000]],
  'PUBG Mobile': [['60 UC', 15000], ['325 UC', 75000], ['660 UC', 150000], ['1800 UC', 400000], ['Royale Pass', 160000], ['Elite Pass Plus', 420000]],
  'Mobile Legends': [['86 Diamonds', 25000], ['172 Diamonds', 50000], ['257 Diamonds', 75000], ['344 Diamonds', 100000], ['Weekly Diamond Pass', 30000], ['Twilight Pass', 150000]],
  Roblox: [['80 Robux', 15000], ['400 Robux', 75000], ['800 Robux', 150000], ['1700 Robux', 300000], ['Premium 450', 85000], ['Premium 1000', 170000]],
  'Point Blank': [['1.200 PB Cash', 12000], ['2.400 PB Cash', 24000], ['6.000 PB Cash', 60000], ['12.000 PB Cash', 120000], ['Battle Pass', 75000], ['Premium Pack', 150000]],
  'Genshin Impact Genesis Crystals': [['60 Genesis Crystals', 15000], ['300 + 30 Genesis Crystals', 79000], ['980 + 110 Genesis Crystals', 249000], ['1980 + 260 Genesis Crystals', 479000], ['Blessing Welkin Moon', 79000], ['Battle Pass Gnostic Hymn', 159000]],
  'Valorant Points': [['475 VP', 55000], ['1000 VP', 110000], ['2050 VP', 220000], ['3650 VP', 385000], ['5350 VP', 550000], ['11000 VP', 1100000]],
  'Steam Wallet ID': [['Steam Wallet Rp12.000', 12000], ['Steam Wallet Rp45.000', 45000], ['Steam Wallet Rp60.000', 60000], ['Steam Wallet Rp90.000', 90000], ['Steam Wallet Rp120.000', 120000], ['Steam Wallet Rp250.000', 250000]],
  'Arena of Valor Voucher': [['40 Vouchers', 10000], ['90 Vouchers', 20000], ['230 Vouchers', 50000], ['470 Vouchers', 100000], ['950 Vouchers', 200000], ['Weekly Card', 35000]],
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
