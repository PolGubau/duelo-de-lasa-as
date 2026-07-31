from pathlib import Path
from PIL import Image, ImageOps

OUT = Path(__file__).resolve().parents[1] / "assets" / "drawings"
OUT.mkdir(parents=True, exist_ok=True)

SRC = {
    "a": Image.open(r"C:\Users\gubau\AppData\Local\Packages\Microsoft.YourPhone_8wekyb3d8bbwe\TempState\medias\IMG_20260731_201805.HEIC").convert("RGB"),
    "b": Image.open(r"C:\Users\gubau\AppData\Local\Packages\Microsoft.YourPhone_8wekyb3d8bbwe\TempState\medias\IMG_20260731_201750.HEIC").convert("RGB"),
    "c": Image.open(r"C:\Users\gubau\AppData\Local\Packages\Microsoft.YourPhone_8wekyb3d8bbwe\TempState\medias\IMG_20260731_201741.HEIC").convert("RGB"),
}

# Rectangles are in the displayed-photo coordinate system (1152px wide); the
# script scales them to the original camera resolution. Each crop contains
# only the card's illustration panel. Rotation makes sideways cards upright.
CROPS = {
    "a": [
        ("card_cond_salt", (0, 100, 205, 360), 270),
        ("card_cond_rosemary", (190, 140, 530, 530), 270),
        ("card_pasta_fresh", (650, 35, 1010, 370), 270),
        ("card_bechamel_lumpy", (650, 390, 1010, 720), 270),
        ("card_bechamel_smooth", (650, 730, 1010, 1060), 270),
        ("card_cond_basil", (650, 980, 1010, 1300), 270),
        ("card_cond_turmeric", (650, 1320, 1010, 1650), 270),
        ("card_fill_chicken", (200, 1100, 560, 1500), 270),
        ("card_pasta_bought", (0, 1560, 400, 1900), 270),
        ("card_cond_thyme", (160, 520, 530, 850), 270),
        ("card_cond_cinnamon", (160, 850, 530, 1210), 270),
        ("card_cond_oregano", (700, 1640, 1050, 2010), 270),
    ],
    "b": [
        ("card_chef_ylenia", (160, 100, 520, 430), 270),
        ("card_cond_salt", (620, 180, 1010, 500), 270),
        ("card_fill_tomato_sauce", (100, 480, 540, 850), 270),
        ("card_cond_sugar", (620, 500, 1010, 850), 270),
        ("card_fill_mercadona", (100, 900, 540, 1280), 270),
        ("card_fill_fried_tomato", (620, 900, 1010, 1280), 270),
        ("card_fill_spinach", (100, 1240, 540, 1640), 270),
        ("card_chef_sara", (620, 1300, 1010, 1670), 270),
        ("card_bechamel_smooth", (100, 1640, 540, 2040), 270),
        ("card_chef_victor", (620, 1640, 1010, 2040), 270),
    ],
    "c": [
        ("card_cond_oregano", (80, 100, 520, 450), 270),
        ("card_pasta_tortilla", (620, 60, 1010, 450), 270),
        ("card_chef_pol", (100, 440, 540, 820), 270),
        ("card_fill_zucchini", (620, 440, 1010, 820), 270),
        ("card_bechamel_burnt", (100, 820, 540, 1200), 270),
        ("card_fill_tuna", (620, 820, 1010, 1200), 270),
        ("card_chef_dama", (100, 1200, 540, 1580), 270),
        ("card_chef_joan", (100, 1600, 540, 2000), 270),
        ("card_chef_lidia", (620, 1600, 1010, 2000), 270),
    ],
}

for key, entries in CROPS.items():
    im = SRC[key]
    scale = im.width / 1152
    for name, box, angle in entries:
        scaled = tuple(round(v * scale) for v in box)
        crop = im.crop(scaled)
        crop = crop.rotate(angle, expand=True, resample=Image.Resampling.BICUBIC)
        crop = ImageOps.exif_transpose(crop)
        # After rotation the illustration panel is the upper part of each
        # photographed card. Keep that panel and discard the title/rules text.
        if name == "card_fill_chicken":
            # This card overlaps Pasta Comprada in the source photo; its
            # illustration is at the upper-right after rotation.
            crop = crop.crop((round(crop.width * 0.45), 0, crop.width, round(crop.height * 0.34)))
        else:
            left = round(crop.width * 0.12)
            right = round(crop.width * 0.88)
            bottom = round(crop.height * 0.70)
            crop = crop.crop((left, 0, right, bottom))
        crop.save(OUT / f"{name}.png", "PNG", optimize=True)
