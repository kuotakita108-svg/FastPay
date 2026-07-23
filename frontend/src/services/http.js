import {env} from '../config/env'

export async function request(path,options={}){
  let token=''
  try{token=JSON.parse(localStorage.getItem('pulsaprime_session'))?.token||''}catch{/* belum login */}
  const url=new URL(`${env.apiURL}${path}`,window.location.origin).toString()
  const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),8000)
  try{
    const response=await fetch(url,{...options,mode:'same-origin',cache:'no-store',credentials:'same-origin',redirect:'follow',signal:controller.signal,headers:{Accept:'application/json','Content-Type':options.body?'text/plain;charset=UTF-8':'application/json',...(token?{Authorization:`Bearer ${token}`}:{}) ,...options.headers}})
    const data=await response.json().catch(()=>null)
    if(!response.ok)throw new Error(data?.error||`Server tidak dapat memproses permintaan (${response.status})`)
    return data
  }catch(error){
    if(error.name==='AbortError')throw new Error('Koneksi ke server terlalu lama. Periksa internet lalu coba lagi.',{cause:error})
    if(error instanceof TypeError)throw new Error('Koneksi PulsaPrime gagal. Muat ulang halaman lalu coba kembali.',{cause:error})
    throw error
  }finally{clearTimeout(timer)}
}
