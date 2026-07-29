import {request} from './http'

export async function login(credentials){
  return request('/auth/login',{method:'POST',body:JSON.stringify(credentials)})
}

export async function register(profile){
  return request('/auth/register',{method:'POST',body:JSON.stringify(profile)})
}

// Dipakai marketing untuk membuat kredensial agent dari panel internal.
// Akun disimpan dengan hash password dan tidak pernah menyimpan password mentah.
export async function createManagedAgent(profile){
  const name=String(profile.name||'').trim(),username=String(profile.username||'').toLowerCase().trim(),phone=String(profile.phone||'').trim(),email=String(profile.email||'').toLowerCase().trim(),password=String(profile.password||'')
  if(name.length<3||username.length<3||password.length<6)throw new Error('Nama, username, dan password minimal harus diisi dengan benar.')
  return request('/auth/agents',{method:'POST',body:JSON.stringify({name,username,phone,email,password})})
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
