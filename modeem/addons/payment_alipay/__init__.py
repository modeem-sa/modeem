# Part of Modeem. See LICENSE file for full copyright and licensing details.

from . import controllers
from . import models

from modeem.exceptions import UserError
from modeem.tools import config

from modeem.addons.payment import setup_provider, reset_payment_provider


def pre_init_hook(cr):
    if not any(config.get(key) for key in ('init', 'update')):
        raise UserError(
            "This module is deprecated and cannot be installed. "
            "Consider installing the Payment Provider: AsiaPay module instead.")


def post_init_hook(cr, registry):
    setup_provider(cr, registry, 'alipay')


def uninstall_hook(cr, registry):
    reset_payment_provider(cr, registry, 'alipay')
