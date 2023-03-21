# -*- coding: utf-8 -*-
# Part of Modeem. See LICENSE file for full copyright and licensing details.

from modeem import fields, models


class Company(models.Model):
    _inherit = "res.company"

    invoice_is_snailmail = fields.Boolean(string='Send by Post', default=False)
