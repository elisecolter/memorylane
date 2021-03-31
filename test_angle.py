from PIL import Image
import datetime
from PIL.ExifTags import TAGS, GPSTAGS
import math

class LocationParser:
    def get_exif_data(self, image):
        exif_data = {}
        try:
            info = image._getexif()
            if info:
                for tag, value in info.items():
                    decoded = TAGS.get(tag, tag)
                    if decoded == "GPSInfo":
                        gps_data = {}
                        for t in value:
                            sub_decoded = GPSTAGS.get(t, t)
                            gps_data[sub_decoded] = value[t]
                            exif_data[decoded] = gps_data
                    else:
                        exif_data[decoded] = value
        except:
            pass
        return exif_data

    def _convert_to_degrees(self, value):
        d = value[0]
        m = value[1]
        s = value[2]

        return d + (m / 60.0) + (s / 3600.0)

    def _get_if_exists(self, data, key):
        if key in data:
            return data[key]
        return None

    def get_taken(self, exif_data):
        taken = self._get_if_exists(exif_data, 'DateTimeOriginal')
        try:
            return datetime.datetime.strptime(taken, '%Y:%m:%d %H:%M:%S')
        except:
            return None

    def dest_lat_lon(self, exif_data):
        # TODO: somewhere that's not Blair Arch
        return (40.347532, -74.660949)

    def taken_lat_lon(self, exif_data):
        """Returns the latitude and longitude, if available, from the provided exif_data (obtained through get_exif_data above)"""
        lat = None
        lon = None

        if "GPSInfo" in exif_data:      
            gps_info = exif_data["GPSInfo"]
            gps_latitude = self._get_if_exists(gps_info, "GPSLatitude")
            gps_latitude_ref = self._get_if_exists(gps_info, 'GPSLatitudeRef')
            gps_longitude = self._get_if_exists(gps_info, 'GPSLongitude')
            gps_longitude_ref = self._get_if_exists(gps_info, 'GPSLongitudeRef')

            if gps_latitude and gps_latitude_ref and gps_longitude and gps_longitude_ref:
                lat = self._convert_to_degrees(gps_latitude)
                if gps_latitude_ref != "N":                     
                    lat = 0 - lat

                lon = self._convert_to_degrees(gps_longitude)
                if gps_longitude_ref != "E":
                    lon = 0 - lon
    
        return (lat, lon)


loc = LocationParser()
im = Image.open("app/static/assets/blair5.jpg")
exif_data = loc.get_exif_data(im)

angle = None

if "GPSInfo" in exif_data:
    gps_info = exif_data["GPSInfo"]
    angle = loc._get_if_exists(gps_info, "GPSImgDirection")

print(angle)

#distance: 0.0005
dist = 0.0005


x = -74.661449 + dist*math.degrees(math.cos(math.degrees(angle)))
y = dist*math.degrees(math.sin(math.degrees(angle))) + 40.347282
print(x)
print(y)