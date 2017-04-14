from setuptools import setup

version = '0.1'

description = "CLI tools for Oregon ballot measure data and web app"

setup(
    name="oregon_measures",
    version=version,
    url='http://github.com/travishathaway/oregon-measures',
    license='BSD',
    description=description,
    author='Travis Hathaway',
    author_email='travis.j.hathaway@gmail.com',
    packages=['oregon_measures', ],
    install_requires=[
        'setuptools', 
        'psycopg2', 
        'click',
        'flask'
    ],
    entry_points="""
        [console_scripts]
        om = oregon_measures.cli:cli
    """,
    classifiers=[
        'Environment :: Console',
    ],
)
