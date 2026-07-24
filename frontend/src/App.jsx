import {Navigate, Route, Routes} from 'react-router-dom'
import AppLayout from './components/layout/AppLayout'
import ProtectedRoute from './components/auth/ProtectedRoute'
import LoginPage from './pages/LoginPage'
import UserHomePage from './pages/UserHomePage'
import ServicePurchasePage from './pages/ServicePurchasePage'
import CheckoutPage from './pages/CheckoutPage'
import AllServicesPage from './pages/AllServicesPage'
import HistoryPage from './pages/HistoryPage'
import BalancePage from './pages/BalancePage'
import WalletTopUpPage from './pages/WalletTopUpPage'
import TransferPage from './pages/TransferPage'
import ProfilePage from './pages/ProfilePage'
import DashboardPage from './pages/DashboardPage'
import TopUpPage from './pages/TopUpPage'
import ProductsPage from './pages/ProductsPage'
import TransactionsPage from './pages/TransactionsPage'
import CustomersPage from './pages/CustomersPage'
import AnalyticsPage from './pages/AnalyticsPage'
import PaymentMethodsPage from './pages/PaymentMethodsPage'
import InvoicesPage from './pages/InvoicesPage'
import SettingsPage from './pages/SettingsPage'
import NotFoundPage from './pages/NotFoundPage'
import SecurityPage from './pages/SecurityPage'
import AccountFeaturePage from './pages/AccountFeaturePage'
import AgentCreditPage from './pages/AgentCreditPage'
import CreditApplicationsPage from './pages/CreditApplicationsPage'

const Panel = () => <ProtectedRoute roles={['master', 'admin', 'marketing', 'analis']}><AppLayout/></ProtectedRoute>
const User = ({children}) => <ProtectedRoute roles={['user', 'agent']}>{children}</ProtectedRoute>
const Agent = ({children}) => <ProtectedRoute roles={['agent']}>{children}</ProtectedRoute>
const AdminOnly = ({children}) => <ProtectedRoute roles={['master', 'admin']}>{children}</ProtectedRoute>
const ReviewOnly = ({children}) => <ProtectedRoute roles={['master', 'admin', 'marketing', 'analis']}>{children}</ProtectedRoute>

export default function App() {
  return <Routes>
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
  </Routes>
}
