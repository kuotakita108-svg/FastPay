import {env} from '../config/env'
import {readTabSession} from '../utils/tabSession'

const responseCache=new Map()
const pendingRequests=new Map()
const GET_CACHE_TTL=30000

const wait=delay=>new Promise(resolve=>setTimeout(resolve,delay))

function clearReadCache(){responseCache.clear()}

async function fetchJSON(url,fetchOptions,token,timeoutMs){
  const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),timeoutMs)
  try{
    const response=await fetch(url,{...fetchOptions,mode:'same-origin',cache:'no-store',credentials:'same-origin',redirect:'follow',signal:controller.signal,headers:{Accept:'application/json','Content-Type':'application/json',...(token?{Authorization:`Bearer ${token}`}:{}) ,...fetchOptions.headers}})
    const data=await response.json().catch(()=>null)
    if(!response.ok){
      if(response.status===413)throw new Error('Berkas yang dikirim terlalu besar. Pilih foto yang lebih kecil lalu coba lagi.')
      throw new Error(data?.error||`Server tidak dapat memproses permintaan (${response.status})`)
    }
    return data
  }finally{clearTimeout(timer)}
}

export async function request(path,options={}){
  let token=''
  try{token=readTabSession()?.token||''}catch{/* belum login */}
  const url=new URL(`${env.apiURL}${path}`,window.location.origin).toString()
  const {timeoutMs=12000,noCache=false,...fetchOptions}=options
  const method=(fetchOptions.method||'GET').toUpperCase()
  const cacheKey=`${token}:${url}`
  if(method==='GET'&&!noCache){
    const cached=responseCache.get(cacheKey)
    if(cached&&Date.now()-cached.savedAt<GET_CACHE_TTL)return cached.data
    if(pendingRequests.has(cacheKey))return pendingRequests.get(cacheKey)
  }
  const execute=async()=>{
    const attempts=method==='GET'?2:1
    let lastError
    for(let attempt=0;attempt<attempts;attempt+=1){
      try{return await fetchJSON(url,fetchOptions,token,timeoutMs)}catch(error){
        lastError=error
        const transient=error.name==='AbortError'||error instanceof TypeError||/\(5\d\d\)/.test(error.message)
        if(!transient||attempt===attempts-1)throw error
        await wait(250)
      }
    }
    throw lastError
  }
  try{
    const pending=execute()
    if(method==='GET'&&!noCache)pendingRequests.set(cacheKey,pending)
    const data=await pending
    if(method==='GET'&&!noCache)responseCache.set(cacheKey,{data,savedAt:Date.now()})
    else clearReadCache()
    return data
  }catch(error){
    if(error.name==='AbortError')throw new Error('Koneksi ke server terlalu lama. Periksa internet lalu coba lagi.',{cause:error})
    if(error instanceof TypeError)throw new Error('Koneksi KuotaKita gagal. Muat ulang halaman lalu coba kembali.',{cause:error})
    throw error
  }finally{
    if(method==='GET')pendingRequests.delete(cacheKey)
  }
}
