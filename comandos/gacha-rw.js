import { config } from '../config.js';
import fs from 'fs';
import path from 'path';

const gachaPath = path.resolve('./config/database/gacha/gacha_list.json');
const cooldowns = new Map();
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
            const user = m.sender.split('@')[0].split(':')[0];
            const ahora = Date.now();
            const cooldownKey = `${group}-${user}`;

            if (cooldowns.has(cooldownKey)) {
                const restante = cooldowns.get(cooldownKey) + 10 * 60 * 1000 - ahora;
                if (restante > 0) return m.reply(`*${config.visuals.emoji2}* ¡Espera! Faltan ${Math.ceil(restante / 60000)} min.`);
            }

            if (!fs.existsSync(gachaPath)) return m.reply('Error: Base de datos gacha no encontrada.');
            let gachaDB = JSON.parse(fs.readFileSync(gachaPath, 'utf-8'));

            if (!gachaDB[group]) {
                const newGachaData = JSON.parse(JSON.stringify(gachaDB[baseGroup]));
                Object.keys(newGachaData).forEach(key => {
                    newGachaData[key].owner = null;
                    newGachaData[key].status = 'libre';
                });
                gachaDB[group] = newGachaData;
                fs.writeFileSync(gachaPath, JSON.stringify(gachaDB, null, 2));
            }

            const currentGroupData = gachaDB[group];
            const allIds = Object.keys(currentGroupData);
            
            const esDomadoRoll = Math.random() < 0.01;
            let pool = [];

            if (esDomadoRoll) {
                pool = allIds.filter(id => currentGroupData[id].status === 'domado' || currentGroupData[id].owner !== null);
            }

            if (pool.length === 0) {
                pool = allIds.filter(id => currentGroupData[id].status === 'libre');
                if (pool.length === 0) pool = allIds;
            }

            const randomId = pool[Math.floor(Math.random() * pool.length)];
            const pj = currentGroupData[randomId];

            let caption = `*» (❍ᴥ❍ʋ) \`GACHA ROLL\` «*\n\n`;
            caption += `*Nombre:* ${pj.name}\n`;
            caption += `*ID »* ${randomId}\n`;
            caption += `*Fuente:* ${pj.source}\n`;
            caption += `*Valor:* ¥${pj.value.toLocaleString()}\n`;
            caption += `*Estado:* ${pj.status === 'libre' ? 'Libre' : 'Domado'}\n`;
            if (pj.owner) caption += `*Dueño:* @${pj.owner}\n`;

            const sent = await conn.sendMessage(m.chat, { 
                image: { url: pj.url }, 
                caption: caption,
                mentions: pj.owner ? [pj.owner + '@s.whatsapp.net'] : []
            }, { quoted: m });

            if (!global.db.data.chats[group].rolls) global.db.data.chats[group].rolls = {};
            global.db.data.chats[group].rolls[sent.key.id] = { 
                id: randomId, 
                expiresAt: ahora + 60000 
            };

            cooldowns.set(cooldownKey, ahora);

        } catch (e) {
            m.reply(`*${config.visuals.emoji2}* Error en el sistema de gacha.`);
        }
    }
};

export default rwCommand;