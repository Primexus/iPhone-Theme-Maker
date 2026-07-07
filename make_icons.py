#!/usr/bin/env python
"""Batch-convert Flaticon PNG/SVG icons into themed 1024x1024 iPhone app icons.

Each source icon is recolored to a solid color (using its existing alpha
channel as the shape mask), trimmed of transparent padding, scaled down,
and centered on a background-colored 1024x1024 canvas.

Usage:
    python make_icons.py
    python make_icons.py --input input --output output --scale 0.6 --bg 103C49 --fg FFFFFF
"""

import argparse
import io
from pathlib import Path

import resvg_py
from PIL import Image

SOURCE_GLOBS = ("*.png", "*.svg")
SVG_RENDER_SIZE = 1024

CANVAS_SIZE = 1024

THEMES = {
    "dark": {"bg": "103C49", "fg": "FFFFFF"},
    "yellow": {"bg": "84813A", "fg": "151D20"},
}


def hex_to_rgb(value: str) -> tuple[int, int, int]:
    value = value.lstrip("#")
    return tuple(int(value[i : i + 2], 16) for i in (0, 2, 4))


def recolor(icon: Image.Image, color: tuple[int, int, int]) -> Image.Image:
    """Replace every opaque pixel's color with `color`, keeping alpha as-is."""
    alpha = icon.getchannel("A")
    solid = Image.new("RGBA", icon.size, color + (0,))
    solid.putalpha(alpha)
    return solid


def load_icon(src_path: Path) -> Image.Image:
    if src_path.suffix.lower() == ".svg":
        png_bytes = resvg_py.svg_to_bytes(
            svg_path=str(src_path), width=SVG_RENDER_SIZE, height=SVG_RENDER_SIZE
        )
        return Image.open(io.BytesIO(bytes(png_bytes))).convert("RGBA")
    return Image.open(src_path).convert("RGBA")


def make_icon(
    src_path: Path,
    bg_color: tuple[int, int, int],
    fg_color: tuple[int, int, int],
    scale: float,
) -> Image.Image:
    icon = load_icon(src_path)

    bbox = icon.getchannel("A").getbbox()
    if bbox:
        icon = icon.crop(bbox)

    icon = recolor(icon, fg_color)

    target = int(CANVAS_SIZE * scale)
    icon.thumbnail((target, target), Image.LANCZOS)

    canvas = Image.new("RGB", (CANVAS_SIZE, CANVAS_SIZE), bg_color)
    offset = ((CANVAS_SIZE - icon.width) // 2, (CANVAS_SIZE - icon.height) // 2)
    canvas.paste(icon, offset, mask=icon)
    return canvas


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--input", default="input", help="Folder of source PNG/SVG icons")
    parser.add_argument("--output", default="output", help="Folder to write themed icons to")
    parser.add_argument(
        "--theme",
        choices=sorted(THEMES),
        default="dark",
        help="Named preset for background/icon colors (default: dark)",
    )
    parser.add_argument("--bg", default=None, help="Background color as hex, overrides --theme")
    parser.add_argument("--fg", default=None, help="Icon color as hex, overrides --theme")
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
    theme = THEMES[args.theme]
    bg_color = hex_to_rgb(args.bg if args.bg else theme["bg"])
    fg_color = hex_to_rgb(args.fg if args.fg else theme["fg"])

    sources = sorted(p for glob in SOURCE_GLOBS for p in input_dir.glob(glob))
    if not sources:
        print(f"No PNG/SVG files found in {input_dir}/")
        return

    for src in sources:
        result = make_icon(src, bg_color, fg_color, args.scale)
        dest = output_dir / f"{src.stem}.png"
        result.save(dest, "PNG")
        print(f"{src.name} -> {dest}")


if __name__ == "__main__":
    main()
