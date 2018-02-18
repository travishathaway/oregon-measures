import sys

import click

from .load import process_directory
from .dump import get_geojson, get_data_json


@click.group()
def cli():
    pass


@click.command()
@click.argument('dirname', type=click.Path(exists=True))
def load(dirname):
    """Load CSV files to database
    """
    click.echo("importing the CSVs...")
    process_directory(dirname)


@click.command()
@click.argument('data_type')
def dump(data_type):
    """Dump json files for application
    """
    data_dumps = {
        'geo': get_geojson,
        'data': get_data_json
    }

    data_func = data_dumps.get(data_type)

    if not data_func:
        avail_dumps = ', '.join(data_dumps.keys())
        click.echo(
            click.style(
                'Invalid dump type. Select one of: {}'.format(avail_dumps),
                fg='red'
            )
        )
        sys.exit(1)

    json_data = data_func()
    click.echo(json_data)

cli.add_command(load)
cli.add_command(dump)
