import {useDeferredValue,useEffect,useMemo,useState} from 'react'
import LoadingState from '../components/common/LoadingState'
import ErrorState from '../components/common/ErrorState'
import {useAsync} from '../hooks/useAsync'
import {getProducts} from '../services/productService'

const value=(item,...keys)=>keys.map(key=>item?.[key]).find(entry=>entry!==undefined&&entry!==null&&String(entry).trim()!=='')
const text=input=>String(input??'').trim()
const active=item=>item?.active!==false&&!['inactive','off','disabled','nonaktif'].includes(text(item?.status).toLowerCase())

export default function ProductsPage(){
  const {data=[],loading,error,reload}=useAsync(getProducts)
  const products=useMemo(()=>Array.isArray(data)?data:[],[data])
  const [query,setQuery]=useState(''),[sku,setSku]=useState(''),[group,setGroup]=useState(''),[category,setCategory]=useState(''),[brand,setBrand]=useState(''),[limit,setLimit]=useState(10),[page,setPage]=useState(1),[detail,setDetail]=useState(null)
  const deferredQuery=useDeferredValue(query.toLowerCase()),deferredSku=useDeferredValue(sku.toLowerCase())
  const groups=useMemo(()=>unique(products.map(item=>text(value(item,'group','service')))),[products])
  const categories=useMemo(()=>unique(products.map(item=>text(value(item,'category','service')))),[products])
  const brands=useMemo(()=>unique(products.map(item=>text(value(item,'brand','operator','provider')))),[products])
  const filtered=useMemo(()=>products.filter(item=>{const itemGroup=text(value(item,'group','service')),itemCategory=text(value(item,'category','service')),itemBrand=text(value(item,'brand','operator','provider'));return (!deferredQuery||text(value(item,'name','product_name')).toLowerCase().includes(deferredQuery))&&(!deferredSku||text(value(item,'sku','code')).toLowerCase().includes(deferredSku))&&(!group||itemGroup===group)&&(!category||itemCategory===category)&&(!brand||itemBrand===brand)}),[products,deferredQuery,deferredSku,group,category,brand])
  const pageCount=Math.max(1,Math.ceil(filtered.length/limit)),visible=filtered.slice((page-1)*limit,page*limit)
  useEffect(()=>setPage(1),[deferredQuery,deferredSku,group,category,brand,limit])
  useEffect(()=>{if(page>pageCount)setPage(pageCount)},[page,pageCount])
  const reset=()=>{setQuery('');setSku('');setGroup('');setCategory('');setBrand('');setLimit(10)}
  return <main className="master-products">
    <header className="master-products-title"><div><h1>Master Produk</h1><p>Kelola produk internal, brand produk, dan status aktif produk. Harga retail mengikuti harga sistem ditambah fee sesuai tier.</p></div><div><button type="button" onClick={reload}>Refresh</button><button type="button" className="primary" disabled title="Endpoint penambahan produk belum tersedia">Tambah Produk</button></div></header>
    {loading?<LoadingState/>:error?<ErrorState message={error} onRetry={reload}/>:<>
      <section className="master-products-filters">
        <label><span>Cari Produk</span><input value={query} onChange={event=>setQuery(event.target.value)} placeholder="Cari SKU / nama produk"/></label>
        <label><span>SKU / Kode Produk</span><input value={sku} onChange={event=>setSku(event.target.value)} placeholder="Contoh: AXM10"/></label>
        <label><span>Filter Grup</span><select value={group} onChange={event=>setGroup(event.target.value)}><option value="">Semua grup</option>{groups.map(option=><option key={option}>{option}</option>)}</select></label>
        <label><span>Filter Kategori</span><select value={category} onChange={event=>setCategory(event.target.value)}><option value="">Semua kategori</option>{categories.map(option=><option key={option}>{option}</option>)}</select></label>
        <label><span>Filter Brand</span><select value={brand} onChange={event=>setBrand(event.target.value)}><option value="">Semua brand</option>{brands.map(option=><option key={option}>{option}</option>)}</select></label>
        <label><span>Limit</span><select value={limit} onChange={event=>setLimit(Number(event.target.value))}>{[10,25,50,100].map(option=><option key={option}>{option}</option>)}</select></label>
        <div className="master-products-filter-actions"><button className="primary" type="button" onClick={()=>setPage(1)}>Cari</button><button type="button" onClick={reset}>Reset</button></div>
      </section>
      <section className="master-products-table"><div className="head"><span>No</span><span>ID</span><span>SKU</span><span>Nama</span><span>Grup</span><span>Kategori</span><span>Brand</span><span>Tipe</span><span>Nominal</span><span>Maksimal</span><span>Jam Online</span><span>Status</span><span>Aksi</span></div>
        {visible.map((item,index)=><article key={item.id||item.sku||index}><span>{(page-1)*limit+index+1}</span><span>{value(item,'id','ID')??'-'}</span><code>{value(item,'sku','code')||'-'}</code><b>{value(item,'name','product_name')||'-'}</b><span>{value(item,'group','service')||'-'}</span><span>{value(item,'category')||'-'}</span><span>{value(item,'brand','operator','provider')||'-'}</span><span>{value(item,'type','status')||'-'}</span><span>{formatNumber(value(item,'nominal'))}</span><span>{formatNumber(value(item,'maximum','maximal','max'))}</span><span>{value(item,'online_hours','jam_online')||'-'}</span><em className={active(item)?'active':'inactive'}>{active(item)?'Aktif':'Nonaktif'}</em><button type="button" onClick={()=>setDetail(item)}>Lihat</button></article>)}
        {!visible.length&&<p className="empty">Produk tidak ditemukan untuk filter ini.</p>}
      </section>
      <footer className="master-products-pagination"><span>Total {filtered.length.toLocaleString('id-ID')} data, halaman {page} / {pageCount}</span><div><button disabled={page===1} onClick={()=>setPage(1)}>«</button><button disabled={page===1} onClick={()=>setPage(v=>v-1)}>‹</button>{pageNumbers(page,pageCount).map(number=><button className={number===page?'active':''} key={number} onClick={()=>setPage(number)}>{number}</button>)}<button disabled={page===pageCount} onClick={()=>setPage(v=>v+1)}>›</button><button disabled={page===pageCount} onClick={()=>setPage(pageCount)}>»</button></div></footer>
    </>}
    {detail&&<div className="master-product-modal" role="dialog" aria-modal="true" onClick={()=>setDetail(null)}><article onClick={event=>event.stopPropagation()}><header><div><span>DETAIL PRODUK</span><h2>{detail.name}</h2></div><button onClick={()=>setDetail(null)}>Tutup</button></header><dl><div><dt>ID</dt><dd>{detail.id||'-'}</dd></div><div><dt>SKU</dt><dd>{detail.sku||'-'}</dd></div><div><dt>Grup</dt><dd>{detail.group||detail.service||'-'}</dd></div><div><dt>Kategori</dt><dd>{detail.category||'-'}</dd></div><div><dt>Brand</dt><dd>{detail.brand||detail.operator||'-'}</dd></div><div><dt>Status</dt><dd>{active(detail)?'Aktif':'Nonaktif'}</dd></div></dl></article></div>}
  </main>
}

function unique(list){return [...new Set(list.filter(Boolean))].sort((a,b)=>a.localeCompare(b,'id'))}
function formatNumber(input){const number=Number(input);return Number.isFinite(number)&&number>0?number.toLocaleString('id-ID'):'-'}
function pageNumbers(page,count){const start=Math.max(1,Math.min(page-1,count-2));return Array.from({length:Math.min(3,count)},(_,index)=>start+index)}
