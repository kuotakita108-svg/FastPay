import test from 'node:test'
import assert from 'node:assert/strict'
import {pdamBillDetails} from './pdamBill.js'

test('shows only fee and bill fields supplied by the provider',()=>{
  const details=pdamBillDetails({amount:27600,customer_name:'KERY SUMADI',data:{data:{periode_tagihan:'Agustus 2026',tagihan_pokok:25100,biaya_admin:2500,denda:0}}})
  assert.deepEqual(details,{customer:'KERY SUMADI',period:'Agustus 2026',water:25100,admin:2500,penalty:0,total:27600})
})

test('does not invent an admin fee from total or catalogue price',()=>{
  const details=pdamBillDetails({amount:27600,data:{data:{harga:1000}}})
  assert.equal(details.total,27600)
  assert.equal(details.water,null)
  assert.equal(details.admin,null)
  assert.equal(details.penalty,null)
})
