const OpenAI = require("openai");

const openai = new OpenAI();

let args = process.argv.slice(2);

async function main(inputText) {
    try {
        const completion = await openai.chat.completions.create({
            model: "gpt-4",
            messages: [
                { role: "user", content: inputText }
            ]
        });
        console.log("\n" + completion.choices[0].message.content + "\n");
    } catch (error) {
        console.error("Error generating chat:", error);
    }
}

main(args[0]); // node openai-gpt-4.js "You are a helpful assistant."