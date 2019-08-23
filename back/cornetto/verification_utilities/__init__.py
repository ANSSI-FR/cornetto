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

import re
from typing import List


def valid_commit(s_commit: str, a_list_commit: List[str]) -> None:
    """
    Verify that the parameter is a valid git commit ID
    :param a_list_commit: the list of precedent commits returned by git
    :param s_commit: a string that should contain the id of a git commit
    :raise SyntaxError if the commit ID don't respect the policies
    """
    # verify if s_commit is not null, is 40 characters long and is only composed of alphanumerical character
    if not (a_list_commit and s_commit and len(s_commit) == 40 and re.match(r'[a-zA-Z0-9]{40}', s_commit) and (
            s_commit in a_list_commit)):
        raise SyntaxError("The parameter does not respect the commit ID policies, value : " + s_commit)


def valid_user(s_user: str) -> None:
    """
    Verify that the parameter is a valid username
    :param s_user: a string that should contain a username
    :return: True if the string respect the policies of a username, False otherwise
    """
    # verify if s_user is not null and is only composed of alphanumerical character and eventually '-'
    if not (s_user and re.match(r'[a-zA-z0-9\-]', s_user)):
        raise SyntaxError("The parameter does not respect the username policies, value :" + s_user)
