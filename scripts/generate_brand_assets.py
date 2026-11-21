#!/usr/bin/env python3
"""Generate app icons and splash images from assets/brand/emblem.png.

The emblem is a rounded blue tile on a white page. This script:
  * cuts the tile out (transparent corners) for the in-app / splash logo, and
  * extends the tile's blue background past its rounded corners to build a
    full-bleed square, so iOS and Android can apply their own icon masks.

Run from the project root after changing the emblem:

    python3 scripts/generate_brand_assets.py

Requires Pillow and numpy.
"""

import json
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFilter

ROOT = Path(__file__).resolve().parent.parent
EMBLEM = ROOT / "assets" / "brand" / "emblem.png"
IMAGES = ROOT / "src" / "assets" / "images" / "app-icon"
IOS_ASSETS = ROOT / "ios" / "fixora_customerapp" / "Images.xcassets"
ANDROID_RES = ROOT / "android" / "app" / "src" / "main" / "res"

ANDROID_DENSITIES = {"mdpi": 1, "hdpi": 1.5, "xhdpi": 2, "xxhdpi": 3, "xxxhdpi": 4}
SPLASH_LOGO_PT = 200  # logo canvas size on the splash screen (pt / dp)

# Adaptive icons: 108dp canvas, only a 66dp circle is guaranteed to be visible.
ADAPTIVE_CANVAS_DP = 108
ADAPTIVE_SAFE_RADIUS_DP = 33


def tile_geometry(img: Image.Image):
    """Bounding box and corner radius of the rounded tile inside the emblem."""
    rgb = np.asarray(img.convert("RGB")).astype(int)
    inside = rgb.sum(axis=2) < 700  # anything that isn't the white page
    ys, xs = np.nonzero(inside)
    x0, x1, y0, y1 = xs.min(), xs.max() + 1, ys.min(), ys.max() + 1
    # Radius from where the top edge starts: first tile pixel in the row 2% down.
    probe = y0 + max(4, (y1 - y0) // 50)
    row = np.nonzero(inside[probe])[0]
    inset, dy = row.min() - x0, probe - y0
    # Circle through the probe point: (r - inset)^2 + (r - dy)^2 = r^2
    a, b = inset, dy
    r = (a + b) + np.sqrt(2 * a * b)
    return (int(x0), int(y0), int(x1), int(y1)), float(r)


def tile_mask(size, box, radius, shrink=0) -> Image.Image:
    x0, y0, x1, y1 = box
    mask = Image.new("L", size, 0)
    ImageDraw.Draw(mask).rounded_rectangle(
        (x0 + shrink, y0 + shrink, x1 - 1 - shrink, y1 - 1 - shrink),
        radius=max(0, radius - shrink),
        fill=255,
    )
    return mask


def extended_master(img: Image.Image, box, radius, canvas: int) -> Image.Image:
    """Square canvas centred on the tile; everything outside the tile is filled
    by projecting onto the tile's edge, so the blue gradient carries on."""
    x0, y0, x1, y1 = box
    cx, cy = (x0 + x1) / 2, (y0 + y1) / 2
    src = np.asarray(img.convert("RGB")).astype(np.float32)
    margin = 28  # stay clear of the tile's lighter rim and anti-aliased edge
    r = radius - margin
    lx0, ly0, lx1, ly1 = x0 + margin, y0 + margin, x1 - 1 - margin, y1 - 1 - margin

    yy, xx = np.mgrid[0:canvas, 0:canvas].astype(np.float32)
    px = xx - canvas / 2 + cx
    py = yy - canvas / 2 + cy
    qx = np.clip(px, lx0, lx1)
    qy = np.clip(py, ly0, ly1)
    # Snap points in the rounded corners onto the corner arc.
    ax = np.clip(qx, lx0 + r, lx1 - r)
    ay = np.clip(qy, ly0 + r, ly1 - r)
    dx, dy = qx - ax, qy - ay
    dist = np.sqrt(dx * dx + dy * dy)
    over = dist > r
    scale = np.where(over, r / np.maximum(dist, 1e-6), 1.0)
    qx, qy = ax + dx * scale, ay + dy * scale

    fill = src[qy.round().astype(int), qx.round().astype(int)]
    fill_img = Image.fromarray(fill.astype(np.uint8)).filter(
        ImageFilter.GaussianBlur(canvas / 60)
    )

    out = fill_img.copy()
    offset = (int(round(canvas / 2 - cx)), int(round(canvas / 2 - cy)))
    mask = tile_mask(img.size, box, radius, shrink=margin).filter(
        ImageFilter.GaussianBlur(margin / 2)
    )
    out.paste(img.convert("RGB"), offset, mask)
    return out


def save(img: Image.Image, size: int, path: Path, mode: str = "RGB") -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    img.resize((size, size), Image.LANCZOS).convert(mode).save(path, optimize=True)


def masked(img: Image.Image, shape: str) -> Image.Image:
    size = img.size[0]
    scale = 4  # supersample the mask for smooth edges
    mask = Image.new("L", (size * scale, size * scale), 0)
    draw = ImageDraw.Draw(mask)
    if shape == "rounded":
        draw.rounded_rectangle((0, 0, size * scale - 1, size * scale - 1), radius=size * scale * 0.225, fill=255)
    else:
        draw.ellipse((0, 0, size * scale - 1, size * scale - 1), fill=255)
    out = img.convert("RGBA")
    out.putalpha(mask.resize((size, size), Image.LANCZOS))
    return out


def main() -> None:
    emblem = Image.open(EMBLEM).convert("RGB")
    box, radius = tile_geometry(emblem)
    x0, y0, x1, y1 = box
    tile = max(x1 - x0, y1 - y0)

    # Full-bleed square, the size of the tile (iOS + legacy Android icons).
    square = extended_master(emblem, box, radius, tile)

    # Bigger canvas for the adaptive-icon foreground: the artwork (roughly 0.9 of the
    # tile's half-width from centre) must fit inside the 33dp safe circle.
    artwork_radius = tile / 2 * 0.92
    adaptive_canvas = int(artwork_radius * ADAPTIVE_CANVAS_DP / ADAPTIVE_SAFE_RADIUS_DP)
    adaptive = extended_master(emblem, box, radius, adaptive_canvas)

    # Cut-out tile with transparent corners (in-app + native splash logo).
    logo = emblem.convert("RGBA")
    logo.putalpha(tile_mask(emblem.size, box, radius))
    logo = logo.crop(box)
    pad = Image.new("RGBA", (tile, tile), (0, 0, 0, 0))
    pad.paste(logo, ((tile - logo.width) // 2, (tile - logo.height) // 2))
    logo = pad

    # iOS app icon
    folder = IOS_ASSETS / "AppIcon.appiconset"
    contents = json.loads((folder / "Contents.json").read_text())
    for image in contents["images"]:
        pixels = round(float(image["size"].split("x")[0]) * int(image["scale"].rstrip("x")))
        name = f"icon-{pixels}.png"
        save(square, pixels, folder / name)  # App Store icons must be opaque
        image["filename"] = name
    (folder / "Contents.json").write_text(json.dumps(contents, indent=2) + "\n")

    # iOS splash logo
    folder = IOS_ASSETS / "SplashLogo.imageset"
    images = []
    for s in (1, 2, 3):
        name = f"splash-logo@{s}x.png"
        save(logo, SPLASH_LOGO_PT * s, folder / name, "RGBA")
        images.append({"idiom": "universal", "filename": name, "scale": f"{s}x"})
    (folder / "Contents.json").write_text(
        json.dumps({"images": images, "info": {"version": 1, "author": "xcode"}}, indent=2) + "\n"
    )

    # Android launcher icons
    rounded, circle = masked(square, "rounded"), masked(square, "circle")
    for density, factor in ANDROID_DENSITIES.items():
        folder = ANDROID_RES / f"mipmap-{density}"
        save(rounded, round(48 * factor), folder / "ic_launcher.png", "RGBA")
        save(circle, round(48 * factor), folder / "ic_launcher_round.png", "RGBA")
        save(adaptive, round(ADAPTIVE_CANVAS_DP * factor), folder / "ic_launcher_foreground.png")

    # Android native splash logo
    save(logo, SPLASH_LOGO_PT * 4, ANDROID_RES / "drawable-xxxhdpi" / "splash_logo.png", "RGBA")

    # JS splash / register screen logo
    for s, suffix in ((1, ""), (2, "@2x"), (3, "@3x")):
        save(logo, SPLASH_LOGO_PT * s, IMAGES / f"app-logo{suffix}.png", "RGBA")

    print(f"Brand assets generated (tile {tile}px, corner radius {radius:.0f}px).")


if __name__ == "__main__":
    main()
