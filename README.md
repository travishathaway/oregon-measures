Oregon Measures
===============

Oregon Measures is a simple application that shows the results of ballot measure initiatives in Oregon from 1996 til 2016 except for years 2007 (special election year) and 2002.  I am still on the hunt for this data.  The application consists of two parts; a React JS app for displaying the data and a Python CLI program for processing of data.

## Visit the Site!
Check out the application by visiting this link: [Oregon Ballot Measures](http://measures.travishathaway.com)

## ReactJS App
Head over to the [ReactJS App README](./client/README.md) for more information on getting your development environment set up.

## Python CLI
This CLI program is still very much in its infancy. The general idea for the program is to parse an injest data about ballot measures (usually in a CSV file) and load it in to a PostgreSQL database.  The other side of the program is dumping the data in the PostgreSQL database in to a format suitable for our ReactJS app. In this case, that data format is JSON.

Here is a brief overview of the commands available:

**Load** 

Given a specially named folder with specially named files (yes, not very robust), load the data in to a PostgreSQL database.  The folder and folder and files should be named as:

```
nov\<year\>/m<measure_number>.csv
```

An example usage of this command:

```bash
om load nov2012
```

**Dump**

Dump supports a couple different types of data dumps. `geo` will dump the GeoJSON file used by the ReactJS app to render the map of Oregon. `data` will dump all of the data about ballot measures and results. All these dump commands dump straight to std out.

An example usage of this command:

```bash
om dump geo
```

## Contributing
Conributing is very much welcomed. On top of coding and wrangling data, bug reports and suggestions for UI/UX improvements are also greatly appreciated. Hop over to the issues to see what is currently needed.
