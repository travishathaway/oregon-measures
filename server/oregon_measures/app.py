import sqlite3

from flask import Flask, g
from flask_login import LoginManager
from flask_bcrypt import Bcrypt

from .settings import DEBUG, SECRET_KEY, DATABASE

app = Flask('oregon-measures')

app.debug = DEBUG
app.secret_key = SECRET_KEY

flask_bcrypt = Bcrypt(app)

login_manager = LoginManager()
login_manager.init_app(app)


def get_db():
    db = getattr(g, '_database', None)

    if db is None:
        db = g._database = sqlite3.connect(DATABASE)
    return db


@app.teardown_appcontext
def close_connection(exception):
    db = getattr(g, '_database', None)

    if db is not None:
        db.close()
