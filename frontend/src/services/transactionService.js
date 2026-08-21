import {request} from './http'
import {readTabSession} from '../utils/tabSession'
const session=()=>readTabSession()
// Semua akun yang memakai aplikasi mobile harus membaca transaksi miliknya
// sendiri. Endpoint /transactions hanya untuk tabel operasional Admin.
const isUser=()=>['user','agent','marketing'].includes(session()?.user?.role)
const path=()=>isUser()?'/me/transactions':'/transactions'
export const getTransactions=()=>request(path())
export function makeReceiptNumber(prefix='PP'){return `${prefix}-${Date.now().toString().slice(-8)}-${Math.random().toString(36).slice(2,6).toUpperCase()}`}
// Struk selalu dibaca dari transaksi server. Fungsi ini dipertahankan agar UI lama tetap kompatibel.
export const saveReceipt=()=>{}
export const getReceipt=()=>null
export const createTransaction=data=>request(path(),{method:'POST',body:JSON.stringify(data)})
export const payWithBalance=data=>request('/me/payments',{method:'POST',body:JSON.stringify(data),timeoutMs:25000})
export const createPendingPayment=data=>request('/me/payments/pending',{method:'POST',body:JSON.stringify(data)})
export const getPendingPaymentStatus=id=>request(`/me/payments/pending/${encodeURIComponent(id)}`)
export const getPulsa24Balance=()=>request('/h2h/pulsa24jam/balance')
export const getPulsa24Operations=()=>request('/h2h/pulsa24jam/operations',{timeoutMs:25000})
export const refundPulsa24Order=refid=>request(`/h2h/pulsa24jam/operations/${encodeURIComponent(refid)}/refund`,{method:'POST',timeoutMs:25000})
export const getPulsa24Status=refid=>request(`/h2h/pulsa24jam/status?refid=${encodeURIComponent(refid)}`,{timeoutMs:25000})
export const getPulsa24Products=product=>request(`/h2h/pulsa24jam/products${product?`?product=${encodeURIComponent(product)}`:''}`)
export const inquirePulsa24=data=>request('/h2h/pulsa24jam/inquiry',{method:'POST',body:JSON.stringify(data)})
