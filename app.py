import json
import psycopg2
import os

from collections import defaultdict

from flask import Flask, render_template, Response, jsonify, request, g, send_from_directory

app = Flask(__name__)
base_url = os.getenv('APP_BASE_URL', '/')
static_url = os.getenv('APP_STATIC_URL', '/static/')


def get_db():
    db = getattr(g, '_database', None)
    if db is None:
        db = g._database = psycopg2.connect(
            host=os.getenv('APP_DB_HOST', '127.0.0.1'),
            port=os.getenv('APP_DB_PORT', 5432),
            user=os.getenv('APP_DB_USER'),
            password=os.getenv('APP_DB_PASS'),
            dbname=os.getenv('APP_DB_NAME')
        ).cursor()
        return db


@app.teardown_appcontext
def close_connection(exception):
    db = getattr(g, '_database', None)
    if db is not None:
        db.close()


@app.route('{}measure-by-year-all'.format(base_url))
def measures_by_year_all():
    cur = get_db()
    cur.execute('SELECT substr(date::text, 0, 5) as year, number, description FROM measure')
    measures_by_year = defaultdict(list)

    for row in cur.fetchall():
        measures_by_year[row[0]].append({
            'measure': row[1],
            'description': row[2].replace('Amends Constitution:', '')
        })

    return jsonify(measures_by_year)


@app.route('{}measure-by-year'.format(base_url))
def measure_by_year():
    cur = get_db()
    year = request.args.get('year', '')

    cur.execute("SELECT number, description FROM measure where substr(date::text, 0, 5) = %s ORDER BY number",
                (year, ))

    measures = [{'number': row[0], 'description': row[1]}
                for row in cur.fetchall()]

    return jsonify({'measures': measures})


@app.route('{}counties.json'.format(base_url))
def counties_json():

    cur = get_db()
    year = request.args.get('year')
    measure = request.args.get('measure')

    if not year and not measure:
        return Response(
            response='Parameters "year" and "measure" are required',
            status=400
        )

    cur.execute(
        '''
        SELECT row_to_json(fc)
        FROM (
            SELECT 'FeatureCollection' As type, array_to_json(array_agg(f)) As features
            FROM (
                SELECT 'Feature' As type
                , ST_AsGeoJSON(ST_Simplify(lg.geom, 0.01))::json As geometry
                , row_to_json(
                    (SELECT l FROM (
                        SELECT lg.gid, c.name, mbc.yes_votes, mbc.no_votes,
                        (mbc.yes_votes - mbc.no_votes) / (mbc.yes_votes + mbc.no_votes)::decimal / 2 + 0.5 
                        as proportion
                    ) As l)
                ) As properties
                FROM orcnty24_4326 As lg
                LEFT JOIN county c
                ON c.gid = lg.gid
                LEFT JOIN measure_by_county mbc
                on c.id = mbc.county_id
                LEFT JOIN measure m
                on m.id = mbc.measure_id
                WHERE substr(m.date::text, 0, 5) = %s and m.number = %s
            ) As f
            ) As fc;
        ''', (year, measure)
    )

    row = cur.fetchone()

    resp = Response(response=json.dumps(row),
                    status=200,
                    mimetype="application/json")
    return resp


if __name__ == '__main__':
    app.run(debug=os.getenv('APP_DEBUG'))
