/*
  Scraping the UNESCO site for site danger info (endangered sites / danger level)
*/

const cheerio = require('cheerio')
const path = require('path')
const fetch = require('node-fetch')
const fs = require('fs')
const url = 'http://whc.unesco.org/en/danger/'

let dangerList = new Promise((resolve, reject) => {
  resolve(
    (async () => {
      let text = await (await fetch(url)).text()
      const $ = cheerio.load(text)
      let list = $('.list_site')
        .find('a')
        .toArray()
        .map(a => $(a).attr('href'))
        .filter(link => link.includes('list'))
        .map(link => link.replace('/en/list/', ''))
      return list
    })(),
  )
  reject(() => [])
})

dangerList.then(res => {
  if (res) {
    fs.writeFile(
      path.join(__dirname, '../assets/js/dangerList.json'),
      JSON.stringify(res),
      'utf8',
      err => {
        if (err) throw err
        console.log('Saved!')
      },
    )
  }
})
