# Part of Modeem. See LICENSE file for full copyright and licensing details.
# Original Copyright 2015 Eezee-It, modified and maintained by Modeem.

from hashlib import sha256

from modeem import api, fields, models

from .const import SUPPORTED_CURRENCIES


class PaymentProvider(models.Model):
    _inherit = 'payment.provider'

    code = fields.Selection(
        selection_add=[('sips', "Sips")], ondelete={'sips': 'set default'})
    sips_merchant_id = fields.Char(
        string="Merchant ID", help="The ID solely used to identify the merchant account with Sips",
        required_if_provider='sips')
    sips_secret = fields.Char(
        string="SIPS Secret Key", size=64, required_if_provider='sips', groups='base.group_system')
    sips_key_version = fields.Integer(
        string="Secret Key Version", required_if_provider='sips', default=2)
    sips_test_url = fields.Char(
        string="Test URL", required_if_provider='sips',
        default="https://payment-webinit.simu.sips-services.com/paymentInit")
    sips_prod_url = fields.Char(
        string="Production URL", required_if_provider='sips',
        default="https://payment-webinit.sips-services.com/paymentInit")
    sips_version = fields.Char(
        string="Interface Version", required_if_provider='sips', default="HP_2.31")

    @api.model
    def _get_compatible_providers(self, *args, currency_id=None, **kwargs):
        """ Override of payment to unlist Sips providers when the currency is not supported. """
        providers = super()._get_compatible_providers(*args, currency_id=currency_id, **kwargs)

        currency = self.env['res.currency'].browse(currency_id).exists()
        if currency and currency.name not in SUPPORTED_CURRENCIES:
            providers = providers.filtered(lambda p: p.code != 'sips')

        return providers

    def _sips_generate_shasign(self, data):
        """ Generate the shasign for incoming or outgoing communications.

        Note: self.ensure_one()

        :param str data: The data to use to generate the shasign
        :return: shasign
        :rtype: str
        """
        self.ensure_one()

        key = self.sips_secret
        shasign = sha256((data + key).encode('utf-8'))
        return shasign.hexdigest()
