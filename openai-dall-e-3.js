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

main(args[0]); // node openai-dall-e-3.js "A top-down 2D pixel art scene, inspired by the style of 'Octopath Traveler', focusing on a female character with blonde hair, portrayed as a loyal knight. She should be featured in the center of the image, wearing an intricate knight's armor with a predominantly blue and silver color scheme. The character is holding a sword and shield, showcasing a brave and confident posture. The background should include a medieval fantasy setting with detailed cobblestone paths and ancient buildings, embodying a vibrant, classic role-playing game atmosphere. Emphasize the detailed, colorful pixel art style that captures the essence of a rich fantasy world."