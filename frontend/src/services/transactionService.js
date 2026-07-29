import {request} from './http'
const session=()=>{try{return JSON.parse(localStorage.getItem('kuotakita_session'))}catch{return null}}
const isUser=()=>session()?.user?.role==='user'
const path=()=>isUser()?'/me/transactions':'/transactions'
export const getTransactions=()=>request(path())
export function makeReceiptNumber(prefix='PP'){return `${prefix}-${Date.now().toString().slice(-8)}-${Math.random().toString(36).slice(2,6).toUpperCase()}`}
// Struk selalu dibaca dari transaksi server. Fungsi ini dipertahankan agar UI lama tetap kompatibel.
export const saveReceipt=()=>{}
export const getReceipt=()=>null
export const createTransaction=data=>request(path(),{method:'POST',body:JSON.stringify(data)})
export const payWithBalance=data=>request('/me/payments',{method:'POST',body:JSON.stringify(data)})
