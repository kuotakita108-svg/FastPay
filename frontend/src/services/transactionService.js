import {request} from './http'
const session=()=>{try{return JSON.parse(localStorage.getItem('pulsaprime_session'))}catch{return null}}
const key=()=>`pulsaprime_transactions_${session()?.user?.id||'guest'}`
const receiptKey=()=>`pulsaprime_receipts_${session()?.user?.id||'guest'}`
const localList=()=>{try{return JSON.parse(localStorage.getItem(key()))||[]}catch{return[]}}
const receiptList=()=>{try{return JSON.parse(localStorage.getItem(receiptKey()))||{}}catch{return{}}}
const saveLocalItem=item=>localStorage.setItem(key(),JSON.stringify([item,...localList().filter(transaction=>transaction.id!==item.id)]))
const isUser=()=>session()?.user?.role==='user'
const path=()=>isUser()?'/me/transactions':'/transactions'
export async function getTransactions(){if(session()?.offline)return localList();try{return await request(path())}catch(error){if(isUser()&&/Koneksi|terlalu lama|Failed to fetch/i.test(error.message))return localList();throw error}}
export function makeReceiptNumber(prefix='PP'){return `${prefix}-${Date.now().toString().slice(-8)}-${Math.random().toString(36).slice(2,6).toUpperCase()}`}
export function saveReceipt(transaction){const receipts=receiptList();localStorage.setItem(receiptKey(),JSON.stringify({...receipts,[transaction.id]:transaction}));if(isUser())saveLocalItem(transaction)}
export function getReceipt(id){return receiptList()[id]||null}
export async function createTransaction(data){if(!session()?.offline){try{const item=await request(path(),{method:'POST',body:JSON.stringify(data)});const enriched={...data,...item,order_number:item.order_number||makeReceiptNumber('ORD'),sn:item.sn||makeReceiptNumber('SN')};saveReceipt(enriched);return enriched}catch(error){if(!isUser()||!/Koneksi|terlalu lama|Failed to fetch/i.test(error.message))throw error}}const item={...data,id:`LOCAL-${Date.now()}`,order_number:makeReceiptNumber('ORD'),sn:makeReceiptNumber('SN'),status:'Berhasil',created_at:new Date().toISOString()};localStorage.setItem(key(),JSON.stringify([item,...localList()]));saveReceipt(item);return item}
export async function payWithBalance(data){return request('/me/payments',{method:'POST',body:JSON.stringify(data)})}
