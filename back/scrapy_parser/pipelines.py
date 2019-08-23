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
# Define your item pipelines here
#
# Don't forget to add your pipeline to the ITEM_PIPELINES setting
# See: http://doc.scrapy.org/en/latest/topics/item-pipeline.html

from scrapy_parser.spiders.MirroringSpider import MirroringSpider

from scrapy_parser.items import MirroringItem


class MirroringPipeline(object):
    def process_item(self, item, spider):
        """
        Pipeline that link a MirroringSpider to the MirroringItem
        :type item: Object
        :type spider: MirroringSpider
        """
        if isinstance(spider, MirroringSpider) and isinstance(item, MirroringItem):
            item.process()

        return item
