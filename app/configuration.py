
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

	GOOGLE_APPLICATION_CREDENTIALS = {
  		"type": "service_account",
  "project_id": "carbide-program-309313",
  "private_key_id": "49b2e29d7c940341b28080f43bbf3d4fed155d5a",
  "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC75NEb4nOr0DRT\ngX2Iz/f797ZbwuQV3P3IzjACZwU/h5oDMj+xgvCutoMnmfVLKLMp9owoQ6218nUV\nslloJwwQZgtTvqkrM9aHbIzSV0AFRQPcck9U1U90WbAfsX7Mx8Aw/5zpy+KRVrnF\nhYRKXIfjwUaENkzJpyFQ0nud+o2fmQ4ywgydtkTMSZpZmn4lHk1fnAeHixKiIcLC\nytj9g9As1sZsWgXp27f+R9TG8RexAZJ26GqEdQ3NZI7vr0XRb/lzfPTkgwEiBGWD\nZ2EB9E1JNOXHEITXj875yiEfgVNokKPlevPgVyw7+1nMoQG8DrpCfs2crTltGfWp\nOpm+n44fAgMBAAECggEACYGzmNSvPV+DJKevf9QYVa3VxefJXYsF/8dHtsXN0xL1\ncAYpvD2fsUW3wuTildZt1jvMuwU0AIacQo6r2mROk0FufxXtZKuyeSPWlJZO8KId\nmcvibd+xeo9GvrVe11XSyHsUzkZMGBMKXDWVf3B8fNtDFtGeg5dxGcmq8OlqVmUa\ny4sxJXXVrfCZ09jhTi6cnl/4+pH9dgSkVUJfUfu0MsTuu6bjtXVDSBO2mTon+l6W\nr9kRGQu/cqawdWuiJOEqN05DpGsPDsvGVMhoxhIACkiX9AaAFQmCZ9SHwuesRWML\nolu5v+bJFd1/SXztY76eYNwN6xZafmjkiR1ek4M2EQKBgQDfBf2fOnaTkzJ1UZ8D\nZALHLHD0XHSe2ytXB8UjziPus5a+FGg9fL5yo5ZJJkqIHTQ2Hk8VWsph48pf67zN\nao+ReD5Z9dEEUZ/8gkzIdTovGGblh8wD390GeuBTlLTRrZe0J8EF3N9VuaA0q9pl\nwullxF35UJXtO5oFuQMO56A2UQKBgQDXrRS6S0dLNTlZM6fq9R5Nsgm0CNW07cfJ\nKZfXNFg3Qb72kJBgwNoL6V3T2TqjJYLuky9MJvAX+YbMChfa6bKb9wnZIQ4h0kAV\nbUFq1MqB6oAVheWud/Uo4bFYLJ2Fu4zXg6geQ4ltC4CNz00zSX27/Gxh8o9Z2If6\nd+b3KHqxbwKBgBKY9EpH3MV3m9iOotzshRLI0O5/mzX3/sg2HKlcskBgd2yIVRzz\nfwoePBUDfWmWTdlJc7zLIl9BWInhJZBXl3tA9KoZxoE+sUGkN/TrWZu9xC7VwRx9\nmXfF3Vj66I0nlaPvQLhVb8Y9QW/C+OZNd5sF4fQ9VRNAShq6D9g5VnHRAoGBAJ92\n0YSMdEIfMC/MCbOnWKiJorMCdUA5LyaFIkdz5GW2rsMPUDC5Zn64JS+lxb0q1wwe\ntzHO+GZBkHD8ZXbuo6i9lwJ7dj97fPZauauLec9k2x8OySuedh2sAbv4AOAIM7KF\nHaCCvvFpN7uiMqphBB4iHOCuv17mwmNmk9bajxzxAoGALSoaj6V8yk9SqmpYqAYq\nEhqpMeypWrsFN35Eq0QbdKyjO2hIbGGoOb0TQpII8Juo6XDiIIXskr2ZcXwJXh+3\nEcHPRWnNMm5v1eDRqbVIKrkcd9JtnK2DJGqFNl/yrUv2SWO15yhSl6YRjXNG0f8G\nWmLCb5RrctAERVNw0caKxno=\n-----END PRIVATE KEY-----\n",
  "client_email": "memorylane@carbide-program-309313.iam.gserviceaccount.com",
  "client_id": "107189148068302953492",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/memorylane%40carbide-program-309313.iam.gserviceaccount.com"
}


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
