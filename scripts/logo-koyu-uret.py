# Acik logodan koyu logo: murekkep (harf dolgusu ve kenari) krem olur, yesil
# ve mercan golgeler oldugu gibi kalir. Kenar pikselleri R kanalina gore
# karisim oraniyla cevrilir; ince koyu dikis kalmaz.
import sys
from PIL import Image
kaynak, hedef = sys.argv[1], sys.argv[2]
src = Image.open(kaynak).convert("RGBA")
px = src.load()
ink = (25, 26, 20)
krem = (0xf4, 0xef, 0xe0)
diger = 215.0
out = Image.new("RGBA", src.size)
op = out.load()
for y in range(src.height):
    for x in range(src.width):
        r, g, b, a = px[x, y]
        if a == 0:
            op[x, y] = (0, 0, 0, 0)
            continue
        t = max(0.0, min(1.0, (diger - r) / (diger - ink[0])))
        op[x, y] = tuple(int(max(0, min(255, round(c + t * (k - i))))) for c, k, i in zip((r, g, b), krem, ink)) + (a,)
out.save(hedef, optimize=True)
