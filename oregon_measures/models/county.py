from oregon_measures.app import get_measures_db


def get_counties() -> list:
    """
    Get a list of counties from the "measures" database
    """
    db = get_measures_db()
    cursor = db.cursor()

    cursor.execute('SELECT id, name FROM county order by name')

    return [
        {'id': r[0], 'name': r[1]} for r in cursor.fetchall()
    ]