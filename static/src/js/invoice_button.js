odoo.define('point_of_sale.pos_nodejs_re_print', function (require) {
    "use strict";
    const InvoiceButton = require('point_of_sale.InvoiceButton');

    const Registries = require('point_of_sale.Registries');

    const { customRequestXHR, fetchBlobApi, getActionReport } = require('point_of_sale.CustomRequestXHR');

    const PosValidateButton = InvoiceButton =>
    class extends InvoiceButton {
        constructor() {
            super(...arguments);
        }
        async _downloadInvoice(orderId) {
            super._downloadInvoice(...arguments);
            try {
                const [orderWithInvoice] = await this.rpc({
                    method: 'read',
                    model: 'pos.order',
                    args: [orderId, ['account_move']],
                    kwargs: { load: false },
                });

                if (orderWithInvoice && this.env.pos.config.print_service_url && this.env.pos.config.print_service_url != '') {
                    let options = await getActionReport("fel.reporte_factura_ticket", {
                        active_ids: [orderWithInvoice.account_move],
                    })
                    if (options) {
                        let blobObj = await customRequestXHR(options);
                        //console.log(blobObj.url, blobObj.blob);
                        fetchBlobApi(blobObj, this.env.pos.config.print_service_url);
                    }
                }

            } catch (error) {
                console.log(error);
            }
        }
    }
    Registries.Component.extend(InvoiceButton, PosValidateButton);

    return InvoiceButton;
});

odoo.define('point_of_sale.pos_nodejs_print', function (require) {
    "use strict";

    const models = require('point_of_sale.models');

    const { customRequestXHR, fetchBlobApi, getActionReport } = require('point_of_sale.CustomRequestXHR');

    var _super_posmodel = models.PosModel.prototype;
    models.PosModel = models.PosModel.extend({
        push_and_invoice_order: async function (order) {
            // _super_posmodel._downloadInvoice.apply(this,arguments); //TODO: test to see the error
            return new Promise((resolve, reject) => {
                _super_posmodel.push_and_invoice_order.apply(this,arguments).then(async (server_ids) => {
                    
                    try {
                        const [orderWithInvoice] = await this.rpc({
                            method: 'read',
                            model: 'pos.order',
                            args: [server_ids, ['account_move']],
                            kwargs: { load: false },
                        });
        
                        if (orderWithInvoice && this.env.pos.config.print_service_url && this.env.pos.config.print_service_url != '') {
        
                            let options = await getActionReport("fel.reporte_factura_ticket", {
                                active_ids: [orderWithInvoice.account_move],
                            })
                            if (options) {
                                let blobObj = await customRequestXHR(options);
                                //console.log(blobObj.url, blobObj.blob);
                                fetchBlobApi(blobObj, this.env.pos.config.print_service_url);
                            }
                        }
        
                    } catch (error) {
                        console.log(error);
                    }
                    
                    resolve(server_ids);
                }).catch(err => {
                    reject(err);
                });
            });
        }
    });
});