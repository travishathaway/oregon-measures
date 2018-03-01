import os

DATABASE = os.getenv('DATABASE_URL') or 'postgresql://travishathaway@localhost:5432/om_2'
DEBUG = os.getenv('DEBUG') or True

SECRET_KEY = os.getenv('SECRET_KEY') or '92b2f9e0028b2b41cd7ce8ce94937ca2b767b486fc43d1c1'

API_URL = os.getenv('API_URL') or '/api'
