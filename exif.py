"""Test file to work with exif data"""

import exifread

filepath = "photos/IMG_4980.HEIC"
f = open(filepath, 'rb')
tags = exifread.process_file(f)

for tag in tags.keys():
    if 'GPS' in tag:
        print("Key: %s, value %s" % (tag, tags[tag]))