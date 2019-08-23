import os

import pytest
from flask import json
from werkzeug.datastructures import Headers

from cornetto.models import open_session_db
from cornetto import create_app

config = {
    'DEBUG': True,
    'LOGLEVEL': 'INFO',
    'STATIC_REPOSITORY': '',
    'URL_GIT': '',
    'URLS': '',
    'DOMAINS': '',
    'LOGFILE': 'tests/statif.log',
    'PROJECT_DIRECTORY': 'cornettto',
    'PIDFILE': 'tests/.pid.data',
    'LOCKFILE': 'tests/.lock_access',
    'STATUS_BACKGROUND': 'tests/.status_background.json',
    'CRAWLER_PROGRESS_COUNTER_FILE': 'tests/.crawlerProgressCounterFile.txt',
    'DELETE_FILES': '',
    'DELETE_DIRECTORIES': '',
    'URL_REGEX': '(https?://)?web(.your-private-domain.com/?)?',
    'URL_REPLACEMENT': '',
    'DATABASE_URI': 'sqlite:///:memory:',
    'SQLALCHEMY_TRACK_MODIFICATIONS': False
}


@pytest.yield_fixture()
def setup_module():
    os.makedirs(os.path.dirname(config['LOCKFILE']), exist_ok=True)
    session = open_session_db('sqlite:///:memory:')


@pytest.yield_fixture()
def setup_fonction():
    app = create_app(None, config)
    yield {
        'client': app.test_client(),
        'designation': 'Statification Test',
        'description': 'A test statification for unit test',
        'x_forwarded_user': 'Username',
        'content_type': 'application/json'
    }


def test_statification_status(setup_module, setup_fonction):
    r = setup_fonction['client'].get(
        '/api/statification/status'
    )

    assert r.status_code == 200

    data = json.loads(r.get_data())
    assert data['commit'] == ''
    assert data['description'] == ''
    assert data['designation'] == ''
    assert not data['isLocked']
    assert not data['isRunning']
    assert data['nbItemToCrawl'] == 100
    assert data['status'] == 3
    assert data['statusBackground'] == {}
    assert data['status_code'] == 200


def test_do_start_statif(setup_module, setup_fonction):
    """
    TODO write a full test for do_start_statif
    """
    r = setup_fonction['client'].post(
        '/api/statification/start',
        data=json.dumps({
            'designation': setup_fonction['designation'],
            'description': setup_fonction['description']
        }),
        headers=Headers([
            ('X-Forwarded-User', setup_fonction['x_forwarded_user']),
            ('Content-Type', setup_fonction['content_type'])
        ])
    )

    assert r.status_code == 200

    data = json.loads(r.get_data())
    assert data['status_code'] == 200
