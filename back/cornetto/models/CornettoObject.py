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
from typing import Any, Dict


class CornettoObject(object):
    """
    This abstract class is there so other Cornetto data object implement the method in it
    """
    __metaclass__ = abc.ABCMeta

    @abc.abstractmethod
    def get_dict(self) -> Dict[str, Any]:
        """
        Create a python dict from the source object
        :return: A python dict
        """
        raise NotImplementedError()

    def __str__(self) -> str:
        return str(self.get_dict())
