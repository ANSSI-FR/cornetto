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


class ScannedFile(Base, StatificationLinkedObject):
    __tablename__ = 'scanned_files'
    id = Column(Integer, primary_key=True, nullable=False)
    type_file = Column(String, nullable=False)
    nb = Column(Integer, nullable=False)
    statification_id = Column(Integer, ForeignKey('statifications.id'), nullable=False)
    statification = relationship("Statification", backref=backref("scanned_files", cascade="all, delete-orphan"))

    def __init__(self, statification, s_type_file: str, i_nb: int) -> None:
        """
        The constructor of the object ScannedFile.
        Create a ScannedFile by setting the attribute with the given parameters

        :param statification: The statification that contains those files
        :param s_type_file: type MIME of the file
        :param i_nb: the number of file for the given type
        """
        self.type_file = s_type_file
        self.nb = i_nb
        self.statification = statification

    @staticmethod
    def add_to_statification(session: Session, statification, s_type_file: str, i_nb: int) -> None:
        """
        Create and add a new scanned file to the statification filled with the given parameters
        :param session: The database session
        :param statification: The statification that contains those files
        :param s_type_file: type MIME of the file
        :param i_nb: the number of file for the given type
        """
        if session and statification and s_type_file and i_nb:
            session.add(ScannedFile(statification, s_type_file, i_nb))
            session.commit()
        else:
            raise ValueError("Passing value is None")

    def get_dict(self) -> Dict[str, Any]:
        """
        Create a python dict from the source object
        :implement
        :return: A python dict
        """
        return {'id': self.id, 'type_file': self.type_file, 'nb': self.nb}

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
            results = session.query(ScannedFile).filter(ScannedFile.statification_id == i_statification_id)
            return results
        except NoResultFound:
            raise NoResultFound("Statification wasn't found for the given id : " + str(i_statification_id))
