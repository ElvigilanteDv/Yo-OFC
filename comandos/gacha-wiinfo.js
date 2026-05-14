import { config } from '../config.js';
import { getAnimeImage } from 'wimages-lib';

const waifuImageCommand = {
    name: 'waifuinfo',
    alias: ['wiinfo'],
    category: 'gacha',
    desc: 'Busca imágenes e info de personajes en WimagesLib.',
    noPrefix: true,

    run: async (conn, m, args, usedPrefix, commandName, text) => {
        try {
            if (!text) {
                return m.reply(`*${config.visuals.emoji2}* Ingrese el nombre del personaje.\n\nEjemplo: ${usedPrefix}${commandName} Yotsuba`);
            }

            await conn.sendMessage(m.chat, { react: { text: '⌛', key: m.key } });

            const character = await getAnimeImage(text);

            if (!character || character.length === 0) {
                await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
                return m.reply(`*${config.visuals.emoji2}* No encontré a "${text}" en mi base de datos.`);
            }

            const data = character[0];

            let txt = `*${config.visuals.emoji3} INFO - CHARACTER*\n\n`;
            txt += `*Nombre:* ${data.name}\n`;
            txt += `*Anime:* ${data.anime}\n`;
            txt += `*Rareza:* ${data.rarity || 'Común'}\n`;
            txt += `*Tags:* ${data.tags?.join(', ') || 'Sin etiquetas'}\n\n`;
            txt += `> © Developed by Félix`;

            await conn.sendMessage(m.chat, { 
                image: { url: data.imageUrl }, 
                caption: txt 
            }, { quoted: m });

            await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });

        } catch (e) {
            await conn.sendMessage(m.chat, { react: { text: '✖️', key: m.key } });
            m.reply(`*${config.visuals.emoji2}* Error al consultar WimagesLib.`);
        }
    }
};

export default waifuImageCommand;