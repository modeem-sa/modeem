# -*- coding: utf-8 -*-
# Part of Modeem. See LICENSE file for full copyright and licensing details.

from unittest.mock import patch

import modeem
from modeem.tests import HttpCase
from modeem import http

class TestAuthSignupFlow(HttpCase):

    def setUp(self):
        super(TestAuthSignupFlow, self).setUp()
        res_config = self.env['res.config.settings']
        self.default_values = res_config.default_get(list(res_config.fields_get()))

    def _activate_free_signup(self):
        self.default_values.update({'auth_signup_uninvited': 'b2c'})

    def _get_free_signup_url(self):
        return '/web/signup'

    def test_confirmation_mail_free_signup(self):
        """
        Check if a new user is informed by email when he is registered
        """

        # Activate free signup
        self._activate_free_signup()

        # Get csrf_token
        self.authenticate(None, None)
        csrf_token = http.Request.csrf_token(self)

        # Values from login form
        name = 'toto'
        payload = {
            'login': 'toto@example.com',
            'name': name,
            'password': 'mypassword',
            'confirm_password': 'mypassword',
            'csrf_token': csrf_token,
        }

        # Override unlink to not delete the email if the send works.
        with patch.object(modeem.addons.mail.models.mail_mail.MailMail, 'unlink', lambda self: None):
            # Call the controller
            url_free_signup = self._get_free_signup_url()
            self.url_open(url_free_signup, data=payload)
            # Check if an email is sent to the new userw
            new_user = self.env['res.users'].search([('name', '=', name)])
            self.assertTrue(new_user)
            mail = self.env['mail.message'].search([('message_type', '=', 'email'), ('model', '=', 'res.users'), ('res_id', '=', new_user.id)], limit=1)
            self.assertTrue(mail, "The new user must be informed of his registration")
