import {request} from './http'

const ACCOUNTS_KEY='kuotakita_local_accounts'
const connectionError=error=>/Koneksi KuotaKita gagal|terlalu lama|Failed to fetch/i.test(error?.message||'')
const readAccounts=()=>{try{return JSON.parse(localStorage.getItem(ACCOUNTS_KEY))||[]}catch{return[]}}
const hash=async value=>Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(value)))).map(byte=>byte.toString(16).padStart(2,'0')).join('')
const result=user=>({token:`offline.${btoa(user.id)}`,offline:true,user})

const demo={
  octa11:{id:'USR-001',username:'octa',name:'Octa User',role:'user',balance:275000,phone:'081234567890',email:'user@kuotakita.id'},
  octa22:{id:'MST-001',username:'octa',name:'Octa Master',role:'master',balance:25000000,phone:'081234567890',email:'master@kuotakita.id'},
  octa33:{id:'ADM-001',username:'octa',name:'Octa Admin',role:'admin',balance:8500000,phone:'081234567890',email:'admin@kuotakita.id'}
}

export async function login(credentials){
  const demoUsername=credentials.username.toLowerCase().trim()
  if(demoUsername==='octa'&&demo[credentials.password])return result(demo[credentials.password])
  // Akun yang dibuat marketing (termasuk agent baru) harus bisa masuk
  // sebelum mencoba API demo/hardcoded yang belum mengenal akun tersebut.
  const username=credentials.username.toLowerCase().trim(),passwordHash=await hash(credentials.password)
  const local=readAccounts().find(account=>(account.username===username||account.phone===username||account.email===username)&&account.passwordHash===passwordHash)
  if(local){const{passwordHash:_,...user}=local;void _;return result(user)}
  try{return await request('/auth/login',{method:'POST',body:JSON.stringify(credentials)})}
  catch(error){
    if(!connectionError(error))throw error
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
    const user={id:`LOCAL-${crypto.randomUUID()}`,username,name:profile.name.trim(),phone:profile.phone.trim(),email:(profile.email||'').toLowerCase().trim(),role:'user',balance:0}
    accounts.push({...user,passwordHash:await hash(profile.password)})
    localStorage.setItem(ACCOUNTS_KEY,JSON.stringify(accounts))
    return result(user)
  }
}

// Dipakai marketing untuk membuat kredensial agent dari panel internal.
// Akun disimpan dengan hash password dan tidak pernah menyimpan password mentah.
export async function createManagedAgent(profile){
  const name=String(profile.name||'').trim(),username=String(profile.username||'').toLowerCase().trim(),phone=String(profile.phone||'').trim(),email=String(profile.email||'').toLowerCase().trim(),password=String(profile.password||'')
  if(name.length<3||username.length<3||password.length<6)throw new Error('Nama, username, dan password minimal harus diisi dengan benar.')
  try{return await request('/auth/agents',{method:'POST',body:JSON.stringify({name,username,phone,email,password})})}
  catch(error){
    if(!connectionError(error))throw error
  }
  // Fallback hanya saat perangkat benar-benar offline. Saat server aktif, akun
  // selalu dibuat di server agar agent dapat masuk dari perangkat mana pun.
  const accounts=readAccounts()
  if(accounts.some(account=>account.username===username))throw new Error('Username agent sudah digunakan di perangkat ini.')
  const user={id:`AGENT-${crypto.randomUUID()}`,username,name,role:'agent',balance:0,phone,email}
  accounts.push({...user,passwordHash:await hash(password),createdBy:'marketing',createdAt:new Date().toISOString()})
  localStorage.setItem(ACCOUNTS_KEY,JSON.stringify(accounts))
  return user
}

export async function resetPassword(profile){
  const identity=(profile.identity||profile.username||'').toLowerCase().trim()
  if(!identity||profile.password?.length<6)throw new Error('Isi akun dan kata sandi baru minimal 6 karakter.')
  try{return await request('/auth/reset-password',{method:'POST',body:JSON.stringify({identity,password:profile.password})})}
  catch(error){
    if(!connectionError(error))throw error
    const accounts=readAccounts()
    const index=accounts.findIndex(account=>account.username===identity||account.phone===identity||account.email===identity)
    if(index<0)throw new Error('Akun belum ditemukan di perangkat ini. Pastikan username, nomor HP, atau email benar.',{cause:error})
    accounts[index]={...accounts[index],passwordHash:await hash(profile.password)}
    localStorage.setItem(ACCOUNTS_KEY,JSON.stringify(accounts))
    return {message:'Kata sandi berhasil diperbarui. Silakan masuk kembali.'}
  }
}

export const googleLogin=()=>{
  const apiURL=import.meta.env.VITE_API_URL||'/api/v1'
  const target=new URL(`${apiURL}/auth/google`,window.location.origin)
  target.searchParams.set('return_to','/app')
  window.location.assign(target.toString())
}
