from pathlib import Path
from PIL import Image, ImageOps, ImageDraw
import json
root = Path(__file__).parent
source = Path(r'C:\Users\DELL\Desktop\树礼书院学生会艺术创作资产')
out = root / 'assets'
out.mkdir(exist_ok=True)
sheet = Image.new('RGB', (1200, 7*190), '#eee9df')
draw = ImageDraw.Draw(sheet)
for i in range(1,32):
    with Image.open(source / f'资产 ({i}).jpg') as original:
        im = ImageOps.exif_transpose(original).convert('RGB')
        im.thumbnail((1600,1600))
        im.save(out / f'art-{i:02}.webp', 'WEBP', quality=88)
        thumb = im.copy()
        thumb.thumbnail((220,158))
        x,y = ((i-1)%5)*240, ((i-1)//5)*190
        sheet.paste(thumb,(x+(240-thumb.width)//2,y))
        draw.text((x+12,y+164),str(i),fill='#352516')
sheet.save(out/'contact-sheet.jpg')
print('Prepared 31 web images and contact sheet')
