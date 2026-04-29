import { config } from '../config.js';
import fs from 'fs-extra';
import path from 'path';

const ecoPath = path.resolve('./config/database/economy/economy.json');
const rpgPath = path.resolve('./config/database/rpg/rpg.json');

const menuCommand = {
    name: 'menu',
    alias: ['help', 'menú', 'ayuda'],
    category: 'main',
    isOwner: false,
    noPrefix: true,

    run: async (conn, m, args, usedPrefix) => {
        try {
            const prefix = usedPrefix || '#'; 
            const user = m.sender.split('@')[0].split(':')[0];
            const group = m.chat;
            const botNumber = conn.user.id.split(':')[0].replace(/\D/g, '');

            const subSessionsPath = path.resolve('./sesiones_subbots');
            const moodSessionsPath = path.resolve('./sesiones_moods');

            let settingsPath = '';
            let currentBotType = 'Mood';

            // Detectar tipo de bot y cargar configuración visual personalizada
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

            // Datos de economía/RPG
            const ecoDB = await fs.pathExists(ecoPath) ? await fs.readJson(ecoPath) : {};
            const rpgDB = await fs.pathExists(rpgPath) ? await fs.readJson(rpgPath) : {};
            const wallet = ecoDB[user]?.wallet || 0;
            const userRpg = rpgDB[group]?.[user] || {};
            const rank = userRpg.rank || 'Novato de las Cuevas';
            const diamantes = userRpg.minerals?.diamantes || 0;

            // --- LÓGICA DE CARGA INTELIGENTE DE COMANDOS ---
            const allCommands = Array.from(global.commands.values());
            const categories = {};

            allCommands.forEach(cmd => {
                const cat = cmd.category ? cmd.category.toLowerCase() : 'otros';
                if (!categories[cat]) categories[cat] = [];
                // Evitar duplicados por alias
                if (!categories[cat].some(c => c.name === cmd.name)) {
                    categories[cat].push({
                        name: cmd.name,
                        alias: cmd.alias || []
                    });
                }
            });

            // Secciones fijas del diseño
            const infoBot = `┏━━━━✿︎ 𝐈𝐍𝐅𝐎-𝐁𝐎𝐓 ✿︎━━━━╮
┃ ✐ *Owner* »
┃ kazuma.giize.com/Dev-FelixOfc
┃ ✐ *Commands* »
┃ kazuma.giize.com/commands
┃ ✐ *Upload* »
┃ upload.yotsuba.giize.com
┃ ✐ *Official channel* »
┃ https://whatsapp.com/channel/0029Vb6sgWdJkK73qeLU0J0N
╰━━━━━━━━━━━━━━━━━━━╯\n`;

            const infoUser = `┏━━━━✿︎ 𝐈𝐍𝐅𝐎-𝐔𝐒𝐄𝐑 ✿︎━━━━╮
┃ ✐ *Usuario* »  @${user}
┃ ✐ *Rango* » ${rank}
┃ ✐ *Coins* » ¥${wallet.toLocaleString()}
┃ ✐ *Diamantes* » ${diamantes}
╰━━━━━━━━━━━━━━━━━━━╯`;

            let header = `¡Hola! Soy ${displayLongName} *(${currentBotType})*.\n\n`;
            let finalBody = "";

            const input = args[0]?.toLowerCase();

            // Si el usuario pide una categoría específica o el menú general
            const catToDisplay = input && categories[input] ? [input] : Object.keys(categories).sort();

            if (input && !categories[input]) {
                return m.reply(`*${config.visuals.emoji2}* \`Categoría no encontrada\`\n\n*Categorías disponibles:* \n${Object.keys(categories).map(c => `> ➪ ${c}`).join('\n')}`);
            }

            // Construcción dinámica del cuerpo del menú respetando tu diseño
            for (const cat of catToDisplay) {
                // Títulos personalizados por categoría (puedes añadir más aquí)
                const titles = {
                    main: "MAIN",
                    economy: "ECONOMY",
                    sockets: "SOCKETS",
                    gacha: "GACHA",
                    perfil: "PERFIL",
                    gestion: "GESTIÓN",
                    admins: "ADMINS",
                    descargas: "DESCARGAS",
                    tools: "TOOLS",
                    owner: "OWNER"
                };

                finalBody += `*» (❍ᴥ❍ʋ) \`${titles[cat] || cat.toUpperCase()}\` «*\n`;
                
                categories[cat].forEach(cmd => {
                    const aliases = cmd.alias.length > 0 ? ` • ${prefix}${cmd.alias.join(` • ${prefix}`)}` : '';
                    finalBody += `*✿︎ ${prefix}${cmd.name}${aliases}*\n`;
                });
                finalBody += `\n`;
            }

            let textoMenu = `${header}${infoBot}\n${infoUser}\n\n${finalBody}`;

            await conn.sendMessage(m.chat, { 
                image: { url: displayBanner }, 
                caption: textoMenu,
                mentions: [m.sender]
            }, { quoted: m });

        } catch (err) {
            console.error('Error en el menú:', err);
        }
    }
};

export default menuCommand;