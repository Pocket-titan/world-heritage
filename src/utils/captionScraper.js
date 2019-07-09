const cheerio = require('cheerio')
const fs = require('fs')
const path = require('path')
const fetch = require('node-fetch')
const Promise = require('bluebird')
const json = require(path.join(__dirname, '../assets/js/whc-sites-2018.json'))
// const liljson = json.slice(0,5)

const obj = {}

const captions = Promise.map(
  json,
  async site => {
    const url = `http://whc.unesco.org/en/list/${site.id_no}`
    console.log(`processing site no ${site.id_no}`)
    let res = await fetch(url)
    if (!res) {
      return
    }
    let text = await res.text()
    const $ = cheerio.load(text)
    const caption = $('.icaption.bordered')
      .find('strong.description')
      .text()
    obj[site.id_no] = await caption
  },
  { concurrency: 5 },
)

captions.then(async () => {
  await fs.writeFile(
    path.join(__dirname, '../assets/js/imageCaptions.json'),
    JSON.stringify(obj),
    'utf8',
    err => {
      if (err) {
        console.error(err)
      } else {
        console.log('done!')
      }
    },
  )
})
