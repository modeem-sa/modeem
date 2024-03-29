# -*- coding: utf-8 -*-
# Part of Modeem. See LICENSE file for full copyright and licensing details.

from unittest.mock import patch

from modeem.exceptions import UserError
from modeem.addons.payment.tests.common import PaymentCommon
from modeem.addons.website_sale_delivery.controllers.main import WebsiteSaleDelivery
from modeem.addons.website.tools import MockRequest
from modeem.tests import tagged

@tagged('post_install', '-at_install')
class TestWebsiteSaleDeliveryController(PaymentCommon):
    def setUp(self):
        super().setUp()
        self.website = self.env.ref('website.default_website')
        self.Controller = WebsiteSaleDelivery()

    # test that changing the carrier while there is a pending transaction raises an error
    def test_controller_change_carrier_when_transaction(self):
        with MockRequest(self.env, website=self.website):
            order = self.website.sale_get_order(force_create=True)
            order.transaction_ids = self._create_transaction(flow='redirect', state='pending')
            with self.assertRaises(UserError):
                with patch(
                    'modeem.addons.website_sale.models.website.Website.sale_get_order',
                    return_value=order,
                ):  # Patch to retrieve the order even if it is linked to a pending transaction.
                    self.Controller.update_eshop_carrier(carrier_id=1)

    # test that changing the carrier while there is a draft transaction doesn't raise an error
    def test_controller_change_carrier_when_draft_transaction(self):
        with MockRequest(self.env, website=self.website):
            order = self.website.sale_get_order(force_create=True)
            order.transaction_ids = self._create_transaction(flow='redirect', state='draft')
            self.Controller.update_eshop_carrier(carrier_id=1)
