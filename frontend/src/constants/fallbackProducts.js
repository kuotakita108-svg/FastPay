const rupiahText = value => `Rp${Number(value).toLocaleString('id-ID')}`
const clean = value => String(value || '').trim()

const priced = (names, base = 0) => names.map(([name, value]) => [name, value + base])
const pack = (unit, values, rate, prefix = '') => values.map(value => [`${prefix}${value.toLocaleString('id-ID')} ${unit}`, Math.round(value * rate)])
const billSeries = (label = 'Pembayaran') => [
  ['Cek Tagihan', 2500],
  [`${label} ${rupiahText(25000)}`, 25000],
  [`${label} ${rupiahText(50000)}`, 50000],
  [`${label} ${rupiahText(100000)}`, 100000],
  [`${label} ${rupiahText(150000)}`, 150000],
  [`${label} ${rupiahText(250000)}`, 250000],
  [`${label} ${rupiahText(500000)}`, 500000],
  [`${label} ${rupiahText(750000)}`, 750000],
  [`${label} ${rupiahText(1000000)}`, 1000000],
]

const nominal = [5000, 10000, 15000, 20000, 25000, 30000, 40000, 50000, 75000, 100000, 150000, 200000, 250000, 300000, 500000, 750000, 1000000]
const walletNominal = [10000, 15000, 20000, 25000, 50000, 75000, 100000, 150000, 200000, 250000, 300000, 500000, 750000, 1000000, 1500000, 2000000]
const plnNominal = [20000, 50000, 100000, 200000, 500000, 1000000, 2000000, 5000000, 10000000]

const dataProducts = [
  ['Internet Harian 1 GB - 1 Hari', 6500],
  ['Internet Harian 3 GB - 3 Hari', 15000],
  ['Internet Mingguan 5 GB - 7 Hari', 23000],
  ['Internet Mingguan 10 GB - 7 Hari', 38000],
  ['Combo 12 GB - 30 Hari', 52000],
  ['Combo 18 GB - 30 Hari', 68000],
  ['Combo 25 GB - 30 Hari', 88000],
  ['Combo 35 GB - 30 Hari', 115000],
  ['Jumbo 50 GB - 30 Hari', 145000],
  ['Jumbo 75 GB - 30 Hari', 195000],
  ['Unlimited Apps 30 Hari', 99000],
  ['Unlimited Premium 30 Hari', 169000],
  ['Roaming Asia 3 GB - 7 Hari', 85000],
  ['Roaming Global 8 GB - 15 Hari', 249000],
]

const gameProducts = {
  'Free Fire': [
    ...pack('Diamonds', [5, 12, 20, 50, 70, 100, 140, 210, 280, 355, 425, 500, 635, 720, 860, 1000, 1075, 1450, 2000, 2180, 2720, 3640, 4000, 5000, 6000, 7290, 8000, 10000], 145),
    ['Membership Harian', 7000], ['Membership Mingguan', 30000], ['Membership Bulanan', 85000], ['Level Up Pass', 18000], ['BP Card', 45000], ['Special Bundle', 125000],
  ],
  'PUBG Mobile': [
    ...pack('UC', [30, 60, 90, 120, 180, 240, 325, 385, 445, 565, 660, 985, 1320, 1800, 2125, 2460, 3000, 3850, 4500, 5650, 6500, 8100, 10000, 12000, 16000], 225),
    ['Royale Pass', 160000], ['Elite Pass Plus', 420000], ['Prime Plus', 150000], ['Mythic Pack', 650000],
  ],
  'Mobile Legends': [
    ...pack('Diamonds', [5, 12, 19, 28, 36, 44, 59, 74, 86, 110, 148, 172, 222, 257, 284, 344, 408, 429, 514, 568, 706, 875, 963, 1050, 1412, 2010, 2400, 3000, 4000, 5000, 6000, 7500, 10000], 285),
    ['Weekly Diamond Pass', 30000], ['2x Weekly Diamond Pass', 60000], ['3x Weekly Diamond Pass', 90000], ['Twilight Pass', 150000], ['Starlight Member', 165000],
  ],
  Roblox: [
    ...pack('Robux', [80, 160, 240, 320, 400, 560, 800, 1000, 1200, 1700, 2250, 3000, 4500, 6000, 8000, 10000, 15000, 20000, 25000], 185),
    ['Premium 450', 85000], ['Premium 1000', 170000], ['Premium 2200', 360000], ['Premium 4500', 720000],
  ],
  'Point Blank': [
    ...pack('PB Cash', [1200, 2400, 3600, 6000, 9000, 12000, 18000, 24000, 36000, 48000, 60000, 84000, 120000, 180000, 240000, 360000, 500000], 10),
    ['Battle Pass', 75000], ['Premium Pack', 150000], ['Weapon Pack', 99000], ['Elite Bundle', 250000],
  ],
  'Genshin Impact Genesis Crystals': [
    ['60 Genesis Crystals', 15000], ['120 Genesis Crystals', 30000], ['300 + 30 Genesis Crystals', 79000], ['600 + 60 Genesis Crystals', 158000], ['980 + 110 Genesis Crystals', 249000], ['1960 + 220 Genesis Crystals', 498000], ['1980 + 260 Genesis Crystals', 479000], ['3280 + 600 Genesis Crystals', 799000], ['5000 Genesis Crystals', 1225000], ['6480 + 1600 Genesis Crystals', 1599000], ['10000 Genesis Crystals', 2450000], ['12960 + 3200 Genesis Crystals', 3198000], ['Blessing Welkin Moon', 79000], ['2x Blessing Welkin Moon', 158000], ['Battle Pass Gnostic Hymn', 159000], ['Battle Pass Gnostic Chorus', 329000],
  ],
  'Valorant Points': [
    ['125 VP', 15000], ['250 VP', 29000], ['420 VP', 49000], ['475 VP', 55000], ['700 VP', 77000], ['1000 VP', 110000], ['1375 VP', 149000], ['1650 VP', 179000], ['2050 VP', 220000], ['2400 VP', 259000], ['3050 VP', 325000], ['3650 VP', 385000], ['4400 VP', 462000], ['5350 VP', 550000], ['6500 VP', 665000], ['8150 VP', 825000], ['10000 VP', 1000000], ['11000 VP', 1100000], ['15000 VP', 1500000], ['20000 VP', 2000000],
  ],
  'Steam Wallet ID': [12000, 25000, 45000, 60000, 90000, 120000, 150000, 200000, 250000, 300000, 400000, 500000, 600000, 750000, 1000000, 1250000, 1500000, 2000000, 2500000, 3000000].map(value => [`Steam Wallet ${rupiahText(value)}`, value]),
  'Arena of Valor Voucher': [
    ...pack('Vouchers', [40, 90, 150, 230, 350, 470, 650, 950, 1200, 1430, 1800, 2390, 3000, 4000, 4800, 5000, 6500, 8000, 10000], 220),
    ['Weekly Card', 35000], ['Monthly Card', 99000], ['Battle Pass', 149000], ['Legend Bundle', 299000],
  ],
}

const providerSpecific = {
  BPJS: {
    'BPJS Kesehatan': ['Kelas 1', 'Kelas 2', 'Kelas 3'].flatMap(kelas => [1, 2, 3, 6, 12].map(month => [`${kelas} - ${month} Bulan`, month * (kelas === 'Kelas 1' ? 150000 : kelas === 'Kelas 2' ? 100000 : 42000)])),
  },
  'Internet & TV': {
    IndiHome: [...billSeries('Bayar Tagihan'), ['Add-on Speed 30 Mbps', 75000], ['Add-on Speed 50 Mbps', 125000], ['Paket Gamer', 99000]],
    Telkom: [...billSeries('Bayar Telkom'), ['Telepon Rumah', 75000], ['Deposit Telkom', 150000]],
    MyRepublic: [...billSeries('Bayar Tagihan'), ['Nova 50 Mbps', 260000], ['Fast 100 Mbps', 360000], ['Gamer 250 Mbps', 560000]],
    Biznet: [...billSeries('Bayar Tagihan'), ['Home Internet 1B', 350000], ['Home Internet 2C', 575000], ['Home Gamers', 700000]],
    CBN: [...billSeries('Bayar Tagihan'), ['Fiber 50 Mbps', 299000], ['Fiber 100 Mbps', 399000], ['Fiber 300 Mbps', 799000]],
    'MNC Vision': [...billSeries('Bayar TV'), ['Basic Pack 30 Hari', 99000], ['Family Pack 30 Hari', 149000], ['Sports Pack 30 Hari', 199000]],
    'K-Vision': [['Voucher Gardiner 30 Hari', 55000], ['Voucher Bromo 30 Hari', 99000], ['Voucher Cartenz 30 Hari', 150000], ...billSeries('Isi Voucher')],
    Transvision: [['Basic 30 Hari', 99000], ['Family 30 Hari', 169000], ['Premium 30 Hari', 249000], ...billSeries('Bayar TV')],
  },
  Perjalanan: {
    'Kereta Api': [['Tiket Ekonomi', 75000], ['Tiket Bisnis', 150000], ['Tiket Eksekutif', 300000], ['Reschedule Tiket', 25000], ['Tambah Bagasi', 50000]],
    Pesawat: [['Deposit Tiket Domestik', 500000], ['Deposit Tiket Internasional', 1500000], ['Tambah Bagasi 10 Kg', 150000], ['Tambah Bagasi 20 Kg', 280000], ['Asuransi Perjalanan', 35000]],
    'Bus & Travel': [['Travel Reguler', 85000], ['Travel Executive', 150000], ['Bus AKAP Ekonomi', 120000], ['Bus AKAP Executive', 250000], ['Shuttle Bandara', 75000]],
  },
  Pengiriman: {
    JNE: [['REG', 15000], ['YES', 25000], ['OKE', 12000], ['JTR Cargo', 75000], ['Packing Kayu', 45000], ['Asuransi Paket', 10000]],
    'J&T Express': [['EZ', 14000], ['J&T Super', 28000], ['Cargo', 65000], ['Asuransi Paket', 10000], ['Pickup Instan', 5000]],
    SiCepat: [['REG', 13000], ['BEST', 23000], ['GOKIL Cargo', 60000], ['HALU', 10000], ['Asuransi Paket', 10000]],
    'Pos Indonesia': [['Pos Reguler', 12000], ['Pos Kilat Khusus', 22000], ['EMS Dokumen', 180000], ['Paket Jumbo', 70000]],
    AnterAja: [['Regular', 13000], ['Next Day', 24000], ['Same Day', 42000], ['Cargo', 65000], ['Asuransi Paket', 10000]],
  },
}

const categoryCatalog = {
  Pulsa: nominal.map(value => [`Pulsa ${rupiahText(value)}`, value]),
  'Paket Data': dataProducts,
  'E-Wallet': walletNominal.map(value => [`Top Up ${rupiahText(value)}`, value]),
  'Token PLN': plnNominal.map(value => [`Token PLN ${rupiahText(value)}`, value]),
  PDAM: billSeries('Bayar PDAM'),
  Pascabayar: [...billSeries('Bayar Pascabayar'), ['Paket Add-on 5 GB', 50000], ['Paket Add-on 15 GB', 100000]],
  'Tagihan Gas': billSeries('Bayar Gas PGN'),
  'Transfer Bank': [['Biaya Admin Transfer', 6500], ...[50000, 100000, 250000, 500000, 1000000, 2000000, 5000000, 10000000].map(value => [`Transfer ${rupiahText(value)}`, value])],
  'Voucher Digital': [
    ['Google Play Rp20.000', 20000], ['Google Play Rp50.000', 50000], ['Google Play Rp100.000', 100000], ['Google Play Rp300.000', 300000],
    ['Apple Gift Card Rp50.000', 50000], ['Apple Gift Card Rp100.000', 100000], ['Apple Gift Card Rp250.000', 250000], ['Apple Gift Card Rp500.000', 500000],
    ['Spotify Premium 1 Bulan', 54000], ['Spotify Premium 3 Bulan', 159000], ['Vidio Platinum 30 Hari', 39000], ['Vidio Premier League 30 Hari', 79000],
  ],
  Pendidikan: [['SPP Bulanan', 250000], ['Uang Buku', 150000], ['Daftar Ulang', 500000], ['Biaya Ujian', 200000], ['Bimbel 1 Bulan', 350000], ['Bimbel 3 Bulan', 900000], ['Universitas UKT', 1000000], ['Universitas Praktikum', 500000]],
  Asuransi: [['Premi Bulanan', 150000], ['Premi Keluarga', 350000], ['Asuransi Jiwa', 250000], ['Asuransi Kesehatan', 300000], ['Asuransi Kendaraan', 500000], ['Top Up Polis', 1000000]],
  Cicilan: billSeries('Bayar Cicilan'),
  Pajak: [['Cek NOP', 2500], ['PBB Tahunan', 150000], ['PBB Rumah', 350000], ['PBB Ruko', 750000], ['PBB Tanah', 1000000], ['Denda PBB', 50000]],
  QRIS: walletNominal.map(value => [`Pembayaran QRIS ${rupiahText(value)}`, value]),
  'Uang Elektronik': walletNominal.map(value => [`Top Up Kartu ${rupiahText(value)}`, value]),
  'Kartu Tol': walletNominal.map(value => [`Isi Saldo Tol ${rupiahText(value)}`, value]),
  'Hiburan Digital': [['Paket 7 Hari', 25000], ['Paket Mobile 30 Hari', 54000], ['Paket Individual 30 Hari', 79000], ['Paket Premium 30 Hari', 159000], ['Paket Keluarga 30 Hari', 199000], ['Sports Pack 30 Hari', 129000], ['Movie Pack 30 Hari', 99000], ['Music Premium 3 Bulan', 159000], ['Annual Lite', 499000]],
  'Paket eSIM': [['Starter 3 GB - 7 Hari', 35000], ['Hemat 10 GB - 30 Hari', 85000], ['Combo 25 GB - 30 Hari', 135000], ['Premium 50 GB - 30 Hari', 225000], ['Roaming Asia 5 GB', 129000], ['Roaming Global 10 GB', 299000], ['Unlimited Daily', 99000], ['Unlimited 7 Hari', 299000]],
  Kesehatan: [['Konsultasi Dokter', 35000], ['Voucher Apotek Rp50.000', 50000], ['Voucher Apotek Rp100.000', 100000], ['Pemeriksaan Dasar', 99000], ['Paket Laboratorium', 249000], ['Vitamin Pack', 75000], ['Medical Check Up', 499000]],
  'Kartu Kredit': billSeries('Bayar Kartu Kredit'),
  Multifinance: billSeries('Bayar Multifinance'),
  'Pajak Negara': [['Cek Kode Billing', 2500], ['Bayar Pajak Rp100.000', 100000], ['Bayar Pajak Rp250.000', 250000], ['Bayar Pajak Rp500.000', 500000], ['Bayar Pajak Rp1.000.000', 1000000], ['Bayar Pajak Rp2.000.000', 2000000], ['Bayar Samsat', 350000], ['PNBP', 150000]],
  Donasi: walletNominal.map(value => [`Donasi ${rupiahText(value)}`, value]),
  Parkir: [['Parkir 1 Jam', 5000], ['Parkir 3 Jam', 15000], ['Parkir Harian', 30000], ['Saldo Parkir Rp25.000', 25000], ['Saldo Parkir Rp50.000', 50000], ['Saldo Parkir Rp100.000', 100000], ['Parkir Bandara', 50000]],
  Pengiriman: [['Reguler', 15000], ['Hemat', 10000], ['Next Day', 25000], ['Same Day', 40000], ['Kargo', 75000]],
}

export function fallbackProducts(category, provider) {
  const scoped = providerSpecific[category]?.[provider]
  const items = category === 'Voucher Game' && gameProducts[provider]
    ? gameProducts[provider]
    : scoped || categoryCatalog[category] || billSeries('Pembayaran')

  return priced(items).map(([name, nominal], index) => ({
    id: `LOCAL-${clean(category).replace(/\s+/g, '-')}-${clean(provider).replace(/\s+/g, '-')}-${index}`,
    category,
    operator: provider,
    name: clean(name).includes(clean(provider)) ? clean(name) : `${provider} · ${name}`,
    nominal,
    price: nominal + (nominal > 2500 ? 750 : 0),
    stock: 999,
    fallback: true,
  }))
}
