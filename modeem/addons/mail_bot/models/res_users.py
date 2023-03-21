# -*- coding: utf-8 -*-
# Part of Modeem. See LICENSE file for full copyright and licensing details.

from modeem import models, fields, _

class Users(models.Model):
    _inherit = 'res.users'

    modeembot_state = fields.Selection(
        [
            ('not_initialized', 'Not initialized'),
            ('onboarding_emoji', 'Onboarding emoji'),
            ('onboarding_attachement', 'Onboarding attachment'),
            ('onboarding_command', 'Onboarding command'),
            ('onboarding_ping', 'Onboarding ping'),
            ('idle', 'Idle'),
            ('disabled', 'Disabled'),
        ], string="ModeemBot Status", readonly=True, required=False)  # keep track of the state: correspond to the code of the last message sent
    modeembot_failed = fields.Boolean(readonly=True)

    @property
    def SELF_READABLE_FIELDS(self):
        return super().SELF_READABLE_FIELDS + ['modeembot_state']

    def _init_messaging(self):
        if self.modeembot_state in [False, 'not_initialized'] and self._is_internal():
            self._init_modeembot()
        return super()._init_messaging()

    def _init_modeembot(self):
        self.ensure_one()
        modeembot_id = self.env['ir.model.data']._xmlid_to_res_id("base.partner_root")
        channel_info = self.env['mail.channel'].channel_get([modeembot_id, self.partner_id.id])
        channel = self.env['mail.channel'].browse(channel_info['id'])
        message = _("Hello,<br/>Modeem's chat helps employees collaborate efficiently. I'm here to help you discover its features.<br/><b>Try to send me an emoji</b> <span class=\"o_modeembot_command\">:)</span>")
        channel.sudo().message_post(body=message, author_id=modeembot_id, message_type="comment", subtype_xmlid="mail.mt_comment")
        self.sudo().modeembot_state = 'onboarding_emoji'
        return channel
