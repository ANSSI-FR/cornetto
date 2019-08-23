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

import abc
from typing import Any

from sqlalchemy import Column
from sqlalchemy.orm.session import Session

from cornetto.models.CornettoObject import CornettoObject


class StatificationLinkedObject(CornettoObject):
    """
    This abstract class is there so other Cornetto data object implement the method in it
    """

    __metaclass__ = abc.ABCMeta

    @staticmethod
    @abc.abstractmethod
    def get_from_statification_id(session: Session, i_statification_id: Column) -> Any:
        """
        Get the object linked to the statification id passed in parameter
        :param session: The database session
        :param i_statification_id: the id of the statification
        :return: the corresponding object(s) linked to the statification id
        """
        raise NotImplementedError()

    @staticmethod
    @abc.abstractmethod
    def add_to_statification(*args, **kargs) -> None:
        """
        Create and add a new object to the statification filled with the given parameters
        """
        raise NotImplementedError()
