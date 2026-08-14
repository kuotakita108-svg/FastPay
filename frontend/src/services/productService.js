import {request} from './http'

const cache = new Map()

export const getProducts = async service => {
  const key = service || 'all'
  const existing = cache.get(key)
  if (existing?.data && Date.now() - existing.savedAt < 120000) return existing.data
  if (existing?.promise) return existing.promise
  const promise = request(`/products${service ? `?service=${encodeURIComponent(service)}` : ''}`)
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
