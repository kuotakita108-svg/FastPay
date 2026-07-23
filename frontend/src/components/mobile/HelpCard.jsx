import { ChevronRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import ServiceEmblem from './ServiceEmblem'

export default function HelpCard() {
  const navigate = useNavigate()
  return <button type="button" className="mobile-help" onClick={() => navigate('/app/profile/help')}><i className="dashboard-hd-emblem"><ServiceEmblem type="insurance" label="Pusat bantuan"/></i><div><strong>Ada kendala transaksi?</strong><p>Buka pusat bantuan dan hubungi tim KuotaKita.</p></div><span><ChevronRight /></span></button>
}
