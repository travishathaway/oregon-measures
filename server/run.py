# Main app
# Get Blueprints
from oregon_measures.auth import auth
from oregon_measures.admin import admin
from oregon_measures.app import app

# Register Blueprints
app.register_blueprint(auth)
app.register_blueprint(admin)

if __name__ == '__main__':
    app.run()
