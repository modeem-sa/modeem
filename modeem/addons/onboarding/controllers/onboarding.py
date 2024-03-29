# -*- coding: utf-8 -*-
# Part of Modeem. See LICENSE file for full copyright and licensing details.

from modeem import http
from modeem.http import request


class OnboardingController(http.Controller):
    @http.route('/onboarding/<string:route_name>', auth='user', type='json')
    def get_onboarding_data(self, route_name=None):
        if not request.env.user.has_group('base.group_system'):
            return {}

        onboarding = request.env['onboarding.onboarding'].search([('route_name', '=', route_name)])
        if onboarding and not onboarding._search_or_create_progress().is_onboarding_closed:
            # JS implementation of the onboarding panel expects this data structure
            return {
                'html': request.env['ir.qweb']._render(
                    'onboarding.onboarding_panel', onboarding._prepare_rendering_values())
            }

        return {}
