import os

PG_CONN_INFO = {
    'host': os.getenv('APP_DB_HOST', '127.0.0.1'),
    'port': os.getenv('APP_DB_PORT', 5432),
    'user': os.getenv('APP_DB_USER'),
    'password': os.getenv('APP_DB_PASS'),
    'dbname': os.getenv('APP_DB_NAME')
}
