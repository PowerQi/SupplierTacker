/*
 * GET download file.
 */
var zip = require('node-native-zip'),
    fs = require("fs");

var order_path = '/home/ubuntu/workspace/public/data/order';
var return_path = '/home/ubuntu/workspace/public/data/return';
var order_zip_path = "/home/ubuntu/workspace/public/data/zip/order.zip";
var return_zip_path = "/home/ubuntu/workspace/public/data/zip/return.zip";

exports.download = function(req, res) {
    var id = req.params.id;
    if (id == 'order') {
        createZipFiles(order_path, order_zip_path, downloadFun, res);
    }
    else if (id == 'return') {
        createZipFiles(return_path, return_zip_path, downloadFun, res);
    }
};

exports.order = function(req, res) {
    var id = req.params.id;
    var path = '/home/ubuntu/workspace/public/data/order/';
    downloadFun(res, path + id);
}

exports.return = function(req, res) {
    var id = req.params.id;
    var path = '/home/ubuntu/workspace/public/data/return/';
    downloadFun(res, path + id);
}

function createZipFiles(path, zipPath, callback, res) {
    // res.setHeader('content-encoding', 'zip');

    var array = new Array();
    fs.readdirSync(path).forEach(function(name) {
        array.push({
            name: name,
            path: path + '/' + name
        });
    });
    var archive = new zip();
    archive.addFiles(array, function(err) {
        if (err) return console.log('err while adding files', err);
        var buff = archive.toBuffer();

        fs.writeFile(zipPath, buff, callback(res, zipPath));
    });
}

function downloadFun(res, path) {
    res.download(path);
    // res.end();
}

// createZipFiles(order_path, order_zip_path, function() {
//     console.log(111)
// });