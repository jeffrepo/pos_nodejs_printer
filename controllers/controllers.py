# -*- coding: utf-8 -*-
# from odoo import http


# class PosNodejsPrinter(http.Controller):
#     @http.route('/pos_nodejs_printer/pos_nodejs_printer/', auth='public')
#     def index(self, **kw):
#         return "Hello, world"

#     @http.route('/pos_nodejs_printer/pos_nodejs_printer/objects/', auth='public')
#     def list(self, **kw):
#         return http.request.render('pos_nodejs_printer.listing', {
#             'root': '/pos_nodejs_printer/pos_nodejs_printer',
#             'objects': http.request.env['pos_nodejs_printer.pos_nodejs_printer'].search([]),
#         })

#     @http.route('/pos_nodejs_printer/pos_nodejs_printer/objects/<model("pos_nodejs_printer.pos_nodejs_printer"):obj>/', auth='public')
#     def object(self, obj, **kw):
#         return http.request.render('pos_nodejs_printer.object', {
#             'object': obj
#         })
