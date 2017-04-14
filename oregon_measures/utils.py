from functools import wraps

import psycopg2


def psycopg2_cur(conn_info):
    """Wrap function to setup and tear down a Postgres connection.
    While providing a cursor object to make queries with.

    :param conn_info: Dictionary, passed to psycopg2 connect function
    """
    def wrap(f):
        @wraps(f)
        def wrapper(*args, **kwargs):
            try:
                # Setup postgres connection
                connection = psycopg2.connect(**conn_info)
                cursor = connection.cursor()

                # Call function passing in cursor
                return_val = f(cursor, *args, **kwargs)

            finally:
                # Close connection
                connection.commit()
                connection.close()

            return return_val
        return wrapper
    return wrap
