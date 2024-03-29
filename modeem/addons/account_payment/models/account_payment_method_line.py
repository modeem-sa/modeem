# -*- coding: utf-8 -*-
# Part of Modeem. See LICENSE file for full copyright and licensing details.

from modeem import api, fields, models, _
from modeem.osv import expression


class AccountPaymentMethodLine(models.Model):
    _inherit = "account.payment.method.line"

    payment_provider_id = fields.Many2one(
        comodel_name='payment.provider',
        compute='_compute_payment_provider_id',
        store=True
    )
    payment_provider_state = fields.Selection(
        related='payment_provider_id.state'
    )

    @api.depends('payment_method_id')
    def _compute_payment_provider_id(self):
        providers = self.env['payment.provider'].sudo().search([
            ('code', 'in', self.mapped('code')),
            ('company_id', 'in', self.journal_id.company_id.ids),
        ])

        # Make sure to pick the active provider, if any.
        providers_map = dict()
        for provider in providers:
            current_value = providers_map.get((provider.code, provider.company_id), False)
            if current_value and current_value.state != 'disabled':
                continue

            providers_map[(provider.code, provider.company_id)] = provider

        for line in self:
            code = line.payment_method_id.code
            company = line.journal_id.company_id
            line.payment_provider_id = providers_map.get((code, company), False)

    @api.model
    def _get_payment_method_domain(self, code):
        # OVERRIDE
        domain = super()._get_payment_method_domain(code)
        information = self._get_payment_method_information().get(code)

        unique = information.get('mode') == 'unique'
        if unique:
            company_ids = self.env['payment.provider'].sudo().search([('code', '=', code)]).mapped('company_id')
            if company_ids:
                domain = expression.AND([domain, [('company_id', 'in', company_ids.ids)]])

        return domain

    def action_open_provider_form(self):
        self.ensure_one()
        return {
            'type': 'ir.actions.act_window',
            'name': _('Provider'),
            'view_mode': 'form',
            'res_model': 'payment.provider',
            'target': 'current',
            'res_id': self.payment_provider_id.id
        }
