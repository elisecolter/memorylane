import datetime

from flask import url_for, request, redirect, render_template, flash, g, current_app, session
from flask_login import login_user, logout_user, current_user, login_required
from flask_session import Session
from app import app, lm
from app.forms import ExampleForm, LoginForm
from app.models import Photo, Location
from PIL import Image, ExifTags
import cloudinary
import json
import geojson
import cloudinary.uploader
from .location import LocationParser

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

@app.route("/upload-image", methods=["GET", "POST"])
def upload_image():
    if request.method == "POST":

        if request.files:
            lat = request.form.get("lat")
            lon = request.form.get("lon")

            image = request.files["image"]

           # Upload to cloudinary
            response = cloudinary.uploader.upload(image,
                cloud_name=current_app.config['CLOUDINARY_CLOUD_NAME'],
                api_key=current_app.config['CLOUDINARY_API_KEY'],
                api_secret=current_app.config['CLOUDINARY_API_SECRET'])
            public_id = response['public_id']
            url = "https://res.cloudinary.com/dixpjmvss/image/upload/" + public_id

            # Parse location if it exists
            parser = LocationParser()

            # Location
            exif_decoded = parser.get_exif_data(Image.open(image))
            taken_coords = parser.taken_lat_lon(exif_decoded)
            dest_coords = parser.dest_lat_lon(exif_decoded)

            # Center map at photo if it has coordinates
            if taken_coords[0] and taken_coords[1]:
                lat = taken_coords[0]
                lon = taken_coords[1]

            # TODO: Timestamps
            # taken = parser.get_taken(exif_decoded)
            taken = datetime.datetime.now()
            photo = {"pic": public_id, "taken": taken, "coords": dest_coords,
                     "taken_coords": taken_coords}

            session['photo'] = photo

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
    return render_template("camera.html", lat=lat, lon=lon, url=url)

@app.route("/add-camera", methods=["GET", "POST"])
def add_camera():
    if 'photo' in session:
        photo = session['photo']

        lat = request.form.get("lat2")
        lon = request.form.get("lon2")

        # Update destination coords
        dest_coords = (lat, lon)
        photo['dest_coords'] = dest_coords

        # Add to location
        new_loc = None
        # Very very inefficient
        locations = Location.fetch_all()
        for location in locations:
            if location.equals(lat, lon):
                new_loc = location
                break

        if new_loc is None:
            new_loc = Location(lat=lat, lon=lon)


        new_loc.add_photo(Photo(pic=photo['pic'], taken=photo['taken'], coords = dest_coords, 
                                taken_coords=photo['taken_coords'], loc=new_loc))

        print(photo)
        session.pop('photo')
    else:
        return redirect("/")
    return redirect("/")

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
