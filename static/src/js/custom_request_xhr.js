odoo.define('point_of_sale.CustomRequestXHR', function (require) {

    const { browser } = require('@web/core/browser/browser');
    var download = require('web.download');
    const { makeErrorFromResponse } = require("@web/core/network/rpc_service");
    var contentdisposition = require('web.contentdisposition');

    const { Gui } = require('point_of_sale.Gui');
    var core = require('web.core');
    var _t = core._t;

    var rpc = require('web.rpc');
    var session = require('web.session');

    var exports = {};

    /**
     * El codigo de la api se encuentra en la carpeta nodejs/api_printer
     * Más información en el archivo readme.md
     * 
     */

    /**
     * Forma de uso: el objeto options puede ser obtenido con el uso de la funcion "getActionReport"
     * Importar la función de la siguiente manera const { customRequestXHR } = require('point_of_sale.CustomRequestXHR');
     * @param {*} options Objeto con informacion de la url y los parametros a utilizar para la peticion XHR
     * @returns retorna una promesa en donde se espera obtener la url del objeto (PDF:blob) que se encuentra en la memoria ram
     * y el objeto binario en formato blob
     */

    exports.customRequestXHR = (options) => {
        return new Promise((resolve, reject) => {
            
            const xhr = new browser.XMLHttpRequest();
            let data;
            if (Object.prototype.hasOwnProperty.call(options, "form")) {
                xhr.open(options.form.method, options.form.action);
                data = new FormData(options.form);
            } else {
                xhr.open("POST", options.url);
                data = new FormData();
                Object.entries(options.data).forEach((entry) => {
                    const [key, value] = entry;
                    data.append(key, value);
                });
            }
            data.append("token", "dummy-because-api-expects-one");
            if (odoo.csrf_token) {
                data.append("csrf_token", odoo.csrf_token);
            }
            // IE11 wants this after xhr.open or it throws
            xhr.responseType = "blob";
            xhr.onload = () => {
                const mimetype = xhr.response.type;
                // In Odoo, the default mimetype, including for JSON errors is text/html (ref: http.py:Root.get_response )
                // in that case, we have to assume the file is not valid, hence that there was an error
                if (xhr.status === 200 && mimetype !== "text/html") {
                    // replace because apparently we send some C-D headers with a trailing ";"
                    const header = (xhr.getResponseHeader("Content-Disposition") || "").replace(
                        /;$/,
                        ""
                    );
                    const filename = header ? contentdisposition.parse(header).parameters.filename : null;
                    //download(xhr.response, filename, mimetype);
                    let url = self.URL.createObjectURL(xhr.response);
                    return resolve({ url, blob: xhr.response });

                } else if (xhr.status === 502) { // If Odoo is behind another server (nginx)
                    reject(new ConnectionLostError());
                } else {
                    const decoder = new FileReader();
                    decoder.onload = () => {
                        const contents = decoder.result;
                        const doc = new DOMParser().parseFromString(contents, "text/html");
                        const nodes =
                            doc.body.children.length === 0 ? doc.body.childNodes : doc.body.children;

                        let error;
                        try { // a Serialized python Error
                            const node = nodes[1] || nodes[0];
                            error = JSON.parse(node.textContent);
                        } catch (e) {
                            error = {
                                message: "Arbitrary Uncaught Python Exception",
                                data: {
                                    debug: `${xhr.status}` + `\n` +
                                        `${nodes.length > 0 ? nodes[0].textContent : ""}
                                        ${nodes.length > 1 ? nodes[1].textContent : ""}`
                                },

                            };
                        }
                        error = makeErrorFromResponse(error);
                        reject(error);
                    };
                    decoder.readAsText(xhr.response);
                }
            };
            xhr.onerror = () => {
                reject(new ConnectionLostError());
            };
            xhr.send(data);
        });
    }

    /**
     * Metodo para hacer la petición a la API con parametro de un objeto binario en formato PDF
     * Forma de uso: importar de la siguiente manera const { fetchBlobApi } = require('point_of_sale.CustomRequestXHR');
     * @param {Blob} blobObj objeto binario en formato blob que se enviara a la API
     * @param {string} url url de la API para realizar la peticion de impresion
     */
    exports.fetchBlobApi = (blobObj, url) => {
        var myHeaders = new Headers();
        myHeaders.append("Content-Type", "application/pdf");
        myHeaders.append("Content-Security-Policy", "upgrade-insecure-requests");

        var file = new FormData();
        file.append("content", blobObj.blob)

        var requestOptions = {
            method: 'POST',
            headers: myHeaders,
            body: file,
            redirect: 'follow'
        };
        let baseUrl = url;
        //baseUrl += baseUrl.endsWith('/') ? 'print': '/print';
        if (url) {
            fetch(baseUrl, requestOptions)
                .then(async (response) => {
                    let json = await response.json();
                    if (response.status >= 200 && response.status < 300) {
                        return Promise.resolve(json)
                    } else {
                        return Promise.reject(json)
                    }
                })
                .then(result => {/*console.log(result)*/ })
                .catch(error => {
                    console.log('error', error);
                    Gui.showPopup("ErrorPopup", {
                        'title': _t("Request to printer api"),
                        'body': _t(error.message),
                    });
                });
        }
    }

    /**
     * 
     * @param {string} actionRequest id del record del cual se quiere imprimir el reporte
     * @param {*} context objeto con los identificadores necesarios para encontrar la acción que permite descargar el reporte
     * en este caso solo es necesario el atributo active_ids ejemplo { active_ids: <algun numero> }
     * @returns Objeto options con los atributos necesarios para la petición xhr que se realiza en la función "customRequestXHR"
     */
    exports.getActionReport = (actionRequest, context) => {
        return new Promise((resolve, reject) => {
            const additional_context = {
                active_id: context.active_id,
                active_ids: context.active_ids,
                active_model: context.active_model,
            }
            rpc.query({
                route: "/web/action/load",
                params: {
                    action_id: actionRequest,
                    additional_context,
                }
            }).then(action => {
                let options = {
                    "url": "/report/download",
                    "data": {
                        "data": `[\"/report/pdf/${action.report_name}/${context.active_ids}\",\"${action.report_type}\"]`,
                        "context": JSON.stringify(session.user_context)
                    }
                }
                resolve(options);
            }).guardedCatch(() => reject(null));
        });
    }

    return exports;
});