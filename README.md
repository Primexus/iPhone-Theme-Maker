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

## Options

| Flag       | Default    | Description                                                        |
|------------|------------|---------------------------------------------------------------------|
| `--input`  | `input`    | Folder of source PNG/SVG icons                                      |
| `--output` | `output`   | Folder to write themed icons to                                     |
| `--theme`  | `dark`     | Named preset for background/icon colors: `dark` (`103C49` bg / `FFFFFF` icon) or `yellow` (`84813A` bg / `151D20` icon) |
| `--bg`     | *(none)*   | Background color as hex, overrides `--theme`                       |
| `--fg`     | *(none)*   | Icon color as hex, overrides `--theme`                              |
| `--scale`  | `0.6`      | Fraction of the 1024 canvas the icon's longest side should fill     |

Example using the yellow preset into its own output folder:

```
./venv/Scripts/python.exe make_icons.py --theme yellow --output output_yellow
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
5. Centers it on a solid background of `--bg` and saves the result as PNG.
