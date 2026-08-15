import {useMemo,useState} from 'react'
import {Search,Users} from 'lucide-react'
import PageHeader from '../components/common/PageHeader'
import Avatar from '../components/common/Avatar'
import LoadingState from '../components/common/LoadingState'
import ErrorState from '../components/common/ErrorState'
import {useAsync} from '../hooks/useAsync'
import {getCustomers} from '../services/customerService'
import {shortRupiah} from '../utils/currency'

const roleName={user:'User',agent:'Agent',marketing:'Marketing',operator:'Operator',analis:'Operator',admin:'Admin',master:'Super Admin'}
export default function CustomersPage(){
  const{data,loading,error,reload}=useAsync(getCustomers),items=Array.isArray(data)?data:[],[query,setQuery]=useState(''),[role,setRole]=useState('')
  const filtered=useMemo(()=>items.filter(account=>(!role||account.role===role)&&`${account.name} ${account.username} ${account.email} ${account.phone}`.toLowerCase().includes(query.toLowerCase())),[items,query,role])
  return <><PageHeader eyebrow="PENGGUNA & AKSES" title="Direktori Akun KuotaKita" description="Semua akun yang tersimpan di server, termasuk pendaftaran biasa dan login Google."/>
    {loading?<LoadingState/>:error?<ErrorState message={error} onRetry={reload}/>:<>
      <section className="account-directory-summary"><article><Users/><span><small>Total akun</small><strong>{items.length}</strong></span></article><article><span><small>Login Google</small><strong>{items.filter(item=>item.login_provider==='Google').length}</strong></span></article><article><span><small>User biasa</small><strong>{items.filter(item=>item.role==='user').length}</strong></span></article><article><span><small>Agent</small><strong>{items.filter(item=>item.role==='agent').length}</strong></span></article></section>
      <section className="panel account-directory-panel"><div className="toolbar"><div><Search size={16}/><input value={query} onChange={event=>setQuery(event.target.value)} placeholder="Cari nama, username, email, atau nomor..."/></div><select value={role} onChange={event=>setRole(event.target.value)}><option value="">Semua role</option><option value="user">User</option><option value="agent">Agent</option><option value="marketing">Marketing</option><option value="operator">Operator</option><option value="master">Super Admin</option></select></div><div className="customer-grid">{filtered.map(account=><article className="customer-card account-directory-card" key={account.id}><Avatar name={account.name}/><div><h3>{account.name||account.username}</h3><p>@{account.username}</p></div><em className={`account-provider ${account.login_provider==='Google'?'google':''}`}>{account.login_provider}</em><dl><div><dt>Email</dt><dd>{account.email||'Belum dilengkapi'}</dd></div><div><dt>Nomor</dt><dd>{account.phone||'Belum dilengkapi'}</dd></div><div><dt>Role</dt><dd>{roleName[account.role]||account.role}</dd></div><div><dt>Saldo</dt><dd>{shortRupiah(account.balance||0)}</dd></div></dl><strong className={`account-access ${account.access_status==='suspended'?'suspended':''}`}>{account.access_status==='suspended'?'Ditangguhkan':'Aktif'}</strong></article>)}</div>{!filtered.length&&<div className="owner-monitor-empty"><Users/><b>Akun tidak ditemukan</b><span>Ubah pencarian atau pilihan role.</span></div>}</section>
    </>}
  </>
}
