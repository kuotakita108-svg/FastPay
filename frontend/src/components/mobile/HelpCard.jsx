import { ChevronRight, MessageCircleQuestion } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export default function HelpCard() {
  const navigate = useNavigate()
  return <button type="button" className="mobile-help" onClick={() => navigate('/app/profile')}><i><MessageCircleQuestion /></i><div><strong>Ada kendala transaksi?</strong><p>Buka pusat bantuan dan informasi akun FastPay.</p></div><span><ChevronRight /></span></button>
}
