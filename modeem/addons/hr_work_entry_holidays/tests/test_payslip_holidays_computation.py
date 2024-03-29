# # -*- coding: utf-8 -*-
# Part of Modeem. See LICENSE file for full copyright and licensing details.

from datetime import datetime, date

from modeem.addons.hr_work_entry_holidays.tests.common import TestWorkEntryHolidaysBase


class TestPayslipHolidaysComputation(TestWorkEntryHolidaysBase):

    @classmethod
    def setUpClass(cls):
        super().setUpClass()

        cls.leave_type = cls.env['hr.leave.type'].create({
            'name': 'Legal Leaves',
            'time_type': 'leave',
            'requires_allocation': 'no',
            'work_entry_type_id': cls.work_entry_type_leave.id
        })

    def test_work_data(self):
        start = datetime(2015, 11, 8, 8, 0)
        end = datetime(2015, 11, 10, 22, 0)
        work_days_data = self.jules_emp._get_work_days_data_batch(start, end)
        leave = self.env['hr.leave'].create({
            'name': 'Doctor Appointment',
            'employee_id': self.jules_emp.id,
            'holiday_status_id': self.leave_type.id,
            'date_from': start,
            'date_to': end,
            'number_of_days': work_days_data[self.jules_emp.id]['days'],
        })
        leave.action_approve()

        work_entries = self.jules_emp.contract_ids._generate_work_entries(date(2015, 11, 10), date(2015, 11, 21))
        work_entries.action_validate()
        work_entries = work_entries.filtered(lambda we: we.work_entry_type_id in self.env.ref('hr_work_entry.work_entry_type_attendance'))
        sum_hours = sum(work_entries.mapped('duration'))
        self.assertEqual(sum_hours, 59, 'It should count 59 attendance hours')  # 24h first contract + 35h second contract
