const bytes=value=>Array.from(new Uint8Array(value))
const encode=value=>btoa(String.fromCharCode(...new Uint8Array(value)))
const decode=value=>Uint8Array.from(atob(value),character=>character.charCodeAt(0))
const key=userId=>`kuotakita_security_${userId}`

export const getSecurity=userId=>{try{return JSON.parse(localStorage.getItem(key(userId)))||{}}catch{return{}}}
const save=(userId,value)=>{localStorage.setItem(key(userId),JSON.stringify(value));return value}
const digest=async value=>encode(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(value)))
export const setPin=async(userId,pin)=>save(userId,{...getSecurity(userId),pinHash:await digest(pin),updatedAt:new Date().toISOString()})
export const verifyPin=async(userId,pin)=>(await digest(pin))===getSecurity(userId).pinHash
export const removePin=userId=>{const value=getSecurity(userId);delete value.pinHash;return save(userId,value)}
export const biometricAvailable=()=>Boolean(window.PublicKeyCredential&&navigator.credentials)
export async function enableBiometric(userId,userName){
 if(!biometricAvailable())throw new Error('Sidik jari tidak didukung pada perangkat atau browser ini.')
 const challenge=crypto.getRandomValues(new Uint8Array(32)),userHandle=crypto.getRandomValues(new Uint8Array(16))
 const credential=await navigator.credentials.create({publicKey:{challenge,rp:{name:'KuotaKita'},user:{id:userHandle,name:userName,displayName:userName},pubKeyCredParams:[{type:'public-key',alg:-7},{type:'public-key',alg:-257}],authenticatorSelection:{authenticatorAttachment:'platform',userVerification:'required',residentKey:'preferred'},timeout:60000,attestation:'none'}})
 if(!credential)throw new Error('Pendaftaran sidik jari dibatalkan.')
 return save(userId,{...getSecurity(userId),biometricId:encode(credential.rawId),biometricEnabled:true,updatedAt:new Date().toISOString()})
}
export const disableBiometric=userId=>save(userId,{...getSecurity(userId),biometricId:'',biometricEnabled:false})
export async function verifyBiometric(userId){
 const settings=getSecurity(userId);if(!settings.biometricEnabled||!settings.biometricId)throw new Error('Sidik jari belum diaktifkan.')
 const assertion=await navigator.credentials.get({publicKey:{challenge:crypto.getRandomValues(new Uint8Array(32)),allowCredentials:[{id:decode(settings.biometricId),type:'public-key',transports:['internal']}],userVerification:'required',timeout:60000}})
 return Boolean(assertion&&bytes(assertion.rawId).length)
}
