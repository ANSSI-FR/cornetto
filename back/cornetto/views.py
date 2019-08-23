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

import functools

from typing import Any, Dict
from flask import jsonify, request, current_app
from flask.blueprints import Blueprint
from cornetto.services import is_access_locked, lock_access, unlock_access, get_nb_page_crawled, \
    service_get_last_statif_infos, get_background_status_file_content, service_get_satif_list, \
    service_get_statif_info, service_do_apply_prod, service_do_commit, service_get_statif_count, service_do_start_statif

bp = Blueprint("cornetto", __name__)

# =========
# Decorator
# =========


def commit_required(f):
    """
    Check if a commit sha is passed as HTTP POST parameter.
    It is used to decorate route that need this parameter.
    If the commit sha is present in the HTTP POST parameter, it will call the route,
    otherwise it will return a python dict containing an error.

    **Example**:
        If 'commit' is not present in the parameter then it will return :
        {
            success: False,
            error: 'commit_unvalid'
        }
    """
    @functools.wraps(f)
    def commit_required_wrapped(*args, **kwargs):
        s_commit = request.values.get('commit')
        if s_commit is None:
            current_app.logger.error("The commit parameter is empty")
            # return an error code
            return {
                'success': False,
                'error': 'commit_unvalid'
            }

        return f(*args, **kwargs)
    return commit_required_wrapped


def user_required(f):
    """
    Check if a username (X-Forwarded-User) is passed as HTTP POST parameter.
    It is used to decorate route that need this parameter.
    If the username is present in the HTTP POST parameter, it will call the route,
    otherwise it will return a python dict containing an error.

    **Example**:
        If 'X-Forwarded-User' is not present in the parameter then it will return :
        {
            success: False,
            error: 'forwarded_user_empty'
        }
    """
    @functools.wraps(f)
    def user_required_wrapped(*args, **kwargs):
        s_user = request.headers.get('X-Forwarded-User')
        if s_user is None:
            current_app.logger.error("X-Forwarded-User is empty")
            # return an error code
            return {
                'success': False,
                'error': 'forwarded_user_empty'
            }

        return f(*args, **kwargs)
    return user_required_wrapped


def designation_required(f):
    """
    Check if a designation is passed as HTTP POST parameter.
    It is used to decorate route that need this parameter.
    If the designation is present in the HTTP POST parameter, it will call the route,
    otherwise it will return a python dict containing an error.

    **Example**:
        If 'designation' is not present in the parameter then it will return :
        {
            success: False,
            error: 'field_empty'
        }
    """
    @functools.wraps(f)
    def designation_required_wrapped(*args, **kwargs):
        json = request.get_json()
        s_designation = json['designation']
        error = {'success': False, 'error': 'field_empty'}
        if json is None or s_designation is None:
            current_app.logger.error("Field designation is empty")
            # return an error code
            return error
        return f(*args, **kwargs)
    return designation_required_wrapped


def build_json(status_code=200):
    """
    Build a Flask Response with JSON from a python dict.
    It is used to decorate endpoints where the expected output is JSON.
    The endpoints must return a dictionary or else it will break.
    On top of that the wrapper will add some info indicating the request
    was successful.

    **Example**:

      .. code-block:: python

          @app.route('/hello')
          @build_json
          def my_hello_endpoint():
              return { 'info': 'Hello World!' }

      will output to the client:

      .. code-block:: json

          {
              "status_code": 200,
              "info": "Hello World!"
          }
    """
    def build_json_wrapper(f):
        @functools.wraps(f)
        def build_json_wrapped(*args, **kwargs):
            data = f(*args, **kwargs)
            data['status_code'] = status_code
            return jsonify(data)
        return build_json_wrapped
    return build_json_wrapper

# =========
# Route
# =========


@bp.route('/api/statification/status', methods=["POST", "GET"])
@build_json()
def statification_status() -> Dict[str, Any]:
    """
    Check the status of the api. The following information will be returned in a python dict :
    - isRunning         :   a boolean that indicate if a statification Process is running
    - commit            :   a string that contain the sha of the last statification,
                          if the last is a new and unsaved statification it will be empty
    - designation       :   the designation of the last statification, or empty
    - description       :   the description of the last statification, or empty
    - status            :   the status of the last statification :  CREATED = 0
                                                                    STATIFIED = 1
                                                                    SAVED = 2
                                                                    PRODUCTION = 3
                                                                    VISUALIZED = 4
                            Default status will be 3, if there is no statification in the database the user will still
                            be able to create a new one, if there are ongoing statification to be push to prod it still
                            give the hand to the user that have saved it.
    - i_nb_item_to_crawl :  the number of item that have been crawled during the last statification, it will be used
                            as a reference of the number of items to crawl to the next statification. If there is no
                            statification in the database it will be set to 100 by default.
    :return a python dict containing all the above information :
            **Example**:

              The default status when launching the api for the first time should be this one.
              .. code-block:: dict

                    {
                        'isRunning': false,
                        'commit': '',
                        'designation': '',
                        'description': '',
                        'currentNbItemCrawled': 0,
                        'nbItemToCrawl': 100,
                        'status': 3,
                        'isLocked': false,
                        'statusBackground': {}
                    }
    """
    # check if process is running
    b_is_running = current_app.statifProcess.is_running()

    # initialize the nb of item crawled and the number of item to crawl to 0
    i_current_nb_item_crawled = 0

    # get the number of page crawled if a statificationProcess is running
    if b_is_running:
        i_current_nb_item_crawled = get_nb_page_crawled()

    # get the last statification informations
    last_statif_infos = service_get_last_statif_infos()

    commit = last_statif_infos['commit']
    designation = last_statif_infos['designation']
    description = last_statif_infos['description']
    status = last_statif_infos['status']
    i_nb_item_to_crawl = last_statif_infos['i_nb_item_to_crawl']

    # if i_current_nb_item_crawled is raising higher than i_nb_item_to_crawl, then raise i_nb_item_to_crawl
    # we don't want i_nb_item_to_crawl be lower than i_current_nb_item_crawled
    if i_current_nb_item_crawled >= i_nb_item_to_crawl:
        i_nb_item_to_crawl = i_current_nb_item_crawled + 100

    # read the status background file and extract the json from it
    json_status_background = get_background_status_file_content()

    return {
        'isRunning': b_is_running,
        'commit': commit,
        'designation': designation,
        'description': description,
        'currentNbItemCrawled': i_current_nb_item_crawled,
        'nbItemToCrawl': i_nb_item_to_crawl,
        'status': status,
        'isLocked': is_access_locked(),
        'statusBackground': json_status_background
    }


@bp.route('/api/statification/count', methods=["POST", "GET"])
@build_json()
def get_statif_count() -> Dict[str, int]:
    """
    :return: the number of saved statifications
    """
    return service_get_statif_count()


@bp.route('/api/statification/list', methods=["POST", "GET"])
@build_json()
def get_statif_list() -> Dict[str, Any]:
    """
    Return the list of committed statification
    :return a dict containing the list of committed statification,
    if there is no committed statification then return an empty dict
    """
    # initialize i_limit, i_skip and s_order
    i_limit = 10
    i_skip = 0
    s_order = ""

    # try to get the limit given by the request
    if 'limit' in request.values:
        try:
            i_limit = int(request.values.get('limit'))
        except ValueError:
            # if it fail set nb to 10
            i_limit = 10

    # try to get the skip given by the request
    if 'skip' in request.values:
        try:
            i_skip = int(request.values.get('skip'))
        except ValueError:
            # if it fail set nb to 10
            i_skip = 0

    # try to get the order given by the request
    if 'order' in request.values:
        s_order = str(request.values.get('order'))

    # return the list of statification
    return service_get_satif_list(i_limit, i_skip, s_order)


@bp.route('/api/statification/current', methods=["POST", "GET"])
@build_json()
def get_current_statif_info() -> Dict[str, Any]:
    """
    Get the current statification information, with all the data included in associated objects
    :return a python dict containing all the information of the statification
    """
    # get the statification information for the new created statification (the one with commit = '')
    return service_get_statif_info('')


@bp.route('/api/statification', methods=["POST", "GET"])
@build_json()
@commit_required
def get_selected_statif_info() -> Dict[str, Any]:
    """
    Get the chosen statification information, with all the data included in associated objects
    :return a python dict containing all the information of the statification
    """
    # get the request parameter
    s_commit = request.values.get('commit')

    # get the statification corresponding to the commit
    return service_get_statif_info(s_commit)


@bp.route('/api/statification/start', methods=["POST", "GET"])
@build_json()
@user_required
@designation_required
def do_start_statif() -> Dict[str, Any]:
    """
    Do the following :
        - Check if the operation is locked by another process, if that's the case it will return an error
        - Get the lock, so other user can't do anything that would interfere with the operation
        - Initialize and start a statification

    If an error happen during the process the error will be caught and a python dict will be returned with a specific
    error code like the following example :

      -- In the case an error happen with the subprocess operation :
        {
            'success': False,
            'operation': 'subprocess'
        }

      -- If everything goes smoothly the following dict will be returned :
        {
            'success': True,
        }
    """
    # Get the request parameters
    s_designation = request.get_json()['designation']

    try:
        s_description = request.get_json()['description']
    except KeyError:
        s_description = ''

    s_user = request.headers.get('X-Forwarded-User')

    try:
        # test if the lock file is unlocked
        if is_access_locked():
            # the lock file was locked
            raise RuntimeError('route_access')

        # block the lock file for other users
        lock_access()

        current_app.logger.info('> Starting statification process')

        return service_do_start_statif(s_user, s_designation, s_description)

    except RuntimeError as e:
        # return an ajax error code
        return {
            'success': False,
            'error': str(e)
        }
    finally:
        # unlock the route before return
        unlock_access(current_app.config['LOCKFILE'])


@bp.route('/api/statification/stop', methods=["POST", "GET"])
@build_json()
def do_stop_statif() -> Dict[str, bool]:
    """
    Stop the statification process if one was running
    :return Alway return a python dict :
    {
        'success': True,
    }
    """
    current_app.logger.info('> Stoping statification process')

    current_app.statifProcess.stop(current_app.session)
    # on success return a success code
    return {
        'success': True
    }


@bp.route('/api/statification/visualize', methods=["POST", "GET"])
@build_json()
@commit_required
@user_required
def do_visualize() -> Dict[str, Any]:
    """
    Checkout a specified commit into the 'Visualize' repository to visualize a precedent statification

    If an error happen during the process the error will be caught and a python dict will be returned with a specific
    error code like the following example :

      -- In the case an error happen with the subprocess operation :
    {
        'success': False,
        'operation': 'subprocess'
    }

      -- If everything goes smoothly the following dict will be returned :
    {
        'success': True,
    }

    :return a python dict as described above
    """
    try:
        # test if the lock file is unlocked
        if is_access_locked():
            # the lock file was locked
            raise RuntimeError('route_access')

        # block the route for other users
        lock_access()

        # get the request parameter
        s_commit = request.values.get('commit')

        # get the user forwarded by kerberos
        s_user = request.headers.get('X-Forwarded-User')

        current_app.logger.info('> Doing visualization operations')

        return do_visualize(s_commit, s_user)
    except RuntimeError as e:
        # return an ajax error code
        return {
            'success': False,
            'error': str(e)
        }
    finally:
        # unlock the route before return
        unlock_access(current_app.config['LOCKFILE'])


@bp.route('/api/statification/pushtoprod', methods=["POST", "GET"])
@build_json()
@commit_required
@user_required
def do_apply_prod() -> Dict[str, Any]:
    """
    Push the desired statification (commit) in production.

    If an error happen during the process the error will be caught and a python dict will be returned with a specific
    error code like the following example :

      -- In the case an error happen with the subprocess operation :
    {
        'success': False,
        'operation': 'subprocess'
    }

      -- If everything goes smoothly the following dict will be returned :
    {
        'success': True,
    }

    :return a python dict as described above
    """
    try:
        # test if the lock file is unlocked
        if is_access_locked():
            # the lock file was locked
            raise RuntimeError('route_access')

        # block the route for other users
        lock_access()

        # get the request parameters
        s_commit = request.values.get('commit')
        # get the user forwarded by kerberos
        s_user = request.headers.get('X-Forwarded-User')

        current_app.logger.info('> Starting push to prod operations')

        # push the statification to the production server
        return service_do_apply_prod(s_user, s_commit)
    except RuntimeError as e:
        # return an ajax error code
        return {
            'success': False,
            'error': str(e)
        }
    finally:
        # unlock the route before return
        unlock_access(current_app.config['LOCKFILE'])


@bp.route('/api/statification/commit', methods=["POST", "GET"])
@build_json()
@user_required
def do_commit() -> Dict[str, Any]:
    """
    Call the service that will commit and push the statification on the git repository
    and rename the logfile by the commit SHA.
    Need an X-Forwarded-User in the request

    If an error happen during the process the error will be caught and a python dict will be returned with a specific
    error code like the following example :

      -- In the case an error happen with the subprocess operation :
    {
        'success': False,
        'operation': 'subprocess'
    }

      -- If everything goes smoothly the following dict will be returned :
    {
        'success': True,
    }

    When the success python dict will be returned the process of commit will still be running, information about it's
    state will be given by the status background file

    :return a python dict as specified above
    """
    try:
        # test if the lock file is unlocked
        if is_access_locked():
            # the lock file was locked
            raise RuntimeError('route_access')

        # block the route for other users
        lock_access()

        current_app.logger.info('> Starting commit operations')

        # get the request parameter
        # get the user forwarded by kerberos
        s_user = request.headers.get('X-Forwarded-User')

        # if no process is running we authorize to commit
        if current_app.statifProcess.is_running():
            raise RuntimeError('process_running')

        current_app.logger.info('> Starting commit operations')

        # commit and push the statification to the git repository
        return service_do_commit(s_user)

    except RuntimeError as e:
        # return an ajax error code
        return {
            'success': False,
            'error': str(e)
        }
    finally:
        # unlock the route before return
        unlock_access(current_app.config['LOCKFILE'])
