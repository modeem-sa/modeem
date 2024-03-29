# -*- coding: utf-8 -*-
# Part of Modeem. See LICENSE file for full copyright and licensing details.

from modeem import fields, models


class ContractType(models.Model):
    _name = 'hr.contract.type'
    _description = 'Contract Type'
    _order = 'sequence'

    name = fields.Char(required=True, translate=True)
    sequence = fields.Integer()
