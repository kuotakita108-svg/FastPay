import {env} from '../config/env'

export async function request(path,options={}){
  let token=''
  try{token=JSON.parse(sessionStorage.getItem('kuotakita_session'))?.token||''}catch{/* belum login */}
  const url=new URL(`${env.apiURL}${path}`,window.location.origin).toString()
  const {timeoutMs=8000,...fetchOptions}=options
  const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),timeoutMs)
  try{
    const response=await fetch(url,{...fetchOptions,mode:'same-origin',cache:'no-store',credentials:'same-origin',redirect:'follow',signal:controller.signal,headers:{Accept:'application/json','Content-Type':fetchOptions.body?'text/plain;charset=UTF-8':'application/json',...(token?{Authorization:`Bearer ${token}`}:{}) ,...fetchOptions.headers}})
    const data=await response.json().catch(()=>null)
    if(!response.ok)throw new Error(data?.error||`Server tidak dapat memproses permintaan (${response.status})`)
    return data
  }catch(error){
    if(error.name==='AbortError')throw new Error('Koneksi ke server terlalu lama. Periksa internet lalu coba lagi.',{cause:error})
    if(error instanceof TypeError)throw new Error('Koneksi KuotaKita gagal. Muat ulang halaman lalu coba kembali.',{cause:error})
    throw error
  }finally{clearTimeout(timer)}
}
