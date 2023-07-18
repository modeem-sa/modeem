# -*- coding: utf-8 -*-
# See LICENSE file for full copyright and licensing details.
# Developed by Bizople Solutions Pvt. Ltd.

from modeem import api, fields, models, _

class PWAshortcuts(models.Model):
    _name = 'pwa.shortcuts'
    _description = "PWA Shortcuts"

    name = fields.Char("Name", required=True)
    short_name = fields.Char("Short Name", required=True)
    url = fields.Char("URL", required=True, default='/')
    description = fields.Char("Description", required=True)
    image_192_shortcut = fields.Binary('Image 192px', readonly=False)