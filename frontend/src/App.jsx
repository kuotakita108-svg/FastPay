import {lazy,Suspense,useEffect} from 'react'
import {Navigate,Route,Routes,useLocation} from 'react-router-dom'
import ProtectedRoute from './components/auth/ProtectedRoute'
import LoginPage from './pages/LoginPage'

const loadUserHome=()=>import('./pages/UserHomePage')
const loadHistory=()=>import('./pages/HistoryPage')
const loadProfile=()=>import('./pages/ProfilePage')
const loadAgentCredit=()=>import('./pages/AgentCreditPage')
const loadCreditApplications=()=>import('./pages/CreditApplicationsPage')
const loadServicePurchase=()=>import('./pages/ServicePurchasePage')
const loadAllServices=()=>import('./pages/AllServicesPage')
const UserHomePage=lazy(loadUserHome)
const HistoryPage=lazy(loadHistory)
const ProfilePage=lazy(loadProfile)
const AgentCreditPage=lazy(loadAgentCredit)
const CreditApplicationsPage=lazy(loadCreditApplications)
const AppLayout=lazy(()=>import('./components/layout/AppLayout'))
const ServicePurchasePage=lazy(loadServicePurchase)
const CheckoutPage=lazy(()=>import('./pages/CheckoutPage'))
const AllServicesPage=lazy(loadAllServices)
const BalancePage=lazy(()=>import('./pages/BalancePage'))
const WalletTopUpPage=lazy(()=>import('./pages/WalletTopUpPage'))
const TransferPage=lazy(()=>import('./pages/TransferPage'))
const DashboardPage=lazy(()=>import('./pages/DashboardPage'))
const TopUpPage=lazy(()=>import('./pages/TopUpPage'))
const ProductsPage=lazy(()=>import('./pages/ProductsPage'))
const TransactionsPage=lazy(()=>import('./pages/TransactionsPage'))
const CustomersPage=lazy(()=>import('./pages/CustomersPage'))
const AnalyticsPage=lazy(()=>import('./pages/AnalyticsPage'))
const PaymentMethodsPage=lazy(()=>import('./pages/PaymentMethodsPage'))
const InvoicesPage=lazy(()=>import('./pages/InvoicesPage'))
const SettingsPage=lazy(()=>import('./pages/SettingsPage'))
const NotFoundPage=lazy(()=>import('./pages/NotFoundPage'))
const SecurityPage=lazy(()=>import('./pages/SecurityPage'))
const AccountFeaturePage=lazy(()=>import('./pages/AccountFeaturePage'))

// Halaman awal dibuat langsung tersedia. Jangan menahan pengguna di splash screen.
const RouteLoading=()=> <div className="route-loading" role="status" aria-label="Memuat halaman"/>
const Panel=()=> <ProtectedRoute roles={['master','admin','marketing','operator','analis']}><AppLayout/></ProtectedRoute>
const User=({children})=> <ProtectedRoute roles={['user','agent']}>{children}</ProtectedRoute>
const Agent=({children})=> <ProtectedRoute roles={['agent']}>{children}</ProtectedRoute>
const AdminOnly=({children})=> <ProtectedRoute roles={['master','admin']}>{children}</ProtectedRoute>
const ReviewOnly=({children})=> <ProtectedRoute roles={['master','admin','marketing','operator','analis']}>{children}</ProtectedRoute>

export default function App(){
 const location=useLocation(),backgroundLocation=location.state?.backgroundLocation
 useEffect(()=>{
  const warmRoutes=()=>{
   if(location.pathname.startsWith('/app'))[loadUserHome,loadHistory,loadProfile,loadAgentCredit,loadAllServices,loadServicePurchase].forEach(load=>load())
   if(location.pathname.includes('credit-applications'))loadCreditApplications()
  }
  if('requestIdleCallback' in window){const id=window.requestIdleCallback(warmRoutes,{timeout:1800});return()=>window.cancelIdleCallback(id)}
  const timer=window.setTimeout(warmRoutes,700);return()=>window.clearTimeout(timer)
 },[location.pathname])
 return <Suspense fallback={<RouteLoading/>}><Routes location={backgroundLocation||location}>
 <Route path="/login" element={<LoginPage/>}/>
 <Route path="/app" element={<User><UserHomePage/></User>}/>
 <Route path="/app/buy/:type" element={<User><ServicePurchasePage/></User>}/>
 <Route path="/app/checkout" element={<User><CheckoutPage/></User>}/>
 <Route path="/app/services" element={<User><AllServicesPage/></User>}/>
 <Route path="/app/history" element={<User><HistoryPage/></User>}/>
 <Route path="/app/scan" element={<Navigate to="/app" replace/>}/>
 <Route path="/app/balance" element={<User><BalancePage/></User>}/>
 <Route path="/app/balance/topup" element={<User><WalletTopUpPage/></User>}/>
 <Route path="/app/balance/credit" element={<Agent><AgentCreditPage/></Agent>}/>
 <Route path="/app/balance/send" element={<User><TransferPage/></User>}/>
 <Route path="/app/balance/withdraw" element={<User><TransferPage/></User>}/>
 <Route path="/app/profile" element={<User><ProfilePage/></User>}/>
 <Route path="/app/profile/security" element={<User><SecurityPage/></User>}/>
 <Route path="/app/profile/notifications" element={<User><AccountFeaturePage/></User>}/>
 <Route path="/app/profile/help" element={<User><AccountFeaturePage/></User>}/>
 <Route path="/app/profile/policies" element={<User><AccountFeaturePage/></User>}/>
 <Route element={<Panel/>}>
  <Route path="dashboard" element={<AdminOnly><DashboardPage/></AdminOnly>}/>
  <Route path="topup" element={<AdminOnly><TopUpPage/></AdminOnly>}/>
  <Route path="products" element={<AdminOnly><ProductsPage/></AdminOnly>}/>
  <Route path="transactions" element={<AdminOnly><TransactionsPage/></AdminOnly>}/>
  <Route path="credit-applications" element={<ReviewOnly><CreditApplicationsPage/></ReviewOnly>}/>
  <Route path="customers" element={<AdminOnly><CustomersPage/></AdminOnly>}/>
  <Route path="analytics" element={<AdminOnly><AnalyticsPage/></AdminOnly>}/>
  <Route path="payment-methods" element={<AdminOnly><PaymentMethodsPage/></AdminOnly>}/>
  <Route path="invoices" element={<AdminOnly><InvoicesPage/></AdminOnly>}/>
  <Route path="settings" element={<AdminOnly><SettingsPage/></AdminOnly>}/>
 </Route>
 <Route path="/" element={<Navigate to="/login" replace/>}/>
 <Route path="*" element={<NotFoundPage/>}/>
</Routes>{backgroundLocation&&<Routes><Route path="/app/checkout" element={<User><CheckoutPage/></User>}/></Routes>}</Suspense>}
