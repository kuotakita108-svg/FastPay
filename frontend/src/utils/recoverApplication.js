const RECOVERY_KEY='kuotakita_asset_recovery'

export async function recoverApplication({automatic=false}={}){
  const last=Number(sessionStorage.getItem(RECOVERY_KEY)||0)
  if(automatic&&Date.now()-last<30000)return false
  sessionStorage.setItem(RECOVERY_KEY,String(Date.now()))
  try{
    if('caches' in window)await Promise.all((await caches.keys()).map(key=>caches.delete(key)))
    if('serviceWorker' in navigator)await Promise.all((await navigator.serviceWorker.getRegistrations()).map(registration=>registration.unregister()))
  }catch{
    // Reload tetap dilakukan meskipun browser membatasi API cache tertentu.
  }
  window.location.reload()
  return true
}

export function clearRecoveryMarker(){
  const last=Number(sessionStorage.getItem(RECOVERY_KEY)||0)
  if(last&&Date.now()-last>10000)sessionStorage.removeItem(RECOVERY_KEY)
}
