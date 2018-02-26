import sqlite3

import psycopg2
from flask import Flask, g
from flask_login import LoginManager
from flask_bcrypt import Bcrypt
from flasgger import Swagger

from .settings import (
    DEBUG, SECRET_KEY, DATABASE, MEASURES_DB
)

app = Flask('oregon-measures')

app.debug = DEBUG
app.secret_key = SECRET_KEY

flask_bcrypt = Bcrypt(app)

login_manager = LoginManager()
login_manager.init_app(app)

swagger = Swagger(app)

def get_db():
    db = getattr(g, '_database', None)

    if db is None:
        db = g._database = sqlite3.connect(DATABASE)
    return db


def get_measures_db():
    db = getattr(g, '_measures_database', None)

    if db is None:
        db = g._measures_database = psycopg2.connect(MEASURES_DB)
    return db


@app.teardown_appcontext
def close_connection(exception):
    db = getattr(g, '_database', None)

    if db is not None:
        db.close()
