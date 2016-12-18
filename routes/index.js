var test = require("../test");
var excelHandle = require("../excelHandle");
var os = require('os');
/*
 * GET home page.
 */

exports.login = function(req, res) {
  res.render('login');
};

exports.index = function(req, res) {
   //执行test
  var sid = 'PHPSESSID=' + req.query.PHPSESSID;
  test.test(excelHandle.readExcelData(), sid);
  setTimeout(function() {
    var data = test.data;
    // console.log(JSON.stringify(data));
    res.render('index', {
      data: data
    });
  }, 40000);
};
