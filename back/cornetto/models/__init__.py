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

import enum

from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.engine import create_engine
from sqlalchemy.orm import Session
from sqlalchemy.orm.session import sessionmaker

# create a db from the SQLAlchemy plugin for flask
db = SQLAlchemy()

# get the Model declarative base class
Base = db.Model


def open_session_db(database_uri: str) -> Session:
    """
    This method will create a new Session to access the database
    It used when subprocess need to access the database but the Flask session isn't available.
    :param database_uri: the uri of the database
    :return: a new session
    """
    # create engine for asynchronous connection to the database
    engine = create_engine(database_uri)

    # create a configured "SessionMaker" class
    session = sessionmaker(bind=engine)

    # create a new session
    return session()


class Status(enum.Enum):
    """
    This enumeration is used to provide the list of the different state a statification can have.
    It is use to keep a track on which statification is currently in production, in visualisation,
    or has not been committed yet
    """
    CREATED = 0
    STATIFIED = 1
    SAVED = 2
    PRODUCTION = 3
    VISUALIZED = 4


class Actions(enum.Enum):
    """
    These enumeration correspond to the different action an user can do to a Statification.
    It is use to register all operations done to a statification, and keep an historic of what have been done.
    """
    CREATE_STATIFICATION = "Création d'une nouvelle statification"
    COMMIT_STATIFICATION = "Validation de la statification"
    VISUALIZE_STATIFICATION = "Visualisation de la statification"
    PUSHTOPROD_STATIFICATION = "Mise en production de la statification"
    UPDATE_STATIFICATION = "Mise à jour de la statification"
