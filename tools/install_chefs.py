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
    "card_chef_pol": "exec-9d39e060-c3f7-43ce-a68d-073029afecc5.png",
    "card_chef_ylenia": "exec-939c7476-1a10-4ea9-8903-e6f933c97069.png",
    "card_chef_sara": "exec-7974c37d-e26f-4064-9068-4ddef5236da8.png",
    "card_chef_victor": "exec-060d878e-db8b-440f-beee-0f81b4cc1887.png",
    "card_chef_dama": "exec-ebd799c2-e070-44d9-87c6-20df57fe2c35.png",
    "card_chef_joan": "exec-5cd85a9f-88b6-4545-b8b8-6b18e6adc639.png",
    "card_chef_lidia": "exec-91456e82-62d4-4d6f-b1e8-daeb23e15733.png",
}
for name, filename in mapping.items():
    temp = out / f"{name}.src.png"
    shutil.copy2(generated / filename, temp)
    image = Image.open(temp)
    image.thumbnail((1024, 1024), Image.Resampling.LANCZOS)
    image.save(temp, "PNG", optimize=True)
    subprocess.run([str(python), str(helper), "--input", str(temp), "--out", str(out / f"{name}.png"), "--auto-key", "border", "--soft-matte", "--transparent-threshold", "12", "--opaque-threshold", "220", "--despill", "--force"], check=True)
    temp.unlink()
