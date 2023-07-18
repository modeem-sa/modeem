# -*- coding: utf-8 -*-
# See LICENSE file for full copyright and licensing details.
# Developed by Bizople Solutions Pvt. Ltd.

from modeem.modules.module import get_resource_path
from modeem import api, fields, models, tools, _
from modeem.exceptions import UserError
import base64

class BackendConfig(models.Model):
	_name = 'backend.config'
	_description = "Configurator Backend Theme"

	def _default_app_drawer_bg_image(self):
		image_path = get_resource_path(
			'spiffy_theme_backend', 'static/description', 'app-drawer-bg-image.png')
		with tools.file_open(image_path, 'rb') as f:
			return base64.b64encode(f.read())

	use_custom_colors = fields.Boolean(string="Use Custom Colors")
	use_custom_drawer_color = fields.Boolean(string="Use Custom Drawer Colors")

	tree_form_split_view = fields.Boolean(string="Tree Form Split View")

	color_pallet = fields.Selection([
		('pallet_1', 'Color Pallet 1'),
		('pallet_2', 'Color Pallet 2'),
		('pallet_3', 'Color Pallet 3'),
		('pallet_4', 'Color Pallet 4'),
		('pallet_5', 'Color Pallet 5'),
		('pallet_6', 'Color Pallet 6'),
		('pallet_7', 'Color Pallet 7'),
		('pallet_8', 'Color Pallet 8'),
		('pallet_9', 'Color Pallet 9'),
	],default="pallet_9", string="Color Pallets")

	drawer_color_pallet = fields.Selection([
		('drawer_pallet_1', 'Color Pallet 1'),
		('drawer_pallet_2', 'Color Pallet 2'),
		('drawer_pallet_3', 'Color Pallet 3'),
		('drawer_pallet_4', 'Color Pallet 4'),
		('drawer_pallet_5', 'Color Pallet 5'),
		('drawer_pallet_6', 'Color Pallet 6'),
		('drawer_pallet_7', 'Color Pallet 7'),
		('drawer_pallet_8', 'Color Pallet 8'),
		('drawer_pallet_9', 'Color Pallet 9'),
	],default="drawer_pallet_9", string="Drawer Color Pallets")

	appdrawer_custom_bg_color = fields.Char(string="App Drawer Custom Background Color",default="#0097a7")
	appdrawer_custom_text_color = fields.Char(string="App Drawer Custom Text Color",default="#ffffff")

	light_primary_bg_color = fields.Char(string="Primary Background Color for light",default="#0097a7")
	light_primary_text_color = fields.Char(string="Primary Text Color for light",default="#ffffff")

	apply_light_bg_img = fields.Boolean(string="Apply light bg image")
	light_bg_image = fields.Binary(string="Background Image For light", default=_default_app_drawer_bg_image, readonly=False)

	dark_primary_bg_color = fields.Char(string="Primary Background Color for dark",default="#0097a7")
	dark_primary_text_color = fields.Char(string="Primary Text Color for dark",default="#ffffff")

	dark_secondry_bg_color = fields.Char(string="Secondry Background Color for dark",default="#242424")
	dark_secondry_text_color = fields.Char(string="Secondry Text Color for dark",default="#ffffff")

	dark_body_bg_color = fields.Char(string="Body Background Color for dark",default="#1d1d1d")
	dark_body_text_color = fields.Char(string="Body Text Color for dark",default="#ffffff")

	separator = fields.Selection([
		('separator_style_1', 'Separator Style 1'),
		('separator_style_2', 'Separator Style 2'),
		('separator_style_3', 'Separator Style 3'),
		('separator_style_4', 'Separator Style 4')],
		default="separator_style_2", string="Separator Styles")

	tab = fields.Selection([
		('tab_style_1', 'Tab Style 1'),
		('tab_style_2', 'Tab Style 2'),
		('tab_style_3', 'Tab Style 3'),
		('tab_style_4', 'Tab Style 4')],
		default="tab_style_1", string="Tab Styles")

	checkbox = fields.Selection([
		('checkbox_style_1', 'Checkbox Style 1'),
		('checkbox_style_2', 'Checkbox Style 2'),
		('checkbox_style_3', 'Checkbox Style 3'),
		('checkbox_style_4', 'Checkbox Style 4')],
		default="checkbox_style_4", string="Checkbox Styles")

	radio = fields.Selection([
		('radio_style_1', 'Radio Style 1'),
		('radio_style_2', 'Radio Style 2'),
		('radio_style_3', 'Radio Style 3'),
		('radio_style_4', 'Radio Style 4')],
		default="radio_style_1", string="Radio Styles")

	popup = fields.Selection([
		('popup_style_1', 'popup Style 1'),
		('popup_style_2', 'popup Style 2'),
		('popup_style_3', 'popup Style 3'),
		('popup_style_4', 'popup Style 4')],
		default="popup_style_2", string="popup Styles")
	
	chatter_position = fields.Selection([
		('chatter_right', 'Chatter Right'),
		('chatter_bottom', 'Chatter Bottom')],
		default="chatter_right", string="Chatter Position")
	
	top_menu_position = fields.Selection([
		('top_menu_horizontal', 'Top Menu Horizontal'),
		('top_menu_vertical', 'Top Menu Vertical')],
		default="top_menu_vertical", string="Top Menu Position")

	theme_style = fields.Selection([
		('biz_theme_rounded', 'Rounded Theme'),
		('biz_theme_standard', 'Standard Theme'),
		('biz_theme_square', 'Square Theme')],
		default="biz_theme_rounded", string="Theme Style")
	
	attachment_in_tree_view = fields.Boolean(string="Show Attachement in tree view")

	font_size = fields.Selection([
		('font_small', 'Font Small'),
		('font_medium', 'Font Medium'),
		('font_large', 'Font large')],
		default="font_medium", string="Font size")

	loader_style = fields.Selection([
		('loader_style_1', 'Loader Style 1'),
		('loader_style_2', 'Loader Style 2'),
		('loader_style_3', 'Loader Style 3'),
		('loader_style_4', 'Loader Style 4'),
		('loader_style_5', 'Loader Style 5'),
		('loader_style_6', 'Loader Style 6'),
		('loader_style_7', 'Loader Style 7'),
		('loader_style_8', 'Loader Style 8'),
		('loader_style_9', 'Loader Style 9'),
		('loader_style_10', 'Loader Style 10'),],
		default="loader_style_10", string="Loader Styles")
	
	font_family = fields.Selection([
		('lato', 'Lato'),
		('montserrat', 'Montserrat'),
		('open_sans', 'Open Sans'),
		('oswald', 'Oswald'),
		('raleway', 'Raleway'),
		('roboto', 'Roboto'),
		('poppins', 'Poppins'),
		('rubik', 'Rubik'),
		('inter', 'Inter'),
		('josefin_sans', 'Josefin Sans'),
		('varela_round', 'Varela Round'),
		('manrope', 'Manrope'),
		('Nunito_Sans', 'Nunito Sans')],
		default="rubik", string="Font Family")

	list_view_density = fields.Selection([
		('list_comfortable', 'Comfortable'),
		('list_compact', 'Compact'),],
		default="list_comfortable", string="List View Density")

	list_view_sticky_header = fields.Boolean(string="List view Sticky Header")
