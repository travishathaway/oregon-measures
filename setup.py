from setuptools import setup, find_packages

version = '0.1'

description = "Web app for Oregon Ballot Measures"

setup(
    name="oregon_measures",
    version=version,
    url='http://github.com/travishathaway/oregon-measures',
    license='BSD',
    description=description,
    author='Travis Hathaway',
    author_email='travis.j.hathaway@gmail.com',
    packages=find_packages(),
    install_requires=[
        'flask',
        'flask-login',
        'flask-bcrypt'
    ],
    classifiers=[
        'Environment :: Console',
    ],
)
