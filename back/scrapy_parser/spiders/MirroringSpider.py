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
along with this program. If not, see http://www.gnu.org/licenses/.
"""

# TODO you should customize this spider to adapt it's behavior to your needs.

import re
from urllib import parse
from lxml import html
from lxml import etree
from scrapy.http import Request
from scrapy.spiders import Spider
from scrapy_parser.items import *


class MirroringSpider(Spider):
    name = "mirroring"

    def __init__(self, crawler, output="", urls="", domains="", url_regex="", url_replacement='/',
                 crawler_count_file=None, *args, **kwargs):
        """
        Constructor of the spider, here we set different parameters into the attributes of the spiders
        :param crawler the crawler to bound to the spider
        :param output: the path to the directory where to store downloaded content
        :param urls: the urls to crawl, separated by comma
        :param domains: the allowed domains , separated by comma
        :param url_regex: the regex to be match for url replacement
        :param url_replacement: the url that will replace the matched urlRegex
        :param crawler_count_file: the path to the file that  will be use to store the count of crawled urls
        :param args: list of other args
        :param kwargs: dictionary of other args
        """

        super(Spider, self).__init__(*args, **kwargs)

        self.allowed_domains = domains.strip('\"').split(',')
        self.start_urls = urls.strip('\"').split(',')
        self.output = output
        self.visitedURLs = set() # list of urls crawled
        self.outURLS = set() # list of external urls found during the crawl
        self.cachedResourcePath = set()
        self.sCrawlerProgressCountFile = crawler_count_file

        # set two regex that are used in the parser
        self.urlRegex = re.compile(url_regex.strip('\"').encode('utf-8'), re.I)
        self.urlReplacement = url_replacement.strip('\"').encode('utf-8')
        self.crawler = crawler

    @classmethod
    def from_crawler(cls, crawler, output="", urls="", domains="", *args, **kwargs):
        """

        This is the class method used by Scrapy to create the spider, it's called before __init__
        :param crawler the crawler to bound to the spider
        :param output: the path to the directory where to store downloaded content
        :param urls: the urls to crawl, separated by comma
        :param domains: the allowed domains , separated by comma
        :param args: list of other args
        :param kwargs: dictionary of other args
        """
        return cls(crawler, output, urls, domains, *args, **kwargs)

    def get_local_filename(self, url, default_index="index.html"):
        """
        This method is used to get the path to the local file
        :param url: the url of the file that has been downloaded
        :param default_index: the default index of the url to the file
        :return: the path to the local file
        """

        # get the path to the file from the url
        filename = "/" + parse.unquote(url.path) if (url.path == "") or (url.path[0] != "/") else parse.unquote(
            url.path)

        # if the filename is a directory then the file is index.html
        if os.path.isdir(filename) or os.path.basename(filename) == "":
            filename += default_index

        if url.query:
            filename += "%3F" + parse.unquote(url.query)
        return filename

    def start_requests(self):
        """
        This will be call to start the first requests
        """
        for url in self.start_urls:
            yield Request(url)

    def parse(self, response):
        """
        The method that will manage how to parse any web content
        """
        url_regex = self.urlRegex

        self.crawler.stats.inc_value('custom_count')
        file = open(self.sCrawlerProgressCountFile, 'w')
        file.write(str(self.crawler.stats.get_value('custom_count')))
        file.close()

        # catch error HTTP
        if not (200 <= response.status < 400):
            statif_logger.log(logging.WARNING, "HTTP error [%i] for %s from %s" % (
                response.status, response.url, response.request.headers.get('Referer', b'').decode('utf-8')))
            return

        current_url = parse.urlparse(response.url)
        current_filename = self.get_local_filename(current_url)

        # get Content-Type in headers, if not specified treat as text/plain
        if 'Content-Type' in response.headers:
            mime = response.headers['Content-Type'].decode('utf-8').split(';')[0].strip()
        else:
            mime = 'text/plain'

        if mime == "text/html":
            # replace all url that match the regex by urlReplacement
            body = url_regex.sub(self.urlReplacement, response.body)

            root = etree.fromstring(body, parser=html.HTMLParser(encoding="utf-8", remove_comments=False),
                                    base_url=response.url).getroottree()

            # Search for links
            for link in root.xpath(
                    '//a/@href | //applet/@code | //area/@href | //bgsound/@src | //body/@background | //embed/@src | //fig/@src | //form/@action | //frame/@src | //iframe/@src | //img/@src | //input/@src | //layer/@src | //link/@href | //object/@data | //overlay/@src | //script/@src | //table/@background | //td/@background | //tr/@background | //video/@src | //video/@poster | //audio/@src | //source/@src | //div/@style | //section/@style | //article/@style | //a/@style'):

                link = parse.urljoin(response.url, link)

                if not re.match('^https?:|data:', link):
                    statif_logger.log(logging.DEBUG, "Unknown external link format [%s]" % link)
                    continue

                if (parse.urlparse(link).netloc not in self.allowed_domains) and (link not in self.outURLS):
                    self.outURLS.add(link)
                    statif_logger.log(logging.INFO, "External link detected [%s] in %s" % (link, response.url))
                yield Request(link)

            yield MirroringItemHtml(filename=self.output + current_filename, content=root)

        elif mime == "text/css":
            # replace all url that match the regex by urlReplacement
            body = url_regex.sub(self.urlReplacement, response.body)

            # Search for links
            for url in re.findall(b"url\s*\(\s*[\"']?([^)\"']+)[\"']?\s*\)", body):
                link = parse.urljoin(response.url, url.decode('utf-8'))
                if not re.match('^https?:|data:', link):
                    statif_logger.log(logging.DEBUG, "Unknown external link format [%s] in %s" % (link, response.url))
                    continue

                if (parse.urlparse(link).netloc not in self.allowed_domains) and (link not in self.outURLS):
                    self.outURLS.add(link)
                    statif_logger.log(logging.INFO, "External link detected [%s] in %s" % (link, response.url))
                yield Request(link)

            yield MirroringItemCss(filename=self.output + current_filename, content=body)

        elif mime == "application/pdf":
            yield MirroringItemPdf(filename=self.output + current_filename, content=response.body)

        elif mime == "text/xml":
            # get the body content and encode it as utf-8
            body = url_regex.sub(self.urlReplacement, response.body)

            root = etree.fromstring(body, parser=etree.XMLParser(strip_cdata=False, resolve_entities=False),
                                    base_url=response.url).getroottree()

            # Parse XML to find every declared namespaces
            namespaces = {}
            for event, elem in etree.iterwalk(root, ('start', 'start-ns')):
                if event == 'start-ns':
                    namespaces[elem[0]] = elem[1]
                elif event == 'start':
                    break

            # Search for links
            xpath = "/rss/channel/link | /rss/channel/item/link | /rss/channel/item/comments"
            if 'atom' in namespaces:
                xpath += " | /rss/channel/atom:link[@href]"
            if 'wfw' in namespaces:
                xpath += " | /rss/channel/item/wfw:commentRss"
            for elem in root.xpath(xpath, namespaces=namespaces):
                if elem.tag == '{' + namespaces['atom'] + '}link':
                    link = elem.get('href')
                else:
                    link = elem.text

                link = parse.urljoin(response.url, link)

                if not re.match('^https?:|data:', link):
                    statif_logger.log(logging.WARNING, "Unknown external link format [%s]" % link)
                    continue

                if (parse.urlparse(link).netloc not in self.allowed_domains) and (link not in self.outURLS):
                    self.outURLS.add(link)
                    statif_logger.log(logging.INFO, "External link detected [%s] in %s" % (link, response.url))
                yield Request(link)

            yield MirroringItemXml(filename=self.output + current_filename, content=root)

        elif mime in ["image/gif", "image/jpeg", "image/png", "image/x-ms-bmp", "image/vnd.microsoft.icon",
                      "image/x-icon"]:
            yield MirroringItemImg(filename=self.output + current_filename, content=response.body)

        elif mime in ["application/javascript", "text/javascript"]:
            # get the body content and encode it as utf-8
            body = url_regex.sub(self.urlReplacement, response.body)

            yield MirroringItemJs(filename=self.output + current_filename, content=body)

        # Here are all the MIME type of files that will be downloaded and stored
        # TODO This list is an example, any other type that should be downloaded must be added here
        elif mime in ["application/font-woff", "application/vnd.ms-fontobject", "text/plain", "application/x-gzip",
                      "application/zip", "application/rtf", "video/mp4", "video/webm", "text/csv",
                      "application/x-x509-ca-cert", "application/x-pkcs7-crl", "application/msword",
                      "application/vnd.ms-excel", "application/epub+zip", "application/x-mobi8-ebook",
                      "application/xml", "image/svg+xml"]:
            yield MirroringItem(filename=self.output + current_filename, content=response.body)

        else:  # Content not allowed
            statif_logger.log(logging.WARNING, "Forbidden content [%s] detected in %s" % (mime, response.url))
