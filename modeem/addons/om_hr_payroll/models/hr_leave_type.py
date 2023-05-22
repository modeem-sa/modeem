# -*- coding:utf-8 -*-

from modeem import api, fields, models


class LeaveType(models.Model):
    _inherit = 'hr.leave.type'

    code = fields.Char(string='Code')

