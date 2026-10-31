# Acik logodan koyu logo uretir.
#   1. Murekkep (harf dolgusu ve kenari) krem olur; yesil ve mercan golgeler
#      oldugu gibi kalir. Kenar pikselleri R kanalina gore karisim oraniyla
#      cevrilir, ince koyu dikis kalmaz.
#   2. Krem harf ile acik yesil golge birbirine karismasin diye harfin
#      cevresine, golgenin ustune koyu zemin renginde bir ayrim cizgisi
#      cizilir (Ozer: "renkler belli olmuyor", secenek B).
# Kullanim: python3 scripts/logo-koyu-uret.py public/borcama-logo.png cikti.png
import sys

import numpy as np
from PIL import Image, ImageFilter

MUREKKEP = (25, 26, 20)
KREM = (0xF4, 0xEF, 0xE0)
ZEMIN = (0x0F, 0x11, 0x0A)
GOLGE_R = 215.0      # golgelerin R kanali bundan yuksek
AYRIM = 9            # 900 px genislikte ayrim cizgisi yaricapi (px)

kaynak, hedef = sys.argv[1], sys.argv[2]
src = np.array(Image.open(kaynak).convert("RGBA")).astype(float)
r, a = src[..., 0], src[..., 3]

t = np.clip((GOLGE_R - r) / (GOLGE_R - MUREKKEP[0]), 0, 1)[..., None]
out = src.copy()
out[..., :3] = src[..., :3] + t * (np.array(KREM) - np.array(MUREKKEP))

harf = (out[..., 2] > 150) & (a > 0)
olcek = src.shape[1] / 900
yaricap = AYRIM * olcek
maske = Image.fromarray((harf * 255).astype(np.uint8))
genis = np.array(maske.filter(ImageFilter.GaussianBlur(yaricap * 0.75))).astype(float) / 255
halka = np.clip((genis - 0.08) / 0.25, 0, 1) * (~harf) * (a / 255)
for k in range(3):
    out[..., k] = out[..., k] * (1 - halka) + ZEMIN[k] * halka

Image.fromarray(np.clip(out, 0, 255).astype(np.uint8)).save(hedef, optimize=True)
