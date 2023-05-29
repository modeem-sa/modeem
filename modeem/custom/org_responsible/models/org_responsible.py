import base64

from modeem import fields, models


class OrgResponsible(models.Model):
    _name = "org.responsible"
    _rec_name = "name"
    _inherit = ['mail.thread', 'mail.activity.mixin']

    name = fields.Char(string="Name")
    customer_id = fields.Many2one("res.users", string="Customer ID")
    state = fields.Selection([("draft", "Draft"), ("escalation", "Escalation"), ("rejected", "Rejected")],
                             default="draft")
    # name_seq = fields.Char(string="Name Seq")
    priority = fields.Selection([("0", "Very Low"), ("1", "Very Low"), ("2", "Very Low"), ("3", "Very Low"),
                                ("4", "Very Low")])
    description = fields.Text(string="Description")
    customer_name = fields.Char(string="Customer Name")
    customer_email = fields.Char(string="Customer Name")
    customer_phone = fields.Char(string="Customer Phone")
    responsible_org = fields.Char(string="Organization")

    attachment = fields.Binary(string="Attachment")

    def escalate(self):
        escalate_ticket_id = self.env["help.ticket"].sudo().create({
            "subject": self.name,
            "description": self.description,
            "email": self.customer_email,
            "phone": self.customer_phone,
            "priority": self.priority,
            "org_responsible_id": self._origin.id,
        })
        help_ticket_id = self.env["help.ticket"].search([("id", "=", escalate_ticket_id.id)])
        help_ticket_id.message_post(attachments=[('filename', base64.urlsafe_b64decode(self.attachment))])
        if self.attachment:
            self.write({'attachment': None})
        self.state = "escalation"

    def reject(self):
        if self.attachment:
            self.write({'attachment': None})
        self.state = "rejected"
