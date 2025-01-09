import sharp from "sharp"

const smallVer = async (img, filename) => {
    return await sharp(img)
        .resize(300, 300)
        .toFile(`productImages/${filename}[productsPage].png`, (err) => {
            console.log(err)
        })
}

module.exports = smallVer;