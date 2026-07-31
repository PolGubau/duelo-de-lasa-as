from pathlib import Path
import shutil
import subprocess
from PIL import Image

root = Path(__file__).resolve().parents[1]
out = root / "assets" / "drawings"
generated = Path(r"C:\Users\gubau\.codex\generated_images\019fb96a-5c0d-7470-9f8a-2057b3a76728")
helper = Path(r"C:\Users\gubau\.codex\skills\.system\imagegen\scripts\remove_chroma_key.py")
python = Path(r"C:\Users\gubau\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe")
mapping = {
    "card_fill_tomato_sauce": "exec-89d7984a-ac2a-4728-90b2-b9c0a3449349.png",
    "card_fill_mercadona": "exec-082bf291-f1bc-4358-8a3d-2fdd4496c7e0.png",
    "card_fill_spinach": "exec-7398d30d-bcee-4930-9ecd-e82c98fef472.png",
    "card_fill_zucchini": "exec-97e1b49a-ee09-4ea5-b518-071172dddf26.png",
    "card_fill_tuna": "exec-c7f6b25d-1cc0-47c1-9eba-fbdcf3f241ae.png",
    "card_fill_fried_tomato": "exec-0054eb89-ee32-4783-b87b-2acfefa30c91.png",
    "card_pasta_fresh": "exec-bb2ef2f1-479b-45dc-8fd1-2b1db3105087.png",
    "card_pasta_bought": "exec-bb0115b1-b5f5-48c8-97d1-1696e120e373.png",
    "card_pasta_tortilla": "exec-8aa38541-a018-483d-9199-ed9c91f2a5c2.png",
    "card_bechamel_smooth": "exec-97afeb17-9f35-487f-b440-a0c7b509bbad.png",
    "card_bechamel_lumpy": "exec-6b874a78-2e19-40de-895c-b3235f5758d9.png",
    "card_bechamel_burnt": "exec-86cdc563-9ab4-4058-8bb6-30e0db615bca.png",
    "card_cond_salt": "exec-efdc19da-a93d-459c-8697-d4abde51ffdd.png",
    "card_cond_sugar": "exec-e931c7b3-54a7-4e2a-8af6-a9c86637d076.png",
    "card_cond_rosemary": "exec-2df07a9c-6897-4d90-8505-dec3cb5e4fbc.png",
    "card_cond_thyme": "exec-d185de2b-da61-43a7-ac71-e1f09b408725.png",
    "card_cond_cinnamon": "exec-865aabb8-2aae-4005-a677-3a1cb8a0adcf.png",
    "card_cond_basil": "exec-09d6dcc1-cb67-45a8-8207-52dc85c2feb0.png",
    "card_cond_oregano": "exec-c00edbdd-c364-48c7-89cd-f2e0958905c4.png",
    "card_cond_turmeric": "exec-31bc4469-fd82-4f60-9c75-0f896b7a0b2b.png",
    "card_fill_chicken": "exec-30e5aeee-6db1-4538-a3c4-3b8b01256e94.png",
}
for name, filename in mapping.items():
    source = generated / filename
    temp = out / f"{name}.src.png"
    final = out / f"{name}.png"
    shutil.copy2(source, temp)
    image = Image.open(temp)
    image.thumbnail((1024, 1024), Image.Resampling.LANCZOS)
    image.save(temp, "PNG", optimize=True)
    subprocess.run([
        str(python), str(helper), "--input", str(temp), "--out", str(final),
        "--auto-key", "border", "--soft-matte", "--transparent-threshold", "12",
        "--opaque-threshold", "220", "--despill", "--force",
    ], check=True)
    temp.unlink()
