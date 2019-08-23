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
# Todo This file should be customized to add specific treatment when saving different type of file.
# It can be useful to clear metadata of pdf file and image file.

import logging
import os

from PIL import Image
from lxml import etree
from scrapy.item import Item, Field

statif_logger = logging.getLogger('statification')


def remove_xml_element(element):
    """

    :param element:
    :type element:
    :return:
    ::
    """
    parent = element.getparent()
    if parent is not None:
        parent.remove(element)


class MirroringItem(Item):
    """
    This class define how to create folders and how to save file in the default case.
    """
    content = Field()
    filename = Field()

    def mkdir(self):
        """
        Create new folder
        """
        # Create directories structure
        path = os.path.dirname(self['filename'])

        if os.path.isdir(path):
            # the directories exist we do nothing
            pass
        elif os.path.exists(path):
            # the path exist but doesn't point to a directory
            # we will remove the file and make a new directory
            os.remove(path)
            os.makedirs(path)
        else:
            # the directory doesn't exist we create it
            os.makedirs(path)

    def save(self, content=None):
        """
        Save the content into a file
        :param content: content of a file
        :type content: str
        """
        if content is None:
            content = self['content']

        # Save content
        self.mkdir()
        try:
            f = open(self['filename'], "wb")
            f.write(content)
            f.close()
        except IsADirectoryError:
            pass

    def process(self):
        self.save()


class MirroringItemHtml(MirroringItem):
    def process(self):
        """
        Here we do the specific treatment to save HTML files
        """
        root = self['content']
        self.save(etree.tostring(root, method="html", encoding=root.docinfo.encoding, pretty_print=True))


class MirroringItemCss(MirroringItem):
    def process(self):
        """
        Here we do the specific treatment to save CSS files
        """
        self.save()


class MirroringItemPdf(MirroringItem):
    def process(self):
        """
        Here we do the specific treatment to save PDF files
        """

        # save the pdf into a file
        self.save()

        # Uncomment to remove metadata of PDF file (beware it need the exiftool package to be installed)
        # try:
        #     # erase all metadata in the pdf file
        #     logging.log(logging.DEBUG,
        #                 sh.exiftool('-overwrite_original', '-all=', self['filename'], _bg=True, _tty_out=False))
        # except sh.CommandNotFound:
        #     logging.log(logging.ERROR, "Error command exiftool not found, is it correctly installed ?")


class MirroringItemXml(MirroringItem):
    def process(self):
        """
        Here we do the specific treatment to save XML files
        """
        root = self['content']
        self.save(etree.tostring(root, method="xml", encoding=root.docinfo.encoding, pretty_print=True))


class MirroringItemJs(MirroringItem):
    def process(self):
        """
        Here we do the specific treatment to save JS files
        """
        self.save()


class MirroringItemImg(MirroringItem):
    def process(self):
        """
        Here we do the specific treatment to save Image files
        """
        self.save()

        # if the image exist
        if os.path.isfile(self['filename']):
            try:
                # Create a new image to strip the metadata, and override initial image
                img = Image.open(self['filename'])
                img.save(self['filename'])
            except SyntaxError:
                logging.log(logging.INFO, "File " + self['filename'] + ' not cleaned error while removing metadata')

        else:
            logging.log(logging.ERROR, "Unable to found image file : " + self['filename'])
