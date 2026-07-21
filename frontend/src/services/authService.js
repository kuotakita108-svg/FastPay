import {request} from './http'

const ACCOUNTS_KEY='fastpay_local_accounts'
const connectionError=error=>/Koneksi FastPay gagal|terlalu lama|Failed to fetch/i.test(error?.message||'')
const readAccounts=()=>{try{return JSON.parse(localStorage.getItem(ACCOUNTS_KEY))||[]}catch{return[]}}
const hash=async value=>Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(value)))).map(byte=>byte.toString(16).padStart(2,'0')).join('')
const result=user=>({token:`offline.${btoa(user.id)}`,offline:true,user})

const demo={
  octa11:{id:'USR-001',username:'octa',name:'Octa User',role:'user',balance:275000,phone:'081234567890',email:'octa@gmail.com'},
  octa22:{id:'MST-001',username:'octa',name:'Octa Master',role:'master',balance:25000000,phone:'081234567890',email:'master@fastpay.id'},
  octa33:{id:'ADM-001',username:'octa',name:'Octa Admin',role:'admin',balance:8500000,phone:'081234567890',email:'admin@fastpay.id'}
}

export async function login(credentials){
  const demoUsername=credentials.username.toLowerCase().trim()
  if(demoUsername==='octa'&&demo[credentials.password])return result(demo[credentials.password])
  try{return await request('/auth/login',{method:'POST',body:JSON.stringify(credentials)})}
  catch(error){
    if(!connectionError(error))throw error
    const username=credentials.username.toLowerCase().trim(),passwordHash=await hash(credentials.password)
    const local=readAccounts().find(account=>account.username===username&&account.passwordHash===passwordHash)
    if(local){const{passwordHash:_,...user}=local;void _;return result(user)}
    if(username==='octa'&&demo[credentials.password])return result(demo[credentials.password])
    throw new Error('Akun belum tersimpan di perangkat ini. Daftar akun terlebih dahulu.',{cause:error})
  }
}

export async function register(profile){
  try{return await request('/auth/register',{method:'POST',body:JSON.stringify(profile)})}
  catch(error){
    if(!connectionError(error))throw error
    const accounts=readAccounts(),username=profile.username.toLowerCase().trim()
    if(accounts.some(account=>account.username===username))throw new Error('Username sudah digunakan di perangkat ini.',{cause:error})
    const user={id:`LOCAL-${crypto.randomUUID()}`,username,name:profile.name.trim(),phone:profile.phone.trim(),email:profile.email.toLowerCase().trim(),role:'user',balance:0}
    accounts.push({...user,passwordHash:await hash(profile.password)})
    localStorage.setItem(ACCOUNTS_KEY,JSON.stringify(accounts))
    return result(user)
  }
}

export const googleLogin=()=>{
  const apiURL=import.meta.env.VITE_API_URL||'/api/v1'
  const target=new URL(`${apiURL}/auth/google`,window.location.origin)
  target.searchParams.set('return_to','/app')
  window.location.assign(target.toString())
}
