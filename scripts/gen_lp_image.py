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
        "Cinematic dark hero background for a Japanese real estate exam study app. "
        "Deep navy (#0a0e27) to black gradient. A glowing cyan-purple rocket launching upward "
        "into a starry night sky, leaving a soft trail of light. Subtle constellations and "
        "soft bokeh of cyan and magenta light particles. Empty negative space in the center "
        "so headline text can be overlaid. Minimal, modern, futuristic. No text, no UI elements."
    ),
    "features": (
        "A flat-design illustration of multiple sleek dark-themed mobile devices (smartphone, "
        "tablet) showing abstract study app screens — category icons, progress charts, "
        "radar chart, question cards. Dark navy background (#0a0e27), accent colors cyan #22d3ee "
        "and purple #a78bfa. Floating UI cards and subtle grid lines. Clean, modern, isometric-ish. "
        "No real text, only abstract glyphs."
    ),
    "update": (
        "Conceptual split illustration: left side shows old-style study (a single static "
        "notebook, faded), right side shows futuristic AI-optimized learning (glowing data "
        "viz, neural network nodes, multiple devices synced via cloud). Dark navy background, "
        "cyan-purple accents. Connecting arrows of light from old to new."
    ),
    "install": (
        "Flat isometric illustration of multiple devices (iPhone, Android phone, iPad, "
        "MacBook, Windows desktop) connected by glowing cyan lines to a soft cloud icon in "
        "the center. Dark navy background, cyan #22d3ee and purple #a78bfa accents. Subtle "
        "grid lines on the floor. No text. Minimal, clean."
    ),
    "logo": (
        "App icon: rounded square gradient background (cyan #22d3ee to purple #a78bfa). "
        "Centered white rocket silhouette with subtle book pages forming the rocket fins. "
        "Glossy, modern, iOS-style icon. No text. Square 1024x1024 friendly composition."
    ),
    "aibrain": (
        "Stylized brain icon made of glowing neural network lines and nodes. "
        "Purple-magenta gradient background. White line-art brain merging into a "
        "circuit-like neural network. Glowing connection points. Minimal, modern, "
        "iOS-style icon. No text."
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
