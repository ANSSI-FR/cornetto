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

from typing import Dict, Any

from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship, backref
from sqlalchemy.orm.exc import NoResultFound
from sqlalchemy.orm.session import Session

from cornetto.models.StatificationLinkedObject import StatificationLinkedObject
from cornetto.models import Base


class HtmlError(Base, StatificationLinkedObject):
    __tablename__ = 'html_errors'
    id = Column(Integer, primary_key=True, nullable=False)
    error_code = Column(String, nullable=False)
    url = Column(String, nullable=False)
    source = Column(String, nullable=False)
    statification_id = Column(Integer, ForeignKey('statifications.id'), nullable=False)
    statification = relationship("Statification", backref=backref("html_errors", cascade="all, delete-orphan"))

    def __init__(self, statification, s_error_code: str, s_url: str, s_source: str) -> None:
        """
        The constructor of the object HtmlError.
        Create a HtmlError by setting the attribute with the given parameters

        :param s_error_code: the HTTP error code
        :param s_url: The url that caused the error
        :param s_source: the source url that contained the faulty url
        :param statification: the statification that contain that error
        """
        self.error_code = s_error_code
        self.url = s_url
        self.source = s_source
        self.statification = statification

    @staticmethod
    def add_to_statification(session: Session, statification, s_code_error: str, s_url: str,
                             s_source: str) -> None:
        """
        Create and add a new HTML error type to the statification filled with the given parameters
        :param session: the database session
        :param statification: the statification that contain that error
        :param s_code_error: the HTTP error code
        :param s_url: The url that caused the error
        :param s_source: the source url that contained the faulty url

        """
        if session and statification and s_code_error and s_url and s_source:
            session.add(HtmlError(statification, s_code_error, s_url, s_source))
            session.commit()
        else:
            raise ValueError("Passing value is None")

    def get_dict(self) -> Dict[str, Any]:
        """
        Create a python dict from the source object
        :implement
        :return: A python dict
        """
        return {'id': self.id, 'error_code': self.error_code, 'url': self.url, 'source': self.source}

    @staticmethod
    def get_from_statification_id(session: Session, i_statification_id: Column) -> Any:
        """
        Get the object linked to the statification id passed in parameter
        :implement
        :param session: The database session
        :param i_statification_id: the id of the statification
        :return: the corresponding object(s) linked to the statification id
        """
        try:
            results = session.query(HtmlError).filter(HtmlError.statification_id == i_statification_id)
            return results
        except NoResultFound:
            raise NoResultFound("Statification wasn't found for the given id : " + str(i_statification_id))
