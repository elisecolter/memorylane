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

    def __init__(self, lat, lon):
        self.lat = lat
        self.lon = lon

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
        return db.session.query(Location).all()

    def fetch_all_photos():
        locations = db.session.query(Location).all()
        locations_json = []

        for location in locations:
            photos = []

            for photo in location.photos:
                photos.append({"lat":photo.taken_lat, "lng":photo.taken_lon,
                               "url":"https://res.cloudinary.com/dixpjmvss/image/upload/" + photo.pic, 
                               "thumbnail":"https://res.cloudinary.com/dixpjmvss/image/upload/" + photo.pic})
            locations_json.append({"lat":location.lat, "lon":location.lon, "name":location.name,
                                   "photos":photos})

        return locations_json


class Photo(db.Model):
    __tablename__ = 'photos'

    id = db.Column(db.Integer, primary_key = True)
    pic = db.Column(db.String(50))
    taken = db.Column(db.DateTime, default=datetime.datetime.utcnow)
    lat = db.Column(db.Float)
    lon = db.Column(db.Float)
    taken_lat = db.Column(db.Float)
    taken_lon = db.Column(db.Float)

    location_id = db.Column(db.ForeignKey(Location.id))
    location = relationship("Location", back_populates="photos")

    def __init__(self, pic, taken, coords, taken_coords, loc):
        self.location = loc
        self.location_id = loc.id
        self.pic = pic
        self.taken = taken
        self.lat = coords[0]
        self.lon = coords[1]
        self.taken_lat = taken_coords[0]
        self.taken_lon = taken_coords[1]
        db.session.add(self)
        db.session.commit()

    def fetch_all():
        photos = db.session.query(Photo).all()
        photos_json = []

        for photo in photos:
            photos_json.append({"lat":photo.lat, "lng":photo.lon, 
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
