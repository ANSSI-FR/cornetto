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

from datetime import datetime
from typing import Dict, Any, List, Type

from sqlalchemy import Column, Integer, String, DateTime, Enum
from sqlalchemy.orm.exc import NoResultFound
from sqlalchemy.orm.session import Session
from sqlalchemy.sql.expression import desc

from cornetto.models.CornettoObject import CornettoObject
from cornetto.models.StatificationLinkedObject import StatificationLinkedObject

from cornetto.models import Base, Status


class Statification(Base, CornettoObject):
    """
    This class define a statification object to store related information into the database
    """
    __tablename__ = 'statifications'
    id = Column(Integer, primary_key=True, nullable=False)
    commit = Column(String, unique=True)
    designation = Column(String, nullable=False)
    description = Column(String, nullable=True)
    cre_date = Column(DateTime, nullable=False)
    upd_date = Column(DateTime, nullable=False)
    status = Column(Enum(Status), nullable=False)
    nb_item = Column(Integer, nullable=True)

    __mapper_args__ = {
        'confirm_deleted_rows': False
    }

    def __init__(self, s_commit: str, s_designation: str, s_description: str, d_cre_date: datetime,
                 d_upd_date: datetime, e_status: Status) -> None:
        """
        The constructor of the object Statification. Create a statification
        by setting the attribute with the given parameters
        :param s_commit: the commit sha
        :param s_designation: the designation
        :param s_description: the description
        :param d_cre_date: the date of creation
        :param d_upd_date: the date of last update
        :param e_status: the status of the statification
        """
        self.commit = s_commit
        self.designation = s_designation
        self.description = s_description
        self.cre_date = d_cre_date
        self.upd_date = d_upd_date
        self.status = e_status
        self.nb_item = 0

    @staticmethod
    def upd_designation(session: Session, s_commit: str, s_designation: str) -> None:
        """
        Update the designation of the statification
        :param session: the database session
        :param s_commit: the commit sha of the statification we want to update
        :param s_designation: the designation to set
        """
        try:
            statification = session.query(Statification).filter(Statification.commit == s_commit).one()
            statification.designation = s_designation
            session.add(statification)
            session.commit()
        except NoResultFound:
            raise NoResultFound("Statification wasn't found for the given commit : " + s_commit)

    @staticmethod
    def upd_description(session: Session, s_commit: str, s_description: str) -> None:
        """
        Update the description of the statification
        :param session: the database session
        :param s_commit: the commit sha of the statification we want to update
        :param s_description: the description to set
        """
        try:
            statification = session.query(Statification).filter(Statification.commit == s_commit).one()
            statification.description = s_description
            session.add(statification)
            session.commit()
        except NoResultFound:
            raise NoResultFound("Statification wasn't found for the given commit : " + s_commit)

    @staticmethod
    def upd_upd_date(session: Session, s_commit: str, d_upd_date: datetime) -> None:
        """
        Update the updDate of the statification
        :param session: the database session
        :param s_commit: the commit sha of the statification we want to update
        :param d_upd_date: the date to set
        """
        try:
            statification = session.query(Statification).filter(Statification.commit == s_commit).one()
            statification.upd_date = d_upd_date
            session.add(statification)
            session.commit()
        except NoResultFound:
            raise NoResultFound("Statification wasn't found for the given commit : " + s_commit)

    @staticmethod
    def upd_status(session: Session, s_commit: str, e_status: Status) -> None:
        """
        Update the status of the statification
        :param session: the database session
        :param s_commit: the commit sha of the statification we want to update
        :param e_status: the new status to set
        """
        # verifiy that status are from the enumeration, and that the default status wasn't given for eStatusOld
        if e_status in Status:
            try:
                statification = session.query(Statification).filter(Statification.commit == s_commit).one()
                statification.status = e_status
                session.add(statification)
                session.commit()
            except NoResultFound:
                raise NoResultFound("Statification wasn't found for the given commit : " + s_commit)
        else:
            # if the status aren't correct raise an error
            raise ValueError("The value passed for status aren't correct.")

    @staticmethod
    def upd_nb_item(session: Session, s_commit: str, i_nb_item: int) -> None:
        """
        Update the number of item crawled of the statification
        :param session: the database session
        :param s_commit: the commit sha of the statification we want to update
        :param i_nb_item: the number of item crawled
        """
        # verifiy that i_nb_item is set
        if i_nb_item:
            try:
                statification = session.query(Statification).filter(Statification.commit == s_commit).one()
                statification.nb_item = i_nb_item
                session.add(statification)
                session.commit()
            except NoResultFound:
                raise NoResultFound("Statification wasn't found for the given commit : " + s_commit)
        else:
            # if the status aren't correct raise an error
            raise ValueError("The value passed for status aren't correct.")

    @staticmethod
    def switch_status(session: Session, e_status_old: Status, e_status_new: Status) -> None:
        """
        Change the status of a Statification with another status
        :param session: the database session
        :param e_status_new : the new status to set
        :param e_status_old : the old status, that status should be unique
        """
        # verifiy that status are from the enumeration
        if e_status_old in Status and e_status_new in Status:
            try:
                statification = session.query(Statification).filter(Statification.status == e_status_old).one()
                statification.status = e_status_new
                session.add(statification)
                session.commit()
            except NoResultFound:
                raise NoResultFound("No statification has the Status " + repr(e_status_old))
        else:
            # if the status aren't correct raise an error
            raise ValueError("The value passed for status aren't correct.")

    @staticmethod
    def upd_commit(session: Session, s_commit_old: str, s_commit_new: str) -> None:
        """
        Update the commit sha of the statification
        :param session: the database session
        :param s_commit_old: the old commit sha of the statification
        :param s_commit_new: the new commit sha to set
        """
        try:
            statification = session.query(Statification).filter(Statification.commit == s_commit_old).one()
            statification.commit = s_commit_new
            session.add(statification)
            session.commit()
        except NoResultFound:
            raise NoResultFound("Statification wasn't found for the given commit : " + s_commit_old)

    def add_object_to_statification(self, c_class: Type[StatificationLinkedObject], session: Session, *args) -> None:
        """
        Add an object to the statification
        :param c_class: the class of the object to create and add
        :param session: the database session
        :param args: the parameters to set the new object
        """
        c_class.add_to_statification(session, self, *args)

    @staticmethod
    def static_add_object_to_statification(c_class: Type[StatificationLinkedObject],
                                           session: Session, s_commit: str, *args) -> None:
        """
        Add an object to the statification that have the corresponding commit sha
        :param s_commit: the commit sha of the statification
        :param c_class: the class of the object to create and add
        :param session: the database session
        :param args: the parameters to set the new object
        """
        # get the statification for the given commit
        statification = Statification.get_statification(session, s_commit)
        statification.add_object_to_statification(c_class, session, *args)

    @staticmethod
    def get_statification(session: Session, s_commit: str) -> 'Statification':
        """
        Get the statification that have the corresponding commit sha
        :param session: the database session
        :param s_commit: the commit sha of the statification to be get
        :return: the statification that have the commit sha
        :raise ValueError
        """
        # get the statification corresponding to the given commit
        try:
            return session.query(Statification).filter(Statification.commit == s_commit).one()
        except NoResultFound:
            raise NoResultFound("Statification wasn't found for the given commit : " + s_commit)

    @staticmethod
    def get_from_statification_id(session: Session, i_statification_id: int) -> 'Statification':
        """
        @Implement
        Get the statification from the statification id
        :param session: the database session
        :param i_statification_id: the id of the statification to get
        :return: the corresponding statification object
        :raise NoResultFound if no result has been found for the given id
        """
        try:
            return session.query(Statification).filter(Statification.id == i_statification_id).one()
        except NoResultFound:
            raise NoResultFound("Statification wasn't found for the given id : " + str(i_statification_id))

    def get_list_from_class(self, c_class: Type[StatificationLinkedObject], session: Session) -> List[Dict[str, Any]]:
        """
        Get the list of the object linked to the Statification. This method proceed to a sort of reflexive call
        to methods in the class of object that are wanted to retrieve.
        :param c_class: The class of the objects you want to get - the objects need to
                        implement StatificationLinkedObject abstract class
        :param session: Session
        :return: a list containing the object that are linked to the Statification
        """
        return [element.get_dict() for element in c_class.get_from_statification_id(session, self.id)]

    @staticmethod
    def get_n_list_statifications(session: Session, i_limit: int, i_skip: int, order_by: str,
                                  sort: str = 'asc') -> List:
        """
        Get the list of n-th first Statification after the m-th skipped ones
        :param session: database session
        :param i_limit the number of Statification to get
        :param i_skip the number of Statfication to skip
        :param order_by: field of statification used to order
        :param sort: asc sort or desc sort
        :return: return the list of Statification as JsonArray
        """
        if sort == 'desc':
            return [statification.get_dict() for statification in
                    session.query(Statification).order_by(desc(order_by)).limit(i_limit).offset(i_skip).all()]
        else:
            return [statification.get_dict() for statification in
                    session.query(Statification).order_by(order_by).limit(i_limit).offset(i_skip).all()]

    @staticmethod
    def get_count(session: Session) -> int:
        """
        Return the number of Statifications in the database
        :param session: the database session
        :return: the number of statification in the database
        """
        return session.query(Statification).count()

    def delete(self, session: Session) -> None:
        """
        Delete the Statification
        :param session: the database session
        """
        session.delete(self)
        session.commit()

    @staticmethod
    def delete_statification(session: Session, i_id: int) -> None:
        """
        Delete the statification that have the given id
        :param session: the database session
        :param i_id: the id of the statification to be deleted
        """
        session.delete(Statification.get_from_statification_id(session, i_id))
        session.commit()

    def get_dict(self) -> Dict[str, Any]:
        """
        :implement
        Create a python dict from the source object
        :return: A python dict
        """
        return {'id': self.id, 'commit': self.commit, 'designation': self.designation,
                'description': self.description, 'cre_date': self.cre_date.strftime("%Y-%m-%d %H:%M"),
                'upd_date': self.upd_date.strftime(
                    "%Y-%m-%d %H:%M"), 'status': self.status.value, 'nb_item': self.nb_item}
