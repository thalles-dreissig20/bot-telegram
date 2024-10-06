const { Telegraf } = require('telegraf');
const logger = require('pino')();
require('dotenv').config();
const { GoogleGenerativeAI } = require("@google/generative-ai");
const genAI = new GoogleGenerativeAI(process.env.GEMINI_KEY);
const bot = new Telegraf(process.env.TELEGRAM_KEY);

async function run(message) {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash"});
    const result = await model.generateContent(message);
    const response = await result.response;
    return response.text();
}

function formatAsText(text) {
    return text
        .replace(/(\*\*)(.*?)\1/g, '*$2*')
        .replace(/(\*)(.*?)\1/g, '_$2_')
        .replace(/## (.*?)\n/g, '🔹 $1\n')
        .replace(/\* (.*?)\n/g, '• $1\n')
        .replace(/\n\n/g, '\n');
}


bot.catch((err) => {
    logger.error(`Ocorreu um erro: ${err}`);
});

bot.on('text', async (ctx) => {
    const userMessage = ctx.message.text;
    try {
        const response = await run(userMessage)

        const formattedResponse = formatAsText(response);

        await ctx.reply(formattedResponse);

    } catch (error) {
        logger.error(`Erro ao processar a mensagem: ${error.message}`);
        await ctx.reply('Desculpe, ocorreu um erro ao processar sua mensagem.');
    }
});

bot.launch();
