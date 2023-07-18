# -*- coding: utf-8 -*-
# See LICENSE file for full copyright and licensing details.
# Developed by Bizople Solutions Pvt. Ltd.

import base64
from modeem import api, http, fields, models, tools
from modeem.http import request
from modeem.modules.module import get_resource_path
from modeem.tools.translate import _

class Company(models.Model):
    _inherit = 'res.company'

    tab_name = fields.Char(string="Backend Tab Name", default="Spiffy", readonly=False)
    backend_theme_level = fields.Selection([
        ('user_level', 'User Level'),
        ('global_level', 'Global Level')],
        default="user_level", required=True, string="Backend Theme Level", readonly=False)
    
    login_page_style = fields.Selection([
		('login_style_1', 'Login Style 1'),
		('login_style_2', 'Login Style 2'),
		('login_style_3', 'Login Style 3'),
		('login_style_4', 'Login Style 4')],
		default="login_style_1", required=True, string="Login Styles", readonly=False)
    
    login_page_background_img = fields.Binary('Login Background Image', readonly=False, store=True)
    login_page_background_color = fields.Char('Login Background Color', default="#f2f6ff", readonly=False)
    login_page_text_color = fields.Char('Login Text Color', default="#777777", readonly=False)
    show_bg_image = fields.Boolean(string='Add Login Background Image', readonly=False)

    def get_login_page_data(self):
        admin_users = request.env['res.users'].sudo().search([
            ('groups_id','in',request.env.ref('base.user_admin').id),
            ('backend_theme_config','!=',False),
        ], order="id asc", limit=1)
        admin_config = False
        if admin_users:
            admin_config = admin_users.backend_theme_config

        if admin_config:
            config_vals = admin_config
        else:
            config_vals = request.env['backend.config'].sudo().search([], order="id asc", limit=1)
        
        values = {
            'config_vals': config_vals,
        }
        return values

    backend_menubar_logo = fields.Binary(
        string="Menubar Logo",  readonly=False)
    backend_menubar_logo_icon = fields.Binary(
        string="Menubar Logo Icon",  readonly=False)

    enable_pwa = fields.Boolean(string='Enable PWA', readonly=False)
    app_name_pwa = fields.Char('App Name', readonly=False, default='Spiffy')
    short_name_pwa = fields.Char('Short Name', readonly=False, default='Spiffy')
    description_pwa = fields.Char('App Description', readonly=False, default='Spiffy')
    image_192_pwa = fields.Binary('Image 192px', readonly=False, store=True)
    image_512_pwa = fields.Binary('Image 512px', readonly=False, store=True)
    start_url_pwa = fields.Char('App Start Url', readonly=False, default='/web')
    background_color_pwa = fields.Char('Background Color', readonly=False, default='#0097a7')
    theme_color_pwa = fields.Char('Theme Color', readonly=False, default='#0097a7')
    pwa_shortcuts_ids = fields.Many2many('pwa.shortcuts', string='PWA Shortcuts')

    spiffy_toobar_color = fields.Char('Toolbar Color', readonly=False, default='#0097a7')
    prevent_auto_save = fields.Boolean(string='Prevent Auto Save', readonly=False)
    
    prevent_auto_save_warning = fields.Char('Auto Save Warning', translate=True, default="Autosave is disabled, Click on save button.", readonly=False)
