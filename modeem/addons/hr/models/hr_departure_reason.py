# -*- coding: utf-8 -*-
# Part of Modeem. See LICENSE file for full copyright and licensing details.

from modeem import api, fields, models, _
from modeem.exceptions import UserError


class DepartureReason(models.Model):
    _name = "hr.departure.reason"
    _description = "Departure Reason"
    _order = "sequence"

    sequence = fields.Integer("Sequence", default=10)
    name = fields.Char(string="Reason", required=True, translate=True)

    def _get_default_departure_reasons(self):
        return {
            'fired': 342,
            'resigned': 343,
            'retired': 340,
        }

    @api.ondelete(at_uninstall=False)
    def _unlink_except_default_departure_reasons(self):
        raise UserError(_('Default departure reasons cannot be deleted.'))
