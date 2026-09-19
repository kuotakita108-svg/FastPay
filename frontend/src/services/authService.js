import {request} from './http'
import {canonicalRole} from '../utils/role'

function normalizeAuth(result,{requireToken=true}={}){
  const payload=result?.data??result
  const source=payload?.user??payload
  const token=payload?.token??result?.token??''
  if(!source||typeof source!=='object')throw new Error('Respons login server tidak lengkap.')
  if(requireToken&&!token)throw new Error('Token login tidak diterima dari server.')
  const {token:_ignoredToken,...rawUser}=source
  return {token,user:{...rawUser,role:canonicalRole(rawUser.role)}}
}

export async function login(credentials){
  return normalizeAuth(await request('/auth/login',{method:'POST',body:JSON.stringify(credentials)}))
}

export async function register(profile){
  return normalizeAuth(await request('/auth/register',{method:'POST',body:JSON.stringify(profile)}),{requireToken:false})
}

// Account data is always read from the backend so a browser's old session
// cannot display a demo/stale balance after the app has moved to the server.
export async function currentUser(){
  return request('/me')
}

export async function updateProfile(profile){
  return request('/me',{method:'PATCH',body:JSON.stringify(profile)})
}

// Dipakai marketing untuk membuat kredensial agent dari panel internal.
// Akun disimpan dengan hash password dan tidak pernah menyimpan password mentah.
export async function createManagedAgent(profile){
  const name=String(profile.name||'').trim(),username=String(profile.username||'').toLowerCase().trim(),phone=String(profile.phone||'').trim(),email=String(profile.email||'').toLowerCase().trim(),password=String(profile.password||'')
  const store_name=String(profile.store_name||'').trim()
  if(name.length<3||username.length<3||phone.length<10||password.length<6||store_name.length<2)throw new Error('Lengkapi identitas, toko, WhatsApp, username, dan password agent.')
  return request('/credit/agents',{method:'POST',body:JSON.stringify({name,username,phone,email,password,store_name})})
}

export async function listManagedAgents(){
  return request('/retail/network')
}

export async function updateAgentFollowUp(id,status,note=''){
  return request(`/auth/agents/${encodeURIComponent(id)}/follow-up`,{method:'PATCH',body:JSON.stringify({status,note})})
}

export async function createManagedDownline(profile){
  const name=String(profile.name||'').trim(),email=String(profile.email||'').toLowerCase().trim(),password=String(profile.password||''),account_type=String(profile.role||'user').toLowerCase()
  if(name.length<3||!email.includes('@')||password.length<6||!['user','agent'].includes(account_type))throw new Error('Lengkapi nama, email, role, dan password minimal 6 karakter.')
  return request('/auth/downlines',{method:'POST',body:JSON.stringify({name,email,password,account_type})})
}

export async function listManagedDownlines(){
  return request('/auth/downlines',{noCache:true})
}

export async function createManagedMarketing(profile){
  const name=String(profile.name||'').trim(),username=String(profile.username||'').toLowerCase().trim(),phone=String(profile.phone||'').trim(),email=String(profile.email||'').toLowerCase().trim(),password=String(profile.password||'')
  if(name.length<3||username.length<3||phone.length<10||password.length<6)throw new Error('Lengkapi nama, WhatsApp, username, dan password marketing minimal 6 karakter.')
  return request('/operator/marketing',{method:'POST',body:JSON.stringify({name,username,phone,email,password})})
}

export async function resetPassword(profile){
  const identity=(profile.identity||profile.username||'').toLowerCase().trim()
  if(!identity||profile.password?.length<6)throw new Error('Isi akun dan kata sandi baru minimal 6 karakter.')
  return request('/auth/reset-password',{method:'POST',body:JSON.stringify({identity,password:profile.password})})
}

let googleScriptPromise
function loadGoogleIdentity(){
  if(globalThis.google?.accounts?.id)return Promise.resolve(globalThis.google)
  if(!googleScriptPromise)googleScriptPromise=new Promise((resolve,reject)=>{
    const script=document.createElement('script')
    script.src='https://accounts.google.com/gsi/client'
    script.async=true
    script.defer=true
    script.dataset.kuotakitaGoogle='true'
    script.onload=()=>resolve(globalThis.google)
    script.onerror=()=>reject(new Error('Google Login gagal dimuat.'))
    document.head.appendChild(script)
  })
  return googleScriptPromise
}

export async function googleLogin(){
  const clientId=import.meta.env.VITE_GOOGLE_CLIENT_ID
  if(!clientId)throw new Error('Google Client ID belum dikonfigurasi.')
  const google=await loadGoogleIdentity()
  const credential=await new Promise((resolve,reject)=>{
    let settled=false
    google.accounts.id.initialize({client_id:clientId,callback:response=>{
      if(settled)return
      settled=true
      if(response?.credential)resolve(response.credential)
      else reject(new Error('Credential Google tidak diterima.'))
    }})
    google.accounts.id.prompt(notification=>{
      if(settled)return
      if(notification.isNotDisplayed?.()||notification.isSkippedMoment?.()){
        settled=true
        reject(new Error('Jendela Google Login tidak dapat ditampilkan. Izinkan pop-up/cookie lalu coba lagi.'))
      }
    })
  })
  return normalizeAuth(await request('/auth/google',{method:'POST',body:JSON.stringify({credential})}))
}
