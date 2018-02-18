from flask import (
    Blueprint, render_template
)

from flask_login import login_required, current_user

admin = Blueprint(
    'admin', __name__, template_folder='templates'
)


@admin.route("/admin", methods=["get"])
@login_required
def admin_index():
    """
    Render the admin index
    """
    return render_template('admin/index.html')
