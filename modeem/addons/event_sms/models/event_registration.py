# -*- coding: utf-8 -*-
# Part of Modeem. See LICENSE file for full copyright and licensing details.

from modeem import models


class Registration(models.Model):
    _inherit = 'event.registration'

    def _sms_get_number_fields(self):
        """ This method returns the fields to use to find the number to use to
        send an SMS on a record. """
        return ['mobile', 'phone']
