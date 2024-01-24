const OpenAI = require("openai");
const axios = require("axios");
const fs = require('fs');
const path = require('path');

const openai = new OpenAI();

let args = process.argv.slice(2);

function getDateTimeString() {
    const now = new Date();
    return now.toISOString().replace(/:/g, '-').replace(/\..+/, '');
}

async function downloadImage(url, filepath) {
    const response = await axios({
        url,
        method: 'GET',
        responseType: 'stream'
    });

    return new Promise((resolve, reject) => {
        response.data.pipe(fs.createWriteStream(filepath))
            .on('error', reject)
            .once('close', () => resolve(filepath));
    });
}

async function main(inputText) {
    try {
        const imageResponse = await openai.images.generate({
            model: "dall-e-3",
            prompt: inputText,
            n: 1, // Must be 1 for dall-e-3 models.
            size: "1024x1024" // Must be one of 1024x1024, 1792x1024, or 1024x1792 for dall-e-3 models.
        });

        const assetsDir = path.join(__dirname, 'assets');
        if (!fs.existsSync(assetsDir)) {
            fs.mkdirSync(assetsDir);
        }

        const dateTimeString = getDateTimeString();
        const imageUrl = imageResponse.data[0].url;
        const imagePath = path.join(assetsDir, `image-${dateTimeString}.png`);
        await downloadImage(imageUrl, imagePath);
        console.log("\nImage saved to:", imagePath, "\n");
    } catch (error) {
        console.error("Error generating image:", error);
    }
}

main(args[0]); // node openai-dall-e-3.js "An expressive oil painting of a basketball player dunking, depicted as an explosion of a nebula."