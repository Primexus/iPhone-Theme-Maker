# iPhone Theme Maker

Batch-converts Flaticon PNG icons into themed iPhone app icons: each icon is
recolored to solid white and centered on a `#103C49` 1024x1024 background.

## Setup

A virtual environment with dependencies is already set up in `venv/`. To
recreate it from scratch:

```
python -m venv venv
./venv/Scripts/python.exe -m pip install -r requirements.txt
```

## Usage

1. Download icons from Flaticon as PNG (transparent background) and place
   them in `input/`.
2. Run:

```
./venv/Scripts/python.exe make_icons.py
```

3. Themed 1024x1024 icons are written to `output/`, one per source file with
   the same name.

## Options

| Flag       | Default    | Description                                                        |
|------------|------------|---------------------------------------------------------------------|
| `--input`  | `input`    | Folder of source PNG icons                                          |
| `--output` | `output`   | Folder to write themed icons to                                     |
| `--bg`     | `103C49`   | Background color as hex                                             |
| `--scale`  | `0.6`      | Fraction of the 1024 canvas the icon's longest side should fill     |

Example with a different background and larger glyph:

```
./venv/Scripts/python.exe make_icons.py --bg 1A1A2E --scale 0.7
```

## How it works

For each PNG in the input folder, `make_icons.py`:

1. Crops away fully-transparent padding around the icon.
2. Recolors every pixel to solid white, keeping the original alpha channel
   (so anti-aliased edges stay smooth).
3. Scales the icon to fit within `--scale` of the 1024x1024 canvas.
4. Centers it on a solid background of `--bg` and saves the result.
