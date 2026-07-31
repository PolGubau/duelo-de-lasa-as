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
    "card_cond_rosemary": "exec-2df07a9c-6897-4d90-8505-dec3cb5e4fbc.png",
    "card_cond_thyme": "exec-d185de2b-da61-43a7-ac71-e1f09b408725.png",
    "card_cond_cinnamon": "exec-865aabb8-2aae-4005-a677-3a1cb8a0adcf.png",
    "card_cond_basil": "exec-09d6dcc1-cb67-45a8-8207-52dc85c2feb0.png",
    "card_cond_oregano": "exec-c00edbdd-c364-48c7-89cd-f2e0958905c4.png",
    "card_cond_turmeric": "exec-31bc4469-fd82-4f60-9c75-0f896b7a0b2b.png",
    "card_fill_chicken": "exec-30e5aeee-6db1-4538-a3c4-3b8b01256e94.png",
}
for name, filename in mapping.items():
    temp = out / f"{name}.src.png"
    shutil.copy2(generated / filename, temp)
    image = Image.open(temp)
    image.thumbnail((1024, 1024), Image.Resampling.LANCZOS)
    image.save(temp, "PNG", optimize=True)
    subprocess.run([str(python), str(helper), "--input", str(temp), "--out", str(out / f"{name}.png"), "--auto-key", "border", "--soft-matte", "--transparent-threshold", "12", "--opaque-threshold", "220", "--despill", "--force"], check=True)
    temp.unlink()
