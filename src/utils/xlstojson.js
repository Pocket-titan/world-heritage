/*
  UNESCO provides an .xls file for all sites, so we convert it to json
*/

let XLSX = require('xlsx');
let fs = require('fs')
let workbook = XLSX.readFile('whc-sites-2017.xls');
let sheet = workbook.Sheets[workbook.SheetNames[0]];
let data = XLSX.utils.sheet_to_json(sheet);

fs.writeFile('whc-sites-2017.json', JSON.stringify(data), (err) => {
  if (err) throw err;
  console.log('The file has been saved!');
});
