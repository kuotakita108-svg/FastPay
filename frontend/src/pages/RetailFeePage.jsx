import {useEffect,useMemo,useState} from 'react'
import {ArrowDownToLine,Coins,RefreshCw,WalletCards} from 'lucide-react'
import SubPageHeader from '../components/mobile/SubPageHeader'
import MobileNav from '../components/mobile/MobileNav'
import {request} from '../services/http'
import {rupiah} from '../utils/currency'

const number=value=>Math.max(0,Number(value)||0)
const agentName=item=>item?.userName||item?.form?.agentName||'Agent binaan'
const feeValue=item=>number(item?.marketingCommission)
const feeStatus=item=>String(item?.marketingCommissionStatus||'tersedia').toLowerCase()
const feeDate=item=>item?.marketingCommissionAt||item?.updatedAt||item?.createdAt
const dateTime=value=>value?new Intl.DateTimeFormat('id-ID',{dateStyle:'medium',timeStyle:'short'}).format(new Date(value)):'-'

export default function RetailFeePage(){
  const [portfolio,setPortfolio]=useState([])
  const [loading,setLoading]=useState(true)
  const [error,setError]=useState('')
  const load=()=>{
    setLoading(true);setError('')
    request('/agent-credit/applications').then(data=>setPortfolio(Array.isArray(data)?data:[])).catch(requestError=>setError(requestError.message||'Data fee belum dapat dimuat.')).finally(()=>setLoading(false))
  }
  useEffect(load,[])
  const fees=useMemo(()=>portfolio.filter(item=>feeValue(item)>0).sort((a,b)=>new Date(feeDate(b))-new Date(feeDate(a))),[portfolio])
  const summary=useMemo(()=>fees.reduce((result,item)=>{
    const amount=feeValue(item),status=feeStatus(item)
    result.total+=amount
    if(status.includes('pending'))result.pending+=amount
    else if(status.includes('approved')||status.includes('ditarik')||status.includes('withdrawn'))result.approved+=amount
    else result.available+=amount
    return result
  },{total:0,available:0,pending:0,approved:0}),[fees])
  return <main className="mobile-app retail-fee-page">
    <SubPageHeader title="Fee Retail" description="Komisi dari agent binaanmu"/>
    <section className="retail-fee-hero"><i><Coins/></i><div><span>KOMISI KUOTAKITA</span><h1>Fee Retail</h1><p>Komisi yang sudah dibukukan server akan masuk ke saldo fee akunmu.</p></div></section>
    <section className="retail-fee-summary">
      <article className="total"><span>Total fee</span><strong>{rupiah(summary.total)}</strong></article>
      <article className="available"><span>Saldo tersedia</span><strong>{rupiah(summary.available)}</strong></article>
      <article className="pending"><span>Withdraw pending</span><strong>{rupiah(summary.pending)}</strong></article>
      <article className="approved"><span>Withdraw approved</span><strong>{rupiah(summary.approved)}</strong></article>
    </section>
    <section className="retail-fee-history">
      <header><div><h2>Riwayat Fee</h2><p>Komisi retail terbaru dari transaksi agent binaan.</p></div><button type="button" onClick={load} disabled={loading} aria-label="Muat ulang fee"><RefreshCw/></button></header>
      {loading&&<div className="retail-fee-empty"><span className="mutation-loader"/><strong>Memuat data fee...</strong></div>}
      {!loading&&error&&<div className="retail-fee-empty error"><RefreshCw/><strong>Data fee belum dapat dimuat</strong><small>{error}</small><button type="button" onClick={load}>Coba lagi</button></div>}
      {!loading&&!error&&fees.length===0&&<div className="retail-fee-empty"><WalletCards/><strong>Belum ada fee retail</strong><small>Saldo dan riwayat akan terisi otomatis setelah komisi resmi dibukukan oleh server KuotaKita.</small></div>}
      {!loading&&!error&&fees.map(item=><article className="retail-fee-row" key={item.id}>
        <i><Coins/></i><div><strong>{rupiah(feeValue(item))}</strong><b>{agentName(item)}</b><small>{item.id} · {dateTime(feeDate(item))}</small></div><span className={feeStatus(item)}>{item.marketingCommissionStatus||'Tersedia'}</span>
      </article>)}
    </section>
    <MobileNav/>
  </main>
}
