import {request} from './http'

const cache = new Map()
const defaults = []
const normalizeNumber = value => {
  let number = String(value || '').replace(/[^\d+]/g, '')
  if (number.startsWith('+62')) number = `0${number.slice(3)}`
  else if (number.startsWith('62')) number = `0${number.slice(2)}`
  else if (number.startsWith('8')) number = `0${number}`
  return number.replace(/\D/g, '').slice(0, 15)
}
const list = userId => cache.get(userId) || defaults
const write = async (userId, next) => {
  const result = await request('/me/preferences',{method:'PUT',body:JSON.stringify({favorites:next})})
  const saved = Array.isArray(result.favorites) ? result.favorites : next
  cache.set(userId,saved); return saved
}
export async function loadFavoriteContacts(userId){
  const result=await request('/me/preferences'); const items=Array.isArray(result.favorites)?result.favorites:[]
  cache.set(userId,items); return items
}
export const getFavoriteContacts=userId=>list(userId)
export async function saveFavoriteContact(contact,userId){
  const number=normalizeNumber(contact?.number); const current=list(userId)
  if(number.length<9)return current
  const item={id:`${number}-${contact?.service||'pulsa'}`,number,label:String(contact?.label||'Nomor favorit').trim(),service:contact?.service||'pulsa',updatedAt:new Date().toISOString()}
  return write(userId,[item,...current.filter(value=>value.id!==item.id)].slice(0,20))
}
export async function removeFavoriteContact(number,service,userId){
  const normalized=normalizeNumber(number); return write(userId,list(userId).filter(item=>item.id!==`${normalized}-${service||'pulsa'}`))
}
export const isFavoriteContact=(number,service,userId)=>list(userId).some(item=>item.id===`${normalizeNumber(number)}-${service||'pulsa'}`)
export {normalizeNumber}
