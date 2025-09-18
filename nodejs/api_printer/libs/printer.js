var ptp = require("pdf-to-printer");
var fs = require("fs");
var path = require("path");

export const getPrintersInSystem = () => {
    ptp.getPrinters().then(console.log);
}

export const sendToPrinter = async (req, res, next) => {
    const options = {};
    
}