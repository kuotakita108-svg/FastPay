import {request} from './http'

export const getProducts=service=>request(`/products${service?`?service=${encodeURIComponent(service)}`:''}`)
