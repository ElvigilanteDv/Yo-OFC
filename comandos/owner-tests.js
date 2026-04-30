import { config } from '../config.js';
import fs from 'fs-extra';
import path from 'path';

const ecoPath = path.resolve('./config/database/economy/economy.json');
const rpgPath = path.resolve('./config/database/rpg/rpg.json');

const menuCommand = {
    name: 'menu',
    alias: ['help', 'menú', 'ayuda'],
    category: 'main',
    desc: 'Muestra la lista de comandos disponibles.',
    isOwner: false,
    noPrefix: true,

    run: async (conn, m, args, usedPrefix) => {
        try {
            const prefix = usedPrefix || '#'; 
            const user = m.sender.split('@')[0].split(':')[0];
            const group = m.chat;
            const botNumber = conn.user.id.split(':')[0].replace(/\D/g, '');

            // Configuración de visuales y sesión
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

            // Datos de usuario
            const ecoDB = await fs.pathExists(ecoPath) ? await fs.readJson(ecoPath) : {};
            const rpgDB = await fs.pathExists(rpgPath) ? await fs.readJson(rpgPath) : {};
            const wallet = ecoDB[user]?.wallet || 0;
            const userRpg = rpgDB[group]?.[user] || {};
            const rank = userRpg.rank || 'Novato de las Cuevas';
            const diamantes = userRpg.minerals?.diamantes || 0;

            const infoBot = `┏━━━━✿︎ 𝐈𝐍𝐅𝐎-𝐁𝐎𝐓 ✿︎━━━━╮\n┃ ✐ *Owner* »\n┃ kazuma.giize.com/Dev-FelixOfc\n┃ ✐ *Commands* »\n┃ kazuma.giize.com/commands\n┃ ✐ *Official channel* »\n┃ https://whatsapp.com/channel/0029Vb6sgWdJkK73qeLU0J0N\n╰━━━━━━━━━━━━━━━━━━━╯\n`;

            const infoUser = `┏━━━━✿︎ 𝐈𝐍𝐅𝐎-𝐔𝐒𝐄𝐑 ✿︎━━━━╮\n┃ ✐ *Usuario* »  @${user}\n┃ ✐ *Rango* » ${rank}\n┃ ✐ *Coins* » ¥${wallet.toLocaleString()}\n┃ ✐ *Diamantes* » ${diamantes}\n╰━━━━━━━━━━━━━━━━━━━╯`;

            // Lógica para filtrar comandos por categoría
            // Asumimos que los comandos están en conn.commands (o donde los cargue tu bot)
            const allCommands = Array.from(conn.commands.values());
            const categories = [...new Set(allCommands.map(cmd => cmd.category))];

            const input = args[0]?.toLowerCase();
            let finalBody = "";
            let subHeader = "";

            const formatCategory = (cat) => {
                const cmdsInCat = allCommands.filter(cmd => cmd.category === cat);
                let catText = `*» (❍ᴥ❍ʋ) \`${cat.toUpperCase()}\` «*\n> ꕥ Comandos de la categoría ${cat}.\n\n`;
                
                cmdsInCat.forEach(cmd => {
                    const names = [cmd.name, ...(cmd.alias || [])].map(n => prefix + n).join(', ');
                    catText += `*✿︎ ${names}*\n> ❀ ${cmd.desc || 'Sin descripción.'}\n\n`;
                });
                return catText;
            };

            if (!input) {
                subHeader = `*☞︎︎︎ Lista Completa de Comandos ☜︎︎︎*\n\n`;
                finalBody = categories.map(cat => formatCategory(cat)).join('\n');
            } else if (categories.includes(input)) {
                subHeader = `*☞︎︎︎ Comandos para \`${input.toUpperCase()}\` ☜︎︎︎*\n\n`;
                finalBody = formatCategory(input);
            } else {
                return m.reply(`*${config.visuals.emoji2}* \`Categoría no encontrada\`\n\n*Categorías* »\n${categories.map(c => `> ➪ ${c}`).join('\n')}`);
            }

            let header = `¡Hola! Soy ${displayLongName} *(${currentBotType})*.\n\n`;
            let textoMenu = `${header}${subHeader}${infoBot}\n${infoUser}\n\n${finalBody}`;

            await conn.sendMessage(m.chat, { 
                image: { url: displayBanner }, 
                caption: textoMenu,
                mentions: [m.sender]
            }, { quoted: m });

        } catch (err) {
            console.error('Error en el menú dinámico:', err);
        }
    }
};

export default menuCommand;