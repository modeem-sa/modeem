# Part of Modeem. See LICENSE file for full copyright and licensing details.
{
    'name': "Spreadsheet dashboard for time sheets",
    'version': '1.0',
    'category': 'Hidden',
    'summary': 'Spreadsheet',
    'description': 'Spreadsheet',
    'depends': ['spreadsheet_dashboard', 'sale_timesheet'],
    'data': [
        "data/dashboards.xml",
    ],
    'demo': [],
    'installable': True,
    'auto_install': ['sale_timesheet'],
    'license': 'LGPL-3',
    'assets': {}
}
