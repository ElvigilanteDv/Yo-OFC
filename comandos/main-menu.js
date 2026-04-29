import { config } from '../config.js';
import fs from 'fs-extra';
import path from 'path';

const ecoPath = path.resolve('./config/database/economy/economy.json');
const rpgPath = path.resolve('./config/database/rpg/rpg.json');

// --- DICCIONARIO DE DESCRIPCIONES (Tu contenido original) ---
const descriptions = {
    "menu": "Solicita la lista de comandos.",
    "ping": "Calcular la latencia del bot.",
    "status": "Mirar información detallada del bot.",
    "daily": "Reclama tu recompensa diaria de coins.",
    "work": "Trabaja duro para obtener un salario.",
    "slut": "Arriésgate en el escenario para ganar dinero.",
    "crime": "Comete actos ilícitos para obtener grandes sumas.",
    "baltop": "Mira el ranking global de los usuarios más ricos.",
    "deposit": "Asegura tus coins enviándolas al banco.",
    "pay": "Envía dinero de tu banco a otros usuarios.",
    "coinflip": "Apuesta ¥1,000 en un cara o cruz.",
    "economy": "Consulta tus balances y tiempos de espera.",
    "code": "Hazte SubBot de Kazuma.",
    "bots": "Mira la lista de sockets activos.",
    "delsession": "Elimina tu sesión de subbot.",
    "rw": "Lanza un dado para encontrar un personaje aleatorio.",
    "claim": "Reclama y compra al personaje que acaba de salir.",
    "harem": "Mira tu colección de personajes con sus IDs.",
    "sell": "Pon un personaje en venta (Valor + ¥1,000 mín).",
    "haremshop": "Mira el catálogo de personajes en venta por otros usuarios.",
    "buy": "Adquiere un personaje del mercado de usuarios.",
    "trade": "Intercambia personajes con otros usuarios.",
    "profile": "Visualiza tu estado, economía y pareja.",
    "marry": "Inicia un pacto matrimonial o disuelve tu vínculo.",
    "update": "Actualiza el servidor via Git.",
    "backup": "El bot envía el contenido actual de la base de datos pedida.",
    "deletesession": "Elimina todas las sesiones de subbots o una sola."
    // Agrega aquí las descripciones de los comandos que falten
};

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
            const botNumber = conn.user.id.split(':')[0].replace(/\D/g, '');

            // Configuración visual (Banner y Nombre)
            let displayLongName = config.botName;
            let displayBanner = config.visuals.img1;
            // ... (lógica de detección de SubBot/Mood que ya tienes arriba se mantiene igual)

            // Carga de comandos en memoria
            const allCommands = Array.from(global.commands.values());
            const categories = {};

            allCommands.forEach(cmd => {
                const cat = cmd.category ? cmd.category.toLowerCase() : 'otros';
                if (!categories[cat]) categories[cat] = [];
                if (!categories[cat].some(c => c.name === cmd.name)) {
                    categories[cat].push({
                        name: cmd.name,
                        alias: cmd.alias || [],
                        desc: descriptions[cmd.name] || "Comando sin descripción configurada."
                    });
                }
            });

            // Estructura de diseño
            const infoBot = `┏━━━━✿︎ 𝐈𝐍𝐅𝐎-𝐁𝐎𝐓 ✿︎━━━━╮
┃ ✐ *Owner* » kazuma.giize.com/Dev-FelixOfc
┃ ✐ *Commands* » kazuma.giize.com/commands
┃ ✐ *Official channel* » https://whatsapp.com/channel/0029Vb6sgWdJkK73qeLU0J0N
╰━━━━━━━━━━━━━━━━━━━╯\n`;

            const infoUser = `┏━━━━✿︎ 𝐈𝐍𝐅𝐎-𝐔𝐒𝐄𝐑 ✿︎━━━━╮
┃ ✐ *Usuario* »  @${user}
┃ ✐ *Coins* » ¥${(ecoDB[user]?.wallet || 0).toLocaleString()}
╰━━━━━━━━━━━━━━━━━━━╯`;

            let finalBody = "";
            const input = args[0]?.toLowerCase();
            const catToDisplay = input && categories[input] ? [input] : Object.keys(categories).sort();

            for (const cat of catToDisplay) {
                const categoryTitles = {
                    main: "MAIN", economy: "ECONOMY", sockets: "SOCKETS", 
                    gacha: "GACHA", perfil: "PERFIL", owner: "OWNER"
                };

                finalBody += `*» (❍ᴥ❍ʋ) \`${categoryTitles[cat] || cat.toUpperCase()}\` «*\n`;
                finalBody += `> ꕥ Sección de comandos para ${cat}.\n\n`;
                
                categories[cat].forEach(cmd => {
                    const aliases = cmd.alias.length > 0 ? ` • ${prefix}${cmd.alias.join(` • ${prefix}`)}` : '';
                    finalBody += `*✿︎ ${prefix}${cmd.name}${aliases}*\n`;
                    finalBody += `> ❀ ${cmd.desc}\n`; // AQUÍ SE CARGA TU DESCRIPCIÓN
                });
                finalBody += `\n`;
            }

            let textoMenu = `¡Hola! Soy ${displayLongName}.\n\n${infoBot}\n${infoUser}\n\n${finalBody}`;

            await conn.sendMessage(m.chat, { 
                image: { url: displayBanner }, 
                caption: textoMenu,
                mentions: [m.sender]
            }, { quoted: m });

        } catch (err) {
            console.error(err);
        }
    }
};

export default menuCommand;