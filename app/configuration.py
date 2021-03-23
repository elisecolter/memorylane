
class Config(object):
	"""
	Configuration base, for all environments.
	"""
	DEBUG = False
	TESTING = False
	SQLALCHEMY_DATABASE_URI = 'postgresql:///photos_dev'
	BOOTSTRAP_FONTAWESOME = True
	SECRET_KEY = "this-needs-to-be-changed"
	CSRF_ENABLED = True
	SQLALCHEMY_TRACK_MODIFICATIONS = True
	CLOUDINARY_CLOUD_NAME = 'dixpjmvss'
	CLOUDINARY_API_KEY = '894391253635585'
	CLOUDINARY_API_SECRET = 'llH0_xawFLHL1WdIKoZp98buYto'

	#Get your reCaptche key on: https://www.google.com/recaptcha/admin/create
	#RECAPTCHA_PUBLIC_KEY = "6LffFNwSAAAAAFcWVy__EnOCsNZcG2fVHFjTBvRP"
	#RECAPTCHA_PRIVATE_KEY = "6LffFNwSAAAAAO7UURCGI7qQ811SOSZlgU69rvv7"

class ProductionConfig(Config):
	SQLALCHEMY_DATABASE_URI = 'mysql://user@localhost/foo'
	SQLALCHEMY_TRACK_MODIFICATIONS = False

class DevelopmentConfig(Config):
	DEBUG = True

class TestingConfig(Config):
	TESTING = True
