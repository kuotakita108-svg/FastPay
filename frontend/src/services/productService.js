import {request} from './http'

const cache = new Map()

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
      // Jangan menyimpan respons kosong sesaat setelah backend restart. Tanpa
      // ini halaman terus menampilkan 0 provider selama dua menit meskipun
      // katalog H2HR sudah selesai dimuat pada request berikutnya.
      if(Array.isArray(data)&&data.length>0)cache.set(key, {data, savedAt: Date.now()})
      else cache.delete(key)
      return data
    })
    .catch(error => {
      cache.delete(key)
      throw error
    })
  cache.set(key, {promise})
  return promise
}
