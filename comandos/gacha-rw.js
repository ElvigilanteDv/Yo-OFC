import { config } from '../config.js';
import fs from 'fs';
import path from 'path';

const gachaPath = path.resolve('./config/database/gacha/gacha_list.json');
const baseGroup = "120363423871589037@g.us";

const rwCommand = {
    name: 'rw',
    alias: ['roll', 'waifu'],
    category: 'gacha',
    desc: 'Realiza un roll para descubrir un nuevo personaje en el grupo.',
    noPrefix: true,
    isGroup: true,

    run: async (conn, m) => {
        try {
            const group = m.chat;
            const user = m.sender;
            const ahora = Date.now();

            if (!global.db.data.users[user]) global.db.data.users[user] = {};
            const userDb = global.db.data.users[user];
            const cooldownTime = 10 * 60 * 1000;

            if (userDb.lastGachaRoll && ahora - userDb.lastGachaRoll < cooldownTime) {
                const restante = userDb.lastGachaRoll + cooldownTime - ahora;
                return m.reply(`*${config.visuals.emoji2}* ¡Espera! Faltan ${Math.ceil(restante / 60000)} min.`);
            }

            if (!fs.existsSync(gachaPath)) return m.reply('Error: Base de datos gacha no encontrada.');
            const rawData = JSON.parse(fs.readFileSync(gachaPath, 'utf-8'));
            const plantillaPersonajes = rawData[baseGroup];
            const allIds = Object.keys(plantillaPersonajes);

            if (!global.db.data.chats[group].gacha) global.db.data.chats[group].gacha = {};
            const dbGrupo = global.db.data.chats[group].gacha;

            const esDomadoRoll = Math.random() < 0.01;
            let pool = [];

            if (esDomadoRoll) {
                pool = allIds.filter(id => dbGrupo[id] && dbGrupo[id].status === 'domado');
            }

            if (pool.length === 0) {
                pool = allIds.filter(id => !dbGrupo[id] || dbGrupo[id].status === 'libre');
                if (pool.length === 0) pool = allIds;
            }

            const randomId = pool[Math.floor(Math.random() * pool.length)];
            const infoFija = plantillaPersonajes[randomId];
            const infoGrupo = dbGrupo[randomId] || { status: 'libre', owner: null };

            let caption = `*» (❍ᴥ❍ʋ) \`GACHA ROLL\` «*\n\n`;
            caption += `*Nombre:* ${infoFija.name}\n`;
            caption += `*ID »* ${randomId}\n`;
            caption += `*Fuente:* ${infoFija.source}\n`;
            caption += `*Valor:* ¥${infoFija.value.toLocaleString()}\n`;
            caption += `*Estado:* ${infoGrupo.status === 'libre' ? 'Libre' : 'Domado'}\n`;
            
            if (infoGrupo.owner) {
                const ownerId = infoGrupo.owner.split('@')[0];
                caption += `*Dueño:* @${ownerId}\n`;
            }

            const sent = await conn.sendMessage(m.chat, { 
                image: { url: infoFija.url }, 
                caption: caption,
                mentions: infoGrupo.owner ? [infoGrupo.owner] : []
            }, { quoted: m });

            if (!global.db.data.chats[group].rolls) global.db.data.chats[group].rolls = {};
            global.db.data.chats[group].rolls[sent.key.id] = { 
                id: randomId, 
                expiresAt: ahora + 60000 
            };

            userDb.lastGachaRoll = ahora;

        } catch (e) {
            console.error(e);
            m.reply(`*${config.visuals.emoji2}* Error en el sistema de gacha.`);
        }
    }
};

export default rwCommand;