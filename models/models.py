# -*- coding: utf-8 -*-

# from odoo import models, fields, api


# class pos_nodejs_printer(models.Model):
#     _name = 'pos_nodejs_printer.pos_nodejs_printer'
#     _description = 'pos_nodejs_printer.pos_nodejs_printer'

#     name = fields.Char()
#     value = fields.Integer()
#     value2 = fields.Float(compute="_value_pc", store=True)
#     description = fields.Text()
#
#     @api.depends('value')
#     def _value_pc(self):
#         for record in self:
#             record.value2 = float(record.value) / 100
