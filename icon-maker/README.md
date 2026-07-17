# iPhone Theme Maker

Batch-converts Flaticon PNG/SVG icons into themed iPhone app icons: each icon
is recolored to a solid color and centered on a themed 1024x1024 background.

## Setup

A virtual environment with dependencies is already set up in `venv/`. To
recreate it from scratch:

```
python -m venv venv
./venv/Scripts/python.exe -m pip install -r requirements.txt
```

## Usage

1. Download icons from Flaticon as PNG (transparent background) or SVG and
   place them in `input/`.
2. Run:

```
./venv/Scripts/python.exe make_icons.py
```

3. Themed 1024x1024 icons are written to `output/` as PNGs, one per source
   file with the same name (SVGs are rasterized during conversion).

### Per-icon scale overrides

To make specific icons bigger (or smaller) than `--scale`, drop them into a
subfolder of `input/` named after the scale you want, e.g.:

```
input/
  facebook.png          # uses --scale (default 0.6)
  0.85/
    thin-logo.png        # uses scale 0.85 instead
```

The output mirrors the same subfolder structure (e.g. `output/0.85/thin-logo.png`).

## Options

| Flag       | Default    | Description                                                        |
|------------|------------|---------------------------------------------------------------------|
| `--input`  | `input`    | Folder of source PNG/SVG icons                                      |
| `--output` | `output`   | Folder to write themed icons to                                     |
| `--theme`  | `dark`     | Named preset for background/icon colors: `dark` (`103C49` bg / `FFFFFF` icon), `yellow` (`FFE710` bg / `151D20` icon), `outline-yellow` (`030E14` bg / `E4BD32` icon + border), or `outline-blue` (`030E14` bg / `36A6CB` icon + border) |
| `--bg`     | *(none)*   | Background color as hex, overrides `--theme`                       |
| `--fg`     | *(none)*   | Icon color as hex, overrides `--theme`                              |
| `--border` | *(none)*   | Outline border color as hex, overrides `--theme`. Pass `none` to strip a preset's border |
| `--scale`  | `0.6`      | Fraction of the 1024 canvas the icon's longest side should fill     |

Example using the yellow preset into its own output folder:

```
./venv/Scripts/python.exe make_icons.py --theme yellow --output output_yellow
```

Example using the thin-border outline presets (dark bg, colored icon + matching border):

```
./venv/Scripts/python.exe make_icons.py --theme outline-yellow --output output_outline_yellow
./venv/Scripts/python.exe make_icons.py --theme outline-blue --output output_outline_blue
```

Example with a one-off custom background and larger glyph:

```
./venv/Scripts/python.exe make_icons.py --bg 1A1A2E --scale 0.7
```

To add another named preset, edit the `THEMES` dict at the top of
`make_icons.py`.

## How it works

For each PNG/SVG in the input folder, `make_icons.py`:

1. Rasterizes SVGs to a transparent 1024x1024 PNG first (via `resvg-py`).
2. Crops away fully-transparent padding around the icon.
3. Recolors every pixel to `--fg`, keeping the original alpha channel (so
   anti-aliased edges stay smooth).
4. Scales the icon to fit within `--scale` of the 1024x1024 canvas.
5. Centers it on a solid background of `--bg`.
6. If a `--border` color is set (directly or via a theme like `outline-yellow`
   / `outline-blue`), strokes a thin rounded-rectangle outline near the edge
   of the canvas in that color, then saves the result as PNG.
