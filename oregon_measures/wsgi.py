# Main app
# Get Blueprints
from oregon_measures.views.auth import auth
from oregon_measures.views.admin import admin
from oregon_measures.views.public import public
from oregon_measures.app import app

# Register Blueprints
app.register_blueprint(auth)
app.register_blueprint(admin)
app.register_blueprint(public)

app.static_folder = 'oregon_measures/static'

if __name__ == '__main__':
    app.run()
