# -*- coding: utf-8 -*-
# Part of Modeem. See LICENSE file for full copyright and licensing details.

from modeem import fields, models


class Lead(models.Model):
    _inherit = 'crm.lead'

    lead_mining_request_id = fields.Many2one('crm.iap.lead.mining.request', string='Lead Mining Request', index='btree_not_null')

    def _merge_get_fields(self):
        return super(Lead, self)._merge_get_fields() + ['lead_mining_request_id']
