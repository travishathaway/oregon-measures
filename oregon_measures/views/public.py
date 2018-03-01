from flask import (
    Blueprint, render_template, jsonify, abort, request
)

from oregon_measures import settings
from oregon_measures.app import get_db
from oregon_measures.models.measure import (
    get_measures, get_measure
)

public = Blueprint(
    'public', __name__, template_folder='../templates'
)


@public.route('/', methods=["GET"])
def index():
    """
    Render the public site index
    """
    return render_template('index.html')


@public.route('/measure/<year>/<measure>')
def measure_detail(year, measure):
    """
    Render the detail page for a measure
    """
    return render_template('index.html')


@public.route('/api/measure', methods=['GET'])
def measures():
    """
    Endpoint for searching measures
    """
    measure_list = get_measures(request.args)

    return jsonify(measure_list)


@public.route('/api/measure/<year>/<number>', methods=['GET'])
def measures_detail(year, number):
    """
    Endpoint for searching measures
    """
    try:
        year = int(year)
    except ValueError:
        return abort(400, 'Invalid input provided')

    meas = get_measure(year, number)

    if meas:
        return jsonify(meas)

    abort(404)


@public.route('/api/measure/years', methods=['GET'])
def measure_years():
    """
    Returns the years for which we have measures
    """
    db = get_db()
    cursor = db.cursor()

    query = """
        SELECT DISTINCT EXTRACT(year FROM date) 
        FROM measure
        ORDER BY EXTRACT(year FROM date) DESC
    """
    cursor.execute(query)

    return jsonify(
        [r[0] for r in cursor.fetchall()]
    )


@public.context_processor
def constants_processor():
    return {
        'API_URL': settings.API_URL
    }