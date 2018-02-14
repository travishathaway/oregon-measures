from flask_login.mixins import UserMixin
from flask_bcrypt import generate_password_hash
from .app import get_db


class User(UserMixin):
    """
    User class that represents users in the app
    """

    def __init__(self, username=None, password=None):
        self.username = username
        self.password = password

    @property
    def is_authenticated(self):
        if self.username:
            return True

    @property
    def is_anonymous(self):
        if self.username is None:
            return True
        return False

    def get_id(self):
        return self.username

    def save(self):
        if self.username and self.password:
            password = generate_password_hash(self.password)
            db = get_db()
            cursor = db.cursor()

            cursor.execute(
                'INSERT INTO users VALUES (?, ?)', (self.username, password)
            )

            db.commit()

    @classmethod
    def find_user(cls, username):
        """
        Find user by provided username
        """
        db = get_db()
        cursor = db.cursor()

        cursor.execute(
            'SELECT username, password from users WHERE username = ?',
            (username, )
        )

        res = cursor.fetchone()

        if res:
            return cls(res[0], res[1])
