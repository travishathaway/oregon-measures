from datetime import datetime
from oregon_measures.utils import parse_bulk_update_text
from oregon_measures.app import get_db


class MeasureValidationError(Exception):
    pass


def get_measures(filters: dict) -> list:
    """
    Retrieve a list of measures provided a set of filters. Possible
    values for filters are:
      - years: list of years
      - search: str search term
    """
    params = []
    where_cls = []
    db = get_db()
    cursor = db.cursor()
    search = filters.get('search')
    years = filters.get('years[]')

    query = """
        SELECT 
            m.id, m.number, m.description,
            m.date,
            CASE WHEN 
                SUM(mc.yes_votes) > SUM(mc.no_votes) 
            THEN true ELSE false END AS passed
        FROM 
            measure m
        LEFT JOIN 
            measure_by_county mc 
        ON 
            mc.measure_id = m.id
        {}
        GROUP BY 
            m.id, m.number, m.date, m.description, m.date
        ORDER BY date DESC
    """

    if search:
        search = f'%{search}%'
        params.append(search)
        where_cls.append('description ILIKE %s')

    if years:
        params.append(years)
        where_cls.append('extract(year from date) IN (%s)')

    if not years and not search:
        query = query.format('')
        cursor.execute(query)
    else:
        where_str = 'WHERE ' + ' AND '.join(where_cls)
        query = query.format(where_str)
        cursor.execute(query, params)

    return [{
        'id': row[0],
        'number': row[1],
        'description': row[2],
        'date': row[3].isoformat(),
        'year': row[3].year,
        'passed': row[4]
    } for row in cursor.fetchall()]


def get_measure(year: int, number: str) -> dict:
    """
    Get single measure
    """
    db = get_db()
    cursor = db.cursor()

    cursor.execute("""
    select row_to_json(t)
      from (
        select measure.id, measure.number, measure.date, measure.description,
          (
            select array_to_json(array_agg(row_to_json(d)))
            from (
              select yes_votes, no_votes, county_id, c.name
              from county c
              left join measure_by_county mbc
              on c.id = mbc.county_id
              where measure_id=measure.id
              order by c.name
            ) d
          ) as results
        from measure
        where number = %s
        and extract(year from date) = %s
      ) t
    """, (number, year))

    meas = cursor.fetchone()

    if meas:
        return meas[0]


def update_measure_results(measure_id: int, yes_votes: list,
                           no_votes: list, counties: list):
    """Bulk update measure results"""
    db = get_db()
    cursor = db.cursor()

    cursor.execute(
        'DELETE FROM measure_by_county WHERE measure_id = %s', (measure_id, )
    )

    data = [
        (measure_id, c['county_id'], yes, no)
        for yes, no, c in zip(yes_votes, no_votes, counties)
    ]

    cursor.executemany(
        'INSERT INTO measure_by_county '
        '(measure_id, county_id, yes_votes, no_votes) '
        'VALUES (%s, %s, %s, %s)',
        data
    )

    db.commit()


class Measure:
    """
    Class for representing single measures
    """
    DATE_FORMAT = '%Y-%m-%d'

    def __init__(self, number: str=None, date=None, description: str=None,
                 measure_id: int=None):
        self.measure_id = measure_id
        self.number = number
        self.description = description

        if isinstance(date, str):
            self.date = datetime.strptime(date, self.DATE_FORMAT)
        else:
            self.date = date

    def update(self, **kwargs):
        """
        Update object based on kwarg values and then save
        """
        for key, val in kwargs.items():
            if hasattr(self, key):
                setattr(self, key, val)

        self.save()

    def update_results(self, data, counties):
        """
        Update the results associated with measure
        """
        if data.get('yes_votes_bulk') and data.get('no_votes_bulk'):
            yes_votes = parse_bulk_update_text(
                data.get('yes_votes_bulk')
            )
            no_votes = parse_bulk_update_text(
                data.get('no_votes_bulk')
            )

            if len(no_votes) != len(counties) and len(yes_votes) != len(counties):
                raise MeasureValidationError(
                    'Provided bulk measures do not match amount of counties')
        else:
            yes_votes = [x or 0 for x in data.getlist('yes_votes')]
            no_votes = [x or 0 for x in data.getlist('no_votes')]

        if yes_votes and no_votes:
            update_measure_results(
                self.measure_id, yes_votes, no_votes, counties
            )

    def save(self):
        if self.date and self.number and self.description:
            db = get_db()
            cursor = db.cursor()

            if not self.measure_id:
                cursor.execute(
                    'INSERT INTO measure (number, date, description) '
                    'VALUES (%s, %s, %s)',
                    (self.number, self.date, self.description)
                )
            else:
                cursor.execute(
                    'UPDATE measure '
                    'SET number = %s, date = %s, description = %s '
                    'WHERE id = %s',
                    (self.number, self.date, self.description,
                     self.measure_id)
                )

            db.commit()

    def delete(self):
        """
        Delete measure from database
        """
        if self.measure_id:
            db = get_db()
            cursor = db.cursor()

            cursor.execute('DELETE FROM measure_by_county '
                           'WHERE measure_id = %s',
                           (self.measure_id, ))

            cursor.execute('DELETE FROM measure WHERE id = %s',
                           (self.measure_id, ))

            db.commit()

    def json(self) -> dict:
        """
        Return JSON serializable representation of this object
        """
        return get_measure(self.date.year, self.number)

    @classmethod
    def find(cls, year, number):
        """
        Find measure by year and number
        """
        db = get_db()
        cursor = db.cursor()

        cursor.execute(
            'SELECT number, date, description, id '
            'FROM measure '
            'WHERE extract(year from date) = %s '
            'AND number = %s',
            (year, number)
        )

        res = cursor.fetchone()

        if res:
            return cls(res[0], res[1], res[2], measure_id=res[3])
