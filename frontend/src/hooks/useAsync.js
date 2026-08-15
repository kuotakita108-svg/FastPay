import { useCallback, useEffect, useState } from 'react'

const resultCache = new WeakMap()
const CACHE_TTL = 60000

export function useAsync(fn) {
  const initial = resultCache.get(fn)
  const [data, setData] = useState(initial?.data ?? null)
  const [loading, setLoading] = useState(!initial)
  const [error, setError] = useState(null)
  const execute = useCallback(async (force = false) => {
    const cached = resultCache.get(fn)
    const fresh = cached && Date.now() - cached.savedAt < CACHE_TTL
    if (!force && fresh) {
      setData(cached.data)
      setLoading(false)
      return cached.data
    }
    if (cached?.data === undefined) setLoading(true)
    setError(null)
    try {
      const next = await fn()
      resultCache.set(fn, {data: next, savedAt: Date.now()})
      setData(next)
      return next
    } catch (currentError) {
      // Data lama tetap ditampilkan ketika refresh latar belakang terganggu.
      // Layar error hanya dipakai jika halaman memang belum pernah punya data.
      if (cached?.data === undefined) setError(currentError.message)
    } finally {
      setLoading(false)
    }
  }, [fn])
  useEffect(() => { execute() }, [execute])
  return { data, loading, error, reload: () => execute(true) }
}
