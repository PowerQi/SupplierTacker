 var util = require('util'),
  os = require('os'),
  url = require('url'),
  iconv = require('iconv-lite'),
  fs = require('fs'),
  https = require('https');
 var cheerio = require("cheerio");
 var async = require('async');

 var result = {};
 result.order = new Array();
 result.return = new Array();

 var order_path = './public/data/order';
 var return_path = './public/data/return';
 var order_indexs = {
  item_id: 1,
  price: 3,
  unit: 4,
  count: 5
 };

 var return_indexs = {
  item_id: 1,
  price: 3,
  unit: 4,
  count: 6
 };

 var _map;

 var order_infos = "https://supplier.rt-mart.com.cn/php/scm_basic.php?status=0";
 var single_order = "https://supplier.rt-mart.com.cn/php/scm_orders.php?store_no=999&ord_no=";
 var cookie = fs.readFileSync('请输入cookie');

 String.prototype.startWith = function(str) {
  if (str == null || str == "" || this.length == 0 || str.length > this.length)
   return false;
  if (this.substr(0, str.length) == str)
   return true;
  else
   return false;
  return true;
 }
 String.prototype.endWith = function(str) {
  if (str == null || str == "" || this.length == 0 || str.length > this.length)
   return false;
  if (this.substring(this.length - str.length) == str)
   return true;
  else
   return false;
  return true;
 }

 //https请求获取原始网页数据QWQ
 function invokeHttps(_url, cookie, callback, order_id) {

  var option = url.parse(_url);
  option.method = 'GET';
  option.rejectUnauthorized = false;
  option.headers = {
   Cookie: cookie
  };

  var post_req = https.request(option, function(res) {
   var content = '';
   res.on('data', function(buffer) {

    buffer = iconv.decode(buffer, 'gbk');
    // buffer = iconv.encode(buffer,'utf8');
    content += buffer;
   });
   res.on('end', function() {
    callback(content, order_id);
    // return result;
   });

  });
  post_req.end();
 }

 //单个订单处理，获取数据，写入数据
 // function handleSingleOrder(data, order_id) {
 //  //data for web
 //  buildDataForWeb(data, order_id);
 //  //local fs
 //  buildDataForLocalFs(data, order_id);
 // }

 function buildDataForWeb(data, order_id) {
  //区分正常单据或退货单据
  var indexs;
  var isReturn = false;
  var name = '';
  var extractData = cheerioInvokeForSingleOrder(data, indexs);
  //退货数据
  if (order_id.toString().startWith('*')) {
   indexs = return_indexs;
   isReturn = true;
   name = 'order_' + order_id.slice(1) + '_' + extractData.date + '.txt';
   //正常单据
  }
  else {
   indexs = order_indexs;
   name = 'order_' + order_id + '_' + extractData.date + '.txt';
  }
  data = extractData.data;
  // console.log('web order_id: ' + order_id);
  //data for web invoke
  if (isReturn) {
   result.return.push({
    id: order_id,
    name: name
     // array: JSON.stringify(data)
   });
  }
  else {
   result.order.push({
    id: order_id,
    name: name
     // ,array: JSON.stringify(data)
   });
  }
 }

 function buildDataForLocalFs(data, order_id) {
  // console.log(order_id)
  var path = '';
  var indexs = order_indexs;
  //选择indexs
  if (order_id.toString().startWith('*')) {
   indexs = return_indexs;
  }
  var extractData = cheerioInvokeForSingleOrder(data, indexs);

  if (order_id.toString().startWith('*')) {
   path = return_path + '/order_' + order_id.slice(1) + '_' + extractData.date + '.txt';
   //正常单据
  }
  else {
   path = order_path + '/order_' + order_id + '_' + extractData.date + '.txt';
  }
  //判断是否已存在
  if(fs.existsSync(path)){
   return;
  }
   console.log('local order_id: ' + order_id);
  // console.log(path + '   ' + fs.existsSync(path));
  data = extractData.data;
  //构造数据
  var str = '货品编号,单价,数量\r\n';
  data.forEach(function(entry) {
   //处理单价格式
   var reg = /\d+\.?\d+/g;
   var matches = (entry.price + '').match(reg);
   var price = 0;
   // console.log(matches + '---' + JSON.stringify(entry, null, 4) + '-----------' + order_id);
   //处理货号、型号名转换
   var sku = _map[entry.item_id];
   if (matches != null && matches.length > 0) {
    price = matches[0];

   }
   str += sku + ',' + price + ',' + entry.count + '\r\n';
  });
  //转码为ansi
  // str = iconv.decode(str, 'gbk');
  str = iconv.encode(str, 'gbk');
  fs.writeFile(path, str, function(err) {
   if (err) throw err;
   // console.log('It\'s saved!'); //文件被保存
  });
 }

 function cheerioInvokeForSingleOrder(data, indexs) {
  var $ = cheerio.load(data);
  var i = 0;
  var jsonArray = new Array();
  var jsonObject;
  $("TABLE [bordercolordark='silver'] > tr").each(function() {
   if (i >= 2) {
    jsonObject = {};
    for (var temp in indexs) {
     var index = indexs[temp];
     //去掉数量上千位的逗号
     var tempValue = $(this).children()[index].children[0].data.toString();
     if (tempValue.indexOf(',') >= 0) {
      tempValue = tempValue.replace(',', '');
      // console.log(tempValue);
     }
     jsonObject[temp] = tempValue;
    }
    jsonArray.push(jsonObject);
   }
   i++;

  });
  //日期
  var date = $('td:contains(预交货日)').closest('tr').find('td:last-child').text();
  //排序
  jsonArray.sort(function(a, b) {
   return a.item_id - b.item_id
  });
  // for (var i = 0; i < jsonArray.length; i++) {
  //  console.log('item_id: ' + jsonArray[i].item_id);
  //  }
  return {
   data: jsonArray,
   date: date
  };
 }

 function handleMultipleOrderIds(data) {
  data = cheerioInvokeForMultipleOrderIds(data);
  //删除旧数据
  deleteUnuseFiles(order_path);
  deleteUnuseFiles(return_path);
  buildDataForWebForM();
  buildDataForLocalForM();
  // async.series([
  //  buildDataForWebForM, buildDataForLocalForM
  // ], function(err, values) {
  //  // do somethig with the err or values v1/v2/v3
  // });

  function buildDataForWebForM() {
   for (var index in data) {
    var id = data[index];
    if (id.toString().startWith('*')) {
     id = id.slice(1);
    }
    invokeHttps(single_order + id, cookie, buildDataForWeb, data[index])
   }
  }

  function buildDataForLocalForM() {
   for (var index in data) {
    var id = data[index];
    if (id.toString().startWith('*')) {
     id = id.slice(1);
    }
    invokeHttps(single_order + id, cookie, buildDataForLocalFs, data[index])
   }
  }
 }

 function deleteUnuseFiles(path) {
  var folder_exists = fs.existsSync(path);
  if (folder_exists == true) {
   var dirList = fs.readdirSync(path);
   dirList.forEach(function(fileName) {
    fs.unlinkSync(path + '/' + fileName);
   });
  }
 }

 function cheerioInvokeForMultipleOrderIds(data) {
  var $ = cheerio.load(data);
  var orderArray = new Array();
  $("a.class1").each(function() {
   orderArray.push($(this).text());
  });

  return orderArray;
 }

 //订单下载数据
 // invokeHttps(single_order + 60986570, cookie, handleSingleOrder, 60986570);

 //获取所有订单信息
 function invoke(map, sid) {
  result.order = new Array();
  result.return = new Array();
  cookie = sid;
  // console.log(sid.toString());
  _map = map;
  invokeHttps(order_infos, cookie, handleMultipleOrderIds);
 }
 exports.test = invoke;
 exports.data = result;