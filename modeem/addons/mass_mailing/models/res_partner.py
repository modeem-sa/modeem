# -*- coding: utf-8 -*-
# Part of Modeem. See LICENSE file for full copyright and licensing details.

from modeem import models


class Partner(models.Model):
    _inherit = 'res.partner'
    _mailing_enabled = True
