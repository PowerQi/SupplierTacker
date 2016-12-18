var https = require("https");
var test = require("../test");
var excelHandle = require("../excelHandle");
/*
 * GET users listing.
 */

exports.list = function(req, res) {
  res.send("respond with a resource");
};

exports.login = function(req, res) {
  var request = require('request');
  var fs = require('fs')
  request.post({
      rejectUnauthorized: false,
      url: 'https://supplier.rt-mart.com.cn/php/scm_login_check.php',
      headers: {
        'Cookie': 'PHPSESSID=' + req.query.PHPSESSID,
        'Referer': "https://supplier.rt-mart.com.cn/index.php"
      },
      form: {
        "area": parseInt(req.query.area),
        "image.x": parseInt(req.query.imagex),
        "image.y": parseInt(req.query.imagey),
        "userid": req.query.userid,
        "passwd": req.query.passwd,
        "checkstr": req.query.checkstr
      }
    },
    function(err, httpResponse, body) {
      if (body.indexOf("scm_main.php") != -1) {
        request.get({
            rejectUnauthorized: false,
            headers: {
              'Cookie': 'PHPSESSID=' + req.query.PHPSESSID,
              'Referer': "https://supplier.rt-mart.com.cn/php/scm_login_check.php"
            },
            url: 'https://supplier.rt-mart.com.cn/php/scm_main.php',
          },
          function(err, httpResponse, body) {
          })
        res.send("登录成功")
      } else {
        res.send('登录错误')
      }
    })
}

exports.code = function(req, res) {
  var options = {
    hostname: 'supplier.rt-mart.com.cn',
    port: 443,
    path: '/code.php',
    method: 'GET',
    rejectUnauthorized: false,
    headers: {
      'Cookie': 'PHPSESSID=' + req.query.PHPSESSID,
      'Referer': "https://supplier.rt-mart.com.cn/index.php"
    }
  };

  var req = https.request(options, function(r) {
    r.on('data', function(d) {
      var data = new Buffer(d, 'binary').toString('base64');
      res.send("data:image/png;base64," + data);
    });
  });
  req.end();

  req.on('error', function(e) {
    res.send(e);
  });
};

exports.session = function(req, res) {
  var options = {
    hostname: 'supplier.rt-mart.com.cn',
    port: 443,
    path: '/php/r_index.php',
    method: 'GET',
    rejectUnauthorized: false
  };

  var req = https.request(options, function(r) {
    res.send({
      "headers": r.headers["set-cookie"][0].split(";")[0]
    });
    r.on('data', function(d) {});
  });
  req.end();
 
  req.on('error', function(e) {
    res.send(e);
  });
};