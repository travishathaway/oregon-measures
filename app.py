import json
import psycopg2
import os

from flask import Flask, render_template, Response, jsonify, request, g

app = Flask(__name__)
app.debug = True
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


@app.route(base_url)
def index():
    cur = get_db()
    cur.execute("SELECT distinct date FROM measure ORDER BY date")
    years = [row[0] for row in cur.fetchall()]

    cur.execute("SELECT number, description FROM measure where date = %s ORDER BY number",
                (years[0], ))
    measures = [{'number': row[0], 'description': row[1]}
                for row in cur.fetchall()]

    return render_template('base.html', years=years, static_url=static_url,
                           measures=measures, base_url=base_url)


@app.route('{}measure-by-year'.format(base_url))
def measure_by_year():
    cur = get_db()
    year = request.args.get('year', '')

    cur.execute("SELECT number, description FROM measure where date = %s ORDER BY number",
                (year, ))

    measures = [{'number': row[0], 'description': row[1]}
                for row in cur.fetchall()]

    return jsonify({'measures': measures})


@app.route('{}counties.json'.format(base_url))
def counties_json():

    cur = get_db()
    year = request.args.get('year', '2012-11-06')
    measure = request.args.get('measure', '83')

    cur.execute(
        '''
        SELECT row_to_json(fc)
        FROM (
            SELECT 'FeatureCollection' As type, array_to_json(array_agg(f)) As features
            FROM (
                SELECT 'Feature' As type
                , ST_AsGeoJSON(ST_Simplify(lg.geom, 0.01))::json As geometry
                , row_to_json(
                    (SELECT l FROM (SELECT lg.gid, c.name, mbc.yes_votes, mbc.no_votes) As l)
                ) As properties
                FROM orcnty24_4326 As lg
                LEFT JOIN county c
                ON c.gid = lg.gid
                LEFT JOIN measure_by_county mbc
                on c.id = mbc.county_id
                LEFT JOIN measure m
                on m.id = mbc.measure_id
                WHERE m.date = %s and m.number = %s
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
    app.run()
