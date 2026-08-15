import {useDeferredValue, useEffect, useMemo, useState} from 'react'
import {Boxes, ChevronLeft, ChevronRight, Search} from 'lucide-react'
import PageHeader from '../components/common/PageHeader'
import LoadingState from '../components/common/LoadingState'
import ErrorState from '../components/common/ErrorState'
import {useAsync} from '../hooks/useAsync'
import {getProducts} from '../services/productService'
import {rupiah} from '../utils/currency'

const PAGE_SIZE = 30
const text = value => String(value || '').trim()

export default function ProductsPage() {
  const {data = [], loading, error, reload} = useAsync(getProducts)
  const products = Array.isArray(data) ? data : []
  const [query, setQuery] = useState('')
  const [service, setService] = useState('')
  const [operator, setOperator] = useState('')
  const [page, setPage] = useState(1)
  const deferredQuery = useDeferredValue(query.toLowerCase())

  const services = useMemo(() => [...new Set(products.map(item => text(item.category)).filter(Boolean))].sort((a, b) => a.localeCompare(b, 'id')), [products])
  const operators = useMemo(() => [...new Set(products.filter(item => !service || text(item.category) === service).map(item => text(item.operator)).filter(Boolean))].sort((a, b) => a.localeCompare(b, 'id')), [products, service])
  const items = useMemo(() => products
    .filter(item => (!service || text(item.category) === service) && (!operator || text(item.operator) === operator))
    .filter(item => !deferredQuery || `${text(item.name)} ${text(item.operator)} ${text(item.category)}`.toLowerCase().includes(deferredQuery))
    .sort((a, b) => text(a.category).localeCompare(text(b.category), 'id') || text(a.operator).localeCompare(text(b.operator), 'id') || Number(a.price || 0) - Number(b.price || 0) || text(a.name).localeCompare(text(b.name), 'id')),
  [products, deferredQuery, operator, service])
  const pageCount = Math.max(1, Math.ceil(items.length / PAGE_SIZE))
  const visible = items.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  useEffect(() => setPage(1), [deferredQuery, operator, service])
  useEffect(() => { if (page > pageCount) setPage(pageCount) }, [page, pageCount])

  return <>
    <PageHeader eyebrow="Katalog" title="Produk & Harga" description="Katalog dikelompokkan berdasarkan layanan dan operator agar mudah dipantau."/>
    {loading ? <LoadingState/> : error ? <ErrorState message={error} onRetry={reload}/> : <section className="panel product-catalog-panel">
      <div className="product-catalog-tools">
        <label><Search/><input value={query} onChange={event => setQuery(event.target.value)} placeholder="Cari nama produk, operator, atau layanan..."/></label>
        <select value={service} onChange={event => {setService(event.target.value);setOperator('')}}><option value="">Semua layanan</option>{services.map(value => <option key={value}>{value}</option>)}</select>
        <select value={operator} onChange={event => setOperator(event.target.value)}><option value="">Semua operator</option>{operators.map(value => <option key={value}>{value}</option>)}</select>
      </div>
      <header className="product-catalog-summary"><div><span>HASIL KATALOG</span><b>{items.length} produk</b></div><small>Urutan: layanan, operator, lalu harga termurah</small></header>
      <div className="product-table"><div className="product-table-head"><span>Produk</span><span>Operator</span><span>Harga Agen</span><span>Harga Jual</span><span>Keuntungan</span><span>Stok</span></div>{visible.map(product => <div className="product-row" key={product.id}><span><i><Boxes/></i><b>{product.name}</b><small>{product.category}</small></span><span><em className={`operator-logo ${text(product.operator).toLowerCase()}`}>{text(product.operator).slice(0, 2)}</em>{product.operator}</span><strong>{rupiah(product.price)}</strong><strong>{rupiah(Number(product.price || 0) + 1500)}</strong><span className="profit">+{rupiah(1500)}</span><span className="stock">{product.stock} tersedia</span></div>)}{!visible.length && <p className="product-empty">Produk tidak ditemukan.</p>}</div>
      <footer className="product-pagination"><span>Halaman {page} dari {pageCount}</span><div><button disabled={page === 1} onClick={() => setPage(value => value - 1)}><ChevronLeft/>Sebelumnya</button><button disabled={page === pageCount} onClick={() => setPage(value => value + 1)}>Berikutnya<ChevronRight/></button></div></footer>
    </section>}
  </>
}
