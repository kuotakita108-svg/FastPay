"""Convert the provider H2H price export into KuotaKita's embedded catalog.

Usage: python tools/import_h2h_catalog.py <pasted-text.txt>
The source export is intentionally kept outside the application. The generated
JSON is deterministic, compact, and is embedded by the Go backend at build time.
"""
from __future__ import annotations

import json
import re
import sys
from pathlib import Path


GAME_RULES = [
    ("FREE FIRE", "Free Fire"), ("MOBILE LEGEND", "Mobile Legends"),
    ("PUBG", "PUBG Mobile"), ("POINT BLANK", "Point Blank"),
    ("ROBLOX", "Roblox"), ("GENSHIN", "Genshin Impact Genesis Crystals"),
    ("VALORANT", "Valorant Points"), ("STEAM", "Steam Wallet ID"),
    ("ARENA OF VALOR", "Arena of Valor Voucher"), ("HONOR OF KINGS", "Honor of Kings"),
    ("MINECRAFT", "Minecraft"), ("WILD CORES", "League of Legends: Wild Rift"),
    ("B-CHIPS", "Honkai Impact 3"), (" CRYSTALS", "Honkai Impact 3"),
    ("FC POINTS", "FC Mobile"), (" SILVER", "FC Mobile"),
    ("HIGGS", "Higgs Domino"), ("CALL OF DUTY", "Call of Duty Mobile"),
    ("GARENA", "Garena"),
]


def contains(text: str, *values: str) -> bool:
    return any(value in text for value in values)


def has_word(text: str, value: str) -> bool:
    """Match provider names as words, so PERDANA is never read as DANA."""
    return re.search(rf"(?<![A-Z0-9]){re.escape(value)}(?![A-Z0-9])", text) is not None


def classify(sku: str, name: str, group: str) -> tuple[str, str]:
    text = f" {group} {name} ".upper()
    sku_upper = sku.upper()

    if group.upper() == "RTOL" or sku_upper.startswith("RTOL"):
        provider = re.sub(r"^RTOL\s+TRANSFER\s+", "", name, flags=re.IGNORECASE).strip()
        provider = re.sub(r"^BANK\s+", "", provider, flags=re.IGNORECASE).strip()
        return "Transfer Bank", provider or "Bank Indonesia"

    if "PDAM" in text:
        return "PDAM", "PDAM Indonesia"
    if "BPJS" in text:
        return "BPJS", "BPJS Kesehatan"
    if "PLN PASCABAYAR" in text:
        return "Token PLN", "PLN Pascabayar"
    if contains(text, "PLN", "LISTRIK"):
        return "Token PLN", "PLN"
    if "PGN" in text:
        return "Tagihan Gas", "PGN"
    if "INTERNET PASCABAYAR" in text:
        return "Internet & TV", "Internet Pascabayar"
    if "HP PASCABAYAR" in text:
        return "Pascabayar", "HP Pascabayar"

    for needle, provider in GAME_RULES:
        if needle in text:
            return "Voucher Game", provider
    if sku_upper.startswith(("MGC", "VMGC")) or re.fullmatch(r"\d+ DIAMOND", group.upper()):
        return "Voucher Game", "Magic Chess: Go Go"
    if sku_upper.startswith(("FCP", "VFCP", "FCS", "VFCS")):
        return "Voucher Game", "FC Mobile"
    if sku_upper.startswith(("LOL", "VLOL")):
        return "Voucher Game", "League of Legends: Wild Rift"
    if sku_upper.startswith(("HIB", "VHIB", "HIC", "VHIC")):
        return "Voucher Game", "Honkai Impact 3"

    # Operator seluler diperiksa sebelum dompet digital. Nama produk kartu
    # perdana mengandung rangkaian huruf "DANA", tetapi bukan provider DANA.
    telcos = [
        ("TELKOMSEL", "Telkomsel"), ("TSEL", "Telkomsel"),
        ("INDOSAT", "Indosat"), ("ISAT", "Indosat"), ("IM3", "Indosat"),
        ("SMARTFREN", "Smartfren"), ("SMART", "Smartfren"),
        ("BY.U", "by.U"), ("AXIS", "AXIS"), ("TRI", "Tri"),
        ("THREE", "Tri"), ("XL", "XL"),
    ]
    provider = next((value for needle, value in telcos if has_word(text, needle)), "")
    if provider:
        if contains(text, "PASCABAYAR", "POSTPAID", "HALO"):
            return "Pascabayar", provider
        data_words = ("DATA", "VCR", "VOUCHER", "AKTIVASI", "INTERNET", "COMBO", "AIGO", "BRONET", "FREEDOM", "HAPPY", "AON", "UNLIMITED", "ROAMING", "TELPON", "SMS", "HIFI", "PURE", "MASA AKTIF", "PERDANA")
        return ("Paket Data" if contains(text, *data_words) else "Pulsa"), provider

    wallets = [
        ("DANA", "DANA"), ("GOPAY", "GoPay"), ("GOJEK", "GoPay"),
        ("OVO", "OVO"), ("SHOPEE", "ShopeePay"), ("LINKAJA", "LinkAja"),
        ("ISAKU", "i.saku"), ("I.SAKU", "i.saku"), ("KASPRO", "KasPro"),
        ("LINK AJA", "LinkAja"), ("SHOPEEPAY", "ShopeePay"),
        ("SAKUKU", "Sakuku"), ("MAXIM", "Maxim"), ("GRAB", "Grab"),
    ]
    for needle, provider in wallets:
        if has_word(text, needle):
            return "E-Wallet", provider

    if contains(text, "BRIZZI", "E-MONEY", "TAPCASH", "FLAZZ"):
        provider = "BRIZZI" if "BRIZZI" in text else "Mandiri e-Money" if "E-MONEY" in text else "BNI TapCash" if "TAPCASH" in text else "BCA Flazz"
        return "Uang Elektronik", provider

    digital = [
        ("GOOGLE PLAY", "Google Play"), ("APPLE", "Apple Gift Card"),
        ("CANVA", "Canva Pro"), ("CHAT GPT", "ChatGPT"), ("UNIPIN", "UniPin"),
        ("TIKTOK", "TikTok"),
    ]
    for needle, provider in digital:
        if needle in text:
            return "Voucher Digital", provider
    streaming = [
        ("NETFLIX", "Netflix"), ("SPOTIFY", "Spotify"), ("YOUTUBE", "YouTube Premium"),
        ("DISNEY", "Disney+ Hotstar"), ("VIDIO", "Vidio"), (" VIU", "Viu"),
        ("WETV", "WeTV"),
    ]
    for needle, provider in streaming:
        if needle in text:
            return "Hiburan Digital", provider

    television = [
        ("K-VISION", "K-Vision"), ("TRANSVISION", "Transvision"),
        ("MNC VISION", "MNC Vision"), ("NEX PARABOLA", "Nex Parabola"),
        ("VISION+", "Vision+"), ("INDIHOME", "IndiHome"),
        ("TELKOM", "Telkom"), ("TV PASCABAYAR", "TV Berlangganan"),
    ]
    for needle, provider in television:
        if needle in text:
            return "Internet & TV", provider

    return "Layanan H2H", group.title()


def service_for(category: str, operator: str) -> str:
    direct = {
        "Pulsa": "pulsa", "Paket Data": "data", "Pascabayar": "pascabayar",
        "E-Wallet": "ewallet", "Uang Elektronik": "emoney", "Voucher Game": "game",
        "Token PLN": "pln", "PDAM": "pdam", "BPJS": "bpjs", "Tagihan Gas": "gas",
        "Voucher Digital": "voucher", "Hiburan Digital": "streaming",
        "Transfer Bank": "bank",
    }
    if category in direct:
        return direct[category]
    if category == "Internet & TV":
        if operator in {"Telkom", "IndiHome"}:
            return "telkom"
        if operator in {"K-Vision", "Transvision", "MNC Vision", "Nex Parabola", "Vision+", "TV Berlangganan"}:
            return "tv"
        return "internet"
    return "internet"


def nominal_from(name: str, price: int) -> int:
    values = re.findall(r"(?<!\d)(\d{1,3}(?:\.\d{3})+|\d{4,})(?!\d)", name)
    if not values:
        return price
    value = int(values[-1].replace(".", ""))
    return value if value >= 1000 else price


def main() -> None:
    if len(sys.argv) != 2:
        raise SystemExit("usage: import_h2h_catalog.py <pasted-text.txt>")
    source = Path(sys.argv[1])
    lines = [line.strip() for line in source.read_text(encoding="utf-8", errors="ignore").splitlines() if line.strip()]
    rows: list[dict] = []
    seen: set[str] = set()
    price_pattern = re.compile(r"^(?:\+\s*)?Rp\s*-?[\d.]+$", re.IGNORECASE)
    for index, line in enumerate(lines):
        if not price_pattern.fullmatch(line) or index < 4:
            continue
        sku, name, group, status = lines[index - 4:index]
        status = status.replace("â€¢", "•")
        if status.upper() != "FIXED" and not status.upper().startswith("OPEN_AMOUNT"):
            continue
        if sku in seen:
            continue
        seen.add(sku)
        price = int(re.sub(r"\D", "", line)) * (-1 if "-" in line else 1)
        category, operator = classify(sku, name, group)
        open_amount = status.upper().startswith("OPEN_AMOUNT")
        rows.append({"id": f"h2h-{sku.lower()}", "sku": sku, "service": service_for(category, operator), "operator": operator, "name": name, "group": group, "category": category, "nominal": 0 if open_amount else nominal_from(name, price), "price": price, "stock": 999, "status": status})
    destination = Path(__file__).resolve().parents[1] / "backend" / "internal" / "service" / "h2h_catalog.json"
    destination.write_text(json.dumps(rows, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")
    print(f"generated {len(rows)} H2H products -> {destination}")


if __name__ == "__main__":
    main()
