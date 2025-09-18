var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
var ptp = require("pdf-to-printer");
var fs = require("fs");
var path = require("path");

const URL_FILE_CONFIG = 'api_printer_config.json';

router.get('/', (req, res, next) => {

  ptp.getPrinters().then((data) => {
    let CURRENT_PRINTER = readJsonFile();
    res.render('index', { currentPrint: CURRENT_PRINTER, printers: data });
  });

});

router.post('/change',async (req, res, next) => {

  let writeRes = await writeJsonFile(req.body.printer);
  if (writeRes.status) {
    res.status(200).json({ current: req.body.printer, message: "Se actualizó correctamente la impresora a utilizar." });
  }else {
    res.status(500).json(writeRes);
  }
});

router.get('/show-printers', (req, res, next) => {

  ptp.getPrinters().then(console.log);

  res.status(200).json("Api Works");
});

router.post('/print', bodyParser.raw({ type: 'application/pdf' }), async (req, res, next) => {
  /**
   * Se usó la librería 'pdf-to-printer' más información en https://github.com/artiebits/pdf-to-printer
   */

  let CURRENT_PRINTER = readJsonFile();
  console.log("Current printer:", CURRENT_PRINTER);
  if (CURRENT_PRINTER) {
    const options = {
      printer: CURRENT_PRINTER,
      scale: 'fit', // 'nonscale', 'shrink', 'fit'
      // monochrome: false, // impresion en blanco y negro
      // paperSize: 'A4', // Tamaño de la hoja 'A2','A3','A4','A5','A6','letter','legal','tabloid','statement'
      // copies: 1, // numero de copias a imprimir
    };

    const tmpPdf = path.join(`./api_printer_tmp/${Math.random().toString(36).substring(7)}.pdf`);
    console.log(tmpPdf);
    
    try {
      fs.writeFileSync(tmpPdf, req.body, 'binary');
      await ptp.print(tmpPdf, options);
      fs.unlinkSync(tmpPdf);
      res.status(200).json({ message: 'Impresión realizada con éxito.' });
    } catch (e) {
      try {
        console.log("DELETE: ", tmpPdf);
        fs.unlinkSync(tmpPdf);
      } catch (er) { console.log(er); }
      console.log(e)
      res.status(500).json({ message: "Hubo un error, revise la impresora e intente de nuevo.", error: e });
    }
  } else {
    res.status(500).json({ message: "Hubo un error, imposible obtener una impresora." });
  }
});

function readJsonFile() {
  try {
    let rawdata = fs.readFileSync(URL_FILE_CONFIG)
    let resJson = JSON.parse(rawdata);
    return resJson.currentprint;
  } catch (error) {
    console.log(error);
    return '';
  }
}

function writeJsonFile(printer) {
  return new Promise((resolve, reject) => {
    let storage = { currentprint: printer };
    let data = JSON.stringify(storage);
    fs.writeFile(URL_FILE_CONFIG, data, (err) => {
      if (err) {
        reject({ status: false, message: "No fue posible almacenar la impresora.", error: err });
      }
      resolve({ status: true });
    });
  })
}

module.exports = router;
