import datetime

from flask import url_for, request, redirect, render_template, flash, g, current_app, session
from flask_login import login_user, logout_user, current_user, login_required
from flask_session import Session
from app import app, lm
from app.forms import ExampleForm, LoginForm
from app.models import Photo, Location, Collection
from PIL import Image, ExifTags
import cloudinary
import json
import geojson
import cloudinary.uploader
from .location import LocationParser
from google.cloud import vision
import os

DEFAULT_LAT = 40.3487
DEFAULT_LNG = -74.6591


@app.route('/')
def index():
    return render_template('index.html')

@app.route('/set/')
def set():
    session['key'] = 'value'
    return 'ok'

@app.route('/get/')
def get():
    return session.get('key', 'not set')

@app.route('/photos/')
def api_photos() -> dict:
    photos = Location.fetch_all_photos()
    return json.dumps(photos)

@app.route('/locations/')
def api_locations() -> dict:
    locations = Location.fetch_all()
    return json.dumps(locations)

@app.route("/upload-image-landmarks", methods=["GET", "POST"])
def upload_image_landmarks():
    os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = "key.json"
    landmark_name = ""
    lat = ""
    lon = ""
    if request.method == "POST":

        if request.files:
            lat = request.form.get("lat")
            lon = request.form.get("lon")

            image = request.files["image"]
            if not image:
                return redirect("/")

            # Google landmark detection
            client = vision.ImageAnnotatorClient()
            content = image.read()
            google_image = vision.Image(content=content)
            response = client.landmark_detection(image=google_image)
            landmarks = response.landmark_annotations
            print('Landmarks:')

            image.seek(0)

            for landmark in landmarks:
                score = landmark.score
                confidence = str(round(score,4)*100) + '%'
                landmark_name = landmark.description
                print(landmark.description)
                for location in landmark.locations:
                    lat_lng = location.lat_lng
                    print('Latitude {}'.format(lat_lng.latitude))
                    print('Longitude {}'.format(lat_lng.longitude))
                    lat = '{}'.format(lat_lng.latitude)
                    lon = '{}'.format(lat_lng.longitude)
                    return render_template("index.html", landmark_name=landmark_name, lat=lat, lon=lon, confidence=confidence)
    else:
        return redirect("/")

    return render_template("index.html", landmark="searched")

@app.route("/upload-image", methods=["GET", "POST"])
def upload_image():
    if request.method == "POST":

        if request.files:
            lat = request.form.get("lat")
            lon = request.form.get("lon")
            parser = LocationParser()

            images = request.files.getlist("image")

            # Create a new collection
            if (len(images)) > 1:
                collection_name = request.form.get("collection_name")
                collection_info = request.form.get("collection_info")

                collection = Collection(name=collection_name, info=collection_info)

                for image in images:
                    response = cloudinary.uploader.upload(image,
                        cloud_name=current_app.config['CLOUDINARY_CLOUD_NAME'],
                        api_key=current_app.config['CLOUDINARY_API_KEY'],
                        api_secret=current_app.config['CLOUDINARY_API_SECRET'])
                    public_id = response['public_id']
                    url = "https://res.cloudinary.com/dixpjmvss/image/upload/" + public_id

                    img = Image.open(image)
                    exif_decoded = parser.get_exif_data(img)
                    taken_coords = parser.taken_lat_lon(exif_decoded)
                    dest_coords = parser.dest_lat_lon(exif_decoded)
                    angle = parser.taken_angle(exif_decoded)
                    taken_date = parser.get_taken(exif_decoded)

                    collection.add_photo(Photo(pic=public_id, taken=taken_date, coords = dest_coords, 
                                     taken_coords=taken_coords, loc=None, title="Untitled"))

                return redirect("/")


            # Process a single image
            image = request.files["image"]

            if not image:
                return redirect("/")

           # Upload to cloudinary
            response = cloudinary.uploader.upload(image,
                cloud_name=current_app.config['CLOUDINARY_CLOUD_NAME'],
                api_key=current_app.config['CLOUDINARY_API_KEY'],
                api_secret=current_app.config['CLOUDINARY_API_SECRET'])
            public_id = response['public_id']
            url = "https://res.cloudinary.com/dixpjmvss/image/upload/" + public_id


            # Location
            exif_decoded = parser.get_exif_data(Image.open(image))
            taken_coords = parser.taken_lat_lon(exif_decoded)
            dest_coords = parser.dest_lat_lon(exif_decoded)
            angle = parser.taken_angle(exif_decoded)
            taken_date = parser.get_taken(exif_decoded)
            
            date = '2021-01-01'
            if taken_date:
                date = taken_date.strftime('%Y-%m-%d')

            if not angle:
                angle = -1

            # Center map at photo if it has coordinates
            if taken_coords[0] and taken_coords[1]:
                lat = taken_coords[0]
                lon = taken_coords[1]

            taken_coords = (lat, lon)

            # TODO: Timestamps
            # taken = parser.get_taken(exif_decoded)
            taken = datetime.datetime.now()
            photo = {"pic": public_id, "taken": taken, "coords": dest_coords,
                     "taken_coords": taken_coords, "angle":angle}

            session['photo'] = photo

    else:
        return redirect("/")

    return render_template("details.html", lat=lat, lon=lon, url=url, date=date, show_success_modal=True)

@app.route("/add-details", methods=["GET", "POST"])
def add_details():
    if 'photo' in session:
        photo = session['photo']
        public_id = photo['pic']
        taken_coords = photo['taken_coords']
        url = "https://res.cloudinary.com/dixpjmvss/image/upload/" + public_id

        title = request.form.get("title")
        date = request.form.get("date")
        print("title: " + title)
        print("Date: " + date)
        dt = datetime.datetime.strptime(date, '%Y-%m-%d')

        lat = taken_coords[0]
        lon = taken_coords[1]

        if not lat:
            lat = DEFAULT_LAT
            lon = DEFAULT_LNG

        photo['taken'] = dt;
        photo['title'] = title;
        session['photo'] = photo

        print(photo)
    else:
        return redirect("/")
    return render_template("crosshair.html", lat=lat, lon=lon, url=url, show_success_modal=True)

@app.route("/add-crosshair", methods=["GET", "POST"])
def add_crosshair():
    if 'photo' in session:
        photo = session['photo']
        public_id = photo['pic']
        url = "https://res.cloudinary.com/dixpjmvss/image/upload/" + public_id

        lat = request.form.get("lat2")
        lon = request.form.get("lon2")

        taken_coords = (lat, lon)
        photo['taken_coords'] = taken_coords
        session['photo'] = photo
    else:
        return redirect("/")
    return render_template("camera.html", lat=lat, lon=lon, url=url, angle=photo['angle'])

@app.route("/add-camera", methods=["GET", "POST"])
def add_camera():
    if 'photo' in session:
        photo = session['photo']
        db_photo = None
        collection_id = None

        taken_coords = photo['taken_coords']

        # Check if the photo is already in the database
        if 'id' in photo.keys():
            db_photo = Photo.fetch_by_id(photo['id'])
            collection_id = db_photo.collection_id

        loc_new = request.form.get("loc_new")
        loc_id = request.form.get("loc_id")

        lat = request.form.get("lat2")
        lon = request.form.get("lon2")

        # Update destination coords
        dest_coords = (lat, lon)
        photo['dest_coords'] = dest_coords

        if loc_id:
            print("add to location")
            location = Location.query.get(loc_id)
            location.add_photo(db_photo)

        else:
            print("new location")
            loc_name = "Untitled"
            if loc_new:
                loc_name = loc_new

            location = Location(lat=lat, lon=lon, name=loc_name)

        if not db_photo:
            db_photo = Photo(pic=photo['pic'], taken=photo['taken'], coords = dest_coords, 
                             taken_coords=photo['taken_coords'], loc=location, title=photo['title'])
        else: 
            db_photo.update(pic=photo['pic'], taken=photo['taken'], coords = dest_coords, 
                             taken_coords=photo['taken_coords'], loc=location, title=photo['title'])

        location.add_photo(db_photo)

        # Remove photo from collection
        if collection_id:
            db_photo.remove_collection()
            collection = Collection.fetch_by_id(collection_id)

            # If collection is empty, delete it
            if len(collection.c_photos) == 0:
                collection.delete()


        # # Add to location
        # new_loc = None
        # # Very very inefficient
        # locations = Location.fetch_all()
        # for location in locations:
        #     if location.equals(lat, lon):
        #         new_loc = location
        #         break

        # if new_loc is None:
        #     new_loc = Location(lat=lat, lon=lon)


        # new_loc.add_photo(Photo(pic=photo['pic'], taken=photo['taken'], coords = dest_coords, 
        #                         taken_coords=photo['taken_coords'], loc=new_loc))
        session.pop('photo')
    else:
        return redirect("/")
    return redirect("/")

# === Collections methods ===

@app.route('/collections/', methods = ['GET', 'POST'])
def collections():
    collections = Collection.fetch_all()
    collections_json = json.dumps(collections)
    loaded_collections = json.loads(collections_json)
    return render_template('collections.html', collections=loaded_collections)

@app.route('/collection/', methods = ['GET', 'POST'])
def collection():
    collection_id = request.args.get('id')
    collection = Collection.fetch_by_id(collection_id)

    photos = collection.fetch_photos()

    photos_json = json.dumps(photos)
    loaded_photos = json.loads(photos_json)
    return render_template('collection.html', photos=loaded_photos, name=collection.name, info=collection.info)

@app.route('/photo/', methods=['GET','POST'])
def photo():
    photo_id = request.args.get('id')
    photo = Photo.fetch_by_id(photo_id)
    metadata_exists = "False"
    taken_str = "Unknown Year"
    if photo.taken:
        taken_str = photo.taken.strftime("%Y")
        metadata_exists = "True"
    photo_dict = {"id":photo.id, "lat":photo.taken_lat, "lng":photo.taken_lon, "taken":photo.taken_str, "title":photo.title,
                    "url":"https://res.cloudinary.com/dixpjmvss/image/upload/" + photo.pic, "collection": photo.collection_id,
                    "thumbnail":"https://res.cloudinary.com/dixpjmvss/image/upload/" + photo.pic}
    photo_json = json.dumps(photo_dict)
    loaded_photo = json.loads(photo_json)
    return render_template('photo.html', photo=loaded_photo, metadata=metadata_exists)

@app.route('/geotag-photo/', methods=['GET', 'POST'])
def geotag_photo():
    photo_id = request.args.get('id')
    photo = Photo.fetch_by_id(photo_id)

    lat = DEFAULT_LAT
    lng = DEFAULT_LNG

    if photo.taken_lat:
        lat = photo.taken_lat
        lng = photo.taken_lon

    taken_coords = (photo.taken_lat, photo.taken_lon)

    date = '2021-01-01'
    if photo.taken:
        date = photo.taken.strftime('%Y-%m-%d')

    url = "https://res.cloudinary.com/dixpjmvss/image/upload/" + photo.pic
    photo_dict = {"id":photo.id, "taken_coords":taken_coords, "taken":photo.taken_str, "title":photo.title, "angle":-1,
                    "url":"https://res.cloudinary.com/dixpjmvss/image/upload/" + photo.pic, "collection": photo.collection_id,
                    "thumbnail":"https://res.cloudinary.com/dixpjmvss/image/upload/" + photo.pic, "pic":photo.pic}
    session['photo'] = photo_dict
    return render_template("details.html", lat=lat, lon=lng, url=url, date=date, show_success_modal=True)

# === User login methods ===

@app.before_request
def before_request():
    g.user = current_user

@lm.user_loader
def load_user(id):
    return User.query.get(int(id))

@app.route('/login/', methods = ['GET', 'POST'])
def login():
    if g.user is not None and g.user.is_authenticated:
        return redirect(url_for('index'))
    form = LoginForm()
    if form.validate_on_submit():
        login_user(g.user)

    return render_template('login.html', 
        title = 'Sign In',
        form = form)

@app.route('/logout/')
def logout():
    logout_user()
    return redirect(url_for('index'))

# ====================
