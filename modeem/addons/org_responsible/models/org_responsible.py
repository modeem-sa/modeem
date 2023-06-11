import base64

from modeem import fields, models, api, _
from modeem.exceptions import ValidationError


class OrgResponsible(models.Model):
    _name = "org.responsible"
    _rec_name = "ref"
    _inherit = ['mail.thread', 'mail.activity.mixin']

    name = fields.Char(string="Name")
    state = fields.Selection([("draft", "Draft"), ("escalation", "Escalation"), ("rejected", "Rejected"),
                              ("done", "Done")],
                             default="draft")
    organization = fields.Many2one("modeem.organizations", string="Organization")
    organization_system_type = fields.Selection([("education", "Education"), ("erp", "ERP"), ("training", "Training"),
                                                 ("teacher_app", "Teacher App"), ("halaqat", "Halaqat")])
    # name_seq = fields.Char(string="Name Seq")
    priority = fields.Selection([("0", "Very Low"), ("1", "Low"), ("2", "Normal"), ("3", "High"),
                                ("4", "Very High")])
    description = fields.Text(string="Description")
    customer_name = fields.Char(string="Customer Name")
    customer_email = fields.Char(string="Customer Email")
    customer_phone = fields.Char(string="Customer Phone")

    responsible_org = fields.Many2one("res.users", string="Organization Responsible User")
    ref = fields.Char(string="Reference", default=lambda self: _("new"))
    attachment = fields.Binary(string="Attachment")

    @api.model_create_multi
    def create(self, vals_list):
        for vals in vals_list:
            vals['ref'] = self.env['ir.sequence'].next_by_code('org.responsible')
            return super(OrgResponsible, self).create(vals_list)

    def _creation_message(self):
        return "New Ticket Created"

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
        if self.attachment:
            help_ticket_id.message_post(attachments=[('filename', base64.urlsafe_b64decode(self.attachment))])
            self.write({'attachment': None})
        self.state = "escalation"
        self.message_post(body=f"Your Ticket has been escalated to modeem IT Team, Your ticket REF:  {escalate_ticket_id.name}")
        escalate_ticket_id.message_post(body="This is the record for orginal ticket", attachment_ids=[self._origin.id.id])

    def reject(self):
        if self.attachment:
            self.write({'attachment': None})
        self.state = "rejected"

    def set_to_draft(self):
        if self.state == "escalation":
            raise ValidationError("State in ( Escalate ) you can't reset it")
        self.state = "draft"

    # ---------------------------- Constrains functions -----------------------------
    @api.constrains('organization', 'responsible_org')
    def org_info_no_change(self):
        if not self.env.user.has_group("org_responsible.org_responsible_admin"):
            raise ValidationError("You don't have permission to change this field")
