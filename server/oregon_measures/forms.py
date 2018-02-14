from wtforms import fields, validators, Form


# Login form will provide a Password field (WTForm form field)
class LoginForm(Form):
    username = fields.StringField(
        'Username', validators=[validators.DataRequired()]
    )
    password = fields.PasswordField(
        'Password', validators=[validators.DataRequired()]
    )
