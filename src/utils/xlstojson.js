/*
  UNESCO provides an .xls file for all sites, so we convert it to json
*/

import xlsx from 'xlsx'
import path from 'path'
import fs from 'fs'

const filename = 'whc-sites-2018.xls'
let workbook = xlsx.readFile(__dirname + '/' + filename)
let sheet = workbook.Sheets[workbook.SheetNames[0]]
let data = xlsx.utils.sheet_to_json(sheet)

fs.writeFile(
  path.join(__dirname, '../assets/js/whc-sites.json'),
  JSON.stringify(data),
  err => {
    if (err) throw err
    console.log('The file has been saved!')
  },
)
