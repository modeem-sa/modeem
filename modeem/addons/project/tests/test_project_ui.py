# Part of Modeem. See LICENSE file for full copyright and licensing details.

import modeem.tests


@modeem.tests.tagged('post_install', '-at_install')
class TestUi(modeem.tests.HttpCase):

    def test_01_project_tour(self):
        self.start_tour("/web", 'project_tour', login="admin")
