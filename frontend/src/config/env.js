const cleanBasePath = value => {
  const base = value || '/'
  if (base === '/') return '/'
  return `/${base.replace(/^\/+|\/+$/g, '')}`
}

export const env = {
  appName: import.meta.env.VITE_APP_NAME || 'PulsaPrime',
  apiURL: import.meta.env.VITE_API_URL || '/api/v1',
  basePath: cleanBasePath(import.meta.env.VITE_APP_BASE_PATH)
}
