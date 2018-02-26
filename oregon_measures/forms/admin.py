from flask_wtf import FlaskForm
from wtforms import (
    StringField, DateField, TextAreaField, IntegerField,
    FieldList
)
from wtforms.validators import DataRequired


class MeasureForm(FlaskForm):
    number = StringField('number', validators=[DataRequired()])
    date = DateField('date', validators=[DataRequired()])
    description = TextAreaField('description', validators=[DataRequired()])
    yes_votes = FieldList(IntegerField('yes_votes'))
    no_votes = FieldList(IntegerField('no_votes'))
