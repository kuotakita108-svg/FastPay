import {useMemo,useState} from 'react'
import {Power,Search,Trash2,Users} from 'lucide-react'
import PageHeader from '../components/common/PageHeader'
import LoadingState from '../components/common/LoadingState'
import ErrorState from '../components/common/ErrorState'
import {useAsync} from '../hooks/useAsync'
import {deleteAccount,getCustomers,setAccountAccess} from '../services/customerService'
import {shortRupiah} from '../utils/currency'

const roleName={user:'User',agent:'Agent',marketing:'Marketing',operator:'Operator',analis:'Operator',admin:'Admin',master:'Super Admin'}
const date=value=>value?new Intl.DateTimeFormat('id-ID',{dateStyle:'medium',timeStyle:'short'}).format(new Date(value)):'-'
export default function CustomersPage(){
  const{data,loading,error,reload}=useAsync(getCustomers),items=Array.isArray(data)?data:[],[query,setQuery]=useState(''),[role,setRole]=useState(''),[busy,setBusy]=useState(''),[notice,setNotice]=useState('')
  const filtered=useMemo(()=>items.filter(account=>(!role||account.role===role)&&`${account.name} ${account.username} ${account.email} ${account.phone}`.toLowerCase().includes(query.toLowerCase())),[items,query,role])
  const toggle=async account=>{setBusy(account.id);setNotice('');try{await setAccountAccess(account.id,account.access_status!=='suspended');setNotice(account.access_status==='suspended'?'Akun sudah diaktifkan.':'Akun sudah dinonaktifkan.');reload()}catch(err){setNotice(err.message)}finally{setBusy('')}}
  const remove=async account=>{if(!window.confirm(`Hapus permanen akun ${account.name||account.username}? Tindakan ini tidak dapat dibatalkan.`))return;setBusy(account.id);setNotice('');try{await deleteAccount(account.id);setNotice('Akun sudah dihapus dari server.');reload()}catch(err){setNotice(err.message)}finally{setBusy('')}}
  return <><PageHeader eyebrow="PENGGUNA & AKSES" title="Direktori Akun KuotaKita" description="Pantau seluruh akun server, sumber login, role, saldo, dan status aksesnya."/>
    {loading?<LoadingState/>:error?<ErrorState message={error} onRetry={reload}/>:<>
      <section className="account-directory-summary"><article><Users/><span><small>Total akun</small><strong>{items.length}</strong></span></article><article><span><small>Login Google</small><strong>{items.filter(item=>item.login_provider==='Google').length}</strong></span></article><article><span><small>User biasa</small><strong>{items.filter(item=>item.role==='user').length}</strong></span></article><article><span><small>Agent</small><strong>{items.filter(item=>item.role==='agent').length}</strong></span></article></section>
      <section className="panel account-directory-panel"><div className="toolbar"><div><Search size={16}/><input value={query} onChange={event=>setQuery(event.target.value)} placeholder="Cari nama, username, email, atau nomor..."/></div><select value={role} onChange={event=>setRole(event.target.value)}><option value="">Semua role</option><option value="user">User</option><option value="agent">Agent</option><option value="marketing">Marketing</option><option value="operator">Operator</option><option value="master">Super Admin</option></select></div>{notice&&<p className="account-directory-notice">{notice}</p>}<div className="account-ledger-scroll"><div className="account-ledger"><header><span>No</span><span>Terdaftar</span><span>Nama</span><span>Username</span><span>Kontak</span><span>Login</span><span>Role</span><span>Saldo</span><span>Status</span><span>Aksi</span></header>{filtered.map((account,index)=><article key={account.id}><span>{index+1}</span><time>{date(account.created_at)}</time><b>{account.name||'-'}</b><code>@{account.username}</code><span>{account.email||account.phone||'Belum dilengkapi'}</span><span>{account.login_provider}</span><span>{roleName[account.role]||account.role}</span><strong>{shortRupiah(account.balance||0)}</strong><em className={account.access_status==='suspended'?'suspended':''}>{account.access_status==='suspended'?'Nonaktif':'Aktif'}</em><nav><button disabled={busy===account.id||account.role==='master'} onClick={()=>toggle(account)}><Power/>{account.access_status==='suspended'?'Aktifkan':'Matikan'}</button><button className="danger" disabled={busy===account.id||account.role==='master'} onClick={()=>remove(account)}><Trash2/>Hapus</button></nav></article>)}</div></div>{!filtered.length&&<div className="owner-monitor-empty"><Users/><b>Akun tidak ditemukan</b><span>Ubah pencarian atau pilihan role.</span></div>}</section>
    </>}
  </>
}
