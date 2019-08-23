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


class ScrapyError(Base, StatificationLinkedObject):
    __tablename__ = 'scrapy_errors'
    id = Column(Integer, primary_key=True, nullable=False)
    error_code = Column(String, nullable=False)
    statification_id = Column(Integer, ForeignKey('statifications.id'), nullable=False)
    statification = relationship("Statification", backref=backref("scrapy_errors", cascade="all, delete-orphan"))

    def __init__(self, statification, s_error_code: str) -> None:
        """
        The constructor of the object ScrapyError.
        Create a ScrapyError by setting the attribute with the given parameters

        The role of this object is to store the information about an internal error to scrapy.
        :param s_error_code: The error code correspond to the error message returned by scrapy.
        :param statification: The statification object from which the error is linked
        """
        self.error_code = s_error_code
        self.statification = statification

    @staticmethod
    def add_to_statification(session: Session, statification, s_scrapy_error: str) -> None:
        """
        Create and add a new scrapy error type to the statification filled with the given parameters
        :param statification: The statification object from which the error is linked
        :param session: The database session used to commit the change
        :param s_scrapy_error: The error code correspond to the error message returned by scrapy.
        """
        if session and statification and s_scrapy_error:
            session.add(ScrapyError(statification, s_scrapy_error))
            session.commit()
        else:
            raise ValueError("Passing value is None")

    def get_dict(self) -> Dict[str, Any]:
        """
        Create a python dict from the source object
        :implement
        :return: A python dict
        """
        return {'id': self.id, 'error_code': self.error_code}

    @staticmethod
    def get_from_statification_id(session: Session, i_statification_id: Column) -> Any:
        """
        Get the object linked to the statification id passed in parameter
        :implement
        :param session: The database session used to commit the change
        :param i_statification_id: the id of the statification
        :return: the corresponding object(s) linked to the statification id
        """
        try:
            results = session.query(ScrapyError).filter(ScrapyError.statification_id == i_statification_id)
            return results
        except NoResultFound:
            raise NoResultFound("Statification wasn't found for the given id : " + str(i_statification_id))
