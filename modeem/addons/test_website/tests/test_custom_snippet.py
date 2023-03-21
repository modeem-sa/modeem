# -*- coding: utf-8 -*-
# Part of Modeem. See LICENSE file for full copyright and licensing details.

import modeem.tests
from modeem.tools import mute_logger


@modeem.tests.common.tagged('post_install', '-at_install')
class TestCustomSnippet(modeem.tests.HttpCase):

    @mute_logger('modeem.addons.http_routing.models.ir_http', 'modeem.http')
    def test_01_run_tour(self):
        self.start_tour(self.env['website'].get_client_action_url('/'), 'test_custom_snippet', login="admin")
