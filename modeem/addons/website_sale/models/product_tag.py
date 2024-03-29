# -*- coding: utf-8 -*-
# Part of Modeem. See LICENSE file for full copyright and licensing details.

from modeem import fields, models

class ProductTag(models.Model):
    _name = 'product.tag'
    _inherit = ['website.multi.mixin', 'product.tag']

    ribbon_id = fields.Many2one('product.ribbon', string='Ribbon')
