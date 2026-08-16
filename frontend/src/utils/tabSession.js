const legacySessionKey = 'kuotakita_session'
const tabNamePrefix = 'kuotakita-tab:'

function createTabID() {
  if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID()
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`
}

export function getTabSessionKey() {
  if (typeof window === 'undefined') return legacySessionKey
  // window.name tidak disalin ke tab baru yang dibuka dengan target=_blank,
  // sedangkan nilainya tetap ada saat tab yang sama dimuat ulang.
  if (!window.name.startsWith(tabNamePrefix)) window.name = `${tabNamePrefix}${createTabID()}`
  return `${legacySessionKey}:${window.name.slice(tabNamePrefix.length)}`
}

export function readTabSession() {
  try {
    const key = getTabSessionKey()
    const current = sessionStorage.getItem(key)
    if (current) return JSON.parse(current)

    // Migrasikan sesi versi lama hanya pada tab yang sedang melakukan upgrade.
    // Kunci lama langsung dihapus agar tab baru tidak ikut mewarisinya.
    const legacy = sessionStorage.getItem(legacySessionKey)
    if (!legacy) return null
    sessionStorage.setItem(key, legacy)
    sessionStorage.removeItem(legacySessionKey)
    return JSON.parse(legacy)
  } catch {
    return null
  }
}

export function writeTabSession(value) {
  sessionStorage.setItem(getTabSessionKey(), JSON.stringify(value))
  sessionStorage.removeItem(legacySessionKey)
}

export function clearTabSession() {
  sessionStorage.removeItem(getTabSessionKey())
  sessionStorage.removeItem(legacySessionKey)
}

