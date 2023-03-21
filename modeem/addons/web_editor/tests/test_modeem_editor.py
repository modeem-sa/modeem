# -*- coding: utf-8 -*-
# Part of Modeem. See LICENSE file for full copyright and licensing details.

import modeem.tests

@modeem.tests.tagged("post_install", "-at_install")
class TestModeemEditor(modeem.tests.HttpCase):

    def test_modeem_editor_suite(self):
        self.browser_js('/web_editor/tests', "", "", login='admin', timeout=1800)
