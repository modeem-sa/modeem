from modeem import models, fields, api
from modeem.exceptions import ValidationError


class AddOrgResID(models.Model):
    _inherit = "help.ticket"

    # We need this id so whenever the state changed in help.ticket model there will be a message or notification
    # to the responsible because we can't give them an access to helpdesk
    org_responsible_id = fields.Many2one("org.responsible", string="Organization Responsible ID")

    @api.onchange('stage_id')
    def notify_org_res_state(self):
        org_responsible_record_id = self.env["org.responsible"].search([("id", "=", self.org_responsible_id.id)])
        org_responsible_record_id.message_post(body=f"The state has been changed to {self.stage_id.name}")
        print("Ok Working ##########")
