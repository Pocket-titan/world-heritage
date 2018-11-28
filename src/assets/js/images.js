/*
  Since JS has no dynamic imports (yet)
  we'll export all the images this way
*/
const json = require('./whc-sites-2017.json')
let images = {}

for (let site of json) {
  try {
    let file = require(`../site_images/${site.id_no}.jpg`)
    images[site.id_no] = file
  }
  catch(e) {
    images[site.id_no] = undefined
  }
}

export default images
