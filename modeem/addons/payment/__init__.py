# Part of Modeem. See LICENSE file for full copyright and licensing details.

from . import controllers
from . import models
from . import utils
from . import wizards

from modeem import api, SUPERUSER_ID


def setup_provider(cr, registry, code):
    env = api.Environment(cr, SUPERUSER_ID, {})
    env['payment.provider']._setup_provider(code)


def reset_payment_provider(cr, registry, code):
    env = api.Environment(cr, SUPERUSER_ID, {})
    env['payment.provider']._remove_provider(code)
