
class Config(object):
	"""
	Configuration base, for all environments.
	"""
	DEBUG = False
	TESTING = False
	SESSION_TYPE = 'filesystem'
	SQLALCHEMY_DATABASE_URI = 'postgresql://dotarcphsnumnj:37bc5c4cba91cf75b7699f088f87ddea6e116043ee3cbff29b0c9c4237bf5fcb@ec2-34-225-103-117.compute-1.amazonaws.com:5432/d874o5kaabhl1j'
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
