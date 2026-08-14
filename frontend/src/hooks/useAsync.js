import { useCallback, useEffect, useState } from 'react'

const resultCache = new WeakMap()
const CACHE_TTL = 60000

export function useAsync(fn) {
  const initial = resultCache.get(fn)
  const freshInitial = initial && Date.now() - initial.savedAt < CACHE_TTL
  const [data, setData] = useState(freshInitial ? initial.data : null)
  const [loading, setLoading] = useState(!freshInitial)
  const [error, setError] = useState(null)
  const execute = useCallback(async (force = false) => {
    const cached = resultCache.get(fn)
    const fresh = cached && Date.now() - cached.savedAt < CACHE_TTL
    if (!force && fresh) {
      setData(cached.data)
      setLoading(false)
      return cached.data
    }
    if (!cached?.data) setLoading(true)
    setError(null)
    try {
      const next = await fn()
      resultCache.set(fn, {data: next, savedAt: Date.now()})
      setData(next)
      return next
    } catch (currentError) {
      setError(currentError.message)
    } finally {
      setLoading(false)
    }
  }, [fn])
  useEffect(() => { execute() }, [execute])
  return { data, loading, error, reload: () => execute(true) }
}
