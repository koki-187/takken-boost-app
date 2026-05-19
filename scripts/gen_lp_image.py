"""
LP image generator using OpenAI image API (gpt-image-1).

Usage:
  python gen_lp_image.py <preset> [--prompt "custom prompt"] [--size 1536x1024]

Presets:
  hero       - Hero section background (dark navy + rocket)
  features   - Feature showcase (devices + UI)
  update     - Version comparison (AI/data viz)
  install    - Multi-device cloud sync
  logo       - App icon (rocket + book)
  aibrain    - AI brain icon (neural net)

Outputs:
  C:/takken-build/public/lp-assets/<preset>-desktop.webp (1600px wide)
  C:/takken-build/public/lp-assets/<preset>-mobile.webp  (600px wide)

Reads API key from H:/.../BOOST_LP作成用.env (line containing "sk-proj-...").
"""
import argparse
import base64
import io
import os
import re
import sys
from pathlib import Path

sys.stdout.reconfigure(encoding="utf-8")

ENV_PATH = Path("H:/マイドライブ/♦♦♦オリジナル プロダクト♦♦♦/◇宅建BOOST◇/BOOST_LP作成用.env")
OUT_DIR = Path("C:/takken-build/public/lp-assets")
OUT_DIR.mkdir(parents=True, exist_ok=True)

PRESETS = {
    "hero": (
        "Wide cinematic dark hero composition for a real estate exam study platform. "
        "Background: deep navy blue (#0a0e27) night with a subtle glowing cyan digital "
        "circuit / network grid pattern and city silhouette far in the distance. "
        "Center-right: a 3D floating photoreal smartphone, tablet, and laptop arranged "
        "diagonally, each screen displaying abstract dark UI mockups with cyan accents — "
        "progress rings, bar charts, and question cards. Floating around the devices: "
        "thin-line cyan icons (a house, a balance scale, a checkmark on document, an "
        "AI brain, a book) connected by faint network lines. Left third: clean empty "
        "negative space for headline text. No text or letters in the image. Color palette: "
        "navy #0a0e27, cyan #22d3ee, soft white highlights. Premium, modern, futuristic."
    ),
    "features": (
        "Wide hero panel for a learning platform feature showcase. Four floating glassy "
        "navy cards arranged in a row, each with a thin-line cyan icon at top and a subtle "
        "label area (abstract glyphs only, no real text). Icons: a stack of papers, a "
        "stylized AI gear/brain, a target with arrow, a bar chart with upward arrow. "
        "Background: deep navy #0a0e27 with a soft cyan digital network grid receding into "
        "the distance, faint city silhouette far away. Cyan #22d3ee glow on icons. "
        "Cinematic, premium, no readable text."
    ),
    "update": (
        "Side-by-side comparison illustration. Left column: a single small smartphone with "
        "simple desaturated UI labeled visually as 'old'. Right column: a luminous cyan AI "
        "icon at center radiating connections to a smartphone, tablet, and laptop, all "
        "showing rich glowing dashboard UI mockups. Between the two columns: a glowing "
        "cyan arrow pointing right. Background: deep navy #0a0e27 with cyan circuit grid. "
        "Cyan #22d3ee accents throughout. Premium, futuristic, no readable text."
    ),
    "install": (
        "Wide horizontal illustration of PWA multi-OS support. Bottom: a horizontal row of "
        "5 floating device silhouettes — iPhone, Android phone, iPad, Windows laptop, "
        "MacBook — each with a tiny abstract glowing dashboard. Above them: a large soft "
        "glowing cyan cloud icon with a small geometric house mark inside. Thin cyan lines "
        "radiate from the cloud down to each device. Background: deep navy #0a0e27 with a "
        "soft cyan digital grid and far-distance city skyline silhouette. Cyan #22d3ee "
        "accents, glassmorphism. No readable text, only abstract glyphs."
    ),
    "logo": (
        "App icon, square 1024x1024, iOS-style rounded-corner glossy badge. Background: "
        "deep navy to cyan gradient (#0a0e27 → #22d3ee). Centered: a clean geometric "
        "white house silhouette (simple roof + walls, modern minimal style) with a small "
        "subtle upward arrow or star above the roof suggesting growth. Soft cyan inner "
        "glow around the house. No letters, no text, no characters. Premium, minimal, "
        "Apple App Store icon aesthetic."
    ),
    "aibrain": (
        "Circular icon, 1024x1024. Background: dark navy with a faint cyan radial glow. "
        "Centered: a luminous cyan line-art human brain stylized as a neural network — "
        "thin curved lines forming brain hemispheres with bright cyan nodes at neuron "
        "intersections, faint connecting filaments. Soft cyan #22d3ee outer glow. "
        "Glassmorphism feel. Minimal, futuristic, no text, no letters."
    ),
}


def load_api_key() -> str:
    text = ENV_PATH.read_text(encoding="utf-8")
    m = re.search(r"sk-[A-Za-z0-9_\-]{20,}", text)
    if not m:
        raise SystemExit(f"API key not found in {ENV_PATH}")
    return m.group(0)


def generate(preset: str, prompt_override: str | None, size: str) -> bytes:
    from openai import OpenAI

    api_key = load_api_key()
    client = OpenAI(api_key=api_key)

    prompt = prompt_override or PRESETS[preset]
    print(f"[gen] preset={preset} size={size}")
    print(f"[gen] prompt={prompt[:120]}...")

    resp = client.images.generate(
        model="gpt-image-1",
        prompt=prompt,
        size=size,
        n=1,
    )
    b64 = resp.data[0].b64_json
    return base64.b64decode(b64)


def save_webp(png_bytes: bytes, preset: str) -> None:
    from PIL import Image

    img = Image.open(io.BytesIO(png_bytes)).convert("RGB")
    w, h = img.size

    # Desktop: max 1600px wide
    dw = 1600
    dh = int(h * dw / w)
    img_desktop = img.resize((dw, dh), Image.LANCZOS)
    path_desktop = OUT_DIR / f"{preset}-desktop.webp"
    img_desktop.save(path_desktop, "WEBP", quality=85, method=6)
    print(f"[save] {path_desktop} ({path_desktop.stat().st_size // 1024}KB)")

    # Mobile: max 600px wide
    mw = 600
    mh = int(h * mw / w)
    img_mobile = img.resize((mw, mh), Image.LANCZOS)
    path_mobile = OUT_DIR / f"{preset}-mobile.webp"
    img_mobile.save(path_mobile, "WEBP", quality=82, method=6)
    print(f"[save] {path_mobile} ({path_mobile.stat().st_size // 1024}KB)")


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("preset", choices=list(PRESETS.keys()))
    ap.add_argument("--prompt", default=None, help="Override default prompt")
    ap.add_argument(
        "--size",
        default="1536x1024",
        choices=["1024x1024", "1536x1024", "1024x1536"],
        help="Image size (gpt-image-1 supported)",
    )
    args = ap.parse_args()

    png_bytes = generate(args.preset, args.prompt, args.size)
    save_webp(png_bytes, args.preset)
    print("[done]")


if __name__ == "__main__":
    main()
