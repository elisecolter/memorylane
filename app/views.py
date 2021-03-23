import datetime

from flask import url_for, request, redirect, render_template, flash, g, session, current_app
from flask_login import login_user, logout_user, current_user, login_required
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

@app.route('/photos/')
def api_photos() -> dict:
    photos = Location.fetch_all_photos()
    return json.dumps(photos)

@app.route("/upload-image", methods=["GET", "POST"])
def upload_image():
    if request.method == "POST":

        if request.files:

            image = request.files["image"]
            response = cloudinary.uploader.upload(image,
                cloud_name=current_app.config['CLOUDINARY_CLOUD_NAME'],
                api_key=current_app.config['CLOUDINARY_API_KEY'],
                api_secret=current_app.config['CLOUDINARY_API_SECRET'])
            public_id = response['public_id']

            parser = LocationParser()

            # Location
            exif_decoded = parser.get_exif_data(Image.open(image))
            taken_coords = parser.taken_lat_lon(exif_decoded)
            dest_coords = parser.dest_lat_lon(exif_decoded)

            # Timestamps
            taken = parser.get_taken(exif_decoded)
            taken_decoded = datetime.datetime.strptime(taken, '%Y:%m:%d %H:%M:%S')

            new_loc = None
            lat = taken_coords[0]
            lon = taken_coords[1]

            # Very very inefficient
            locations = Location.fetch_all()
            for location in locations:
                if location.equals(lat, lon):
                    new_loc = location
                    break

            if new_loc is None:
                new_loc = Location(lat=lat, lon=lon)

            new_loc.add_photo(Photo(pic=public_id, taken=taken_decoded, coords = dest_coords, 
                                    taken_coords=taken_coords, loc=new_loc))
            return redirect(request.url)

    return render_template("index.html", show_success_modal=True)


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
