import {request} from './http'

const cache = new Map()

const normalizeText=value=>String(value||'').trim()
const classifyService=product=>{
  const value=`${product.Category||''} ${product.Group||''} ${product.Provider||''} ${product.Name||''}`.toLowerCase()
  const rules=[
    ['bpjs',['bpjs']],['pdam',['pdam','air minum']],['pln',['pln','listrik']],['gas',['pgn','gas negara','tagihan gas']],
    ['multifinance',['multifinance','leasing','cicilan']],['creditcard',['kartu kredit']],['insurance',['asuransi','insurance']],
    ['school',['pendidikan','sekolah','universitas']],['tax',['pajak','pbb','penerimaan negara']],['zakat',['zakat','donasi']],
    ['parking',['parking','parkir']],['toll',['e-toll','tol']],['emoney',['e-money','emoney','uang elektronik']],
    ['bank',['bank transfer','transfer bank','rtol']],['ewallet',['e-wallet','ewallet','dompet digital']],['game',['game','diamond']],
    ['streaming',['streaming']],['voucher',['voucher digital','voucher']],['esim',['esim']],['data',['paket data','internet data','kuota']],
    ['pulsa',['pulsa','masa aktif','paket telepon','aktivasi perdana']],['telkom',['telkom','indihome']],
    ['tv',['televisi','tv berlangganan']],['internet',['internet']],['pascabayar',['pascabayar','postpaid']],
    ['vehicle',['kendaraan','samsat']],['property',['properti']],['qris',['qris']],['health',['kesehatan']],
    ['delivery',['pengiriman','delivery']],['travel',['travel','tiket']],
  ]
  return rules.find(([,words])=>words.some(word=>value.includes(word)))?.[0]||'voucher'
}
const dottedNominal=/\b(\d{1,3}(?:[.,]\d{3})+)\b/
const namedNominal=name=>{
  if(/open amount|bebas nominal/i.test(name||''))return 0
  const match=String(name||'').match(dottedNominal)
  return match?Number(match[1].replace(/[.,]/g,'')):0
}
const normalizeProduct=raw=>{
  if(raw?.sku)return raw
  const category=normalizeText(raw?.Category),status=normalizeText(raw?.PriceType||'FIXED').toUpperCase()
  const basePrice=Number(raw?.Price||raw?.Cost||0)
  // Katalog member yang dikirim backend lama belum memasukkan fee kategori.
  // Pulsa24Jam menampilkan Rp1.500 untuk transfer bank dan Rp1.000 untuk
  // kategori lain; nilai ini juga membuat fixed-price sama dengan dashboard H2HR.
  const memberFee=/bank transfer/i.test(category)?1500:1000
  const open=status.includes('OPEN')
  return {
    id:raw?.ID||`h2hr-${normalizeText(raw?.Code).toLowerCase()}`,
    sku:normalizeText(raw?.Code),
    service:classifyService(raw||{}),
    operator:normalizeText(raw?.Provider||raw?.Category),
    name:normalizeText(raw?.Name||raw?.Code),
    group:normalizeText(raw?.Group),
    category,
    nominal:open?namedNominal(raw?.Name):0,
    price:basePrice+memberFee,
    stock:Number(raw?.Stock||0),
    status,
    active:raw?.Active!==false,
  }
}

export const getProducts = async service => {
  const key = service || 'all'
  const existing = cache.get(key)
  if (existing?.data && Date.now() - existing.savedAt < 120000) return existing.data
  if (existing?.promise) return existing.promise
  // Katalog H2HR dapat berisi lebih dari sembilan ribu baris. Permintaan
  // pertama setelah deploy perlu waktu lebih lama untuk mengambil dan
  // mengelompokkan katalog; request umum tetap memakai timeout pendek.
  const promise = request(`/products${service ? `?service=${encodeURIComponent(service)}` : ''}`,{timeoutMs:60000,noCache:true})
    .then(data => {
      const normalized=(Array.isArray(data)?data:[]).filter(item=>item?.Active!==false&&item?.active!==false).map(normalizeProduct)
      const filtered=service?normalized.filter(item=>item.service===service):normalized
      // Jangan menyimpan respons kosong sesaat setelah backend restart. Tanpa
      // ini halaman terus menampilkan 0 provider selama dua menit meskipun
      // katalog H2HR sudah selesai dimuat pada request berikutnya.
      if(filtered.length>0)cache.set(key, {data:filtered, savedAt: Date.now()})
      else cache.delete(key)
      return filtered
    })
    .catch(error => {
      cache.delete(key)
      throw error
    })
  cache.set(key, {promise})
  return promise
}
