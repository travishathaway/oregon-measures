from flask import (
    Blueprint, render_template, request, redirect, url_for, flash, abort
)

from flask_login import login_required

from oregon_measures.models.measure import (
    get_measures, get_measure, Measure, update_measure_results
)
from oregon_measures.models.county import get_counties
from oregon_measures.forms.admin import MeasureForm
from oregon_measures.utils import parse_bulk_update_text

admin = Blueprint(
    'admin', __name__, template_folder='templates',
    url_prefix='/admin'
)


def parse_int(arg):
    """
    Parse values in args as int
    """
    try:
        return int(arg)
    except ValueError:
        abort(404)


@admin.route("/", methods=["GET"])
@login_required
def index():
    """
    Render the admin index
    """
    measure_list = get_measures(request.args)

    return render_template('admin/index.html', measure_list=measure_list)


@admin.route("/measure", methods=["GET", "POST"])
@login_required
def create_measure():
    """
    Endpoint for creating a measure
    :return:
    """
    form = MeasureForm()

    if request.method == 'POST':
        if form.validate():
            form_mod = Measure(
                **{k: v for k, v in form.data.items() if k != 'csrf_token'}
            )
            form_mod.save()
            flash('New Measure created', 'success')

            return redirect(
                url_for('admin.measure_detail', year=form_mod.date.year,
                        number=form_mod.number)
            )

    return render_template('admin/create_measure.html', form=form)


@admin.route("/measure/<year>/<number>/delete", methods=["POST"])
@login_required
def delete_measure(year, number):
    """Delete a measure"""
    year = parse_int(year)
    measure = Measure.find(year, number)

    if measure:
        measure.delete()
        flash('Measure deleted', 'success')
        return redirect('/admin')
    else:
        abort(404)


@admin.route("/measure/<year>/<number>", methods=["GET", "POST"])
@login_required
def measure_detail(year, number):
    """
    Render the admin index
    """
    year = parse_int(year)
    measure = get_measure(year, number)

    if not measure:
        abort(404)

    counties = measure.get('results') or get_counties()

    measure_mod = Measure(
        number=measure.get('number'), description=measure.get('description'),
        date=measure.get('date'), measure_id=measure.get('id')
    )

    form = MeasureForm(obj=measure_mod)

    if request.method == 'POST':
        if form.validate():
            measure_mod.update(**form.data)

            if (
                request.form.get('yes_votes_bulk') and
                request.form.get('no_votes_bulk')
            ):
                yes_votes = parse_bulk_update_text(
                    request.form.get('yes_votes_bulk')
                )
                no_votes = parse_bulk_update_text(
                    request.form.get('no_votes_bulk')
                )

                if len(no_votes) != len(counties) and len(yes_votes) != len(counties):
                    flash('Provided bulk measures do not '
                          'match amount of counties', 'danger')
                    return redirect(
                        url_for('admin.measure_detail', year=year, number=number)
                    )
            else:
                yes_votes = [x or 0 for x in request.form.getlist('yes_votes')]
                no_votes = [x or 0 for x in request.form.getlist('no_votes')]

            if yes_votes and no_votes:
                update_measure_results(
                    measure_mod.measure_id, yes_votes, no_votes, counties
                )

            flash('Measure results saved', 'success')

            return redirect(
                url_for('admin.measure_detail', year=year, number=number)
            )

        flash('Form errors', 'danger')

    measure_link = url_for('public.measure_detail', measure=measure_mod.number,
                           year=measure_mod.date.year)
    delete_link = url_for('admin.delete_measure', number=measure_mod.number,
                          year=measure_mod.date.year)

    return render_template('admin/measure.html', form=form,
                           measure_link=measure_link, delete_link=delete_link,
                           measure=measure, counties=counties)
