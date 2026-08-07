import { useMemo, useState } from "react";
import { Building2, Check, ChevronRight, CircleDollarSign, Landmark, ShieldCheck, Sparkles, WalletCards } from "lucide-react";
import SubPageHeader from "../components/mobile/SubPageHeader";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { rupiah } from "../utils/currency";

const amounts = [20000, 50000, 100000, 200000, 500000, 1000000];
const methods = [
  { id: "va", title: "Virtual Account", detail: "Menunggu mitra pembayaran resmi", icon: Landmark, fee: 0, badge: "Segera" },
  { id: "bank", title: "Transfer Bank", detail: "Butuh verifikasi mutasi otomatis", icon: Building2, fee: 2500 },
  { id: "wallet", title: "E-Wallet", detail: "Butuh webhook pembayaran resmi", icon: WalletCards, fee: 1500 },
];

export default function WalletTopUpPage() {
  const { user } = useAuth();
  const { show } = useToast();
  const [amount, setAmount] = useState(100000);
  const [custom, setCustom] = useState("");
  const [method, setMethod] = useState("va");
  const selected = methods.find((item) => item.id === method);
  const value = custom ? Number(custom) : amount;
  const total = useMemo(() => value + (selected?.fee || 0), [value, selected]);
  const submit = () => show("Isi saldo belum aktif. Hubungkan QRIS atau Virtual Account resmi beserta webhook pembayaran terlebih dahulu.");

  return (
    <main className="mobile-app wallet-topup-page">
      <SubPageHeader title="Isi Saldo" description="Pembayaran tersedia setelah mitra resmi terhubung" back />
      <section className="topup-mini-wallet"><div><span>Saldo saat ini</span><strong>{rupiah(user?.balance || 0)}</strong></div><i><CircleDollarSign /></i></section>
      <section className="topup-card">
        <header><div><small>NOMINAL</small><h2>Pilih nominal</h2></div><Sparkles /></header>
        <div className="amount-grid">{amounts.map((item) => <button className={!custom && amount === item ? "active" : ""} onClick={() => { setAmount(item); setCustom(""); }} key={item}>{rupiah(item)}</button>)}</div>
        <label className="custom-amount"><span>Nominal lain</span><div><b>Rp</b><input inputMode="numeric" placeholder="Minimal 10.000" value={custom} onChange={(event) => setCustom(event.target.value.replace(/\D/g, ""))} /></div></label>
      </section>
      <section className="topup-card">
        <header><div><small>METODE</small><h2>Pembayaran resmi</h2></div><ShieldCheck /></header>
        <div className="topup-methods">{methods.map((item) => { const Icon = item.icon; return <button key={item.id} className={method === item.id ? "active" : ""} onClick={() => setMethod(item.id)}><i><Icon /></i><div><strong>{item.title}</strong><small>{item.detail}</small></div>{item.badge && <em>{item.badge}</em>}<span>{method === item.id ? <Check /> : <ChevronRight />}</span></button>; })}</div>
      </section>
      <section className="topup-summary"><h2>Ringkasan rencana pembayaran</h2><div><span>Nominal isi saldo</span><b>{rupiah(value || 0)}</b></div><div><span>Estimasi biaya</span><b>{selected?.fee ? rupiah(selected.fee) : "Gratis"}</b></div><div className="total"><span>Total</span><strong>{rupiah(total || 0)}</strong></div><small><ShieldCheck /> Belum ada saldo yang ditambahkan sampai webhook pembayaran resmi mengonfirmasi transaksi.</small></section>
      <footer className="topup-footer"><div><span>Total</span><strong>{rupiah(total || 0)}</strong></div><button disabled={!value} onClick={submit}>Info Pembayaran <ChevronRight /></button></footer>
    </main>
  );
}
