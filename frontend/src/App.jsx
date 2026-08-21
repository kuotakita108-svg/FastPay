import {lazy,Suspense,useEffect} from 'react'
import {Navigate,Route,Routes,useLocation} from 'react-router-dom'
import ProtectedRoute from './components/auth/ProtectedRoute'
import LoginPage from './pages/LoginPage'

const loadUserHome=()=>import('./pages/UserHomePage')
const loadHistory=()=>import('./pages/HistoryPage')
const loadProfile=()=>import('./pages/ProfilePage')
const loadAgentCredit=()=>import('./pages/AgentCreditPage')
const loadCreditApplications=()=>import('./pages/CreditApplicationsPage')
const loadMarketingApp=()=>import('./pages/MarketingAppPage')
const loadServicePurchase=()=>import('./pages/ServicePurchasePage')
const loadAllServices=()=>import('./pages/AllServicesPage')
const loadAppLayout=()=>import('./components/layout/AppLayout')
const loadCheckout=()=>import('./pages/CheckoutPage')
const loadBalance=()=>import('./pages/BalancePage')
const loadWalletTopUp=()=>import('./pages/WalletTopUpPage')
const loadTransfer=()=>import('./pages/TransferPage')
const loadDashboard=()=>import('./pages/DashboardPage')
const loadTopUp=()=>import('./pages/TopUpPage')
const loadProducts=()=>import('./pages/ProductsPage')
const loadTransactions=()=>import('./pages/TransactionsPage')
const loadCustomers=()=>import('./pages/CustomersPage')
const loadAnalytics=()=>import('./pages/AnalyticsPage')
const loadPaymentMethods=()=>import('./pages/PaymentMethodsPage')
const loadInvoices=()=>import('./pages/InvoicesPage')
const loadSettings=()=>import('./pages/SettingsPage')
const loadNotFound=()=>import('./pages/NotFoundPage')
const loadSecurity=()=>import('./pages/SecurityPage')
const loadAccountFeature=()=>import('./pages/AccountFeaturePage')
const loadBalanceMutations=()=>import('./pages/BalanceMutationsPage')
const UserHomePage=lazy(loadUserHome)
const HistoryPage=lazy(loadHistory)
const ProfilePage=lazy(loadProfile)
const AgentCreditPage=lazy(loadAgentCredit)
const CreditApplicationsPage=lazy(loadCreditApplications)
const MarketingAppPage=lazy(loadMarketingApp)
const AppLayout=lazy(loadAppLayout)
const ServicePurchasePage=lazy(loadServicePurchase)
const CheckoutPage=lazy(loadCheckout)
const AllServicesPage=lazy(loadAllServices)
const BalancePage=lazy(loadBalance)
const WalletTopUpPage=lazy(loadWalletTopUp)
const TransferPage=lazy(loadTransfer)
const DashboardPage=lazy(loadDashboard)
const TopUpPage=lazy(loadTopUp)
const ProductsPage=lazy(loadProducts)
const TransactionsPage=lazy(loadTransactions)
const CustomersPage=lazy(loadCustomers)
const AnalyticsPage=lazy(loadAnalytics)
const PaymentMethodsPage=lazy(loadPaymentMethods)
const InvoicesPage=lazy(loadInvoices)
const SettingsPage=lazy(loadSettings)
const NotFoundPage=lazy(loadNotFound)
const SecurityPage=lazy(loadSecurity)
const AccountFeaturePage=lazy(loadAccountFeature)
const BalanceMutationsPage=lazy(loadBalanceMutations)

// Halaman awal dibuat langsung tersedia. Jangan menahan pengguna di splash screen.
const RouteLoading=()=> <div className="route-loading" role="status" aria-label="Memuat halaman"/>
const Panel=()=> <ProtectedRoute roles={['master','admin','operator','analis']}><AppLayout/></ProtectedRoute>
const Marketing=({children})=> <ProtectedRoute roles={['marketing']}>{children}</ProtectedRoute>
const User=({children})=> <ProtectedRoute roles={['user','agent','marketing']}>{children}</ProtectedRoute>
const Agent=({children})=> <ProtectedRoute roles={['agent']}>{children}</ProtectedRoute>
const AdminOnly=({children})=> <ProtectedRoute roles={['master','admin']}>{children}</ProtectedRoute>
const ReviewOnly=({children})=> <ProtectedRoute roles={['master','admin','operator','analis']}>{children}</ProtectedRoute>

export default function App(){
 const location=useLocation(),backgroundLocation=location.state?.backgroundLocation
 useEffect(()=>{
  const warmRoutes=()=>{
   if(location.pathname.startsWith('/app'))[loadUserHome,loadHistory,loadProfile,loadAgentCredit,loadAllServices,loadServicePurchase].forEach(load=>load())
   if(location.pathname.startsWith('/marketing'))[loadMarketingApp,loadCreditApplications].forEach(load=>load())
   if(!location.pathname.startsWith('/app') && !location.pathname.startsWith('/marketing') && location.pathname !== '/login') [loadAppLayout,loadCreditApplications,loadDashboard,loadProducts,loadTransactions,loadCustomers,loadAnalytics,loadPaymentMethods,loadInvoices,loadSettings].forEach(load=>load())
  }
  if('requestIdleCallback' in window){const id=window.requestIdleCallback(warmRoutes,{timeout:1800});return()=>window.cancelIdleCallback(id)}
  const timer=window.setTimeout(warmRoutes,700);return()=>window.clearTimeout(timer)
 },[location.pathname])
 return <Suspense fallback={<RouteLoading/>}><Routes location={backgroundLocation||location}>
 <Route path="/login" element={<LoginPage/>}/>
 <Route path="/marketing" element={<Marketing><MarketingAppPage/></Marketing>}/>
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
 <Route path="/app/profile/mutations" element={<Marketing><BalanceMutationsPage/></Marketing>}/>
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
