# -*- coding: utf-8 -*-
# Part of Odoo Module Developed by Bizople Solutions Pvt. Ltd.
# See LICENSE file for full copyright and licensing details.

from modeem import models, fields, api

class ToDoList(models.Model):
    _name = "todo.list"
    _description = "To Do List"
    _order = 'write_date desc, create_date desc'

    def _default_sequence(self):
        return (self.search([], order="sequence desc", limit=1).sequence or 0) + 1

    sequence = fields.Integer('sequence', default=_default_sequence)
    name = fields.Char("Title")
    description = fields.Html('Description')
    # marked_done = fields.Boolean("Done?")
    user_id = fields.Many2one('res.users', string="User")
    create_date = fields.Datetime(string="Created on")
    write_date = fields.Datetime("Last Updated On", index=True)
    note_color_pallet = fields.Selection([
		('pallet_1', 'Pallet 1'),
		('pallet_2', 'Pallet 2'),
		('pallet_3', 'Pallet 3'),
		('pallet_4', 'Pallet 4'),
		('pallet_5', 'Pallet 5'),
		('pallet_6', 'Pallet 6'),
		('pallet_7', 'Pallet 7'),
	],default="pallet_1", string="Notes Color Pallets", required=True)