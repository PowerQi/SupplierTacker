var xlsx = require("node-xlsx"),
    fs = require('fs');

var map;

function readExcel(path, fileName, optionMap) {
    map  = {};
    if(typeof optionMap != 'undefined'){
        map = optionMap;
    }
    var list = xlsx.parse(path + fileName);
    // list.forEach(handleSingleSheet);
    handleSingleSheet(list[0]);
   return  map;
}

function handleSingleSheet(sheet) {
    // console.log('sheet_name: ' + sheet.name);
    // console.log('rows numb: ' + sheet.data.length);
    sheet.data.forEach(handleRow);
}

function handleRow(rows) {
    // console.log('colspan numb: ' + rows.length);
    // console.log('货号: ' + rows[0] + '; 型号: ' + rows[2]);
    map[rows[0]] = rows[2];
}

function writeExcel(data) {
//   var data = [
//                 ['货号', '单价', '单位', '订购数量'],
//                 [61284116],
//                 [2036440, 3.9829, '把', 300]
//             ];
    var array = new Array();
    array.push(createSheet('order', data));
    array.push(createSheet('return', data));
    var file = xlsx.build([{name: 'sheet1', data: data}]);
    fs.writeFileSync('./public/excel/demo1.xlsx', file, 'binary');
}

function createSheet(sheetName, data){
    var obj = {};
    obj.name = sheetName;
    obj.data = sheetData(data[sheetName]);
    return obj;
}

function sheetData(data){
    var arrayData = new Array();
    var arrayTemp;
    data.forEach(function(entry){
        //id
        arrayTemp = new Array();
        arrayTemp.push(entry.id);
        arrayData.push(arrayTemp);
        //info
        arrayTemp = new Array();
        entry.array1.forEach(function(obj){
            arrayTemp.push(obj.item_id);
            arrayTemp.push(obj.price);
            arrayTemp.push(obj.unit);
            arrayTemp.push(obj.count);
        });
        arrayData.push(arrayTemp);
    });
    return arrayData;
}

function readExcelData(){
  var map = {};
  map = readExcel('./public/excel/', '文具11-18.xlsx');
  map = readExcel('./public/excel/', '玩具.xlsx', map);
  return map;
}

exports.writeExcel = writeExcel;
exports.readExcel = readExcel;
exports.readExcelData = readExcelData;
// readExcel("./public/excel/", '文具.xls');
// var i = 0;
// for(var temp in readExcel("./public/excel/", '文具.xls')){
//     i++;
// }
// console.log(i);