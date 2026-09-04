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
  const promise = request(`/products${service ? `?service=${encodeURIComponent(service)}` : ''}`,{timeoutMs:60000})
    .then(data => {
      cache.set(key, {data, savedAt: Date.now()})
      return data
    })
    .catch(error => {
      cache.delete(key)
      throw error
    })
  cache.set(key, {promise})
  return promise
}
