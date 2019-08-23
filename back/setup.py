# coding=utf-8
"""
Cornetto

Copyright (C) 2018–2019 ANSSI
Contributors:
2018–2019 Bureau Applicatif tech-sdn-app@ssi.gouv.fr
This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.
This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU General Public License for more details.
You should have received a copy of the GNU General Public License
"""

from setuptools import find_packages, setup

setup(
    name='cornetto',
    version='2.0.1',
    url="https://github.com/ANSSI-FR/cornetto",
    license='GPLv3',
    author='Bureau Applicatif',
    author_email='tech-sdn-app@ssi.gouv.fr',
    description='A tool to manage static version of a website.',
    packages=find_packages(exclude=['build', 'docs', 'tests*', 'static']),
    include_package_data=True,
    package_data={
        'cornetto': [
            '../cfg/*'
        ]
    },
    python_requires=">=3.4",
    py_modules=['wsgi', 'scrapy_cmd'],
    install_requires=[
        'Automat',
        'Flask',
        'Flask-SQLAlchemy',
        'Jinja2',
        'MarkupSafe',
        'Pillow',
        'PyDispatcher',
        'SQLAlchemy',
        'Scrapy',
        'Twisted',
        'Werkzeug',
        'asn1crypto',
        'attrs',
        'cffi',
        'characteristic',
        'chardet',
        'click',
        'colorama',
        'constantly',
        'cryptography',
        'cssselect',
        'html5lib',
        'hyperlink',
        'idna',
        'incremental',
        'itsdangerous',
        'lxml',
        'olefile',
        'parsel',
        'ply',
        'pyOpenSSL',
        'pyasn1',
        'pyasn1-modules',
        'pycparser',
        'queuelib',
        'requests',
        'service-identity',
        'sh',
        'six',
        'typing',
        'update',
        'urllib3',
        'w3lib',
        'zope.interface'
    ]
)
