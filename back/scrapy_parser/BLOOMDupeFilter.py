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

from pybloom_live import BloomFilter
from scrapy.dupefilters import BaseDupeFilter
from scrapy.utils.job import job_dir


class BLOOMDupeFilter(BaseDupeFilter):
    """
    BLOOM Duplicate Filter
    This filter is interesting to use if you crawl a lot of url, it will take less memory to filter the urls.
    """
    def __init__(self, path=None):
        self.file = None
        self.fingerprints = BloomFilter(2000000, 0.00001)

    @classmethod
    def from_settings(cls, settings):
        return cls(job_dir(settings))

    def request_seen(self, request):
        fp = request.url
        if fp in self.fingerprints:
            return True
        self.fingerprints.add(fp)

    def close(self, reason):
        self.fingerprints = None
