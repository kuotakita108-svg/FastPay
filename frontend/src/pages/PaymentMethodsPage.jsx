import {CreditCard,Landmark,QrCode,Smartphone} from 'lucide-react'
import PageHeader from '../components/common/PageHeader'

const methods=[['QRIS','Pembayaran QR instan',QrCode,'Menunggu integrasi'],['Virtual Account','Transfer bank otomatis',Landmark,'Menunggu integrasi'],['E-Wallet','GoPay, OVO, DANA, dan layanan terkait',Smartphone,'Aktif melalui H2H'],['Saldo KuotaKita','Pembayaran menggunakan saldo akun',CreditCard,'Aktif']]
export default function PaymentMethodsPage(){return <><PageHeader eyebrow="Pemantauan Pembayaran" title="Kanal Pembayaran" description="Status jalur pembayaran aplikasi. Perubahan konfigurasi dilakukan dari Pengaturan Sistem."/><div className="method-grid owner-method-grid">{methods.map(([name,desc,Icon,status])=><article className="method-card" key={name}><i><Icon/></i><div><h3>{name}</h3><p>{desc}</p></div><em className={status==='Aktif'||status.includes('H2H')?'active':'waiting'}>{status}</em></article>)}</div></>}
