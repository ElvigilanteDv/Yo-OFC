import { config } from '../config.js';
import fs from 'fs';
import path from 'path';

const gachaPath = path.resolve('./config/database/gacha/gacha_list.json');
const cooldowns = new Map();

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

            if (!gachaDB[group]) return m.reply('No hay personajes configurados para este grupo.');

            let allIds = Object.keys(gachaDB[group]);
            let libresNoSimpson = allIds.filter(id => 
                gachaDB[group][id].status === 'libre' && 
                !gachaDB[group][id].source.toLowerCase().includes('simpson')
            );

            let simpsonsLibres = allIds.filter(id => 
                gachaDB[group][id].status === 'libre' && 
                gachaDB[group][id].source.toLowerCase().includes('simpson')
            );

            let keys;
            if (libresNoSimpson.length > 0) {
                keys = libresNoSimpson;
            } else if (simpsonsLibres.length > 0) {
                keys = simpsonsLibres;
            } else {
                keys = allIds;
            }

            const randomId = keys[Math.floor(Math.random() * keys.length)];
            const pj = gachaDB[group][randomId];

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