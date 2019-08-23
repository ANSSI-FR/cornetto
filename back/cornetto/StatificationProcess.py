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
import fcntl
import logging
import os
import re
import signal
from datetime import datetime

import sh
from sqlalchemy.orm import Session
from sqlalchemy.orm.exc import NoResultFound

from cornetto.models.ErrorTypeMIME import ErrorTypeMIME
from cornetto.models.ExternalLink import ExternalLink
from cornetto.models.HtmlError import HtmlError
from cornetto.models.ScannedFile import ScannedFile
from cornetto.models.ScrapyError import ScrapyError
from cornetto.models.StatificationHistoric import StatificationHistoric, Actions
from cornetto.models.Statification import Statification, Status
from cornetto.models import open_session_db


class StatificationProcess:
    def __init__(self, s_logger: str, s_repository_path: str, s_python_path: str, s_urls: str, s_domains: str, s_log_file: str,
                 s_project_directory: str, s_database_uri: str, s_pid_file: str, s_lock_file: str,
                 s_crawler_progress_counter_file: str, s_delete_files: str = '', s_delete_directories: str = '',
                 s_url_regex: str = '', s_url_replacement: str = ''):
        """
        Initialize a StatificationProcess thread with the specified settings
        :param s_logger: the id of the logger
        :param s_repository_path: the path to the git repository folder for statification
        :param s_python_path: the path to the virtual env libs where scrapy is
        :param s_urls: the url to be crawled
        :param s_domains: the domains authorized to be crawled
        :param s_log_file: the path to the log file
        :param s_project_directory: the path to the source
        :param s_database_uri: the uri of the database
        :param s_pid_file: the path to the file that will store the subprocess id
        :param s_lock_file: the path to the lockfile
        :param s_crawler_progress_counter_file: the path to the file that will store the count of crawled files
        :param s_delete_files: the list of files to be deleted at the end of the statification process
        :param s_delete_directories: the list of directories to be deleted at the end of the statification process
        :param s_url_regex: the regex to identify url to be replaced by s_url_replacement
        :param s_url_replacement: the new url to set to replace the match made by s_url_regex
        """
        self.logger = logging.getLogger(s_logger)
        self.s_repository_path = s_repository_path
        self.s_python_path = s_python_path
        self.s_urls = s_urls
        self.s_domains = s_domains
        self.s_delete_files = s_delete_files
        self.s_delete_directories = s_delete_directories
        self.s_log_file = s_log_file
        self.s_url_regex = s_url_regex
        self.s_url_replacement = s_url_replacement

        self.s_database_uri = s_database_uri
        self.s_project_directory = s_project_directory
        self.s_pid_file = s_pid_file
        self.s_lockfile = s_lock_file
        self.s_crawler_progress_counter_file = s_crawler_progress_counter_file

    def is_running(self) -> bool:
        """
        Check if the statification process is running
        :return: True if the process is currently running, false otherwise
        """
        # open the pid file in read mode
        try:
            f_pid_file = open(self.s_pid_file)
            # read the pid
            s_pid = f_pid_file.read()
            f_pid_file.close()
        except FileNotFoundError:
            s_pid = ''
        # if there is no pid in the file then no process is running
        if s_pid == '':
            return False
        # if there was a pid then the process is running
        return True

    def stop(self, session: Session, success: bool = False):
        """
        Stop the statification process
        :param session : the database session
        :param success : a boolean to know if the process has been finish successfully or not,
                         by default it's unsuccessful
        """

        # if success is True and there is an object Statification linked to the process
        if not success:
            try:
                # get the statification with empty commit
                statification = Statification.get_statification(session, '')
                # Delete the current Statification Object with all the linked object
                statification.delete(session)
                self.logger.info(
                    'There was a current statification, it has been deleted, process will continue normally')
            except (NoResultFound, IndexError):
                self.logger.info('There is no current statification, process will continue normally')

        # open the pid file in read mode
        try:
            f_pid_file = open(self.s_pid_file)
            # read the pid
            s_pid = f_pid_file.read()
            f_pid_file.close()
            if not s_pid == "":
                # get an Integer
                i_pid = int(s_pid)
                try:
                    # kill the process with the pid
                    os.kill(i_pid, signal.SIGTERM)
                    os.kill(i_pid, signal.SIGINT)

                    # wait for the process to terminate
                    while True:
                        try:
                            # check if the process has been terminated
                            os.kill(i_pid, 0)
                        except OSError:
                            self.logger.info('The process stopped successfully')
                            # continue when the process has been stopped
                            break
                except ProcessLookupError as e:
                    # if the process was already stopped we do nothing it should be normal if the process was
                    # correctly terminated
                    self.logger.debug('The process was already stopped' + str(e))
        except FileNotFoundError as e:
            # if the process was already stopped we do nothing it should be normal if the process was correctly
            # terminated
            self.logger.debug('The process was already stopped' + str(e))
        finally:
            # erase the content of the pid File and create it empty if it doesn't exist yet
            f_pid_file = open(self.s_pid_file, 'w')
            f_pid_file.close()

    def done(self, cmd: str, success: bool, exit_code: int):
        """
        That method is called after the statification process has finish
        :param cmd: the string containing the command that launched scrapy
        :param success: a boolean , true if successful, false otherwise
        :param exit_code: the exit code that was return by the command
        """
        self.logger.info("the process has finished with exit code : " + str(exit_code))

        # create a session for this specific code , because it's executed after the flask instance has been killed
        session = open_session_db(self.s_database_uri)

        # if the process finished with exit code 0 (success)
        if exit_code == 0:
            try:
                # fill the database with the log
                self.register_error_in_database(session)
            except (NoResultFound, IndexError):
                self.logger.info('There is no current statification, no error will be registered in the database')

        # delete the pid in the file and clear the statification if not a success
        self.stop(session, success)

        # open the file if it exist, create it if it doesn't exist
        f_lock_file = open(self.s_lockfile, "w+")
        # release the lock
        fcntl.flock(f_lock_file, fcntl.LOCK_UN)
        f_lock_file.close()

        # terminate the session
        session.close()

        file_progress_counter = open(self.s_crawler_progress_counter_file, 'w')
        file_progress_counter.close()

    def start(self, session: Session, s_designation: str, s_description: str, s_user: str):
        """
        Start a statification process with scrapy.
        :param session: the database session
        :param s_designation:  the designation of the new statification
        :param s_description: the description of the new statification
        :param s_user: the name of the user which started the operation
        :raise ValueError if one parameter is missing
        """

        if self.s_repository_path and os.path.isdir(self.s_repository_path) and self.s_urls and self.s_domains:

            try:
                # get the statification with empty commit
                statification = Statification.get_statification(session, '')
                # Delete the current Statification Object with all the linked object
                statification.delete(session)
                self.logger.info(
                    'There was a current statification, it has been deleted, process will continue normally')
            except NoResultFound:
                self.logger.info('There is no current statification, process will continue normally')

            self.logger.info("Create Statification")

            # create a new statification with empty commit ID
            statification = Statification('', s_designation, s_description, datetime.utcnow(), datetime.utcnow(),
                                          Status.CREATED)
            session.add(statification)
            session.commit()

            # create a StatificationHistoric
            statification.add_object_to_statification(StatificationHistoric, session, datetime.utcnow(), s_user,
                                                      Actions.CREATE_STATIFICATION)

            # erase the precedent log file
            f_log_file = open(self.s_log_file, "w")
            f_log_file.close()

            try:
                # create a new environnement to call subprocess
                new_env = os.environ.copy()
                new_env["PYTHONPATH"] = self.s_python_path

                # create a subprocess that will run scrapy in background
                process = sh.python3('scrapy_cmd.py', 'crawl', '--loglevel=INFO',
                                     '--logfile=' + self.s_log_file,
                                     '-a', 'output=' + self.s_repository_path,
                                     '-a', 'urls="' + self.s_urls + '"',
                                     '-a', 'domains="' + self.s_domains + '"',
                                     '-a', 'url_regex="' + self.s_url_regex + '"',
                                     '-a', 'url_replacement="' + self.s_url_replacement + '"',
                                     '-a', 'crawler_count_file=' + self.s_crawler_progress_counter_file,
                                     'mirroring',
                                     _cwd=self.s_project_directory, _env=new_env, _bg=True,
                                     _tty_out=False, _done=self.done)

                # create the pid file if it doesn't exist, erase the file if it exist
                f_pid_file = open(self.s_pid_file, "w")
                # write the new process pid in the file
                f_pid_file.write(str(process.pid))
                f_pid_file.close()

            except sh.ErrorReturnCode_1 as e:
                self.logger.info(str(e))

        else:
            raise ValueError("Verify your parameter it seems that one is empty or that one file doesn't exist")

    def delete_files(self):
        """
        Delete the list of files passed in parameter
        """
        self.logger.log(logging.INFO, "> Suppression des fichiers spécifiés...")

        # get the list of files to delete
        a_delete_files = self.s_delete_files.split(',')
        # delete the files
        for file in a_delete_files:
            if os.path.isfile(file):
                os.remove(file)

    def delete_directories(self):
        """
        Delete the list of directories passed in parameter
        """
        self.logger.log(logging.INFO, "> Suppression des dossiers specifiés...")
        # get the list of all directory to delete
        a_delete_directories = self.s_delete_directories.split(',')
        # delete the directories
        for directory in a_delete_directories:
            if os.path.isdir(directory):
                os.removedirs(directory)

    def delete_empty_directories(self):
        """
        Delete all the empty directories inside one
        """
        self.logger.log(logging.INFO, "> Suppression des dossiers vides...")
        # get the list of all empty folder in the repository
        try:
            s_list_empty_dir = sh.find(sh.glob(self.s_repository_path + '/*'), '-type', 'd', '-empty')
            a_list_empty_dir = s_list_empty_dir.split('\n')
            # browse the list and delete all the empty directory
            for sDirectory in a_list_empty_dir:
                if os.path.isdir(sDirectory):
                    os.removedirs(sDirectory)
        except sh.ErrorReturnCode_1:
            self.logger.log(logging.INFO,
                            "Il n'y a pas de sous dossier pour le moment,"
                            " donc il n'y a pas de dossier vide à supprimer.")

    def register_error_in_database(self, session: Session):
        """
        This methode create database object associated to the statification with the result of the log
        that scrapy has generated.
        :param session
        :raise NoResultFound if there is no statification with empty commit sha
        """

        # finalization of the statification by removing unwanted files and directories and empty directories
        self.delete_files()
        self.delete_directories()
        self.delete_empty_directories()

        # get the statification with empty commit
        statification = Statification.get_statification(session, '')

        # open the log file that contain scrapy errors
        f_file = open(self.s_log_file)

        expecting_other_line_for_error_message = False
        s_error_message = ''

        # for each line will look for information that will be used to fill object of the database
        for line in f_file:

            # check if the line contain a warning or a info
            if re.match('(.*)WARNING(.*)', line) or re.match('(.*)INFO(.*)', line) or re.match('(.*) ERROR:(.*)', line):
                expecting_other_line_for_error_message = False

            if expecting_other_line_for_error_message:
                s_error_message += line

            if (not expecting_other_line_for_error_message) and s_error_message != '':
                statification.add_object_to_statification(ScrapyError, session, s_error_message)
                s_error_message = ''

            # in the case the line match an External link
            if re.match('(.*) INFO: External link detected(.*)', line):
                # we get the second part of the line there are also [] in the first part
                s_trunked_line = line[line.index('INFO: External link detected'):len(line)]

                # we get the position of begining of the URL
                i_start_url = s_trunked_line.index('[')
                # we ge the position of the end of the URL
                i_end_url = s_trunked_line.index(']')
                # we get the position of the begining of the source url
                i_start_source = s_trunked_line.index(' in ') + 4

                try:
                    # we create and add a new ExtenalLink to our statification
                    statification.add_object_to_statification(
                        ExternalLink,
                        session,
                        s_trunked_line[i_start_source: len(s_trunked_line)],
                        s_trunked_line[i_start_url + 1:i_end_url]
                    )
                except ValueError as e:
                    self.logger.info(e)
            # in the case the line match a Scrapy Error
            elif re.match('(.*) ERROR:(.*)', line):
                expecting_other_line_for_error_message = True
                # retrieve the Scrapy Error
                s_trunked_line = line[line.index('ERROR: ') + 7: len(line)]
                s_error_message += s_trunked_line

            # in the case the line match an error for type MIME
            elif re.match('(.*) WARNING: Forbidden content (.*)', line):

                # we get the second part of the line where begin the information that interest us
                s_trunked_line = line[line.index('WARNING: Forbidden content '):len(line)]

                # get the starting position of the Error type MIME
                i_start_error_mime = s_trunked_line.index('[')
                # get the end position of the error type MIME
                i_end_error_mime = s_trunked_line.index(']')
                # get the error type MIME
                s_error_mime = s_trunked_line[i_start_error_mime + 1: i_end_error_mime]
                # get the source of the error
                s_source_link = s_trunked_line[s_trunked_line.index('detected in') + 12: len(s_trunked_line)]

                try:
                    # create an ErrorTypeMIME associated to the statification
                    statification.add_object_to_statification(ErrorTypeMIME, session, s_error_mime, s_source_link)
                except ValueError as e:
                    self.logger.info(e)
            # in the case the line match an HTTP error
            elif re.match('(.*) WARNING: HTTP error (.*)', line):

                # we get the second part of the line where begin the information that interest us
                s_trunked_line = line[line.index('WARNING: HTTP error '):len(line)]

                # we get the starting position of the Error Code
                i_start_error_code = s_trunked_line.index('[')
                # we get the end position of the Error Code
                i_end_error_code = s_trunked_line.index(']')
                # we get the start position of the url source of the error
                i_start_url = s_trunked_line.index(' for ')
                # we get the end position of the url source of the error
                i_end_url = s_trunked_line.index(' from ')

                # we retrieve the error code
                s_error_code = s_trunked_line[i_start_error_code + 1: i_end_error_code]

                # we retrieve the url that cause the error
                s_url = s_trunked_line[i_start_url + 5: i_end_url]

                # we retrieve the url of the source where was found the url that caused the error
                s_url_source = s_trunked_line[i_end_url + 6: len(s_trunked_line) - 1]

                try:
                    # we create a new HtmlError associated to the statification
                    statification.add_object_to_statification(HtmlError, session, s_error_code, s_url, s_url_source)
                except ValueError as e:
                    self.logger.info(e)
            elif re.match('(.*)response_received_count(.*)', line):

                # we get the second part of the line where begin the information that interest us
                s_value_item_scraped_count = line[line.index(': ') + 2:line.index(',')]

                try:
                    # set the number of crawled item into the statification object
                    statification.upd_nb_item(session, statification.commit, int(s_value_item_scraped_count))
                except ValueError as e:
                    self.logger.info(e)
        try:
            # retrieve the list of type file with number of file for each type
            s_result_type_files = sh.uniq(
                sh.sort(
                    sh.grep(sh.find(sh.glob(self.s_repository_path + '/*'), '-type', 'f'), '-o', '-E',
                            '\.[a-zA-Z0-9]+$')),
                '-c')
            # the result is a string so we need to get a table,
            # here we get a table made of each line returned, we remove all space
            a_table_result_type_files = s_result_type_files.replace(' ', '').split('\n')

            # browse the line of result
            for row in a_table_result_type_files:
                if row:
                    # a line is composed of a number followed by a type like "42.png",
                    # we separate the number and the type
                    s_type_file = row.split('.')

                    try:
                        # create a new ScannedFile associated to the statificaiton
                        statification.add_object_to_statification(
                            ScannedFile,
                            session,
                            s_type_file[1],
                            int(s_type_file[0])
                        )
                    except ValueError as e:
                        self.logger.info(e)
        except sh.ErrorReturnCode_1:
            self.logger.info('There is no folder in the static repository')
        finally:
            # in all case we need to close the file
            f_file.close()

        # change the status of the statification (NEED TO BE DONE AT THE END !!)
        statification.upd_status(session, '', Status.STATIFIED)
