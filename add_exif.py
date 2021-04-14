from PIL import Image
import piexif
import urllib.request

# url = "https://res.cloudinary.com/dixpjmvss/image/upload/zxn7tf8amp5cspza2fqr"
# im = Image.open(urllib.request.urlopen(url))
im = Image.open('app/static/assets/blair5.jpg')
exif_dict = piexif.load(im.info["exif"])

print(exif_dict['GPS'])