"""Write photographer credits into image files (lossless, no re-encoding).

JPEG: EXIF Artist + Copyright + XPAuthor (shown as "Autoren" in Windows).
PNG:  iTXt chunks "Author" + "Copyright".
"""
import struct
import unicodedata
import zlib
from pathlib import Path

from PIL import Image

TAG_ARTIST, TAG_COPYRIGHT, TAG_XPAUTHOR = 315, 33432, 0x9C9D


def _copyright(credit):
    return f'Copyright {credit}'


def _ascii(text):
    # EXIF Artist/Copyright are ASCII fields: "Jöstijn" -> "Jostijn"
    return unicodedata.normalize('NFKD', text).encode('ascii', 'ignore').decode('ascii')


def _write_jpeg(path, credit):
    with Image.open(path) as img:
        exif = img.getexif()
        artist, copyright_ = _ascii(credit), _ascii(_copyright(credit))
        if exif.get(TAG_ARTIST) == artist and exif.get(TAG_COPYRIGHT) == copyright_:
            return False
        exif[TAG_ARTIST] = artist
        exif[TAG_COPYRIGHT] = copyright_
        exif[TAG_XPAUTHOR] = (credit + '\0').encode('utf-16-le')
        payload = exif.tobytes()
    if not payload.startswith(b'Exif\x00\x00'):
        payload = b'Exif\x00\x00' + payload
    if len(payload) + 2 > 0xFFFF:
        raise ValueError('EXIF block too large')

    data = path.read_bytes()
    if data[:2] != b'\xff\xd8':
        raise ValueError('not a JPEG')
    out, pos, insert_at = bytearray(b'\xff\xd8'), 2, None
    while pos < len(data):
        if data[pos] != 0xFF:
            raise ValueError('bad JPEG segment')
        marker = data[pos + 1]
        if marker == 0xDA:  # start of scan: rest is image data
            break
        seg_len = struct.unpack('>H', data[pos + 2:pos + 4])[0]
        seg = data[pos:pos + 2 + seg_len]
        pos += 2 + seg_len
        if marker == 0xE1 and seg[4:10] == b'Exif\x00\x00':
            continue  # drop old EXIF, replaced below
        out += seg
        if marker == 0xE0 and insert_at is None:
            insert_at = len(out)  # put EXIF right after JFIF header
    app1 = b'\xff\xe1' + struct.pack('>H', len(payload) + 2) + payload
    if insert_at is None:
        insert_at = 2
    out[insert_at:insert_at] = app1
    out += data[pos:]
    path.write_bytes(bytes(out))
    return True


def _png_itxt(key, text):
    body = key.encode('latin-1') + b'\x00\x00\x00\x00\x00' + text.encode('utf-8')
    return struct.pack('>I', len(body)) + b'iTXt' + body + struct.pack('>I', zlib.crc32(b'iTXt' + body) & 0xFFFFFFFF)


def _write_png(path, credit):
    with Image.open(path) as img:
        info = img.info
        if info.get('Author') == credit and info.get('Copyright') == _copyright(credit):
            return False
    data = path.read_bytes()
    out, pos, inserted = bytearray(data[:8]), 8, False
    while pos < len(data):
        length = struct.unpack('>I', data[pos:pos + 4])[0]
        ctype = data[pos + 4:pos + 8]
        chunk = data[pos:pos + 12 + length]
        pos += 12 + length
        if ctype in (b'tEXt', b'iTXt') and chunk[8:].split(b'\x00', 1)[0] in (b'Author', b'Copyright'):
            continue
        if ctype in (b'IDAT', b'IEND') and not inserted:
            # before the image data, so readers see it without decoding the image
            out += _png_itxt('Author', credit) + _png_itxt('Copyright', _copyright(credit))
            inserted = True
        out += chunk
    path.write_bytes(bytes(out))
    return True


def write_credit(path, credit):
    """Embed credit into a local image. Returns True if the file changed."""
    path = Path(path)
    if not credit or not path.is_file():
        return False
    ext = path.suffix.lower()
    if ext in ('.jpg', '.jpeg'):
        return _write_jpeg(path, credit)
    if ext == '.png':
        return _write_png(path, credit)
    return False


def _iter_photos(obj):
    if isinstance(obj, dict):
        if obj.get('credit') and any(k in obj for k in ('src', 'full', 'thumb')):
            yield obj
        for v in obj.values():
            yield from _iter_photos(v)
    elif isinstance(obj, list):
        for v in obj:
            yield from _iter_photos(v)


def apply_credits(content, project_dir):
    """Embed every photo credit in content.json into its local image files."""
    changed = []
    for photo in _iter_photos(content):
        credit = photo['credit'].strip()
        for key in ('src', 'full', 'thumb'):
            rel = photo.get(key)
            if not rel or rel.startswith(('http:', 'https:', '//')):
                continue
            try:
                if write_credit(Path(project_dir) / rel, credit):
                    changed.append(rel)
            except Exception as e:
                print(f"[credit] skipped {rel}: {e}")
    return changed
