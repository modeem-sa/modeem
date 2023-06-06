from modeem import models, fields, api

class ModeemOrganizations(models.Model):
    _name = "modeem.organizations"
    _inherit = ['mail.thread', 'mail.activity.mixin']

    name = fields.Char(string="Organization Name")
    org_responsible = fields.Many2one("res.users", string="Organization responsible")

    def _creation_message(self):
        return "New organization has been created"
