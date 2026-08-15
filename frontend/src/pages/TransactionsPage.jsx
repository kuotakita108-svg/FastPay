import {useMemo,useState} from 'react'
import {useSearchParams,useOutletContext} from 'react-router-dom'
import {Plus,Search} from 'lucide-react'
import PageHeader from '../components/common/PageHeader'
import TransactionTable from '../components/transactions/TransactionTable'
import LoadingState from '../components/common/LoadingState'
import ErrorState from '../components/common/ErrorState'
import {useAsync} from '../hooks/useAsync'
import {getTransactions} from '../services/transactionService'
import {useAuth} from '../context/AuthContext'

export default function TransactionsPage(){
  const[params]=useSearchParams(),[query,setQuery]=useState(params.get('q')||''),[status,setStatus]=useState('')
  const{openPayment}=useOutletContext(),{user}=useAuth(),isOwner=user?.role==='master'
  const{data=[],loading,error,reload}=useAsync(getTransactions)
  const filtered=useMemo(()=>data?.filter(transaction=>(String(transaction.id||'').toLowerCase().includes(query.toLowerCase())||String(transaction.customer||'').toLowerCase().includes(query.toLowerCase()))&&(!status||transaction.status===status))||[],[data,query,status])
  return <><PageHeader eyebrow="Operasional" title="Seluruh Transaksi" description={isOwner?'Pantau transaksi seluruh aplikasi tanpa mengubah proses pembayaran.':'Kelola dan pantau seluruh pembayaran pelanggan.'} action={!isOwner&&<button className="primary-button" onClick={openPayment}><Plus size={17}/>Tambah Transaksi</button>}/>{loading?<LoadingState cards={2}/>:error?<ErrorState message={error} onRetry={reload}/>:<section className="panel"><div className="toolbar"><div><Search size={16}/><input value={query} onChange={event=>setQuery(event.target.value)} placeholder="Cari ID atau pelanggan..."/></div><select value={status} onChange={event=>setStatus(event.target.value)}><option value="">Semua status</option><option>Berhasil</option><option>Diproses</option><option>Gagal</option></select></div><TransactionTable items={filtered}/></section>}</>
}
