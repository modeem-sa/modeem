# -*- coding: utf-8 -*-
# Part of Modeem. See LICENSE file for full copyright and licensing details.

from modeem import api, models
from modeem.tools import float_utils, format_amount, formatLang
from modeem.tools.misc import format_duration


class ProjectUpdate(models.Model):
    _inherit = 'project.update'

    @api.model
    def _get_template_values(self, project):
        template_values = super(ProjectUpdate, self)._get_template_values(project)
        services = self._get_services_values(project)
        profitability = self._get_profitability_values(project)
        show_sold = template_values['project'].allow_billable and len(services.get('data', [])) > 0
        return {
            **template_values,
            'show_sold': show_sold,
            'show_profitability': bool(profitability),
            'show_activities': template_values['show_activities'] or show_sold or bool(profitability),
            'services': services,
            'profitability': profitability,
            'format_value': lambda value, is_hour: str(round(value, 2)) if not is_hour else format_duration(value),
        }

    @api.model
    def _get_services_values(self, project):
        if not project.allow_billable:
            return {}

        services = []
        total_sold, total_effective, total_remaining = 0, 0, 0
        sols = self.env['sale.order.line'].search(
            project._get_sale_items_domain([
                ('is_downpayment', '=', False),
            ]),
        )
        name_by_sol = dict(sols.with_context(with_price_unit=True).name_get())
        product_uom_unit = self.env.ref('uom.product_uom_unit')
        product_uom_hour = self.env.ref('uom.product_uom_hour')
        company_uom = self.env.company.timesheet_encode_uom_id
        for sol in sols:
            #We only want to consider hours and days for this calculation
            is_unit = sol.product_uom == product_uom_unit
            if sol.product_uom.category_id == company_uom.category_id or is_unit:
                product_uom_qty = sol.product_uom._compute_quantity(sol.product_uom_qty, company_uom, raise_if_failure=False)
                qty_delivered = sol.product_uom._compute_quantity(sol.qty_delivered, company_uom, raise_if_failure=False)
                unit = sol.product_uom if is_unit else company_uom
                services.append({
                    'name': name_by_sol[sol.id],
                    'sold_value': product_uom_qty,
                    'effective_value': qty_delivered,
                    'remaining_value': product_uom_qty - qty_delivered,
                    'unit': unit.name,
                    'is_unit': is_unit,
                    'is_hour': unit == product_uom_hour,
                    'sol': sol,
                })
                if sol.product_uom.category_id == company_uom.category_id:
                    total_sold += product_uom_qty
                    total_effective += qty_delivered
        total_remaining = total_sold - total_effective

        return {
            'data': services,
            'total_sold': total_sold,
            'total_effective': total_effective,
            'total_remaining': total_remaining,
            'company_unit_name': company_uom.name,
            'is_hour': company_uom == product_uom_hour,
        }

    @api.model
    def _get_profitability_values(self, project):
        costs_revenues = project.analytic_account_id and project.allow_billable
        if not (self.user_has_groups('project.group_project_manager') and costs_revenues):
            return {}
        profitability_items = project._get_profitability_items(False)
        costs = sum(profitability_items['costs']['total'].values())
        revenues = sum(profitability_items['revenues']['total'].values())
        margin = revenues + costs
        return {
            'analytic_account_id': project.analytic_account_id,
            'costs': costs,
            'costs_formatted': format_amount(self.env, -costs, project.currency_id),
            'revenues': revenues,
            'revenues_formatted': format_amount(self.env, revenues, project.currency_id),
            'margin': margin,
            'margin_formatted': format_amount(self.env, margin, project.currency_id),
            'margin_percentage': formatLang(self.env,
                                            not float_utils.float_is_zero(costs, precision_digits=2) and (margin / -costs) * 100 or 0.0,
                                            digits=0),
        }
