/*
  Scraping the UNESCO site for site images :D
*/

let cheerio = require('cheerio')
const json = require('../assets/js/whc-sites-2017.json')
const fetch = require('node-fetch')
const download = require('image-downloader')
const Promise = require('bluebird')

async function downloadIMG(options) {
  try {
    const { filename, image } = await download.image(options)
    console.log(`downloaded file ${filename}`)
  } catch (e) {
    throw e
  }
}

const images = Promise.map(json, async (site) => {
  const url = `http://whc.unesco.org/en/list/${site.id_no}`
  let text = await (await fetch(url)).text()
  const $ = cheerio.load(text)
  let img_paths =
    $('.icaption.bordered img')
    .toArray()
    .map(img => $(img).attr('data-src'))
    .filter(src => src !== undefined)
    .filter(src => src.includes('/uploads/thumbs/'))

  for (let path of img_paths) {
    const options = {
      url: `http://whc.unesco.org${path}`,
      dest: `./images/${site.id_no}.jpg`
    }
    await downloadIMG(options)
  }
}, {concurrency: 5})
