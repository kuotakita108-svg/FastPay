import MobileHeader from '../components/mobile/MobileHeader'
import ServiceGrid from '../components/mobile/ServiceGrid'
import PromoSlider from '../components/mobile/PromoSlider'
import FavoriteServices from '../components/mobile/FavoriteServices'
import BillReminder from '../components/mobile/BillReminder'
import RecentActivity from '../components/mobile/RecentActivity'
import HelpCard from '../components/mobile/HelpCard'
import MobileNav from '../components/mobile/MobileNav'
import DashboardDiscover from '../components/mobile/DashboardDiscover'
import { useAsync } from '../hooks/useAsync'
import { getTransactions } from '../services/transactionService'
import {useAuth} from '../context/AuthContext'
import MarketingFieldHome from './MarketingFieldHome'

export default function UserHomePage() {
  const {user}=useAuth()
  if(user?.role==='marketing') return <MarketingFieldHome/>
  return <CustomerHome/>
}

function CustomerHome(){
  const { data, loading } = useAsync(getTransactions)
  const transactions = loading ? [] : (data || [])

  return (
    <main className="mobile-app user-dashboard">
      <MobileHeader />
      <ServiceGrid />
      <PromoSlider />
      <DashboardDiscover />
      <RecentActivity items={transactions} />
      <FavoriteServices items={transactions} />
      <BillReminder items={transactions} />
      <HelpCard />
      <footer className="clean-footer"><strong>KuotaKita</strong><span>Â·</span><small>Aman, cepat, dan terpercaya</small></footer>
      <MobileNav />
    </main>
  )
}
