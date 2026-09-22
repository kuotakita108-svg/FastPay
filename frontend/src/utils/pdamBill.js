const firstValue=(rows,keys)=>{
  for(const row of rows){
    if(!row||typeof row!=='object'||Array.isArray(row))continue
    for(const key of keys){
      const value=row[key]
      if(value!==undefined&&value!==null&&value!=='')return value
    }
  }
  return null
}

const money=value=>{
  if(value===null||value===undefined||value==='')return null
  if(typeof value==='number')return Number.isFinite(value)&&value>=0?value:null
  const digits=String(value).replace(/[^\d-]/g,'')
  if(!digits)return null
  const amount=Number(digits)
  return Number.isSafeInteger(amount)&&amount>=0?amount:null
}

// Only expose fields actually returned by Pulsa24Jam. In particular the
// catalogue's fixed SKU price is not the customer's PDAM administration fee.
export function pdamBillDetails(inquiry){
  const raw=inquiry?.data||{}
  const rows=[inquiry,raw,raw.data,raw.transaksi_member,raw.inquiry,raw.detail,raw.tagihan]
  return {
    customer:firstValue(rows,['customer_name','nama_pelanggan','customerName','customer','nama','name']),
    period:firstValue(rows,['periode_tagihan','periode','billing_period','period','bulan_tagihan','bulan']),
    water:money(firstValue(rows,['tagihan_pokok','harga_air','bill_amount','pokok'])),
    admin:money(firstValue(rows,['biaya_admin','admin_fee','biaya_administrasi','administrasi','admin'])),
    penalty:money(firstValue(rows,['denda','penalty','late_fee'])),
    total:money(inquiry?.amount),
  }
}
