#!/usr/bin/env python
"""Batch-convert Flaticon PNG icons into themed 1024x1024 iPhone app icons.

Each source icon is recolored to solid white (using its existing alpha
channel as the shape mask), trimmed of transparent padding, scaled down,
and centered on a background-colored 1024x1024 canvas.

Usage:
    python make_icons.py
    python make_icons.py --input input --output output --scale 0.6 --bg 103C49
"""

import argparse
from pathlib import Path

from PIL import Image

CANVAS_SIZE = 1024


def hex_to_rgb(value: str) -> tuple[int, int, int]:
    value = value.lstrip("#")
    return tuple(int(value[i : i + 2], 16) for i in (0, 2, 4))


def whiten(icon: Image.Image) -> Image.Image:
    """Replace every opaque pixel's color with white, keeping alpha as-is."""
    alpha = icon.getchannel("A")
    white = Image.new("RGBA", icon.size, (255, 255, 255, 0))
    white.putalpha(alpha)
    return white


def make_icon(src_path: Path, bg_color: tuple[int, int, int], scale: float) -> Image.Image:
    icon = Image.open(src_path).convert("RGBA")

    bbox = icon.getchannel("A").getbbox()
    if bbox:
        icon = icon.crop(bbox)

    icon = whiten(icon)

    target = int(CANVAS_SIZE * scale)
    icon.thumbnail((target, target), Image.LANCZOS)

    canvas = Image.new("RGB", (CANVAS_SIZE, CANVAS_SIZE), bg_color)
    offset = ((CANVAS_SIZE - icon.width) // 2, (CANVAS_SIZE - icon.height) // 2)
    canvas.paste(icon, offset, mask=icon)
    return canvas


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--input", default="input", help="Folder of source PNG icons")
    parser.add_argument("--output", default="output", help="Folder to write themed icons to")
    parser.add_argument("--bg", default="103C49", help="Background color as hex (default: 103C49)")
    parser.add_argument(
        "--scale",
        type=float,
        default=0.6,
        help="Fraction of the 1024 canvas the icon's longest side should fill (default: 0.6)",
    )
    args = parser.parse_args()

    input_dir = Path(args.input)
    output_dir = Path(args.output)
    output_dir.mkdir(parents=True, exist_ok=True)
    bg_color = hex_to_rgb(args.bg)

    sources = sorted(p for p in input_dir.glob("*.png"))
    if not sources:
        print(f"No PNG files found in {input_dir}/")
        return

    for src in sources:
        result = make_icon(src, bg_color, args.scale)
        dest = output_dir / src.name
        result.save(dest, "PNG")
        print(f"{src.name} -> {dest}")


if __name__ == "__main__":
    main()
