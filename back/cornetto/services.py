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

import logging
import errno
import fcntl
import os
import sh
import time
from email.utils import formatdate

from datetime import datetime

from flask import current_app
from flask.json import dumps, loads
from sqlalchemy.orm.exc import NoResultFound
from typing import Dict, Any

from cornetto import verification_utilities
from cornetto.models import StatificationHistoric, Actions, open_session_db
from cornetto.models.ErrorTypeMIME import ErrorTypeMIME
from cornetto.models.ExternalLink import ExternalLink
from cornetto.models.HtmlError import HtmlError
from cornetto.models.ScannedFile import ScannedFile
from cornetto.models.ScrapyError import ScrapyError
from cornetto.models.Statification import Statification, Status
from cornetto.models.StatificationHistoric import StatificationHistoric

logger = logging.getLogger('cornetto')


# =========
# Utilities
# =========


def validate_commit(s_repo: str, s_commit: str):
    """
    Verify that the given commit sha exist in the git repository
    :param s_repo: the path to the git repository
    :param s_commit: the sha of the commit
    :raise SyntaxError if the commit doesn't exist
    """
    try:
        # Select the git repository
        git = sh.git.bake(_cwd=s_repo, _tty_out=False)
        # get the list of all commit
        a_list_commit = git.log("--pretty='%H'", "origin/master").replace('\'', '').split('\n')
        # verify that the commit id is valide
        verification_utilities.valid_commit(s_commit, a_list_commit)
    except SyntaxError as e:
        # if the parameter that should contain an id of commit wasn't valid, show an error in the log
        logger.error("The commit parameter is not correct : " + str(e))
        raise e


def is_access_locked() -> bool:
    """
    Test if the lockfile is locked
    :return: a boolean true if it's locked, false is not
    """
    # by default we consider that the lockfile is locked
    is_locked = True

    logger.debug('Lockfile is lock ?')
    try:
        # open the file if it exist
        f_lock_file = open(current_app.config['LOCKFILE'], "r+")
    except FileNotFoundError:
        # create it if not
        f_lock_file = open(current_app.config['LOCKFILE'], "w+")

    try:
        # create an object lock with FileLock
        fcntl.flock(f_lock_file, fcntl.LOCK_EX | fcntl.LOCK_NB)
        if not f_lock_file.read():
            # if the lock has been acquired, then it wasn't locked
            is_locked = False
    except IOError as e:
        # raise on IOErrors not related to LOCK (if it was lock an IOError is raised, but we ignore it)
        if e.errno != errno.EAGAIN:
            f_lock_file.close()
            raise
    finally:
        # release the lock
        fcntl.flock(f_lock_file, fcntl.LOCK_UN)
        f_lock_file.close()

    logger.debug('Route is lock : ' + str(is_locked))
    return is_locked


def lock_access():
    """
    Put a lock on the lockfile. The lockfile is used to block access to a route when doing some critical treatment.
    :raise IOError
    """
    try:
        # open the file if it exist
        f_lock_file = open(current_app.config['LOCKFILE'], "r+")
    except FileNotFoundError:
        # create it if not
        f_lock_file = open(current_app.config['LOCKFILE'], "w+")

    try:
        # create an object lock with FileLock
        fcntl.flock(f_lock_file, fcntl.LOCK_EX | fcntl.LOCK_NB)
        f_lock_file.write('locked')
    except IOError as e:
        logger.info('Fail to lock the route')
        # raise on IOErrors not related to LOCK
        if e.errno != errno.EAGAIN:
            f_lock_file.close()
            raise
    f_lock_file.close()
    logger.info('Locked the route')


def unlock_access(s_lock_file: str):
    """
    Release the lock on the lockfile
    """
    # erase the file if it exist, create it if it doesn't exist
    f_lock_file = open(s_lock_file, "w")
    # release the lock
    fcntl.flock(f_lock_file, fcntl.LOCK_UN)
    f_lock_file.close()
    logger.info('Unlocked the route')


def write_status_background(status: dict, s_file_status_background: str):
    """
    Write a status in the status background file
    """
    # open the file if it exist, create it if it doesn't exist
    with open(s_file_status_background, "w") as fStatusBackground:
        # write the status
        fStatusBackground.write(dumps(status))


def clear_status_background():
    """
    Clear the content of the status background file
    """
    f_status_background = open(current_app.config['STATUS_BACKGROUND'], "w+")
    f_status_background.close()


def get_nb_page_crawled() -> int:
    """
    Get the number of page crawled by the statificationProcess
    :return: the number of page crawled, 0 if nothing is crawled or the file crawlerProgressCount.txt doesn't exist
    """
    i_current_nb_item_crawled = 0
    try:
        # open the crawler page counter file in read mode
        count_file = open(current_app.config['CRAWLER_PROGRESS_COUNTER_FILE'])
        i_current_nb_item_crawled = int(count_file.read())
        count_file.close()

    except (FileNotFoundError, ValueError)as e:
        current_app.logger.info('The file crawlerProgressCount.txt doesn\'t exist' + str(e))

    return i_current_nb_item_crawled


def get_background_status_file_content() -> Dict[str, Any]:
    """
    Read the content of the backgound status file if it exist and return the json content as a python dict.
    If the file is empty return an empty python dict
    :return: a python dict containing the information contained in the file
    """
    dict_status_background = {}
    # look at the content of the file status background
    try:
        f_file_status_background = open(current_app.config['STATUS_BACKGROUND'], 'r')
        s_status_background = f_file_status_background.read()
        # if the file isn't empty
        if s_status_background:
            dict_status_background = loads(s_status_background)
        f_file_status_background.close()

    except FileNotFoundError:
        current_app.logger.info('No status background file')

    return dict_status_background


# =======
# Service
# =======


def service_get_last_statif_infos() -> Dict[str, Any]:
    """
    Get the last statification information. The following information will be returned in a python dict :
    -   commit            :   a string that contain the sha of the last statification,
                            if the last is a new and unsaved statification it will be empty
    -   designation       :   the designation of the last statification, or empty
    -   description       :   the description of the last statification, or empty
    -   status            :   the status of the last statification :  CREATED = 0
                                                                    STATIFIED = 1
                                                                    SAVED = 2
                                                                    PRODUCTION = 3
                                                                    VISUALIZED = 4
                            Default status will be 3, if there is no statification in the database the user will still
                            be able to create a new one, if there are ongoing statification to be push to prod it still
                            give the hand to the user that have saved it.
    - i_nb_item_to_crawl  : the number of item that have been crawled during the last statification, it will be used
                            as a reference of the number of items to crawl to the next statification.

    :return: a python dict containing the above information
             {
                commit,
                designation,
                description,
                status,
                i_nb_item_to_crawl
             }
    """
    # initialize the number of item to crawl to 0
    i_nb_item_to_crawl = 0
    # initialize commit to empty value
    commit = ''
    # set designation and description as empty
    designation = ''
    description = ''
    # default status will be 3 (PRODUCTION), if there is no statification in the database the user will still be able
    # to create a new one, if there are ongoing statification to be push to prod it still give the hand to
    # the user that have saved it.
    status = 3

    # get the 2 last statification that have been created, when the statification process will start the last
    # statification to be created will be the current one (unsaved)
    last_statification = Statification.get_n_list_statifications(current_app.session, 2, 0, Statification.id, 'desc')

    # check if the list of statification isn't empty
    if len(last_statification) != 0:

        if len(last_statification) > 1:
            # get the number of item crawled in the previous statification (preceding the new one created)
            i_nb_item_to_crawl = last_statification[1]['nb_item']

        # get the status and the commit sha of the last statification
        status = last_statification[0]['status']
        commit = last_statification[0]['commit']

        # if the last statification is a new one that has not been saved
        if commit == '':
            designation = last_statification[0]['designation']
            description = last_statification[0]['description']

    return {
        'commit': commit,
        'designation': designation,
        'description': description,
        'status': status,
        'i_nb_item_to_crawl': i_nb_item_to_crawl
    }


def service_get_statif_count() -> Dict[str, int]:
    """
    Get the number of statifications in the database.
    :return: the number of statifications
    """
    return {
        'count': Statification.get_count(current_app.session)
    }


def service_get_satif_list(i_limit: int, i_skip: int, s_order: str) -> Dict[str, Any]:
    """
    Get the list of statifications requested with the following parameters :
    :param i_limit: number of statification to request
    :param i_skip: number of statification to skip
    :param s_order: name of the colum to sort the statification by
    :return: a python dict containing the list of the statifications returned by the request
    """
    order = Statification.id

    # get the Statification attribute corresponding to the column to order by
    if s_order == 'cre_date':
        order = Statification.cre_date
    elif s_order == 'upd_date':
        order = Statification.upd_date
    elif s_order == 'designation':
        order = Statification.designation
    elif s_order == 'status':
        order = Statification.status

    # get the first 'limit' since the 'skip' statifications, if there is less return all
    a_statifications = Statification.get_n_list_statifications(current_app.session, i_limit, i_skip, order, 'desc')

    return {
        'statifications': a_statifications
    }


def service_get_statif_info(s_commit: str) -> Dict[str, Any]:
    """
    Get the statification information for the given commit sha, with all the data included in associated objects.
    For the current statification, it will return a python dict containing :
      -  statification : the data of object statification
      -  errors_type_mime : the list of errors type mime
      -  external_links : the list of external links
      -  html_errors : the list of html errors
      -  scanned_files : the list of scanned files
      -  scrapy_errors : the list of scrapy errors
      -  statification_historics : the list of statification historics.

    :return a python dict containing all the information of the current statification
    """
    # initialize empty variable
    s_statification = None
    a_errors_type_mime = None
    a_external_links = None
    a_html_errors = None
    a_scanned_files = None
    a_scrapy_errors = None
    a_statification_historic = None

    try:
        # verify that the commit is valid if not , if it is empty then
        if s_commit != '':
            validate_commit(current_app.config['STATIC_REPOSITORY'], s_commit)

        try:
            # get the statification corresponding to the commit and the associated objects
            statification = Statification.get_statification(current_app.session, s_commit)
            # get the JSON from this statification
            s_statification = statification.get_dict()

            # get other objects associated to the statification and their JSON
            try:
                a_errors_type_mime = statification.get_list_from_class(ErrorTypeMIME, current_app.session)
            except NoResultFound as e:
                current_app.logger.info(e)
            try:
                a_external_links = statification.get_list_from_class(ExternalLink, current_app.session)
            except NoResultFound as e:
                current_app.logger.info(e)
            try:
                a_html_errors = statification.get_list_from_class(HtmlError, current_app.session)
            except NoResultFound as e:
                current_app.logger.info(e)
            try:
                a_scanned_files = statification.get_list_from_class(ScannedFile, current_app.session)
            except NoResultFound as e:
                current_app.logger.info(e)
            try:
                a_scrapy_errors = statification.get_list_from_class(ScrapyError, current_app.session)
            except NoResultFound as e:
                current_app.logger.info(e)
            try:
                a_statification_historic = statification.get_list_from_class(StatificationHistoric, current_app.session)
            except NoResultFound as e:
                current_app.logger.info(e)
        except NoResultFound as e:
            current_app.logger.info(e)

        # Return a python dict with all information
        return {
            'statification': s_statification,
            'errors_type_mime': a_errors_type_mime,
            'external_links': a_external_links,
            'html_errors': a_html_errors,
            'scanned_files': a_scanned_files,
            'scrapy_errors': a_scrapy_errors,
            'statification_historics': a_statification_historic
        }
    except SyntaxError as e:
        current_app.logger.error(e)
        # return an error code if the commit is not valid
        return {
            'success': False,
            'error': 'commit_unvalid'
        }
    except sh.ErrorReturnCode:
        # if an error has occurred during a subprocess
        return {
            'success': False,
            'error': 'system_fail'
        }


def service_do_init_statif(s_repository: str, s_url_git: str):
    """
    Do the following operation :
        - if the folder doesn't exist, then clone the repository with branch master
        - list the commit
        - Reset static workspace
    :param s_url_git: The url to
    :param s_repository - the path to the repository to initialize
    """
    logger.info('> Static repository initialization ...')
    logger.debug('repertoire init : ' + s_repository)
    logger.debug('repertoire git : ' + s_url_git)

    # Select the git repository
    git = sh.git.bake(_cwd=s_repository, _tty_out=False, _iter='out')

    # if the STATIC_REPOSITORY doesn't exist
    if not os.path.isdir(s_repository + '/.git'):
        # clone into the STATIC_REPOSITORY folder
        logger.info(git.clone('-b master ' + s_url_git))
        logger.info(git('ls-remote'))
    # in case there is already a directory we don't need to clone again

    # Reset static workspace, every result are logged in INFO level
    for log in git.clean('-qxdf'):
        logger.info(log)
    for log in git.reset('--hard', 'HEAD'):
        logger.info(log)
    for log in git.checkout('master'):
        logger.info(log)
    for log in git.fetch('origin'):
        logger.info(log)

    logger.info('> Static repository initialization terminated')


def service_do_start_statif(s_user: str, s_designation: str, s_description: str) -> Dict[str, Any]:
    """
    This method will initialize and start a statification process, this will do the following :
        - Delete the statusBackground file to create a new one containing the information of the statification process
        - Initialize the statification repository
        - Clear all source file in the repository to start in a clean repo
        - Verify that the log directory is accessible to write log
        - Delete the old statif.log file if it exist
        - Start the statification process, it will launch the crawler and begin to create the statification

    If an error happen during the process it will be caught and transferred as a RuntimeError to the parent method with
    a specific error code.
    :return  if everything goes smoothly the following python dict will be returned :
                {
                    'success': True,
                }
    :raise RuntimeError
    """

    clear_status_background()

    # if the field are set and if the process is stopped
    if s_user and s_designation and not current_app.statifProcess.is_running():
        try:
            # reinitialize the repository
            service_do_init_statif(current_app.config['STATIC_REPOSITORY'], current_app.config['URL_GIT'])

            # Select the git repository
            git = sh.git.bake(_cwd=current_app.config['STATIC_REPOSITORY'], _tty_out=False, _iter='out')

            # Delete everything. Content will be added again at the end of the process
            # (this allows deleted files (in the CMS) to be deleted from the repository)
            for log in git.rm('-rfq', '--ignore-unmatch', '.'):
                current_app.logger.info(log)

            try:
                # try to create the folder LOGDIR
                os.makedirs(current_app.config['LOGDIR'])
            except OSError as e:
                # if the folder does not exist raise an error
                if not (e.errno == errno.EEXIST and os.path.isdir(current_app.config['LOGDIR'])):
                    # log the error
                    current_app.logger.error("Error while creating folder \n" + str(e))
                    # return an error code
                    raise RuntimeError('system_fail')

            try:
                # if the static.log exist we delete it
                os.remove(current_app.config['LOGFILE'])
            except FileNotFoundError:
                # if the log file is not found
                current_app.logger.info("The log does not exist yet")

            # create an object statification and start a process of statification
            current_app.statifProcess.start(current_app.session, s_designation, s_description, s_user)

            # on success return a success code
            return {
                'success': True
            }
        except sh.ErrorReturnCode as e:
            current_app.logger.error(str(e))
            # if an error has happened when executing a subprocess command
            raise RuntimeError('subprocess')

    # send a specific error code depending on the cause of error
    if not s_user:
        current_app.logger.error("Parameter X-Forwarded-User empty")
        raise RuntimeError('forwarded_user_empty')
    if not s_designation:
        current_app.logger.error("Parameter designation empty")
        raise RuntimeError('field_empty')
    else:
        current_app.logger.error("Process is running")
        raise RuntimeError('process_running')


def service_do_commit(s_user: str) -> Dict[str, Any]:
    """
    Commit and push the last statification on the git repository and rename the statif.log logfile by the commit sha.
    This method will call a background process to treat asynchronously the push operation which can take a long time,
    it will return before the background process is finished.

    :param s_user is needed and should correspond to a username
    :return  if everything goes smoothly the following python dict will be returned :
                {
                    'success': True,
                }

    :raise RuntimeError if an error happen during the process it will be caught and transferred as a RuntimeError to the
                        parent method with a specific error code.
    """
    clear_status_background()

    try:
        if not s_user:
            current_app.logger.error("Parameter X-Forwarded-User empty")
            raise RuntimeError('forwarded_user_empty')

        # Select the git repository
        git = sh.git.bake(_cwd=current_app.config['STATIC_REPOSITORY'], _tty_out=False)

        current_app.logger.info('> Add all modifications')

        # add all the modification to the next commit
        for line in git.add('-A', _iter=True):
            current_app.logger.info(line)

        current_app.logger.info('> Create a new commit')

        # commit the new statification
        try:
            for line in git.commit(
                    "-qm'Statification validee le " + time.strftime('%Y%m%d.%H%M%S') + " par " + s_user + "'",
                    _iter=True):
                current_app.logger.info(line)
        except sh.ErrorReturnCode_1 as e:
            # this exception can be raised if the commit hasn't been done because there is nothing to commit,
            # in this case stderr will be empty. If an error has occured stderr will be filled with the message
            if e.stderr:
                # if the stderr is not empty, an error has occured
                current_app.logger.error('An error has occured during git commit \n' + str(e))
                raise RuntimeError('commit_fail')
            else:
                # if the stderr is empty , then it means that there is nothing to commit
                current_app.logger.error('There is nothing to commit, the working copy is up to date \n' + str(e))
                # delete the statification
                current_app.statifProcess.stop(current_app.session)
                raise RuntimeError('commit_nothing')

        # get the last commit SHA of local branch master
        s_commit_sha = git.log("--pretty='%H'", "master").replace('\'', '').split('\n', 1)[0]

        # push the commit to 'origin master' branch
        git.push(
            'origin',
            'master',
            _out=current_app.logger.info,
            _bg=True,
            _done=bg_commit_done_creator(
                s_user,
                s_commit_sha,
                current_app.config['LOGFILE'],
                current_app.config['LOGDIR'],
                current_app.config['LOCKFILE'],
                current_app.config['STATUS_BACKGROUND'],
                current_app.config['DATABASE_URI']
            )
        )

        # on success return a success code ,
        # user (front) will need to wait for background process to finish
        return {
            'success': True
        }

    except FileNotFoundError as e:
        # if the log file is not found
        current_app.logger.error("The log file " + current_app.config['LOGFILE'] + " wasn't found \n" + str(e))
        # if an error has happened when executing a subprocess command
        raise RuntimeError('system_fail')
    except sh.ErrorReturnCode as e:
        # if an error is returned by an sh command
        current_app.logger.error("The following error has occurred \n" + str(e))
        raise RuntimeError('subprocess')


def service_do_apply_prod(s_user: str, s_commit: str) -> Dict[str, Any]:
    """
    Push the desired statification (commit) in production.

    This method will call a background process to treat asynchronously the push operation which can take a long time,
    it will return before the background process is finished.

    :param s_user is needed and should correspond to a username
    :param s_commit is needed and should correspond to a valid commit
    :return  if everything goes smoothly the following python dict will be returned :
                {
                    'success': True,
                }
    :raise RuntimeError if an error happen during the process it will be caught and transferred as a RuntimeError to the
                        parent method with a specific error code.
    """
    # this try except is there to check if commit or user are valid
    try:
        if not s_user:
            current_app.logger.error("Parameter X-Forwarded-User empty")
            raise RuntimeError('forwarded_user_empty')

        validate_commit(current_app.config['STATIC_REPOSITORY'], s_commit)

        clear_status_background()

        # Select the git repository
        git = sh.git.bake(_cwd=current_app.config['STATIC_REPOSITORY'], _tty_out=False)
        # reinitialise the STATIC repository before checking out the last commit
        # ensure sources are up to date
        service_do_init_statif(current_app.config['STATIC_REPOSITORY'], current_app.config['URL_GIT'])

        current_app.logger.info('> Load the statification commit')

        # loading the statification
        for line in git.checkout('-q', s_commit, _iter=True):
            current_app.logger.info(line)

        current_app.logger.info('> Add a tag on the production commit')

        # add a tag on the commit ''
        for line in git.tag("-am", "Mise en production le " + formatdate(time.time()) + " par " + s_user,
                            time.strftime('%Y%m%d.%H%M%S'), s_commit):
            current_app.logger.info(line)

        current_app.logger.info('> Push the tag')

        # push the commit to branch 'origin master'
        for line in git.push('--tags', 'origin', 'master', _iter=True):
            current_app.logger.info(line)

        current_app.logger.info('> Rebase local production branch with the production commit')

        # add the commit to 'production' branch
        git.branch('-f', 'production', s_commit, _bg=True, _out=current_app.logger.info,
                   _done=bg_do_apply_prod_done_creator(s_commit,
                                                       s_user,
                                                       current_app.config['STATIC_REPOSITORY'],
                                                       current_app.config['URL_GIT_PROD'],
                                                       current_app.config['STATUS_BACKGROUND'],
                                                       current_app.config['LOCKFILE'],
                                                       current_app.config['DATABASE_URI']
                                                       ))
        # on success return a success code
        return {
            'success': True
        }

    except SyntaxError as e:
        current_app.logger.error(e)
        # on fail write an error
        raise RuntimeError('commit_unvalid')
    except sh.ErrorReturnCode as e:
        current_app.logger.error(str(e))
        # if an error has happened when executing a subprocess command
        raise RuntimeError('subprocess')


def service_do_visualize(s_user: str, s_commit: str) -> Dict[str, Any]:
    """
    Checkout a specified commit into the 'Visualize' repository to visualize a precedent statification.

    This method will call a background process to treat asynchronously the push operation which can take a long time,
    it will return before the background process is finished.

    :param s_user is needed and should correspond to a username
    :param s_commit is needed and should correspond to a valid commit
    :return  if everything goes smoothly the following python dict will be returned :
                {
                    'success': True,
                }
    :raise RuntimeError if an error happen during the process it will be caught and transferred as a RuntimeError to the
                        parent method with a specific error code.
    """
    try:
        if not s_user:
            current_app.logger.error("Parameter X-Forwarded-User empty")
            raise RuntimeError('forwarded_user_empty')

        validate_commit(current_app.config['STATIC_REPOSITORY'], s_commit)

        clear_status_background()

        current_app.logger.info('> Doing visualization operations')

        # Select the git repository
        git = sh.git.bake(_cwd=current_app.config['VISUALIZE_REPOSITORY'], _tty_out=False)

        # update the repository to get all new commits
        git.pull(
            'origin',
            'master',
            _bg=True,
            _out=current_app.logger.info,
            _done=bg_visualize_done_creator(
                s_commit,
                s_user,
                current_app.config['VISUALIZE_REPOSITORY'],
                current_app.config['URL_GIT'],
                current_app.config['STATUS_BACKGROUND'],
                current_app.config['LOCKFILE'],
                current_app.config['DATABASE_URI']
            )
        )

        # on success a success code
        return {
            'success': True
        }
    except SyntaxError as e:
        current_app.logger.error(str(e))
        # on fail write an error
        raise RuntimeError('commit_unvalid')
    except sh.ErrorReturnCode as e:
        current_app.logger.error(str(e))
        # if an error has happened when executing a subprocess command
        raise RuntimeError('subprocess')


# ==========================
# Background service creator
# ==========================


def bg_commit_done_creator(s_user: str, s_commit: str, s_log_file: str, s_log_dir: str, s_lock_file: str,
                           s_file_status_background: str, s_database_uri: str):
    """
    Wrapper for the method that will be called after the background operation of the visualize service is done.
    All the param are required
    :param s_commit: the commit sha of the statification to be visualized
    :param s_user: the name of the user that is doing the operation
    :param s_log_file: the path to the log file
    :param s_log_dir: the path to the log directory
    :param s_file_status_background: the path to the file that register the background process status
    :param s_lock_file: the path to the lockfile
    :param s_database_uri: the uri of the database
    :return: the method that will be called after the background process
    """
    def commit_done(cmd: str, success: bool, exit_code: int):
        """
        That method is called after the git.push process has finish
        :param cmd: the string containing the command that lauch git.push
        :param success: a boolean , true if success false otherwise
        :param exit_code: the exit code that was return by the command
        :raise RuntimeError
        """
        # create a session for this specific code , because it's executed after the flask instance has been killed
        session = open_session_db(s_database_uri)

        if not success:
            raise RuntimeError('Operation was unsuccessful : ' + cmd)

        logger.info('> Rename log file with commit sha')

        try:
            # rename the logfile of the statification by the commit SHA
            os.rename(s_log_file, s_log_dir + "/" + s_commit + ".log")

            logger.info('> Register Commit into the database')

            # update the current statification with no commit with the new commit sha
            Statification.upd_commit(session, '', s_commit)

            # Now the statification is on git so we change the status from statified to SAVED
            Statification.upd_status(session, s_commit, Status.SAVED)

            # update the date of update of the statification
            Statification.upd_upd_date(session, s_commit, datetime.utcnow())

            # create a StatificationHistoric to keep track of the modification
            Statification.static_add_object_to_statification(StatificationHistoric,
                                                             session,
                                                             s_commit,
                                                             datetime.utcnow(),
                                                             s_user,
                                                             Actions.COMMIT_STATIFICATION)
            logger.info('> Commit operations terminated')

            # on success write a success code and the commit id
            write_status_background(
                {
                    'success': True,
                    'commit': s_commit,
                    'operation': 'commit'
                },
                s_file_status_background
            )
        except RuntimeError as e:
            logger.error(str(e))
            write_status_background(
                {
                    'success': False,
                    'error': 'subprocess',
                    'operation': 'commit'
                },
                s_file_status_background
            )
        except FileNotFoundError as e:
            logger.error(str(e))
            write_status_background(
                {
                    'success': False,
                    'error': 'log_file',
                    'operation': 'commit'
                },
                s_file_status_background
            )
        except (ValueError, NoResultFound) as e:
            logger.error(str(e))
            # if no statification was found for the given commit
            # write an error in the statusBackground file
            write_status_background(
                {
                    'success': False,
                    'error': 'database',
                    'operation': 'commit'
                },
                s_file_status_background
            )
        finally:
            # always unlock the route
            unlock_access(s_lock_file)

    return commit_done


def bg_do_apply_prod_done_creator(s_commit: str, s_user: str, s_static_repository: str, urls_git_prod: str,
                                  s_file_status_background: str, s_lock_file: str, s_database_uri: str):
    """
    Wrapper for the method that will be called after the background operation of the visualize service is done.
    All the param are required
    :param s_commit: the commit sha of the statification to be visualized
    :param s_user: the name of the user that is doing the operation
    :param s_static_repository: the path to the git repository used for statification
    :param urls_git_prod: the url of the git repository for production
    :param s_file_status_background: the path to the file that register the background process status
    :param s_lock_file: the path to the lockfile
    :param s_database_uri: the uri of the database
    :return: the method that will be called after the background process
    """
    def do_apply_prod_done(cmd: str, success: bool, exit_code: int):
        """
        That method is called after the git.branch process has finish
        :param cmd: the string containing the command that lauch git.push
        :param success: a boolean , true if success false otherwise
        :param exit_code: the exit code that was return by the command
        :raise RuntimeError
        """
        # create a session for this specific code , because it's executed after the flask instance has been killed
        session = open_session_db(s_database_uri)

        if not success:
            raise RuntimeError('Operation was unsuccessful : ' + cmd)

        # Select the git repository
        git = sh.git.bake(_cwd=s_static_repository, _tty_out=False)

        logger.info('> Push the statification to production server(s)')

        for url in urls_git_prod:
            logger.info('> Push statification to server : ' + url)
            # push the commit to production server
            for log in git.push('-f', url, 'production', _iter='out'):
                logger.info(log)

        logger.info('> Change status of the last statification push to prod to saved')

        # catch error if there is some
        try:
            # change the status of the previous put in Production statification to SAVED status
            Statification.switch_status(session, Status.PRODUCTION, Status.SAVED)
        except (ValueError, NoResultFound) as e:
            # in the case there was no statification that had the status PRODUCTION before, we just catch the error
            # and we continue as normal
            logger.info(str(e))

        logger.info('> Change status of the new statification to push to prod')

        try:
            # change status of the statification pushed to prod to PRODUCTION
            Statification.upd_status(session, s_commit, Status.PRODUCTION)

            # update the date of update of the statification
            Statification.upd_upd_date(session, s_commit, datetime.utcnow())

            # create a StatificationHistoric to keep track of the modification
            Statification.static_add_object_to_statification(StatificationHistoric, session, s_commit,
                                                             datetime.utcnow(),
                                                             s_user,
                                                             Actions.PUSHTOPROD_STATIFICATION)

            logger.info('> Push to prod operations terminated')
            write_status_background(
                {
                    'success': True,
                    'operation': 'pushtoprod',
                    'commit': s_commit
                },
                s_file_status_background
            )
        except RuntimeError as e:
            logger.error(str(e))
            write_status_background(
                {
                    'success': False,
                    'error': 'subprocess',
                    'operation': 'pushtoprod'
                },
                s_file_status_background
            )
        except (ValueError, NoResultFound) as e:
            # there is no reason the process execute the code here
            logger.error(str(e))
            write_status_background(
                {
                    'success': False,
                    'error': 'database',
                    'operation': 'pushtoprod'
                },
                s_file_status_background
            )
        finally:
            # always unlock the route
            unlock_access(s_lock_file)

    return do_apply_prod_done


def bg_visualize_done_creator(s_commit: str, s_user: str, s_visualize_repository: str, s_url_git: str,
                              s_file_status_background: str, s_lock_file: str, s_database_uri: str):
    """
    Wrapper for the method that will be called after the background operation of the visualize service is done.
    All the param are required
    :param s_commit: the commit sha of the statification to be visualized
    :param s_user: the name of the user that is doing the operation
    :param s_visualize_repository: the path to the git repository used for visualization
    :param s_url_git: the url of the git repository for the statification
    :param s_file_status_background: the path to the file that register the background process status
    :param s_lock_file: the path to the lockfile
    :param s_database_uri: the uri of the database
    :return: the method that will be called after the background process
    """
    def visualize_done(cmd: str, success: bool, exit_code: int):
        """
        That method is called after the git.pull process has finish
        :param cmd: the string containing the command that lauch git.pull
        :param success: a boolean , true if success false otherwise
        :param exit_code: the exit code that was return by the command
        :raise RuntimeError
        """
        # create a session for this specific code , because it's executed after the flask instance has been killed
        session = open_session_db(s_database_uri)

        if not success:
            raise RuntimeError('Operation was unsuccessful : ' + cmd)

        try:
            # reinitialize the repository before checking out the commit
            service_do_init_statif(s_visualize_repository, s_url_git)

            logger.info('> Checkout the visualized commit')

            git = sh.git.bake(_cwd=s_visualize_repository, _tty_out=False)

            # checkout the commit on the archive repository
            for line in git.checkout('-q', s_commit, _iter=True):
                logger.info(line)

            logger.info('> Change status for last visualized statification to saved')

            try:
                # change the status of the previous Visualized statification to Saved status
                Statification.switch_status(session, Status.VISUALIZED, Status.SAVED)
            except (ValueError, NoResultFound) as e:
                # in the case there was no statification that had the status VISUALIZED before, we just catch the error
                # and we continue as normal
                logger.info(str(e))

            logger.info('> Change status for new visualized statification')

            # Now the statification is on the visualize repository so we change the status from default to visualized
            Statification.upd_status(session, s_commit, Status.VISUALIZED)

            # update the date of update of the statification
            Statification.upd_upd_date(session, s_commit, datetime.utcnow())

            # create a StatificationHistoric to keep track of the modification
            Statification.static_add_object_to_statification(StatificationHistoric, session, s_commit,
                                                             datetime.utcnow(),
                                                             s_user,
                                                             Actions.VISUALIZE_STATIFICATION)
            # on success write a success code
            write_status_background(
                {'success': True, 'operation': 'visualize', 'commit': s_commit},
                s_file_status_background
            )
        except (ValueError, NoResultFound) as e:
            # there is no reason the process execute the code here
            logger.error(str(e))
            write_status_background(
                {
                    'success': False,
                    'error': 'database',
                    'operation': 'visualize'
                },
                s_file_status_background
            )
        except RuntimeError as e:
            logger.error(str(e))
            write_status_background(
                {
                    'success': False,
                    'error': 'subprocess',
                    'operation': 'visualize'
                },
                s_file_status_background
            )
        except sh.ErrorReturnCode as e:
            logger.error(str(e))
            # if an error has happened during a subprocess
            write_status_background(
                {
                    'success': False,
                    'error': 'subprocess',
                    'operation': 'visualize'
                },
                s_file_status_background
            )
        finally:
            unlock_access(s_lock_file)

    return visualize_done
