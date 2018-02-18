import os
from flask import (
    Blueprint, render_template
)

public = Blueprint(
    'public', __name__, template_folder='../templates'
)


@public.route("/", methods=["GET"])
def admin_index():
    """
    Render the public site index
    """
    print(os.getcwd())
    return render_template('index.html')
