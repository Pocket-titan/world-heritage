import dangerList from './dangerList.json'
import sites from './whc-sites.json'

const markers = sites
  .map(site => ({
    title: site.name_en,
    info: site.short_description_en,
    lat: parseFloat(site.latitude),
    lng: parseFloat(site.longitude),
    category: site.category,
    id: parseInt(site.id_no, 10),
    danger: dangerList.some(danger_id => danger_id === site.id_no),
    image_name: `${site.id_no}`,
  }))
  .filter(({ lat, lng }) => lat && lng)

export default markers
