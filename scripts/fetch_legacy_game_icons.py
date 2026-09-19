import html
import json
import re
import sys
import urllib.parse
import urllib.request


def get(url):
    request = urllib.request.Request(url, headers={"User-Agent": "KuotaKita/1.0 (logo audit)"})
    with urllib.request.urlopen(request, timeout=30) as response:
        return response.read()


def download(url, path):
    data = get(url)
    with open(path, "wb") as handle:
        handle.write(data)
    return len(data)


destination = sys.argv[1]
point_page = get("https://en.wikipedia.org/wiki/Point_Blank_(2008_video_game)").decode("utf-8", "replace")
point_match = re.search(r'<meta property="og:image" content="([^"]+)"', point_page)
if not point_match:
    raise RuntimeError("Point Blank logo not found")
point_url = html.unescape(point_match.group(1))
point_bytes = download(point_url, destination + "/point-blank.png")

omega_page = get("https://apkpure.com/omega-legends/com.igg.android.omegalegends").decode("utf-8", "replace")
match = re.search(r'<meta property="og:image" content="([^"]+)"', omega_page)
if not match:
    raise RuntimeError("Omega Legends icon not found")
omega_url = html.unescape(match.group(1))
omega_bytes = download(omega_url, destination + "/omega-legends.png")
print(json.dumps({"point_blank": point_bytes, "omega_legends": omega_bytes}))
