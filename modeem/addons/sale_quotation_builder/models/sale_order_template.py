# -*- coding: utf-8 -*-
# Part of Modeem. See LICENSE file for full copyright and licensing details.

from modeem import fields, models
from modeem.tools.translate import html_translate


class SaleOrderTemplate(models.Model):
    _inherit = 'sale.order.template'

    website_description = fields.Html(
        string="Website Description",
        translate=html_translate,
        sanitize_overridable=True,
        sanitize_attributes=False,
        sanitize_form=False)

    def action_open_template(self):
        self.ensure_one()
        return {
            'type': 'ir.actions.act_url',
            'target': 'self',
            'url': '/@/sale_quotation_builder/template/%d' % self.id
        }
