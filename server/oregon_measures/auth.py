from .app import login_manager, flask_bcrypt
from flask import (
    Blueprint, render_template, request,
    flash, redirect
)
from flask_login import (
    login_required, login_user,
    logout_user, confirm_login
)

from oregon_measures.models import User

auth = Blueprint(
    'auth', __name__, template_folder='templates'
)


@auth.route("/login", methods=["get", "post"])
def login():
    if request.method == "POST" and "email" in request.form:
        email = request.form["email"]
        user = User.find_user(email)

        if user:
            valid_creds = flask_bcrypt.check_password_hash(
                user.password, request.form["password"]
            )

            if valid_creds:
                remember = request.form.get("remember", "no") == "yes"

                if login_user(user, remember=remember):
                    flash("Logged in!")
                    return redirect('/admin')

        flash("unable to log you in")

    return render_template("/auth/login.html")


@auth.route("/logout")
@login_required
def logout():
    logout_user()
    flash("Logged out.")
    return redirect('/login')


@login_manager.unauthorized_handler
def unauthorized_callback():
    return redirect('/login')


@login_manager.user_loader
def load_user(user_id):
    if user_id is None:
        redirect('/login')

    user = User.find_user(user_id)

    return user
