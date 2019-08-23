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


class ErrorTypeMIME(Base, StatificationLinkedObject):
    __tablename__ = 'error_type_mimes'
    id = Column(Integer, primary_key=True, nullable=False)
    type_mime = Column(String, nullable=False)
    url = Column(String, nullable=False)
    statification_id = Column(Integer, ForeignKey('statifications.id'), nullable=False)
    statification = relationship("Statification", backref=backref("error_type_mimes", cascade="all, delete-orphan"))

    def __init__(self, statification, s_type_mime: str, s_url: str) -> None:
        """

        :param s_type_mime: the MIME type that causes the error
        :param s_url: the url that causes the error
        :param statification: the statification thas possess the ErrorTypeMIME
        """
        self.type_mime = s_type_mime
        self.url = s_url
        self.statification = statification

    @staticmethod
    def add_to_statification(session: Session, statification, s_type_mime: str, s_url: str) -> None:
        """
        Create and add a new error for MIME type to the statification filled with the given parameters
        :param session: the database session
        :param statification: the statification
        :param s_type_mime: the MIME type that causes the error
        :param s_url: the url that causes the error
        """
        if session and statification and s_type_mime and s_url:
            session.add(ErrorTypeMIME(statification, s_type_mime, s_url))
            session.commit()
        else:
            raise ValueError("Passing value is None")

    def get_dict(self) -> Dict[str, Any]:
        """
        Create a python dict from the source object
        :implement
        :return: A python dict
        :: Dict[str, Any]
        """
        return {'id': self.id, 'type_mime': self.type_mime, 'url': self.url}

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
            results = session.query(ErrorTypeMIME).filter(ErrorTypeMIME.statification_id == i_statification_id)
            return results
        except NoResultFound:
            raise NoResultFound("Statification wasn't found for the given id : " + str(i_statification_id))
