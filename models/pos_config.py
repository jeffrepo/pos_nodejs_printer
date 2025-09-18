# -*- coding: utf-8 -*-
from odoo import api, fields, models, _
from odoo.tools.translate import _


class PosConfig(models.Model):
    _inherit = 'pos.config'

    print_service_url = fields.Char(string=_("Print service url")) #, default="http://localhost:5178"