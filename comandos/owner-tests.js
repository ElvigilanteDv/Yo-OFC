import { config } from '../config.js';
import fs from 'fs-extra';
import path from 'path';

const ecoPath = path.resolve('./config/database/economy/economy.json');
const rpgPath = path.resolve('./config/database/rpg/rpg.json');

const menuCommand = {
    name: 'menutest',
    alias: ['hel'],
    category: 'main',
    desc: 'Muestra la lista de comandos dinámica.',
    isOwner: false,
    noPrefix: true,

    run: async (conn, m, args, usedPrefix) => {
        try {
            const prefix = usedPrefix || '#'; 
            const user = m.sender.split('@')[0].split(':')[0];
            const group = m.chat;
            
            const commandsSource = conn.commands || global.commands;
            if (!commandsSource) return m.reply('Error: No se pudo acceder a la lista de comandos.');
            
            const allCommands = Array.from(commandsSource.values());
            const categories = [...new Set(allCommands.map(cmd => cmd.category || 'otros'))];

            const botNumber = conn.user.id.split(':')[0].replace(/\D/g, '');
            const subSessionsPath = path.resolve('./sesiones_subbots');
            const moodSessionsPath = path.resolve('./sesiones_moods');
            let settingsPath = '';
            let currentBotType = 'Mood';

            if (await fs.pathExists(path.join(subSessionsPath, botNumber))) {
                settingsPath = path.join(subSessionsPath, botNumber, 'settings.json');
                currentBotType = 'SubBot';
            } else if (await fs.pathExists(path.join(moodSessionsPath, botNumber))) {
                settingsPath = path.join(moodSessionsPath, botNumber, 'settings.json');
                currentBotType = 'Mood';
            }

            let displayLongName = config.botName;
            let displayBanner = config.visuals.img1;

            if (settingsPath && await fs.pathExists(settingsPath)) {
                const localData = await fs.readJson(settingsPath);
                if (localData.longName) displayLongName = localData.longName;
                if (localData.banner) displayBanner = localData.banner;
            }

            const ecoDB = await fs.pathExists(ecoPath) ? await fs.readJson(ecoPath) : {};
            const rpgDB = await fs.pathExists(rpgPath) ? await fs.readJson(rpgPath) : {};
            const wallet = ecoDB[user]?.wallet || 0;
            const userRpg = rpgDB[group]?.[user] || {};
            const rank = userRpg.rank || 'Novato de las Cuevas';
            const diamantes = userRpg.minerals?.diamantes || 0;

            const infoBot = `┏━━━━✿︎ 𝐈𝐍𝐅𝐎-𝐁𝐎𝐓 ✿︎━━━━╮\n┃ ✐ *Owner* »\n┃ kazuma.giize.com/Dev-FelixOfc\n┃ ✐ *Commands* »\n┃ kazuma.giize.com/commands\n┃ ✐ *Official channel* »\n┃ https://whatsapp.com/channel/0029Vb6sgWdJkK73qeLU0J0N\n╰━━━━━━━━━━━━━━━━━━━╯\n`;

            const infoUser = `┏━━━━✿︎ 𝐈𝐍𝐅𝐎-𝐔𝐒𝐄𝐑 ✿︎━━━━╮\n┃ ✐ *Usuario* »  @${user}\n┃ ✐ *Rango* » ${rank}\n┃ ✐ *Coins* » ¥${wallet.toLocaleString()}\n┃ ✐ *Diamantes* » ${diamantes}\n╰━━━━━━━━━━━━━━━━━━━╯`;

            const formatCategory = (cat) => {
                const cmdsInCat = allCommands.filter(cmd => cmd.category === cat);
                // Cabecera de categoría
                let catText = `*» (❍ᴥ❍ʋ) \`${cat.toUpperCase()}\` «*\n> ꕥ Comandos de la categoría ${cat}.\n\n`;
                
                // Mapeo de comandos sin saltos de línea dobles entre ellos
                const body = cmdsInCat.map(cmd => {
                    const allAliases = [cmd.name, ...(cmd.alias || [])];
                    const namesString = allAliases.map(n => `*#${n}*`).join(' • ');
                    return `✿︎ ${namesString}\n> ❀ ${cmd.desc || 'Sin descripción.'}`;
                }).join('\n'); // Un solo salto de línea aquí para que queden pegados

                return catText + body + '\n';
            };

            const input = args[0]?.toLowerCase();
            let finalBody = "";
            let subHeader = "";

            if (!input) {
                subHeader = `*☞︎︎︎ Lista de comandos ☜︎︎︎*\n\n`;
                finalBody = categories.map(cat => formatCategory(cat)).join('\n');
            } else if (categories.includes(input)) {
                subHeader = `*☞︎︎︎ Comandos: \`${input.toUpperCase()}\` ☜︎︎︎*\n\n`;
                finalBody = formatCategory(input);
            } else {
                return m.reply(`Categoría no encontrada. Disponibles: ${categories.join(', ')}`);
            }

            let header = `¡Hola! Soy ${displayLongName} *(${currentBotType})*.\n\n`;
            let textoMenu = `${header}${subHeader}${infoBot}\n${infoUser}\n\n${finalBody}`;

            await conn.sendMessage(m.chat, { 
                image: { url: displayBanner }, 
                caption: textoMenu,
                mentions: [m.sender]
            }, { quoted: m });

        } catch (err) {
            console.error('Error en menutest:', err);
        }
    }
};

export default menuCommand;