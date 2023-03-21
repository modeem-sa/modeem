# -*- coding: utf-8 -*-
# Part of Modeem. See LICENSE file for full copyright and licensing details.

import modeem.tests

@modeem.tests.common.tagged('post_install', '-at_install')
class TestWebsitePageManager(modeem.tests.HttpCase):

    def test_01_page_manager(self):
        self.start_tour(self.env['website'].get_client_action_url('/'), 'website_page_manager', login="admin")
