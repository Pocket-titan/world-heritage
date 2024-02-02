import cheerio from "cheerio"
import path from "path"
import download from "image-downloader"
import Promise from "bluebird"
import fetch from "node-fetch"
import fs from "fs"
import json from "../assets/js/whc-sites.json"

const img_dir = path.join(__dirname, "../assets/site_images")

const downloadIMG = async (options) => {
  try {
    const { filename } = await download.image(options)
    console.log(`downloaded file ${filename}`)
  } catch (e) {
    console.error(e)
  }
}

const scrape_site = async (site) => {
  const res = await fetch(`https://whc.unesco.org/en/list/${site.id_no}`)
  const text = await res.text()
  const $ = cheerio.load(text)

  let img_paths = $(`a[href="/en/list/${site.id_no}/gallery/"] img`)
    .toArray()
    .map((img) => $(img).attr("src"))
    .filter((src) => src !== undefined)
    .filter((src) => !src.includes("-40-40-"))
    .filter((src) => src.includes("/uploads/thumbs/"))

  const caption = $(
    `a[href="/en/list/${site.id_no}/gallery/"] + div.text-muted.small`
  )
    .text()
    .trim()
    .replace(/\s\s+/g, " ")

  for (let img_path of img_paths) {
    const options = {
      url: img_path,
      dest: path.join(img_dir, `/${site.id_no}.jpg`),
    }

    await downloadIMG(options)
  }

  return caption
}

const scrape_sites = async () => {
  console.log(`Getting ready to scrape ${json.length} images`)

  // Get the images and captions
  if (!fs.existsSync(img_dir)) {
    fs.mkdirSync(img_dir)
  }

  let captions = {}

  try {
    await Promise.map(
      json,
      async (site) => {
        console.log(`Downloading images for ${site.name_en}...`)

        await new Promise((resolve) => {
          setTimeout(resolve, 1000 + 3000 * Math.random())
        })

        console.log("Done sleeping.")

        let caption = await scrape_site(site)
        captions[site.id_no] = await caption

        console.log("caption: ", caption)

        return
      },
      { concurrency: 1 }
    )
  } catch (error) {
    throw new Error(error)
  }

  console.log("Done downloading images!")

  await captions
  await fs.writeFile(
    path.join(__dirname, "../assets/js/imageCaptions.json"),
    JSON.stringify(captions),
    "utf8",
    (err) => {
      if (err) {
        console.error(err)
      } else {
        console.log("Saved captions!")
      }
    }
  )
}

const scrape_dangerlist = async () => {
  let dangerList = await new Promise(async (resolve, reject) => {
    try {
      const res = await fetch("http://whc.unesco.org/en/danger/")
      const text = await res.text()
      const $ = cheerio.load(text)

      const list = $(".list_site")
        .find("a")
        .toArray()
        .map((a) => $(a).attr("href"))
        .filter((link) => link.includes("list"))
        .map((link) => link.replace("/en/list/", ""))

      resolve(list)
    } catch (e) {
      console.error(e)
      reject([])
    }
  })

  if (dangerList && dangerList.length > 0) {
    fs.writeFile(
      path.join(__dirname, "../assets/js/dangerList.json"),
      JSON.stringify(dangerList),
      "utf8",
      (err) => {
        if (err) throw err
        console.log("Saved dangerlist!")
      }
    )
  } else {
    console.warn("Something went wrong generating the danger list")
  }
}

const main = async () => {
  // await Promise.all([scrape_sites(), scrape_dangerlist()])

  // await scrape_site({ id_no: 201 })

  // await scrape_dangerlist()

  await scrape_sites()
}

main()
