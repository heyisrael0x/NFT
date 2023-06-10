const pinataSDK =  require("@pinata/sdk")
const path = require("path")
const fs = require("fs")

async function storeImages(imagesFilePath){
    const fullImagesPath = path.resolve(imagesFilePath)
    const files = fs.readdirSync(fullImagesPath)
    console.log(files)
}
module.exports = { storeImages}