"""Fetch official Android app icons from Google Play pages for H2HR game brands."""
import html
import json
import os
import re
import sys
import time
import urllib.parse
import urllib.request
from concurrent.futures import ThreadPoolExecutor


GAMES = [
    "8 BALL POOL", "AGE OF EMPIRES MOBILE", "ARENA BREAKOUT", "AU2 MOBILE",
    "BLACK CLOVER M", "BLOOD STRIKE", "CALL OF DUTY MOBILE", "CLOUD SONG SAGA OF SKYWALK",
    "CRYSTAL OF ATLAN", "DELTA FORCE GARENA", "DRAGON RAJA", "FARLIGHT 84",
    "FC MOBILE", "FOOTBALL MASTER 2", "FREE FIRE", "FREE FIRE MAX", "GENSHIN IMPACT",
    "GROWTOPIA", "HAGO", "HONKAI IMPACT 3", "HONKAI STAR RAIL", "HONOR OF KINGS",
    "IDENTITY V", "LIGHT OF THEL NEW ERA", "LINEAGE2M", "LORDS MOBILE",
    "LYSSA GODDESS OF RAGE", "MADTALE IDLE RPG", "MAGIC CHESS GO GO", "MARVEL RIVALS",
    "MARVEL SNAP", "MARVEL SUPER WAR", "METAL SLUG AWAKENING", "MOBILE LEGENDS BANG BANG",
    "NARUTO SHIPPUDEN MOBILE", "OMEGA LEGENDS", "ONMYOJI ARENA", "POINT BLANK MOBILE",
    "POKEMON UNITE", "PUBG MOBILE", "PUBG MOBILE LITE", "NEW STATE MOBILE", "RACING MASTER",
    "ROBLOX", "SAUSAGE MAN", "SPEED DRIFTERS", "STATE OF SURVIVAL", "SUPER SUS",
    "UNDAWN", "WUTHERING WAVES", "ZENLESS ZONE ZERO",
]


def get(url):
    request = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0 (compatible; KuotaKita/1.0)"})
    with urllib.request.urlopen(request, timeout=25) as response:
        return response.read(), response.headers.get_content_type()


def slug(value):
    return re.sub(r"[^a-z0-9]+", "-", value.lower()).strip("-")


def main(destination):
    os.makedirs(destination, exist_ok=True)
    def fetch(name):
        query = urllib.parse.quote(name)
        search_url = f"https://play.google.com/store/search?q={query}&c=apps&hl=en&gl=US"
        try:
            page, _ = get(search_url)
            text = page.decode("utf-8", "replace")
            packages = re.findall(r"/store/apps/details\?id=([A-Za-z0-9._]+)", text)
            package = next(iter(dict.fromkeys(packages)), "")
            if not package:
                raise RuntimeError("package not found")
            detail_url = f"https://play.google.com/store/apps/details?id={package}&hl=en&gl=US"
            detail, _ = get(detail_url)
            detail_text = detail.decode("utf-8", "replace")
            title_match = re.search(r'<meta property="og:title" content="([^"]+)"', detail_text)
            image_match = re.search(r'<meta property="og:image" content="([^"]+)"', detail_text)
            if not image_match:
                raise RuntimeError("official icon not found")
            title = html.unescape(title_match.group(1)) if title_match else package
            image_url = html.unescape(image_match.group(1))
            image, content_type = get(image_url)
            extension = ".png" if "png" in content_type else ".webp" if "webp" in content_type else ".jpg"
            filename = slug(name) + extension
            path = os.path.join(destination, filename)
            with open(path, "wb") as handle:
                handle.write(image)
            return {"provider": name, "title": title, "package": package, "file": filename, "bytes": len(image)}
        except Exception as error:
            return {"provider": name, "error": str(error)}
    with ThreadPoolExecutor(max_workers=8) as executor:
        report = list(executor.map(fetch, GAMES))
    print(json.dumps(report, indent=2, ensure_ascii=False))


if __name__ == "__main__":
    main(sys.argv[1])
