import fs from 'fs'

function generateURL(item) {

    const feed = {
        prompt: `close up photo of ${item}`,
        width: 1024,
        height: 1024,
        seed: 361965225,
        model: 'flux',
        output: function () {
            return `https://pollinations.ai/p/${encodeURIComponent(this.prompt)}?width=${this.width}&height=${this.height}&seed=${this.seed}&model=${this.model}`
        }
    }

    return feed.output();

}

async function generateImage(imageUrl, prodName) {
    try {
        const response = await fetch(imageUrl);
        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer)
        fs.writeFileSync(`./productImages/${prodName}.png`, buffer);
        console.log('Download Completed');
        return buffer;
    } catch (error) {
        console.log(error)
    }
}

module.exports = { generateImage, generateURL };

