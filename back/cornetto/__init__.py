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

import logging
import sys

from locale import getpreferredencoding
from logging import Formatter
from logging.handlers import RotatingFileHandler
from flask import Flask
from typing import Dict, Any

from cornetto import StatificationProcess
from cornetto.views import bp as cornetto
from cornetto.models import db

__version__ = '1.0'


def init_logger(app: Flask):
    sqlalchemy_logger = logging.getLogger('sqlalchemy.engine')

    log_level = logging.INFO

    if app.config['LOGLEVEL']:
        log_level = logging._nameToLevel[app.config['LOGLEVEL']]

    app.logger.setLevel(log_level)
    # set logging level to one level more than given level, because INFO level of sqlalchemy is too verbose
    if log_level == 10:
        sqlalchemy_logger.setLevel(log_level)
    else:
        sqlalchemy_logger.setLevel(log_level + 10)

    stdout_handler = logging.StreamHandler(sys.stdout)
    stdout_handler.setFormatter(
        logging.Formatter(
            '%(asctime)s %(levelname)s: %(message)s '
            '[in %(pathname)s:%(lineno)d]'
        )
    )

    app.logger.addHandler(stdout_handler)
    sqlalchemy_logger.addHandler(stdout_handler)

    # if we are not in debug mode add log file
    if not app.debug:
        # create a logger file handler to store logs
        file_handler = RotatingFileHandler(app.config['API_LOGFILE'], encoding='utf-8', maxBytes=500)
        file_handler.level = log_level
        file_handler.setFormatter(Formatter(
            '%(asctime)s %(levelname)s: %(message)s '
            '[in %(pathname)s:%(lineno)d]'
        ))

        app.logger.addHandler(file_handler)
        sqlalchemy_logger.addHandler(file_handler)

    app.logger.info('Logger correctly set')
    app.logger.info('Encoding : ' + getpreferredencoding())


def create_app(config_file_path: str = None, config_dict: Dict[str, Any] = None):
    """
    This method will create a new flask application with the wanted config.
    :param config_file_path python file that contain parameter(s)
    :param config_dict a python dict that contain parameter(s)
    """
    app = Flask(__name__, static_url_path='')  # create the application instance

    if config_file_path:
        # update config from file
        app.config.from_pyfile(config_file_path)
    elif config_dict:
        # update config from dict
        app.config.update(config_dict)

    if __name__ != '__main__':
        init_logger(app)

    # define the sqlite file database, BEWARE ! if you modify it, you need to modify models/base.py
    app.config.update(
        SQLALCHEMY_DATABASE_URI=app.config['DATABASE_URI'])

    # Connecting to the database with the settings of the app
    db.init_app(app)

    app.session = db.session

    # create a statificationProcess object with the configuration
    app.statifProcess = StatificationProcess.StatificationProcess(
        s_logger=app.logger_name,
        s_repository_path=app.config['STATIC_REPOSITORY'],
        s_python_path=app.config['PYTHONPATH'],
        s_urls=app.config['URLS'],
        s_domains=app.config['DOMAINS'],
        s_log_file=app.config['LOGFILE'],
        s_project_directory=app.config['PROJECT_DIRECTORY'],
        s_pid_file=app.config['PIDFILE'],
        s_lock_file=app.config['LOCKFILE'],
        s_crawler_progress_counter_file=app.config['CRAWLER_PROGRESS_COUNTER_FILE'],
        s_delete_files=app.config['DELETE_FILES'],
        s_delete_directories=app.config['DELETE_DIRECTORIES'],
        s_url_regex=app.config['URL_REGEX'],
        s_url_replacement=app.config['URL_REPLACEMENT'],
        s_database_uri=app.config['DATABASE_URI']
    )

    app.register_blueprint(cornetto)
    db.create_all(app=app)

    return app
