import {useState} from 'react'
import {Outlet,useLocation} from 'react-router-dom'
import {useAuth} from '../../context/AuthContext'
import Sidebar from './Sidebar'
import Topbar from './Topbar'
import PaymentModal from '../transactions/PaymentModal'

export default function AppLayout(){
 const[menu,setMenu]=useState(false),[payment,setPayment]=useState(false)
 const{user}=useAuth(),{pathname}=useLocation()
 const panelRoles=['marketing','operator','analis','admin','master']
 const creditWorkspace=panelRoles.includes(user?.role)&&pathname.startsWith('/credit-applications')
 const ownerWorkspace=user?.role==='master'
 return <div className={`app-shell${creditWorkspace?' panel-workspace-shell':''}${ownerWorkspace?' owner-system-shell':''}${creditWorkspace?` role-${user.role}`:''}`}>
  <Sidebar open={menu} onClose={()=>setMenu(false)}/>
  <div className="app-main">
   {!ownerWorkspace&&<Topbar onMenu={()=>setMenu(value=>!value)} onPayment={()=>setPayment(true)}/>}
   {ownerWorkspace&&<button type="button" className="owner-mobile-menu" onClick={()=>setMenu(value=>!value)}>Menu</button>}
   <main className="page-content"><Outlet context={{openPayment:()=>setPayment(true)}}/></main>
  </div>
  {!ownerWorkspace&&<PaymentModal open={payment} onClose={()=>setPayment(false)}/>}
 </div>
}
