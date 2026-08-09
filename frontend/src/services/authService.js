import {request} from './http'

export async function login(credentials){
  return request('/auth/login',{method:'POST',body:JSON.stringify(credentials)})
}

export async function register(profile){
  return request('/auth/register',{method:'POST',body:JSON.stringify(profile)})
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
  const store_name=String(profile.store_name||'').trim(),province=String(profile.province||'').trim(),city=String(profile.city||'').trim(),district=String(profile.district||'').trim()
  if(name.length<3||username.length<3||phone.length<10||password.length<6||store_name.length<2||!province||!city||!district)throw new Error('Lengkapi identitas, toko, wilayah, WhatsApp, username, dan password agent.')
  return request('/auth/agents',{method:'POST',body:JSON.stringify({name,username,phone,email,password,store_name,province,city,district})})
}

export async function resetPassword(profile){
  const identity=(profile.identity||profile.username||'').toLowerCase().trim()
  if(!identity||profile.password?.length<6)throw new Error('Isi akun dan kata sandi baru minimal 6 karakter.')
  return request('/auth/reset-password',{method:'POST',body:JSON.stringify({identity,password:profile.password})})
}

export const googleLogin=()=>{
  const apiURL=import.meta.env.VITE_API_URL||'/api/v1'
  const target=new URL(`${apiURL}/auth/google`,window.location.origin)
  target.searchParams.set('return_to','/app')
  window.location.assign(target.toString())
}
