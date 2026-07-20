import { useCallback, useEffect, useState } from 'react'

export function useAsync(fn) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const execute = useCallback(async () => {
    setLoading(true)
    setError(null)
    try { setData(await fn()) } catch (currentError) { setError(currentError.message) } finally { setLoading(false) }
  }, [fn])
  useEffect(() => { execute() }, [execute])
  return { data, loading, error, reload: execute }
}
