# Part of Modeem. See LICENSE file for full copyright and licensing details.

from modeem import fields, models


class ProductProduct(models.Model):
    _inherit = "product.product"

    image_fetch_pending = fields.Boolean(
        help="Whether an image must be fetched for this product. Handled by a cron.",
    )
