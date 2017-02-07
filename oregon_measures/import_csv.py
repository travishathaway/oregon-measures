"""
Usage:
    om_import <csv_directory>
"""
import glob
import datetime
import csv
import os
import docopt
import sys
import psycopg2

election_dates_by_year = {
    2014: datetime.date(2014, 11, 4),
    2016: datetime.date(2016, 11, 8)
}

connection = psycopg2.connect(
    host=os.getenv('APP_DB_HOST', '127.0.0.1'),
    port=os.getenv('APP_DB_PORT', 5432),
    user=os.getenv('APP_DB_USER'),
    password=os.getenv('APP_DB_PASS'),
    dbname=os.getenv('APP_DB_NAME')
)
cursor = connection.cursor()


try:
    cursor.execute('SELECT id, name FROM county')
    rows = cursor.fetchall()

    county_id_by_name = {row[1]: row[0] for row in rows}

except psycopg2.ProgrammingError:
    cursor.close()
    connection.close()
    sys.stderr.write('Imprpoerly configured database')
    sys.exit(1)


def process_directory(dirname):
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

    # Find all the csv files
    csv_files = glob.glob('{}/*.csv'.format(dirname))

    # Add the file data to database
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


def main():
    """
    Runs the main CSV importer
    """
    try:
        args = docopt.docopt(__doc__)

        dirname = args.get('<csv_directory>')

        if os.path.isdir(dirname):
            process_directory(dirname)
        else:
            sys.stderr.write(
                "Please provide a valid directory containing csvs\n")
            sys.exit(1)
    finally:
        cursor.close()
        connection.commit()
        connection.close()
