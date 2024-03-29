# -*- coding: utf-8 -*-
# Part of Modeem. See LICENSE file for full copyright and licensing details.

from modeem import api, fields, models
from modeem.osv import expression

class City(models.Model):
    _name = 'res.city'
    _description = 'City'
    _order = 'name'
    _rec_names_search = ['name', 'zipcode']

    name = fields.Char("Name", required=True, translate=True)
    zipcode = fields.Char("Zip")
    country_id = fields.Many2one(comodel_name='res.country', string='Country', required=True)
    state_id = fields.Many2one(comodel_name='res.country.state', string='State', domain="[('country_id', '=', country_id)]")

    def name_get(self):
        res = []
        for city in self:
            name = city.name if not city.zipcode else '%s (%s)' % (city.name, city.zipcode)
            res.append((city.id, name))
        return res
