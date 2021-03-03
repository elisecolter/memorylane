from flask import url_for, request, redirect, render_template, flash, g, session
from flask_login import login_user, logout_user, current_user, login_required
from app import app, lm
from app.forms import ExampleForm, LoginForm
from app.models import User
from PIL import Image, ExifTags
import pprint

@app.route('/')
def index():
	return render_template('index.html')

@app.route("/upload-image", methods=["GET", "POST"])
def upload_image():

    if request.method == "POST":

        if request.files:

            image = request.files["image"]
            exif = Image.open(image)._getexif()

            if exif is not None:
                for tag, value in exif.items():
                    decoded = ExifTags.TAGS.get(tag, tag)
                    if decoded == "GPSInfo":
                        gpsinfo = {}
                        for t in value:
                            sub_decoded = ExifTags.GPSTAGS.get(t,t)
                            gpsinfo[sub_decoded] = value[t]
                        pp = pprint.PrettyPrinter(indent=4)
                        pp.pprint(gpsinfo)

            return redirect(request.url)


    return render_template("upload-image.html")


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
