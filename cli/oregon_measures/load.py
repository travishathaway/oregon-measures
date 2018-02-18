import os
import sys
import datetime
import glob
import csv

from .settings import PG_CONN_INFO
from .utils import psycopg2_cur

election_dates_by_year = {
    2014: datetime.date(2014, 11, 4),
    2016: datetime.date(2016, 11, 8),
    2007: datetime.date(2007, 11, 6)
}


def get_county_name_by_id(cursor):
    """
    Return county names by id

    :param cursor:
    :return:
    """
    cursor.execute('SELECT id, name FROM county')
    rows = cursor.fetchall()

    county_id_by_name = {row[1]: row[0] for row in rows}

    return county_id_by_name


@psycopg2_cur(PG_CONN_INFO)
def process_directory(cursor, dirname):
    """
    Provided a dirname, looks for all the CSV files
    at the first level of the directory and then imports
    them into our database. It also matches a special name
    for the directory and file names. They are:

        Directories:
            - nov<year>, (e.g. nov2016)
        Files:
            - m<measure>, (e.g. m99)
    """
    base = os.path.basename(dirname)

    try:
        year = int(base[-4:])
    except ValueError:
        sys.stderr.write(
            'Directory name not valid for import. '+
            'Make sure it is in the format <three_letter_month><year>\n'
        )
        sys.exit(1)

    election_date = election_dates_by_year.get(year)

    if not election_date:
        sys.stderr.write(
            'Election date not found for year {}'.format(year)
        )
        sys.exit(1)

    csv_files = glob.glob('{}/*.csv'.format(dirname))
    county_id_by_name = get_county_name_by_id(cursor)

    for csv_file in csv_files:
        measure_number = int(os.path.basename(csv_file)[1:].replace('.csv', ''))

        cursor.execute(
            'INSERT INTO measure (number, date) values (%s, %s) '+
            ' ON CONFLICT (number, date) DO NOTHING RETURNING *', (
                measure_number, election_date)
        )

        row = cursor.fetchone()

        if not row:
            cursor.execute("""
                SELECT * FROM measure WHERE number = %s AND date = %s """, (
                measure_number, election_date
            ))

            row = cursor.fetchone()

        measure_id = row[0]

        with open(csv_file, 'r') as csv_f_hand:
            csv_data = csv.reader(csv_f_hand)

            for row in csv_data:
                if row[0] != 'County':
                    cursor.execute("""
                        INSERT INTO measure_by_county
                        (measure_id, county_id, yes_votes, no_votes)
                        VALUES (%s, %s, %s, %s)
                        ON CONFLICT (measure_id, county_id) DO NOTHING
                    """, (
                        measure_id, county_id_by_name.get(row[0]),
                        int(row[1].replace(',', '')),
                        int(row[2].replace(',', ''))
                    ))
