import {request} from './http'
export const getCustomers=()=>request('/auth/accounts')
export const setAccountAccess=(id,suspended)=>request(`/auth/accounts/${id}/access`,{method:'PATCH',body:JSON.stringify({suspended})})
export const deleteAccount=id=>request(`/auth/accounts/${id}`,{method:'DELETE'})
