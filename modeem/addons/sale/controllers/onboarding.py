# -*- coding: utf-8 -*-
# Part of Modeem. See LICENSE file for full copyright and licensing details.

from modeem import http
from modeem.http import request


class OnboardingController(http.Controller):

    @http.route('/sales/sale_quotation_onboarding_panel', auth='user', type='json')
    def sale_quotation_onboarding(self):
        """ Returns the `banner` for the sale onboarding panel.
            It can be empty if the user has closed it or if he doesn't have
            the permission to see it. """

        company = request.env.company
        if not request.env.is_admin() or \
           company.sale_quotation_onboarding_state == 'closed':
            return {}

        return {
            'html': request.env['ir.qweb']._render('sale.sale_quotation_onboarding_panel', {
                'company': company,
                'state': company.get_and_update_sale_quotation_onboarding_state()
            })
        }
