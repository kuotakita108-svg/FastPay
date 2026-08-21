import {useEffect,useMemo,useState} from 'react'
import {ArrowDownToLine,Building2,Clock3,Landmark,RefreshCw,WalletCards} from 'lucide-react'
import SubPageHeader from '../components/mobile/SubPageHeader'
import MobileNav from '../components/mobile/MobileNav'
import {request} from '../services/http'
import {rupiah} from '../utils/currency'

const number=value=>Math.max(0,Number(value)||0)
const feeValue=item=>number(item?.marketingCommission)
const feeStatus=item=>String(item?.marketingCommissionStatus||'tersedia').toLowerCase()
const withdrawId=item=>String(item?.marketingWithdrawalId||'').trim()
const withdrawDate=item=>item?.marketingWithdrawalAt||item?.updatedAt||item?.createdAt
const formatDate=value=>value?new Intl.DateTimeFormat('id-ID',{dateStyle:'medium',timeStyle:'short'}).format(new Date(value)):'-'

export default function RetailFeeWithdrawPage(){
  const [portfolio,setPortfolio]=useState([])
  const [loading,setLoading]=useState(true)
  const [error,setError]=useState('')
  const [notice,setNotice]=useState('')
  const load=()=>{
    setLoading(true);setError('')
    request('/agent-credit/applications',{noCache:true}).then(data=>setPortfolio(Array.isArray(data)?data:[])).catch(requestError=>setError(requestError.message||'Data withdraw belum dapat dimuat.')).finally(()=>setLoading(false))
  }
  useEffect(load,[])
  const summary=useMemo(()=>portfolio.reduce((result,item)=>{
    const amount=feeValue(item),status=feeStatus(item)
    if(amount<=0)return result
    if(status.includes('pending'))result.pending+=amount
    else if(status.includes('approved')||status.includes('ditarik')||status.includes('withdrawn'))result.approved+=amount
    else result.available+=amount
    return result
  },{available:0,pending:0,approved:0}),[portfolio])
  const history=useMemo(()=>{
    const grouped=new Map()
    portfolio.forEach(item=>{
      const status=feeStatus(item)
      if(!withdrawId(item)&&!status.includes('pending')&&!status.includes('approved')&&!status.includes('ditarik')&&!status.includes('withdrawn'))return
      const id=withdrawId(item)||`fee-${item.id}`
      const current=grouped.get(id)||{id,amount:0,status:item.marketingCommissionStatus||'Pending',date:withdrawDate(item),bank:item.marketingWithdrawalBank||'',account:item.marketingWithdrawalAccount||''}
      current.amount+=feeValue(item)
      grouped.set(id,current)
    })
    return [...grouped.values()].sort((a,b)=>new Date(b.date)-new Date(a.date))
  },[portfolio])
  const requestWithdraw=()=>{
    if(summary.available<=0)return
    setNotice('Pengajuan withdraw akan dibuka setelah rekening pencairan dan persetujuan Operator resmi diaktifkan. Saldo fee kamu tetap aman dan belum dipotong.')
  }
  return <main className="mobile-app retail-withdraw-page">
    <SubPageHeader title="Withdraw Fee" description="Pencairan komisi retail"/>
    <section className="retail-withdraw-hero"><i><Landmark/></i><div><span>WITHDRAW</span><h1>Withdraw Fee Retail</h1><p>Ajukan pencairan komisi retail ke rekening tujuan yang sudah diverifikasi.</p></div></section>
    <section className="retail-withdraw-summary">
      <article className="available"><span>Saldo tersedia</span><strong>{rupiah(summary.available)}</strong><small>Siap diajukan</small></article>
      <article className="pending"><span>Pending withdraw</span><strong>{rupiah(summary.pending)}</strong><small>Menunggu verifikasi</small></article>
    </section>
    {notice&&<div className="retail-withdraw-notice"><Clock3/><span>{notice}</span></div>}
    <section className="retail-withdraw-history">
      <header><div><h2>Riwayat Withdraw</h2><p>Daftar pengajuan pencairan fee retail terbaru.</p></div><button className="withdraw-apply" type="button" disabled={loading||summary.available<=0} onClick={requestWithdraw}><ArrowDownToLine/>Ajukan</button></header>
      {loading&&<div className="retail-withdraw-empty"><span className="mutation-loader"/><strong>Memuat data withdraw...</strong></div>}
      {!loading&&error&&<div className="retail-withdraw-empty error"><RefreshCw/><strong>Data withdraw belum dapat dimuat</strong><small>{error}</small><button type="button" onClick={load}>Coba lagi</button></div>}
      {!loading&&!error&&history.length===0&&<div className="retail-withdraw-empty"><WalletCards/><strong>Belum ada request withdraw</strong><small>{summary.available>0?'Saldo fee tersedia. Pengajuan dapat dilakukan setelah rekening pencairan resmi diaktifkan.':'Riwayat akan tampil setelah fee resmi tersedia dan pengajuan dikirim.'}</small></div>}
      {!loading&&!error&&history.map(item=><article className="retail-withdraw-row" key={item.id}>
        <i><Building2/></i><div><strong>{rupiah(item.amount)}</strong><b>{item.bank||'Pencairan fee retail'}</b><small>{item.id} · {formatDate(item.date)}{item.account?` · ${item.account}`:''}</small></div><span>{item.status}</span>
      </article>)}
    </section>
    <MobileNav/>
  </main>
}
