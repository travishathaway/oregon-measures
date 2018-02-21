import os

from psycopg2.extras import DictCursor
from flask import (
    Blueprint, render_template, jsonify, abort
)

from oregon_measures import settings
from oregon_measures.app import get_measures_db

public = Blueprint(
    'public', __name__, template_folder='../templates'
)

@public.route('/', methods=["GET"])
def admin_index():
    """
    Render the public site index
    """
    print(os.getcwd())
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
    db = get_measures_db()
    cursor = db.cursor()

    cursor.execute("SELECT * FROM measure LIMIT 25")

    return jsonify([{
        'id': row[0],
        'number': row[1],
        'description': row[2],
        'date': row[3].isoformat(),
        'year': row[3].year
    } for row in cursor.fetchall()])


@public.route('/api/measure/<year>/<number>', methods=['GET'])
def measures_detail(year, number):
    """
    Endpoint for searching measures
    """
    db = get_measures_db()
    cursor = db.cursor()

    cursor.execute("""
    select row_to_json(t)
      from (
        select measure.id, measure.number, measure.date, measure.description,
          (
            select array_to_json(array_agg(row_to_json(d)))
            from (
              select yes_votes, no_votes, county_id
              from measure_by_county
              where measure_id=measure.id
            ) d
          ) as results
        from measure
        where number = %s
        and extract(year from date) = %s
      ) t
    """, (number, year))

    res = cursor.fetchone()

    if res:
        return jsonify(res[0])

    abort(404)


@public.context_processor
def constants_processor():
    return {
        'API_URL': settings.API_URL
    }