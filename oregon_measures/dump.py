import json

from .utils import psycopg2_cur
from .settings import PG_CONN_INFO


@psycopg2_cur(PG_CONN_INFO)
def get_geojson(cursor):
    """Returns the GeoJSON of Oregon

    :param cursor:
    :return:
    """
    cursor.execute(
        '''
        SELECT row_to_json(fc)
        FROM (
            SELECT 'FeatureCollection' As type, array_to_json(array_agg(f)) As features
            FROM (
                SELECT 'Feature' As type
                , ST_AsGeoJSON(ST_Simplify(lg.geom, 0.01))::json As geometry
                , row_to_json(
                    (SELECT l FROM (
                        SELECT lg.gid, c.name, c.id as county_id
                    ) As l)
                ) As properties
                FROM orcnty24_4326 As lg
                LEFT JOIN county c
                ON c.gid = lg.gid
            ) As f
            ) As fc;
        '''
    )

    return json.dumps(cursor.fetchone()[0])


@psycopg2_cur(PG_CONN_INFO)
def get_data_json(cursor):
    """Return all voting data as json

    :param cursor: psycopg2.Cursor
    :return json: str
    """
    cursor.execute('''
    SELECT json_build_object(
        'measures', (
            SELECT
                json_object_agg(rows.year, rows.measures)
            FROM (
                SELECT
                    date_part('year', date) AS year,
                    json_agg(
                        json_build_object(
                            'description', description,
                            'measure', number
                        )
                    ) AS measures
                FROM
                    measure
                GROUP BY
                    date_part('year', date)
            ) AS rows
        ),
        'results', (
            SELECT
                json_object_agg(
                    date_part('year', date) || '-' || number || '-' || mc.county_id,
                    json_build_object(
                        'yes_votes', mc.yes_votes,
                        'no_votes', mc.no_votes,
                        'proportion', (
                            mc.yes_votes - mc.no_votes
                        ) / (
                            mc.yes_votes + mc.no_votes
                        )::decimal / 2 + 0.5
                    )
                )
            FROM
                measure_by_county mc
            LEFT JOIN
                measure m
            ON
                mc.measure_id = m.id
        )
    )
    ''')

    return json.dumps(cursor.fetchone()[0])
