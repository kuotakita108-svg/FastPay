const sessionUserId = () => {
  try { return JSON.parse(localStorage.getItem('kuotakita_session'))?.user?.id || 'guest' } catch { return 'guest' }
}

const storageKey = userId => `kuotakita_favorite_contacts_${userId || sessionUserId()}`

const normalizeNumber = value => {
  let number = String(value || '').replace(/[^\d+]/g, '')
  if (number.startsWith('+62')) number = `0${number.slice(3)}`
  else if (number.startsWith('62')) number = `0${number.slice(2)}`
  else if (number.startsWith('8')) number = `0${number}`
  return number.replace(/\D/g, '').slice(0, 15)
}

export function getFavoriteContacts(userId) {
  try {
    const list = JSON.parse(localStorage.getItem(storageKey(userId)))
    return Array.isArray(list) ? list : []
  } catch { return [] }
}

export function saveFavoriteContact(contact, userId) {
  const number = normalizeNumber(contact?.number)
  if (number.length < 9) return getFavoriteContacts(userId)
  const next = [{
    id: `${number}-${contact?.service || 'pulsa'}`,
    number,
    label: String(contact?.label || 'Nomor favorit').trim(),
    service: contact?.service || 'pulsa',
    updatedAt: new Date().toISOString(),
  }, ...getFavoriteContacts(userId).filter(item => item.id !== `${number}-${contact?.service || 'pulsa'}`)].slice(0, 20)
  localStorage.setItem(storageKey(userId), JSON.stringify(next))
  return next
}

export function removeFavoriteContact(number, service, userId) {
  const normalized = normalizeNumber(number)
  const next = getFavoriteContacts(userId).filter(item => item.id !== `${normalized}-${service || 'pulsa'}`)
  localStorage.setItem(storageKey(userId), JSON.stringify(next))
  return next
}

export function isFavoriteContact(number, service, userId) {
  const normalized = normalizeNumber(number)
  return getFavoriteContacts(userId).some(item => item.id === `${normalized}-${service || 'pulsa'}`)
}

export {normalizeNumber}
