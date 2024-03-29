# -*- coding: utf-8 -*-
# Part of Modeem. See LICENSE file for full copyright and licensing details.

from modeem import http
from modeem.http import request


class WebsiteLivechatChatbotScriptController(http.Controller):
    @http.route('/chatbot/<model("chatbot.script"):chatbot_script>/test',
        type="http", auth="user", website=True)
    def chatbot_test_script(self, chatbot_script):
        """ Custom route allowing to test a chatbot script.
        As we don't have a im_livechat.channel linked to it, we pre-emptively create a mail.channel
        that will hold the conversation between the bot and the user testing the script. """

        mail_channel_values = {
            'channel_member_ids': [(0, 0, {
                'partner_id': chatbot_script.operator_partner_id.id,
                'is_pinned': False
            }, {
                'partner_id': request.env.user.partner_id.id
            })],
            'livechat_active': True,
            'livechat_operator_id': chatbot_script.operator_partner_id.id,
            'chatbot_current_step_id': chatbot_script._get_welcome_steps()[-1].id,
            'anonymous_name': False,
            'channel_type': 'livechat',
            'name': chatbot_script.title,
        }

        visitor_sudo = request.env['website.visitor']._get_visitor_from_request()
        if visitor_sudo:
            mail_channel_values['livechat_visitor_id'] = visitor_sudo.id

        mail_channel = request.env['mail.channel'].create(mail_channel_values)

        return request.render("im_livechat.chatbot_test_script_page", {
            'server_url': chatbot_script.get_base_url(),
            'channel_data': mail_channel.channel_info()[0],
            'chatbot_data': chatbot_script._format_for_frontend()
        })
