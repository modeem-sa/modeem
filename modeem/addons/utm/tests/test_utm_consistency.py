# -*- coding: utf-8 -*-
# Part of Modeem. See LICENSE file for full copyright and licensing details.

from modeem.addons.utm.tests.common import TestUTMCommon
from modeem.exceptions import UserError
from modeem.tests.common import tagged, users


@tagged('post_install', '-at_install', 'utm_consistency')
class TestUTMSecurity(TestUTMCommon):

    @users('__system__')
    def test_utm_consistency(self):
        """ You are not supposed to delete the 'utm_medium_email' record as it is hardcoded in
        some functional flows, notably in HR and Mass Mailing. """

        with self.assertRaises(UserError):
            self.env.ref('utm.utm_medium_email').unlink()
