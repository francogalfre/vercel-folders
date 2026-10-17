from PIL import Image, ImageDraw
import os

SS = 8
BASE = 128 * SS
OUT = os.path.join(os.path.dirname(__file__), "..", "public", "icons")


def s(v):
    return v * SS


def draw_master():
    img = Image.new("RGBA", (BASE, BASE), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    d.rounded_rectangle([0, 0, BASE - 1, BASE - 1], radius=s(28), fill="#000000")
    d.rounded_rectangle([s(21), s(26), s(67), s(60)], radius=s(10), fill="#ffffff")
    d.rounded_rectangle([s(21), s(40), s(107), s(100)], radius=s(12), fill="#ffffff")
    d.polygon([(s(64), s(57)), (s(79), s(83)), (s(49), s(83))], fill="#000000")
    return img


master = draw_master()
os.makedirs(OUT, exist_ok=True)
for size in (16, 32, 48, 128):
    path = os.path.join(OUT, f"icon-{size}.png")
    master.resize((size, size), Image.LANCZOS).save(path)
    print(f"Created {path}")
