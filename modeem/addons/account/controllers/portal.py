# -*- coding: utf-8 -*-
# Part of Modeem. See LICENSE file for full copyright and licensing details.

from modeem import http, _
from modeem.osv import expression
from modeem.addons.portal.controllers.portal import CustomerPortal, pager as portal_pager
from modeem.exceptions import AccessError, MissingError
from collections import OrderedDict
from modeem.http import request


class PortalAccount(CustomerPortal):

    def _prepare_home_portal_values(self, counters):
        values = super()._prepare_home_portal_values(counters)
        if 'invoice_count' in counters:
            invoice_count = request.env['account.move'].search_count(self._get_invoices_domain()) \
                if request.env['account.move'].check_access_rights('read', raise_exception=False) else 0
            values['invoice_count'] = invoice_count
        return values

    # ------------------------------------------------------------
    # My Invoices
    # ------------------------------------------------------------

    def _invoice_get_page_view_values(self, invoice, access_token, **kwargs):
        values = {
            'page_name': 'invoice',
            'invoice': invoice,
        }
        return self._get_page_view_values(invoice, access_token, values, 'my_invoices_history', False, **kwargs)

    def _get_invoices_domain(self):
        return [('state', 'not in', ('cancel', 'draft')), ('is_move_sent', '=', True), ('move_type', 'in', ('out_invoice', 'out_refund', 'in_invoice', 'in_refund', 'out_receipt', 'in_receipt'))]

    def _get_account_searchbar_sortings(self):
        return {
            'date': {'label': _('Date'), 'order': 'invoice_date desc'},
            'duedate': {'label': _('Due Date'), 'order': 'invoice_date_due desc'},
            'name': {'label': _('Reference'), 'order': 'name desc'},
            'state': {'label': _('Status'), 'order': 'state'},
        }

    def _get_account_searchbar_filters(self):
        return {
            'all': {'label': _('All'), 'domain': []},
            'invoices': {'label': _('Invoices'), 'domain': [('move_type', '=', ('out_invoice', 'out_refund'))]},
            'bills': {'label': _('Bills'), 'domain': [('move_type', '=', ('in_invoice', 'in_refund'))]},
        }

    @http.route(['/my/invoices', '/my/invoices/page/<int:page>'], type='http', auth="user", website=True)
    def portal_my_invoices(self, page=1, date_begin=None, date_end=None, sortby=None, filterby=None, **kw):
        values = self._prepare_my_invoices_values(page, date_begin, date_end, sortby, filterby)

        # pager
        pager = portal_pager(**values['pager'])

        # content according to pager and archive selected
        invoices = values['invoices'](pager['offset'])
        request.session['my_invoices_history'] = invoices.ids[:100]

        values.update({
            'invoices': invoices,
            'pager': pager,
        })
        return request.render("account.portal_my_invoices", values)

    def _prepare_my_invoices_values(self, page, date_begin, date_end, sortby, filterby, domain=None, url="/my/invoices"):
        values = self._prepare_portal_layout_values()
        AccountInvoice = request.env['account.move']

        domain = expression.AND([
            domain or [],
            self._get_invoices_domain(),
        ])

        searchbar_sortings = self._get_account_searchbar_sortings()
        # default sort by order
        if not sortby:
            sortby = 'date'
        order = searchbar_sortings[sortby]['order']

        searchbar_filters = self._get_account_searchbar_filters()
        # default filter by value
        if not filterby:
            filterby = 'all'
        domain += searchbar_filters[filterby]['domain']

        if date_begin and date_end:
            domain += [('create_date', '>', date_begin), ('create_date', '<=', date_end)]

        values.update({
            'date': date_begin,
            # content according to pager and archive selected
            # lambda function to get the invoices recordset when the pager will be defined in the main method of a route
            'invoices': lambda pager_offset: AccountInvoice.search(domain, order=order, limit=self._items_per_page, offset=pager_offset),
            'page_name': 'invoice',
            'pager': {  # vals to define the pager.
                "url": url,
                "url_args": {'date_begin': date_begin, 'date_end': date_end, 'sortby': sortby},
                "total": AccountInvoice.search_count(domain),
                "page": page,
                "step": self._items_per_page,
            },
            'default_url': url,
            'searchbar_sortings': searchbar_sortings,
            'sortby': sortby,
            'searchbar_filters': OrderedDict(sorted(searchbar_filters.items())),
            'filterby': filterby,
        })
        return values

    @http.route(['/my/invoices/<int:invoice_id>'], type='http', auth="public", website=True)
    def portal_my_invoice_detail(self, invoice_id, access_token=None, report_type=None, download=False, **kw):
        try:
            invoice_sudo = self._document_check_access('account.move', invoice_id, access_token)
        except (AccessError, MissingError):
            return request.redirect('/my')

        if report_type in ('html', 'pdf', 'text'):
            return self._show_report(model=invoice_sudo, report_type=report_type, report_ref='account.account_invoices', download=download)

        values = self._invoice_get_page_view_values(invoice_sudo, access_token, **kw)
        return request.render("account.portal_invoice_page", values)

    # ------------------------------------------------------------
    # My Home
    # ------------------------------------------------------------

    def details_form_validate(self, data, partner_creation=False):
        error, error_message = super(PortalAccount, self).details_form_validate(data)
        # prevent VAT/name change if invoices exist
        partner = request.env['res.users'].browse(request.uid).partner_id
        # Skip this test if we're creating a new partner as we won't ever block him from filling values.
        if not partner_creation and not partner.can_edit_vat():
            if 'vat' in data and (data['vat'] or False) != (partner.vat or False):
                error['vat'] = 'error'
                error_message.append(_('Changing VAT number is not allowed once invoices have been issued for your account. Please contact us directly for this operation.'))
            if 'name' in data and (data['name'] or False) != (partner.name or False):
                error['name'] = 'error'
                error_message.append(_('Changing your name is not allowed once invoices have been issued for your account. Please contact us directly for this operation.'))
            if 'company_name' in data and (data['company_name'] or False) != (partner.company_name or False):
                error['company_name'] = 'error'
                error_message.append(_('Changing your company name is not allowed once invoices have been issued for your account. Please contact us directly for this operation.'))
        return error, error_message

    def extra_details_form_validate(self, data, additional_required_fields, error, error_message):
        """ Ensure that all additional required fields have a value in the data """
        for field in additional_required_fields:
            if field.name not in data or not data[field.name]:
                error[field.name] = 'error'
                error_message.append(_('The field %s must be filled.', field.field_description.lower()))
        return error, error_message
