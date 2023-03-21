# -*- coding: utf-8 -*-
# Part of Modeem. See LICENSE file for full copyright and licensing details.

from modeem import models, fields


class Company(models.Model):
    _inherit = 'res.company'

    lunch_minimum_threshold = fields.Float()
    lunch_notify_message = fields.Html(
        default="""Your lunch has been delivered.
Enjoy your meal!""", translate=True)
