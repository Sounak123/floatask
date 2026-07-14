#!/usr/bin/env python3
"""
Append an animated Dragon Ball-style count sequence to a transparent GIF.
Usage: make_gif.py <count> <base.gif> <out.gif>
"""
import sys
from PIL import Image, ImageDraw, ImageFont


TRANS_IDX = 255   # palette index reserved for transparent pixels


def extract_frames(gif):
    """Return list of (RGBA Image, duration_ms) for every frame."""
    frames = []
    try:
        while True:
            frame = gif.copy().convert("RGBA")
            dur = gif.info.get("duration", 100)
            frames.append((frame, dur))
            gif.seek(gif.tell() + 1)
    except EOFError:
        pass
    return frames


def rgba_to_p(rgba):
    """Convert RGBA image to palette mode with TRANS_IDX = transparent."""
    r, g, b, a = rgba.split()

    # Quantize opaque pixels to 255 colours (index 255 stays free)
    rgb = Image.merge("RGB", (r, g, b))
    p = rgb.quantize(colors=255, dither=0)

    # Write a placeholder at TRANS_IDX (value doesn't matter — it's masked)
    palette = p.getpalette()
    palette[TRANS_IDX * 3:TRANS_IDX * 3 + 3] = [0, 0, 0]
    p.putpalette(palette)

    # Stamp every transparent pixel with TRANS_IDX
    try:
        pixels = list(p.get_flattened_data())
        alpha  = list(a.get_flattened_data())
    except AttributeError:
        pixels = list(p.getdata())
        alpha  = list(a.getdata())
    p.putdata([TRANS_IDX if alpha[i] < 128 else pixels[i]
               for i in range(len(pixels))])
    return p


def make_count_frame(size, count_str, scale):
    """Draw the Dragon Ball count badge at the given scale (0..1+) on RGBA."""
    W, H = size
    frame = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    if scale <= 0:
        return frame

    draw = ImageDraw.Draw(frame)
    cx, cy = W // 2, H // 2
    r = max(4, int(min(W, H) * 0.30 * scale))

    # Drop shadow
    so = max(1, r // 10)
    draw.ellipse([cx - r + so, cy - r + so, cx + r + so, cy + r + so],
                 fill=(0, 0, 0, 100))

    # Outer gold ring
    draw.ellipse([cx - r, cy - r, cx + r, cy + r], fill=(255, 165, 0, 255))

    # Slightly lighter inner fill for depth
    ir = int(r * 0.82)
    draw.ellipse([cx - ir, cy - ir, cx + ir, cy + ir], fill=(255, 200, 20, 255))

    # Top-left highlight glint
    hr = int(r * 0.55)
    ox, oy = int(r * 0.15), int(r * 0.15)
    draw.ellipse([cx - hr - ox, cy - hr - oy, cx + int(r*0.1), cy + int(r*0.1)],
                 fill=(255, 245, 150, 75))

    # Font
    font_size = max(8, int(r * 1.05))
    font = None
    for path in [
        "/System/Library/Fonts/Helvetica.ttc",
        "/System/Library/Fonts/Arial Bold.ttf",
        "/System/Library/Fonts/Arial.ttf",
    ]:
        try:
            font = ImageFont.truetype(path, font_size)
            break
        except Exception:
            pass
    if font is None:
        font = ImageFont.load_default()

    bbox = draw.textbbox((0, 0), count_str, font=font)
    tw, th = bbox[2] - bbox[0], bbox[3] - bbox[1]
    tx = cx - tw // 2 - bbox[0]
    ty = cy - th // 2 - bbox[1]

    # Text shadow then white text
    draw.text((tx + 1, ty + 2), count_str, fill=(120, 60, 0, 200), font=font)
    draw.text((tx, ty), count_str, fill=(255, 255, 255, 255), font=font)

    return frame


def make_count_sequence(size, count):
    """Return list of (RGBA frame, duration_ms) for the animated count badge."""
    cs = str(count)
    frames = []

    # Bounce grow-in (8 frames × 50 ms)
    for s in [0.1, 0.28, 0.50, 0.70, 0.88, 1.05, 1.12, 1.0]:
        frames.append((make_count_frame(size, cs, s), 50))

    # Hold (5 frames × 90 ms)
    for _ in range(5):
        frames.append((make_count_frame(size, cs, 1.0), 90))

    # Shrink-out (8 frames × 50 ms)
    for s in [0.95, 0.85, 0.72, 0.58, 0.44, 0.28, 0.14, 0.0]:
        frames.append((make_count_frame(size, cs, s), 50))

    # Brief blank pause before loop
    frames.append((Image.new("RGBA", size, (0, 0, 0, 0)), 300))

    return frames


def build_gif(count, base_path, out_path):
    base_gif = Image.open(base_path)
    base_frames = extract_frames(base_gif)
    if not base_frames:
        print("ERROR: no frames in base GIF")
        sys.exit(1)

    size = base_frames[0][0].size
    all_frames = list(base_frames)

    if count > 0:
        all_frames += make_count_sequence(size, count)

    p_frames  = [rgba_to_p(f) for f, _ in all_frames]
    durations = [d for _, d in all_frames]

    p_frames[0].save(
        out_path,
        save_all=True,
        append_images=p_frames[1:],
        loop=0,
        duration=durations,
        transparency=TRANS_IDX,
        disposal=2,
    )
    print(f"Saved {len(p_frames)} frames → {out_path}")


if __name__ == "__main__":
    if len(sys.argv) != 4:
        print(f"Usage: {sys.argv[0]} <count> <base.gif> <out.gif>")
        sys.exit(1)
    build_gif(int(sys.argv[1]), sys.argv[2], sys.argv[3])
