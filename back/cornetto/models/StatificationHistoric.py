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

from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Enum
from sqlalchemy.orm import relationship, backref
from sqlalchemy.orm.exc import NoResultFound
from sqlalchemy.orm.session import Session

from cornetto.models.StatificationLinkedObject import StatificationLinkedObject
from cornetto.models import Base, Actions


class StatificationHistoric(Base, StatificationLinkedObject):
    __tablename__ = 'statification_historiques'
    id = Column(Integer, primary_key=True, nullable=False)
    date = Column(DateTime, nullable=False)
    user = Column(String, nullable=False)
    action = Column(Enum(Actions), nullable=False)
    statification_id = Column(Integer, ForeignKey('statifications.id'), nullable=False)
    statification = relationship("Statification",
                                 backref=backref("statification_historiques", cascade="all, delete-orphan"))

    def __init__(self, statification, date: DateTime, s_user: str, e_action: Actions) -> None:
        """
        The constructor of the object StatificationHistoric.
        Create a StatificationHistoric by setting the attribute with the given parameters

        The role of this object is to trace actions that users will do on a Statification.
        The action that are registered correspond to the one listed in the enumeration Actions above.
        :param date: Date of the realisation of the action
        :param s_user: The name of the user that did the action
        :param e_action: The action that the user did
        :param statification: The statification on which the user did the action
        """
        self.date = date
        self.user = s_user
        self.action = e_action
        self.statification = statification

    @staticmethod
    def add_to_statification(session: Session, statification, date: DateTime, s_user: str,
                             e_action: Actions) -> None:
        """
        Create and add a new historic to the statification filled with the given parameters
        :param session: the database session used to commit the change
        :param date: Date of the realisation of the action
        :param s_user: The name of the user that did the action
        :param e_action: The action that the user did
        :param statification: The statification on which the user did the action
        """
        if session and statification and date and s_user and e_action:
            session.add(StatificationHistoric(statification, date, s_user, e_action))
            session.commit()
        else:
            raise ValueError("Passing value is None")

    def get_dict(self) -> Dict[str, Any]:
        """
        Create a python dict from the source object
        :implement
        :return: A python dict
        """
        return {'id': self.id, 'date': self.date.strftime("%Y-%m-%d %H:%M"),
                'user': self.user, 'action': self.action.value}

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
            results = session.query(StatificationHistoric).filter(
                StatificationHistoric.statification_id == i_statification_id)
        except NoResultFound:
            raise NoResultFound("Statification wasn't found for the given id : " + str(i_statification_id))
        return results
