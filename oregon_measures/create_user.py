from getpass import getpass

from oregon_measures.app import app
from oregon_measures.models.auth import User


def main():
    username = input('Username: ')
    password = getpass('Password: ')

    if username and password:
        user = User(username=username, password=password)
        user.save()
    else:
        print('Error, nothing provided')


if __name__ == '__main__':
    with app.app_context():
        main()
