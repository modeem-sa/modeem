# -*- coding: utf-8 -*-
# Part of Modeem. See LICENSE file for full copyright and licensing details.

import datetime
import random

from modeem import models
from modeem.tools import populate
from dateutil.relativedelta import relativedelta
from itertools import groupby


class HolidaysType(models.Model):
    _inherit = "hr.leave.type"
    _populate_sizes = {"small": 10, "medium": 30, "large": 100}
    _populate_dependencies = ['res.company']

    def _populate_factories(self):

        company_ids = self.env.registry.populated_models['res.company']

        return [
            ('name', populate.constant('leave_type_{counter}')),
            ('company_id', populate.randomize(company_ids)),
            ('requires_allocation', populate.randomize(['yes', 'no'], [0.3, 0.7])),
            ('employee_requests', populate.randomize(['yes', 'no'], [0.2, 0.8])),
            ('request_unit', populate.randomize(['hour', 'day'], [0.2, 0.8])),
        ]


class HolidaysRequest(models.Model):
    _inherit = "hr.leave"
    _populate_sizes = {"small": 100, "medium": 800, "large": 10000}
    _populate_dependencies = ['hr.employee', 'hr.leave.type']

    def _populate_factories(self):

        employee_ids = self.env.registry.populated_models['hr.employee']
        hr_leave_type_ids = self.env.registry.populated_models['hr.leave.type']

        hr_leave_type_records = self.env['hr.leave.type'].browse(hr_leave_type_ids)
        allocationless_leave_type_ids = hr_leave_type_records.filtered(lambda lt: lt.requires_allocation == 'no').ids

        employee_records = self.env['hr.employee'].browse(employee_ids)
        employee_by_company = {k: list(v) for k, v in groupby(employee_records, key=lambda rec: rec['company_id'].id)}
        company_by_type = {rec.id: rec.company_id.id for rec in self.env['hr.leave.type'].browse(hr_leave_type_ids)}


        def compute_employee_id(random=None, values=None, **kwargs):
            company_id = company_by_type[values['holiday_status_id']]
            return random.choice(employee_by_company[company_id]).id

        def compute_date_from(counter, **kwargs):
            date_from = datetime.datetime.now().replace(hour=0, minute=0, second=0)\
                + relativedelta(days=int(3 * int(counter)))
            return date_from

        def compute_date_to(counter, **kwargs):
            date_to = datetime.datetime.now().replace(hour=23, minute=59, second=59)\
                + relativedelta(days=int(3 * int(counter))  + random.randint(0, 2))
            return date_to

        return [
            ('holiday_status_id', populate.randomize(allocationless_leave_type_ids)),
            ('employee_id', populate.compute(compute_employee_id)),
            ('holiday_type', populate.constant('employee')),
            ('date_from', populate.compute(compute_date_from)),
            ('date_to', populate.compute(compute_date_to)),
            ('state', populate.randomize([
                'draft',
                'confirm',
            ])),
        ]
