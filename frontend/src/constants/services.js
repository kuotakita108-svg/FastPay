const config=(title,category,input,placeholder,providers)=>({title,category,input,placeholder,providers})
export const serviceConfig={
  pulsa:config('Isi Pulsa','Pulsa','Nomor Handphone','Contoh: 081234567890',['Telkomsel','Indosat','XL','Tri','AXIS']),
  data:config('Paket Data','Paket Data','Nomor Handphone','Contoh: 081234567890',['Telkomsel','Indosat','XL','Tri','AXIS']),
  ewallet:config('Top Up E-Wallet','E-Wallet','Nomor E-Wallet','Masukkan nomor akun e-wallet',['DANA','GoPay','OVO','ShopeePay','LinkAja']),
  pln:config('Token Listrik PLN','Token PLN','Nomor Meter / ID Pelanggan','Masukkan nomor meter PLN',['PLN']),
  game:config('Voucher & Top Up Game','Voucher Game','User ID Game','Masukkan User ID',['Mobile Legends','Free Fire','PUBG Mobile','Valorant','Genshin Impact']),
  pdam:config('Tagihan PDAM','PDAM','Nomor Pelanggan PDAM','Masukkan nomor pelanggan',['PDAM Jakarta','PDAM Bandung','PDAM Surabaya']),
  bpjs:config('BPJS Kesehatan','BPJS','Nomor Peserta BPJS','Masukkan nomor peserta',['BPJS Kesehatan']),
  telkom:config('Telkom & IndiHome','Internet & TV','Nomor Pelanggan','Masukkan nomor pelanggan',['IndiHome','Telkom']),
  tv:config('TV Berlangganan','Internet & TV','Nomor Pelanggan','Masukkan nomor pelanggan TV',['MNC Vision','K-Vision','Transvision']),
  pascabayar:config('HP Pascabayar','Pascabayar','Nomor Handphone','Masukkan nomor pascabayar',['Telkomsel Halo','Indosat Postpaid','XL Prioritas']),
  gas:config('Tagihan Gas PGN','Tagihan Gas','Nomor Pelanggan','Masukkan nomor pelanggan PGN',['PGN']),
  internet:config('Internet & WiFi','Internet & TV','Nomor Pelanggan','Masukkan nomor pelanggan',['MyRepublic','Biznet','CBN','IndiHome']),
  bank:config('Transfer Bank','Transfer Bank','Nomor Rekening','Masukkan nomor rekening',['BCA','BRI','BNI','Mandiri','Bank Syariah Indonesia']),
  voucher:config('Voucher Digital','Voucher Digital','Nomor Handphone / Email','Masukkan data penerima',['Google Play','Apple Gift Card','Spotify','Vidio']),
  school:config('Pembayaran Pendidikan','Pendidikan','Nomor Siswa / Mahasiswa','Masukkan nomor pelajar',['Sekolah','Universitas','Bimbel']),
  insurance:config('Pembayaran Asuransi','Asuransi','Nomor Polis','Masukkan nomor polis',['Prudential','Allianz','Manulife']),
  vehicle:config('Cicilan Kendaraan','Cicilan','Nomor Kontrak','Masukkan nomor kontrak',['Adira Finance','FIF Group','WOM Finance']),
  property:config('Pajak Bumi & Bangunan','Pajak','Nomor Objek Pajak','Masukkan NOP',['PBB Kota/Kabupaten']),
  travel:config('Tiket Perjalanan','Perjalanan','Nomor Handphone','Masukkan nomor pemesan',['Kereta Api','Pesawat','Bus & Travel']),
}
export const allServices=[['Pulsa','pulsa',null,'Komunikasi'],['Paket Data','data',null,'Komunikasi'],['HP Pascabayar','pascabayar',null,'Komunikasi'],['E-Wallet','ewallet',null,'Keuangan'],['Transfer Bank','bank',null,'Keuangan'],['BPJS','bpjs',null,'Tagihan'],['Token PLN','pln',null,'Rumah Tangga'],['PDAM','pdam',null,'Rumah Tangga'],['Gas PGN','gas',null,'Rumah Tangga'],['Internet & WiFi','internet',null,'Rumah Tangga'],['TV Kabel','tv',null,'Hiburan'],['Voucher Game','game',null,'Hiburan'],['Voucher Digital','voucher',null,'Hiburan'],['Uang Sekolah','school',null,'Pendidikan'],['Asuransi','insurance',null,'Keuangan'],['Cicilan Kendaraan','vehicle',null,'Cicilan'],['PBB','property',null,'Pajak'],['Tiket Perjalanan','travel',null,'Perjalanan']]
