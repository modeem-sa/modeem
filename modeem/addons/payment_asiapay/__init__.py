# Part of Modeem. See LICENSE file for full copyright and licensing details.

from . import controllers
from . import models

from modeem.addons.payment import setup_provider, reset_payment_provider


def post_init_hook(cr, registry):
    setup_provider(cr, registry, 'asiapay')


def uninstall_hook(cr, registry):
    reset_payment_provider(cr, registry, 'asiapay')
