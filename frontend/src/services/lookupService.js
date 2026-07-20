import {request} from './http';export const lookupCustomer=data=>request('/services/lookup',{method:'POST',body:JSON.stringify(data)});
