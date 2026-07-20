import {request} from './http'
const session=()=>{try{return JSON.parse(localStorage.getItem('fastpay_session'))}catch{return null}}
const key=()=>`fastpay_transactions_${session()?.user?.id||'guest'}`
const localList=()=>{try{return JSON.parse(localStorage.getItem(key()))||[]}catch{return[]}}
const isUser=()=>session()?.user?.role==='user'
const path=()=>isUser()?'/me/transactions':'/transactions'
export async function getTransactions(){if(session()?.offline)return localList();try{return await request(path())}catch(error){if(isUser()&&/Koneksi|terlalu lama|Failed to fetch/i.test(error.message))return localList();throw error}}
export async function createTransaction(data){if(!session()?.offline){try{return await request(path(),{method:'POST',body:JSON.stringify(data)})}catch(error){if(!isUser()||!/Koneksi|terlalu lama|Failed to fetch/i.test(error.message))throw error}}const item={...data,id:`LOCAL-${Date.now()}`,status:'Berhasil',created_at:new Date().toISOString()};localStorage.setItem(key(),JSON.stringify([item,...localList()]));return item}
