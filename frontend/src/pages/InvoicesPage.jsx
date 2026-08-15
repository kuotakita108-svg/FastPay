import {ReceiptText} from 'lucide-react'
import PageHeader from '../components/common/PageHeader'
import LoadingState from '../components/common/LoadingState'
import ErrorState from '../components/common/ErrorState'
import TransactionTable from '../components/transactions/TransactionTable'
import {useAsync} from '../hooks/useAsync'
import {getTransactions} from '../services/transactionService'

export default function InvoicesPage(){const{data=[],loading,error,reload}=useAsync(getTransactions);return <><PageHeader eyebrow="Audit Pembayaran" title="Invoice & Pembayaran" description="Arsip pembayaran yang dibuat otomatis oleh sistem KuotaKita."/>{loading?<LoadingState cards={2}/>:error?<ErrorState message={error} onRetry={reload}/>:<section className="panel owner-invoice-panel"><header><div><span>ARSIP OTOMATIS</span><h2>{data.length} invoice transaksi</h2><p>Invoice mengikuti transaksi server dan tidak dibuat manual oleh Super Admin.</p></div><ReceiptText/></header>{data.length?<TransactionTable items={data}/>:<div className="owner-monitor-empty"><ReceiptText/><b>Belum ada invoice transaksi</b><span>Data masuk otomatis setelah pengguna melakukan pembayaran.</span></div>}</section>}</>}
