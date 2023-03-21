# Part of Modeem. See LICENSE file for full copyright and licensing details.

from unittest.mock import patch

from werkzeug.exceptions import Forbidden

from modeem.tests import tagged
from modeem.tools import mute_logger

from modeem.addons.payment.tests.http_common import PaymentHttpCommon
from modeem.addons.payment_razorpay.controllers.main import RazorpayController
from modeem.addons.payment_razorpay.tests.common import RazorpayCommon


@tagged('post_install', '-at_install')
class TestProcessingFlows(RazorpayCommon, PaymentHttpCommon):

    @mute_logger('modeem.addons.payment_razorpay.controllers.main')
    def test_redirect_notification_triggers_processing(self):
        """ Test that receiving a redirect notification triggers the processing of the notification
        data. """
        self._create_transaction('redirect')
        url = self._build_url(f'{RazorpayController._return_url}?reference={self.reference}')
        with patch(
            'modeem.addons.payment_razorpay.controllers.main.RazorpayController'
            '._verify_notification_signature'
        ), patch(
            'modeem.addons.payment.models.payment_transaction.PaymentTransaction'
            '._handle_notification_data'
        ) as handle_notification_data_mock:
            self._make_http_post_request(url, data=self.redirect_notification_data)
        self.assertEqual(handle_notification_data_mock.call_count, 1)

    @mute_logger('modeem.addons.payment_razorpay.controllers.main')
    def test_webhook_notification_triggers_processing(self):
        """ Test that receiving a valid webhook notification triggers the processing of the
        notification data. """
        self._create_transaction('direct')
        url = self._build_url(RazorpayController._webhook_url)
        with patch(
            'modeem.addons.payment_razorpay.controllers.main.RazorpayController.'
            '_verify_notification_signature'
        ), patch(
            'modeem.addons.payment.models.payment_transaction.PaymentTransaction'
            '._handle_notification_data'
        ) as handle_notification_data_mock:
            self._make_json_request(url, data=self.webhook_notification_data)
        self.assertEqual(handle_notification_data_mock.call_count, 1)

    @mute_logger('modeem.addons.payment_razorpay.controllers.main')
    def test_redirect_notification_triggers_signature_check(self):
        """ Test that receiving a redirect notification triggers a signature check. """
        self._create_transaction('redirect')
        url = self._build_url(f'{RazorpayController._return_url}?reference={self.reference}')
        with patch(
            'modeem.addons.payment_razorpay.controllers.main.RazorpayController'
            '._verify_notification_signature'
        ) as signature_check_mock, patch(
            'modeem.addons.payment.models.payment_transaction.PaymentTransaction'
            '._handle_notification_data'
        ):
            self._make_http_post_request(url, data=self.redirect_notification_data)
            self.assertEqual(signature_check_mock.call_count, 1)

    @mute_logger('modeem.addons.payment_razorpay.controllers.main')
    def test_webhook_notification_triggers_signature_check(self):
        """ Test that receiving a webhook notification triggers a signature check. """
        self._create_transaction('redirect')
        url = self._build_url(RazorpayController._webhook_url)
        with patch(
            'modeem.addons.payment_razorpay.controllers.main.RazorpayController'
            '._verify_notification_signature'
        ) as signature_check_mock, patch(
            'modeem.addons.payment.models.payment_transaction.PaymentTransaction'
            '._handle_notification_data'
        ):
            self._make_json_request(url, data=self.webhook_notification_data)
            self.assertEqual(signature_check_mock.call_count, 1)

    def test_accept_webhook_notification_with_valid_signature(self):
        """ Test the verification of a webhook notification with a valid signature. """
        tx = self._create_transaction('redirect')
        with patch(
            'modeem.addons.payment_razorpay.models.payment_provider.PaymentProvider'
            '._razorpay_calculate_signature', return_value='valid_signature'
        ):
            self._assert_does_not_raise(
                Forbidden,
                RazorpayController._verify_notification_signature,
                self.webhook_notification_data,
                'valid_signature',
                tx,
                is_redirect=False,
            )

    @mute_logger('modeem.addons.payment_razorpay.controllers.main')
    def test_reject_notification_with_missing_signature(self):
        """ Test the verification of a notification with a missing signature. """
        tx = self._create_transaction('redirect')
        self.assertRaises(
            Forbidden,
            RazorpayController._verify_notification_signature,
            self.webhook_notification_data,
            None,
            tx,
        )

    @mute_logger('modeem.addons.payment_razorpay.controllers.main')
    def test_reject_notification_with_invalid_signature(self):
        """ Test the verification of a notification with an invalid signature. """
        tx = self._create_transaction('redirect')
        with patch(
            'modeem.addons.payment_razorpay.models.payment_provider.PaymentProvider'
            '._razorpay_calculate_signature', return_value='valid_signature'
        ):
            self.assertRaises(
                Forbidden,
                RazorpayController._verify_notification_signature,
                self.webhook_notification_data,
                'bad_signature',
                tx,
            )
