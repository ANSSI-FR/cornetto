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

# APPS CONF
DEBUG = False
LOGLEVEL = 'INFO'

# define the log directory
LOGDIR = '/opt/cornetto/log/'
API_LOGFILE = '/opt/cornetto/log/api.log'

# the path to the virtual env, it is used to start scrapy as a subprocess
PYTHONPATH = '/opt/cornetto/venv/lib/python3.6/site-packages/'

# define the project directory where the scrapy_cmd.py file is
PROJECT_DIRECTORY = '/opt/cornetto/'
# define the logfile used for the current statification
LOGFILE = '/opt/cornetto/log/statif.log'
# define the file used to store the pid of the statification process
PIDFILE = '/opt/cornetto/.pid.data'
# define the lock file use to block operation
LOCKFILE = '/opt/cornetto/.lock_access'
# define the crawler progess counter file (file that store the count of file crawled) BEWARE modify MirroringSpider.py too if you change it
CRAWLER_PROGRESS_COUNTER_FILE = '/opt/cornetto/.crawlerProgressCounterFile.txt'
# define the path to the file that will store the status of background process
STATUS_BACKGROUND = '/opt/cornetto/statusBackground.json'

# DATABASE

# desactivate tracking of modification for SQLAlchemy session (take extra resources if enabled)
SQLALCHEMY_TRACK_MODIFICATIONS = False

# the uri of the database
DATABASE_URI = 'sqlite:////opt/cornetto/cornetto.db'

# GIT CONFIG

# define the url for git, to be adapted by the user
URL_GIT = 'ssh://url.git.fr/repo/static'
# define the url for the production server
URL_GIT_PROD = ['/opt/cornetto/git_prod']
# define the repository where the statification should be stored (local git repository)
STATIC_REPOSITORY = '/opt/cornetto/git_static'
# define the repository where the statification to visualize should be stored
VISUALIZE_REPOSITORY = '/opt/cornetto/git_visualize'


# CRAWLER CONF

# define the url of the website to crawl
URLS = 'http://web.your-private-domain.com'
# define the authorized domain(s)
DOMAINS = 'web.your-private-domain.com,www.web.com'
URL_REGEX = '(https?://)?web(.your-private-domain.com/?)?'
URL_REPLACEMENT = ''

# define the files to be deleted at the end of the process of statification
DELETE_FILES = ''
# define the directories to be deleted at the end of the process of statification
DELETE_DIRECTORIES = ''
