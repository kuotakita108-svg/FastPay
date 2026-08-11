const base='https://wilayah.id/api'
const cache=new Map()

async function load(path){
  if(cache.has(path))return cache.get(path)
  const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),8000)
  try{
    const response=await fetch(`${base}/${path}`,{signal:controller.signal,cache:'force-cache'})
    if(!response.ok)throw new Error('Data wilayah tidak tersedia')
    const payload=await response.json()
    const rows=(payload?.data||[]).map(row=>({id:row.code,name:row.name}))
    if(!Array.isArray(rows))throw new Error('Format data wilayah tidak valid')
    cache.set(path,rows)
    return rows
  }catch(error){
    if(error.name==='AbortError')throw new Error('Data wilayah terlalu lama dimuat. Coba lagi.')
    throw new Error('Data wilayah Indonesia gagal dimuat. Periksa internet lalu coba lagi.')
  }finally{clearTimeout(timer)}
}

export const getProvinces=()=>load('provinces.json')
export const getRegencies=provinceId=>load(`regencies/${encodeURIComponent(provinceId)}.json`)
export const getDistricts=regencyId=>load(`districts/${encodeURIComponent(regencyId)}.json`)
