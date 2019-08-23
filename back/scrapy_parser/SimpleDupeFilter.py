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

from scrapy.dupefilters import RFPDupeFilter
from scrapy.utils.job import job_dir

statif_logger = logging.getLogger('statification')


class SimpleDupeFilter(RFPDupeFilter):
    """
    A simple Dupe Filter
    """
    def __init__(self, path=None):
        RFPDupeFilter.__init__(self, path)

    @classmethod
    def from_settings(cls, settings):
        return cls(job_dir(settings))

    def request_seen(self, request):
        # get the request fingerprint
        fp = self.request_fingerprint(request)

        # get an alternate request with index.html at the end
        # it will stop doing twice the same request for url pointing to index.html file, considering url like :
        # http://mysite.mydomain/
        # http://mysite.mydomain
        # http://mysite.mydomain/index.html
        if request.url.endswith('/'):
            req = request.replace(url=(request.url + "index.html"))
        else:
            req = request.replace(url=(request.url + "/index.html"))
        fp2 = self.request_fingerprint(req)

        # if fingerprints exist then the url has been already crawled
        if fp in self.fingerprints or fp2 in self.fingerprints:
            return True
        statif_logger.info('do request : ' + request.url)

        # add both fingerprints to the list of seen url
        self.fingerprints.add(fp)
        self.fingerprints.add(fp2)

    def close(self, reason):
        self.fingerprints = None
