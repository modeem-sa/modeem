# -*- coding: utf-8 -*-
# Part of Modeem. See LICENSE file for full copyright and licensing details.

from modeem import fields, models


class MailingContact(models.Model):
    _name = 'mailing.contact'
    _inherit = ['mailing.contact', 'mail.thread.phone']

    mobile = fields.Char(string='Mobile')

    def _phone_get_number_fields(self):
        return ['mobile']
