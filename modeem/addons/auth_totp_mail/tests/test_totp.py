# -*- coding: utf-8 -*-
# Part of Modeem. See LICENSE file for full copyright and licensing details.

from modeem.tests import tagged
from modeem.addons.auth_totp.tests.test_totp import TestTOTP


@tagged('post_install', '-at_install')
class TestTOTPInvite(TestTOTP):

    def test_totp_administration(self):
        self.start_tour('/web', 'totp_admin_invite', login='admin')
        self.start_tour('/web', 'totp_admin_self_invite', login='admin')
