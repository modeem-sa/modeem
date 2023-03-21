# -*- coding: utf-8 -*-
# Part of Modeem. See LICENSE file for full copyright and licensing details.

import modeem
from modeem.tests import HttpCase

@modeem.tests.tagged('-at_install', 'post_install')
class TestImLivechatSupportPage(HttpCase):
    def test_load_modules(self):
        """Checks that all javascript modules load correctly on the livechat support page"""
        check_js_modules = """
            const { missing, failed, unloaded } = modeem.__DEBUG__.jsModules;
            if ([missing, failed, unloaded].some(arr => arr.length)) {
                console.error("Couldn't load all JS modules.", JSON.stringify({ missing, failed, unloaded }));
            } else {
                console.log("test successful");
            }
        """
        self.browser_js("/im_livechat/support/1", code=check_js_modules, ready="modeem.__DEBUG__.didLogInfo")
