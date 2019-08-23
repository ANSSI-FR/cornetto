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
# Scrapy settings for mirroring project
#
# For simplicity, this file contains only the most important settings by
# default. All the other settings are documented here:
#
#     http://doc.scrapy.org/en/latest/topics/settings.html
#

BOT_NAME = 'mirroring'

SPIDER_MODULES = ['scrapy_parser.spiders']
NEWSPIDER_MODULE = 'scrapy_parser.spiders'

# Crawl responsibly by identifying yourself (and your website) on the user-agent
# USER_AGENT = 'scrapy mirroring'

ITEM_PIPELINES = {'scrapy_parser.pipelines.MirroringPipeline': 1}

HTTPERROR_ALLOW_ALL = True

DEFAULT_REQUEST_HEADERS = {
    'Accept-Language': 'fr',
}

CONCURRENT_REQUESTS = 100
CONCURRENT__REQUEST_PER_DOMAIN = 100
REACTOR_THREADPOOL_MAXSIZE = 20

LOG_LEVEL = 'INFO'

COOKIES_ENABLED = False

DOWNLOAD_TIMEOUT = 900
DOWNLOAD_DELAY = 0.01
RANDOMIZE_DOWNLOAD_DELAY = False
METAREFRESH_ENABLED = False

DNSCACHE_ENABLED = True
# DUPEFILTER_CLASS = "scrapy_parser.BLOOMDupeFilter.BLOOMDupeFilter"
DUPEFILTER_CLASS = "scrapy_parser.SimpleDupeFilter.SimpleDupeFilter"
