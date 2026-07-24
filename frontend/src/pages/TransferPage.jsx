import { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Check,
  ChevronRight,
  Copy,
  Landmark,
  MessageSquareText,
  QrCode,
  ReceiptText,
  Search,
  ShieldCheck,
  UserRound,
  UsersRound,
  WalletCards,
  XCircle,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import {
  createTransaction,
  payWithBalance,
} from "../services/transactionService";
import { rupiah } from "../utils/currency";
import { request } from "../services/http";
import bcaLogo from "../assets/providers/official/bca.png";
import briLogo from "../assets/providers/official/bri.png";
import bniLogo from "../assets/providers/official/bni.png";
import mandiriLogo from "../assets/providers/official/mandiri.png";
import bsiLogo from "../assets/providers/official/bsi.png";
import danaLogo from "../assets/providers/dana.png";
import gopayLogo from "../assets/providers/gopay.png";
import ovoLogo from "../assets/providers/ovo.svg";
import shopeepayLogo from "../assets/providers/shopeepay.png";
import linkajaLogo from "../assets/providers/linkaja.svg";
import kuotakitaLogo from "../assets/images/kuotakita-logo-header.svg";
import cimbLogo from "../assets/providers/official/cimb-niaga.svg";
import permataLogo from "../assets/providers/official/permatabank.svg";
import jagoLogo from "../assets/providers/official/jago.svg";
import seabankLogo from "../assets/providers/official/seabank.svg";
import danamonLogo from "../assets/providers/official/danamon.svg";
import isakuLogo from "../assets/providers/official/isaku.svg";
import astrapayLogo from "../assets/providers/official/astrapay.svg";

const channels = [
  {
    id: "bank",
    title: "Rekening Bank",
    desc: "Transfer ke bank di Indonesia",
    icon: Landmark,
  },
  {
    id: "wallet",
    title: "E-Wallet",
    desc: "DANA, GoPay, OVO, dan lainnya",
    icon: WalletCards,
  },
  {
    id: "kuotakita",
    title: "Sesama KuotaKita",
    desc: "Kirim instan tanpa biaya",
    icon: UsersRound,
  },
  {
    id: "virtual",
    title: "Nomor Virtual Account",
    desc: "Bayar atau kirim melalui VA",
    icon: QrCode,
  },
];
const providers = {
  bank: [
    "BCA",
    "BRI",
    "BNI",
    "Mandiri",
    "Bank Syariah Indonesia",
    "CIMB Niaga",
    "PermataBank",
    "Bank Jago",
    "SeaBank",
    "Bank Danamon",
  ],
  wallet: [
    "DANA",
    "GoPay",
    "OVO",
    "ShopeePay",
    "LinkAja",
    "i.saku",
    "AstraPay",
  ],
  kuotakita: ["KuotaKita ID"],
  virtual: [
    "BCA Virtual Account",
    "BRI BRIVA",
    "BNI Virtual Account",
    "Mandiri Virtual Account",
  ],
};
const logoMap = {
  BCA: bcaLogo,
  BRI: briLogo,
  BNI: bniLogo,
  Mandiri: mandiriLogo,
  "Bank Syariah Indonesia": bsiLogo,
  DANA: danaLogo,
  GoPay: gopayLogo,
  OVO: ovoLogo,
  ShopeePay: shopeepayLogo,
  LinkAja: linkajaLogo,
  "KuotaKita ID": kuotakitaLogo,
  "CIMB Niaga": cimbLogo,
  PermataBank: permataLogo,
  "Bank Jago": jagoLogo,
  SeaBank: seabankLogo,
  "Bank Danamon": danamonLogo,
  "i.saku": isakuLogo,
  AstraPay: astrapayLogo,
};
const providerLogo = (name) =>
  Object.entries(logoMap).find(([key]) => name.startsWith(key))?.[1];
function ProviderLogo({ name, index }) {
  const logo = providerLogo(name);
  const initials = name
    .replace("Bank ", "")
    .split(" ")
    .map((word) => word[0])
    .join("")
    .slice(0, 3);
  return (
    <i className={`provider-logo tone-${index % 4}`}>
      {logo ? <img src={logo} alt={`Logo ${name}`} /> : <b>{initials}</b>}
    </i>
  );
}
export default function TransferPage() {
  const location = useLocation(),
    navigate = useNavigate(),
    withdraw = location.pathname.endsWith("/withdraw"),
    { session, user, setBalance, deductBalance } = useAuth(),
    [channel, setChannel] = useState(withdraw ? "bank" : ""),
    [provider, setProvider] = useState(""),
    [number, setNumber] = useState(""),
    [recipient, setRecipient] = useState(null),
    [amount, setAmount] = useState(""),
    [note, setNote] = useState(""),
    [step, setStep] = useState("form"),
    [processing, setProcessing] = useState(false),
    [error, setError] = useState(""),
    [result, setResult] = useState(null);
  const value = Number(amount),
    fee = channel === "bank" || channel === "virtual" ? 2500 : 0,
    total = value + fee,
    available = Number(user?.balance || 0),
    list = useMemo(() => providers[channel] || [], [channel]);
  const selectChannel = (id) => {
    setChannel(id);
    setProvider("");
    setNumber("");
    setRecipient(null);
  };
  const lookup = async () => {
    setError("");
    if (!provider) return setError("Pilih bank atau penyedia tujuan");
    if (number.replace(/\D/g, "").length < 6)
      return setError("Nomor tujuan belum lengkap");
    setProcessing(true);
    try {
      const detail = await request("/services/recipient-lookup", {
        method: "POST",
        body: JSON.stringify({ channel, provider, number }),
      });
      setRecipient(detail);
      setStep("amount");
    } catch (current) {
      setRecipient(null);
      setError(current.message);
    } finally {
      setProcessing(false);
    }
  };
  const review = () => {
    setError("");
    if (value < 10000) return setError("Minimal pengiriman Rp10.000");
    if (total > available) return setError("Saldo KuotaKita tidak mencukupi");
    setStep("confirm");
  };
  const send = async () => {
    setProcessing(true);
    setError("");
    try {
      const payload = {
        type: withdraw ? "withdraw" : "transfer",
        title: withdraw
          ? "Tarik Saldo"
          : channel === "bank"
            ? "Transfer Bank"
            : channel === "wallet"
              ? "Transfer E-Wallet"
              : "Transfer KuotaKita",
        target: `${recipient.name} Â· ${recipient.number}`,
        provider: recipient.provider,
        product: withdraw ? "Penarikan Saldo" : `Kirim ke ${recipient.name}`,
        amount: total,
        email: user.email,
      };
      let response;
      if (session?.offline) {
        deductBalance(total);
        const transaction = await createTransaction({
          customer: payload.target,
          email: user.email || `${user.id}@kuotakita.id`,
          method: `${payload.provider} Â· ${payload.title}`,
          amount: total,
        });
        response = { transaction, balance: available - total };
      } else {
        response = await payWithBalance(payload);
        setBalance(response.balance);
      }
      setResult(response);
      setStep("success");
    } catch (current) {
      setError(current.message);
    } finally {
      setProcessing(false);
    }
  };
  if (step === "success")
    return (
      <main className="mobile-app transfer-page">
        <section className="transfer-success">
          <i>
            <Check />
          </i>
          <span>{withdraw ? "PENARIKAN BERHASIL" : "TRANSFER BERHASIL"}</span>
          <h1>{rupiah(value)}</h1>
          <p>
            Dana berhasil dikirim ke {recipient.name} melalui{" "}
            {recipient.provider}.
          </p>
          <section>
            <div>
              <small>Penerima</small>
              <strong>{recipient.name}</strong>
            </div>
            <div>
              <small>Nomor tujuan</small>
              <strong>{recipient.number}</strong>
            </div>
            <div>
              <small>Biaya admin</small>
              <strong>{rupiah(fee)}</strong>
            </div>
            <div>
              <small>ID transaksi</small>
              <strong>{result.transaction.id}</strong>
            </div>
          </section>
          <button
            onClick={() =>
              navigator.clipboard?.writeText(result.transaction.id)
            }
          >
            <Copy /> Salin ID Transaksi
          </button>
          <button className="primary" onClick={() => navigate("/app/history")}>
            Lihat Riwayat
          </button>
        </section>
      </main>
    );
  return (
    <main className="mobile-app transfer-page">
      <header className="transfer-head">
        <button
          onClick={() =>
            step === "form"
              ? navigate(-1)
              : setStep(step === "confirm" ? "amount" : "form")
          }
        >
          <ArrowLeft />
        </button>
        <div>
          <strong>{withdraw ? "Tarik Saldo" : "Kirim Uang"}</strong>
          <small>
            {step === "form"
              ? "Pilih tujuan dan cek penerima"
              : step === "amount"
                ? "Masukkan nominal pengiriman"
                : "Konfirmasi transaksi"}
          </small>
        </div>
        <i>
          <ShieldCheck />
        </i>
      </header>
      <div className="transfer-progress">
        <span className="done">1</span>
        <i />
        <span className={step !== "form" ? "done" : ""}>2</span>
        <i />
        <span className={step === "confirm" ? "done" : ""}>3</span>
      </div>
      {step === "form" && (
        <section className="transfer-body">
          {!withdraw && (
            <>
              <h2>Pilih jenis pengiriman</h2>
              <div className="transfer-channels">
                {channels.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      className={channel === item.id ? "active" : ""}
                      onClick={() => selectChannel(item.id)}
                      key={item.id}
                    >
                      <i>
                        <Icon />
                      </i>
                      <div>
                        <strong>{item.title}</strong>
                        <small>{item.desc}</small>
                      </div>
                      <ChevronRight />
                    </button>
                  );
                })}
              </div>
            </>
          )}
          {channel && (
            <section className="transfer-card">
              <h2>{withdraw ? "Pilih rekening tujuan" : "Pilih penyedia"}</h2>
              <div className="transfer-providers">
                {list.map((name, index) => (
                  <button
                    className={provider === name ? "active" : ""}
                    onClick={() => {
                      setProvider(name);
                      setRecipient(null);
                    }}
                    key={name}
                  >
                    <ProviderLogo name={name} index={index} />
                    <span>{name}</span>
                    {provider === name && <Check />}
                  </button>
                ))}
              </div>
              <label className="account-input">
                <span>
                  {channel === "wallet"
                    ? "Nomor handphone"
                    : channel === "kuotakita"
                      ? "KuotaKita ID"
                      : "Nomor rekening / akun"}
                </span>
                <div>
                  <Search />
                  <input
                    value={number}
                    onChange={(event) => {
                      setNumber(event.target.value.replace(/\D/g, ""));
                      setRecipient(null);
                    }}
                    inputMode="numeric"
                    placeholder="Masukkan nomor tujuan"
                  />
                </div>
              </label>
<button className="transfer-main" onClick={lookup} disabled={processing}>
                {processing ? "Memverifikasi..." : "Cek Detail Penerima"} <ChevronRight />
              </button>
            </section>
          )}
        </section>
      )}
      {step === "amount" && (
        <section className="transfer-body">
          <section className="recipient-card">
            <span>
              <UserRound />
            </span>
            <div>
              <small>Penerima terverifikasi</small>
              <strong>{recipient.name}</strong>
              <p>
                {recipient.provider} Â· {recipient.number}
              </p>
            </div>
            <i>
              <Check />
            </i>
          </section>
          <section className="transfer-card">
            <label className="amount-input">
              <span>Jumlah yang dikirim</span>
              <div>
                <b>Rp</b>
                <input
                  value={amount}
                  onChange={(event) =>
                    setAmount(event.target.value.replace(/\D/g, ""))
                  }
                  inputMode="numeric"
                  placeholder="0"
                />
              </div>
              <small>Saldo tersedia {rupiah(available)}</small>
            </label>
            <div className="quick-amounts">
              {[50000, 100000, 250000, 500000].map((item) => (
                <button onClick={() => setAmount(String(item))} key={item}>
                  {rupiah(item)}
                </button>
              ))}
            </div>
            <label className="transfer-note">
              <span>Catatan (opsional)</span>
              <div>
                <MessageSquareText />
                <input
                  value={note}
                  onChange={(event) => setNote(event.target.value)}
                  maxLength={50}
                  placeholder="Contoh: uang makan"
                />
              </div>
            </label>
          </section>
          {error && (
            <div className="transfer-error">
              <XCircle />
              {error}
            </div>
          )}
          <button className="transfer-main" onClick={review}>
            Lanjut Konfirmasi <ChevronRight />
          </button>
        </section>
      )}
      {step === "confirm" && (
        <section className="transfer-body">
          <section className="transfer-card transfer-review">
            <header>
              <ReceiptText />
              <div>
                <strong>Konfirmasi Pengiriman</strong>
                <small>Pastikan semua data sudah benar</small>
              </div>
            </header>
            <div>
              <span>Penerima</span>
              <b>{recipient.name}</b>
            </div>
            <div>
              <span>Penyedia</span>
              <b>{recipient.provider}</b>
            </div>
            <div>
              <span>Nomor tujuan</span>
              <b>{recipient.number}</b>
            </div>
            {note && (
              <div>
                <span>Catatan</span>
                <b>{note}</b>
              </div>
            )}
            <div>
              <span>Nominal</span>
              <b>{rupiah(value)}</b>
            </div>
            <div>
              <span>Biaya admin</span>
              <b>{fee ? rupiah(fee) : "Gratis"}</b>
            </div>
            <div className="total">
              <span>Total potong saldo</span>
              <strong>{rupiah(total)}</strong>
            </div>
          </section>
          <p className="transfer-secure">
            <ShieldCheck /> Data dan transaksi dilindungi sistem keamanan
            KuotaKita.
          </p>
          {error && (
            <div className="transfer-error">
              <XCircle />
              {error}
            </div>
          )}
          <button
            className="transfer-main"
            disabled={processing}
            onClick={send}
          >
            {processing
              ? "Memproses..."
              : withdraw
                ? "Tarik Saldo Sekarang"
                : "Kirim Sekarang"}
          </button>
        </section>
      )}
    </main>
  );
}
