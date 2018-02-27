from oregon_measures.app import app
from oregon_measures.models.auth import User


def main():
    user = User(username='travis', password='password')
    user.save()


if __name__ == '__main__':
    with app.app_context():
        main()
