from flask_wtf import FlaskForm
from wtforms import (
    StringField, DateField, TextAreaField
)
from wtforms.validators import DataRequired


class MeasureForm(FlaskForm):
    number = StringField('number', validators=[DataRequired()])
    date = DateField('date', validators=[DataRequired()])
    description = TextAreaField('description', validators=[DataRequired()])
