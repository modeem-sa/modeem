# -*- coding: utf-8 -*-
# Part of Modeem. See LICENSE file for full copyright and licensing details.

from modeem.addons.website.tests.test_performance import UtilPerf


class TestPerformance(UtilPerf):
    def test_10_perf_sql_website_controller_minimalist(self):
        url = '/empty_controller_test'
        self.assertEqual(self._get_url_hot_query(url), 1)
        self.assertEqual(self._get_url_hot_query(url, cache=False), 1)
