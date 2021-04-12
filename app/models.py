import datetime
import app
from app import db, admin
from geojson import Feature, FeatureCollection
from geopy import distance
from sqlalchemy.orm import relationship
import json

class Location(db.Model):
    __tablename__ = 'locations'

    id = db.Column(db.Integer, primary_key = True)
    lat = db.Column(db.Float)
    lon = db.Column(db.Float)
    name = db.Column(db.String(50), default="       ")

    photos = relationship("Photo", back_populates="location")

    def __init__(self, lat, lon, name):
        self.lat = lat
        self.lon = lon
        self.name = name

        db.session.add(self)
        db.session.commit()

    # Radius of 5 m 
    # TODO: Variable radii
    def equals(self, lat, lon):
        coords1 = (self.lat, self.lon)
        coords2 = (lat, lon)
        dist = distance.distance(coords1, coords2).m
        print(dist)
        return True if dist <= 5.0 else False

    def add_photo(self, photo):
        self.photos.append(photo)
        db.session.commit()

    def fetch_all():
        locations = db.session.query(Location).all()
        locations_json = []

        for location in locations:
            locations_json.append({"lat":location.lat, "lon":location.lon, "name":location.name, "id":location.id})

        return locations_json

    def fetch_all_photos():
        locations = db.session.query(Location).all()
        locations_json = []

        for location in locations:
            photos = []

            for photo in location.photos:
                # datetime_taken = photo.taken;
                # taken = datetime_taken.strftime("%m/%d/%Y, %H:%M:%S")
                taken = photo.taken.strftime("%Y")

                photos.append({"lat":photo.taken_lat, "lng":photo.taken_lon, "taken":taken, "title":photo.title,
                               "url":"https://res.cloudinary.com/dixpjmvss/image/upload/" + photo.pic, 
                               "thumbnail":"https://res.cloudinary.com/dixpjmvss/image/upload/" + photo.pic})
            locations_json.append({"lat":location.lat, "lon":location.lon, "name":location.name,
                                   "photos":photos})

        return locations_json

class Collection(db.Model):
    __tablename__ = 'collections'

    id = db.Column(db.Integer, primary_key = True)
    name = db.Column(db.String(50))
    info = db.Column(db.String(150))
    lat = db.Column(db.Float)
    lon = db.Column(db.Float)

    c_photos = relationship("Photo", back_populates="collection")

    def __init__(self, name, info):
        self.name = name
        self.info = info
        db.session.add(self)
        db.session.commit()

    def add_photo(self, photo):
        self.c_photos.append(photo)
        db.session.commit()

    def remove_photo(self, photo):
        self.c_photos.remove(photo)
        db.session.commit()

    def delete(self):
        db.session.delete(self)
        db.session.commit()

    def fetch_photos(self):
        photos_json = []
        for photo in self.c_photos:
            # datetime_taken = photo.taken;
            # taken = datetime_taken.strftime("%m/%d/%Y, %H:%M:%S")
            taken = None
            if photo.taken:
                taken = photo.taken.strftime("%Y")

            photos_json.append({"id": photo.id, "lat":photo.taken_lat, "lng":photo.taken_lon, "taken":taken, "title":photo.title,
                            "url":"https://res.cloudinary.com/dixpjmvss/image/upload/" + photo.pic, 
                            "thumbnail":"https://res.cloudinary.com/dixpjmvss/image/upload/" + photo.pic})
        return photos_json

    def fetch_by_id(id):
        return db.session.query(Collection).get(id)

    def fetch_all():
        collections = db.session.query(Collection).all()

        collections_json = []
        for collection in collections:
            url = ''
            if collection.c_photos:
                url = collection.c_photos[0].pic
            collections_json.append({"id":collection.id, "name":collection.name, "url":url, "size":len(collection.c_photos)})

        return collections_json



class Photo(db.Model):
    __tablename__ = 'photos'

    id = db.Column(db.Integer, primary_key = True)
    pic = db.Column(db.String(50))
    title = db.Column(db.String(50))
    taken_str = db.Column(db.String(25))
    taken = db.Column(db.DateTime)
    lat = db.Column(db.Float)
    lon = db.Column(db.Float)
    taken_lat = db.Column(db.Float)
    taken_lon = db.Column(db.Float)

    location_id = db.Column(db.ForeignKey(Location.id))
    location = relationship("Location", back_populates="photos")

    collection_id = db.Column(db.ForeignKey(Collection.id))
    collection = relationship("Collection", back_populates="c_photos")

    def __init__(self, pic, taken, coords, taken_coords, loc, title):
        self.location = loc
        self.pic = pic
        self.taken = taken
        self.lat = coords[0]
        self.lon = coords[1]
        self.taken_lat = taken_coords[0]
        self.taken_lon = taken_coords[1]
        self.title = title

        if loc:
            self.location_id = loc.id

        db.session.add(self)
        db.session.commit()

    def update(self, pic, taken, coords, taken_coords, loc, title):
        self.location = loc
        self.pic = pic
        self.taken = taken
        self.lat = coords[0]
        self.lon = coords[1]
        self.taken_lat = taken_coords[0]
        self.taken_lon = taken_coords[1]
        self.title = title
        if loc:
            self.location_id = loc.id

        db.session.commit()

    def fetch_by_id(id):
        return db.session.query(Photo).get(id)

    def remove_collection(self):
        if self.collection_id:
            self.collection_id = None
        db.session.commit()

    def fetch_all():
        photos = db.session.query(Photo).all()
        photos_json = []

        for photo in photos:
            taken = photo.taken.strftime("%Y")
            photos_json.append({"lat":photo.lat, "lng":photo.lon, "taken":taken, "title":photo.title,
                "url":"https://res.cloudinary.com/dixpjmvss/image/upload/" + photo.pic,
                "thumbnail":"https://res.cloudinary.com/dixpjmvss/image/upload/" + photo.pic,
                "name":"please work"})
        # for photo in photos:
        #     geometry = { "type": "Point", "coordinates": [photo.lon, photo.lat]}
        #     photos_json.append(Feature(properties={'title':photo.pic, 'name':"NAME"},
        #                                geometry=geometry))

        return photos_json

    def __repr__(self):
        return '<Photo %r>' % (self.id)
