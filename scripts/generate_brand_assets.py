#!/usr/bin/env python3
"""Generate app icons and splash images from the SVGs in assets/brand/.

Run from the project root after changing the design:

    python3 scripts/generate_brand_assets.py

Requires `rsvg-convert` (brew install librsvg) and Pillow.
"""

import json
import subprocess
import tempfile
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
BRAND = ROOT / "assets" / "brand"
ICON_SVG = BRAND / "icon.svg"
MARK_SVG = BRAND / "mark.svg"

IOS_ASSETS = ROOT / "ios" / "fixora_customerapp" / "Images.xcassets"
ANDROID_RES = ROOT / "android" / "app" / "src" / "main" / "res"

ANDROID_DENSITIES = {"mdpi": 1, "hdpi": 1.5, "xhdpi": 2, "xxhdpi": 3, "xxxhdpi": 4}
SPLASH_LOGO_PT = 200  # logo canvas size on the splash screen (pt / dp)


def render(svg: Path, size: int, out: Path, opaque: bool = False) -> None:
    out.parent.mkdir(parents=True, exist_ok=True)
    subprocess.run(
        ["rsvg-convert", "-w", str(size), "-h", str(size), str(svg), "-o", str(out)],
        check=True,
    )
    if opaque:
        # App Store icons must not have an alpha channel.
        Image.open(out).convert("RGB").save(out)


def masked_icon_svg(shape: str) -> Path:
    """The full icon clipped to a rounded square or circle (legacy Android)."""
    body = ICON_SVG.read_text()
    inner = body[body.index(">", body.index("<svg")) + 1 : body.rindex("</svg>")]
    clip = (
        '<rect width="1024" height="1024" rx="230"/>'
        if shape == "rounded"
        else '<circle cx="512" cy="512" r="512"/>'
    )
    svg = (
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024">'
        f'<clipPath id="m">{clip}</clipPath><g clip-path="url(#m)">{inner}</g></svg>'
    )
    tmp = Path(tempfile.mkstemp(suffix=".svg")[1])
    tmp.write_text(svg)
    return tmp


def ios_app_icon() -> None:
    folder = IOS_ASSETS / "AppIcon.appiconset"
    contents = json.loads((folder / "Contents.json").read_text())
    for image in contents["images"]:
        points = float(image["size"].split("x")[0])
        scale = int(image["scale"].rstrip("x"))
        pixels = round(points * scale)
        name = f"icon-{pixels}.png"
        render(ICON_SVG, pixels, folder / name, opaque=True)
        image["filename"] = name
    (folder / "Contents.json").write_text(json.dumps(contents, indent=2) + "\n")


def ios_splash_logo() -> None:
    folder = IOS_ASSETS / "SplashLogo.imageset"
    images = []
    for scale in (1, 2, 3):
        name = f"splash-logo@{scale}x.png"
        render(MARK_SVG, SPLASH_LOGO_PT * scale, folder / name)
        images.append({"idiom": "universal", "filename": name, "scale": f"{scale}x"})
    (folder / "Contents.json").write_text(
        json.dumps({"images": images, "info": {"version": 1, "author": "xcode"}}, indent=2)
        + "\n"
    )


def android_icons() -> None:
    rounded = masked_icon_svg("rounded")
    circle = masked_icon_svg("circle")
    for density, factor in ANDROID_DENSITIES.items():
        folder = ANDROID_RES / f"mipmap-{density}"
        render(rounded, round(48 * factor), folder / "ic_launcher.png")
        render(circle, round(48 * factor), folder / "ic_launcher_round.png")
        # Adaptive icon foreground: 108dp canvas, mark kept inside the 66dp safe zone.
        render(MARK_SVG, round(108 * factor), folder / "ic_launcher_foreground.png")
    rounded.unlink()
    circle.unlink()


def android_splash_logo() -> None:
    render(
        MARK_SVG,
        SPLASH_LOGO_PT * 4,
        ANDROID_RES / "drawable-xxxhdpi" / "splash_logo.png",
    )


def js_splash_logo() -> None:
    for scale, suffix in ((1, ""), (2, "@2x"), (3, "@3x")):
        render(MARK_SVG, SPLASH_LOGO_PT * scale, BRAND / f"splash-logo{suffix}.png")


if __name__ == "__main__":
    ios_app_icon()
    ios_splash_logo()
    android_icons()
    android_splash_logo()
    js_splash_logo()
    print("Brand assets generated.")
