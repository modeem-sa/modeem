# Part of Modeem. See LICENSE file for full copyright and licensing details.

from unittest.mock import patch

from modeem.tests import tagged
from modeem.tools import mute_logger

from modeem.addons.payment.tests.http_common import PaymentHttpCommon
from modeem.addons.payment_stripe.controllers.main import StripeController
from modeem.addons.payment_stripe.tests.common import StripeCommon


@tagged('post_install', '-at_install')
class TestRefundFlows(StripeCommon, PaymentHttpCommon):

    @mute_logger('modeem.addons.payment_stripe.models.payment_transaction')
    def test_refund_id_is_set_as_provider_reference(self):
        """ Test that the id of the refund object is set as the provider reference of the refund
        transaction. """
        source_tx = self._create_transaction('redirect', state='done')
        with patch(
            'modeem.addons.payment_stripe.models.payment_provider.PaymentProvider'
            '._stripe_make_request', return_value=self.refund_object
        ):
            source_tx._send_refund_request()
        refund_tx = self.env['payment.transaction'].search(
            [('source_transaction_id', '=', source_tx.id)]
        )
        self.assertEqual(refund_tx.provider_reference, self.refund_object['id'])

    @mute_logger(
        'modeem.addons.payment_stripe.controllers.main',
        'modeem.addons.payment_stripe.models.payment_transaction',
    )
    def test_canceled_refund_webhook_notification_triggers_processing(self):
        """ Test that receiving a webhook notification for a refund cancellation
        (`charge.refund.updated` event) triggers the processing of the notification data. """
        source_tx = self._create_transaction('redirect', state='done')
        source_tx._create_refund_transaction(
            amount_to_refund=source_tx.amount, provider_reference=self.refund_object['id']
        )
        url = self._build_url(StripeController._webhook_url)
        with patch(
            'modeem.addons.payment_stripe.controllers.main.StripeController'
            '._verify_notification_signature'
        ), patch(
            'modeem.addons.payment.models.payment_transaction.PaymentTransaction'
            '._handle_notification_data'
        ) as handle_notification_data_mock:
            self._make_json_request(url, data=self.canceled_refund_notification_data)
        self.assertEqual(handle_notification_data_mock.call_count, 1)
