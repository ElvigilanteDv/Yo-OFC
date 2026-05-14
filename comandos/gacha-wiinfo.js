import { config } from '../config.js';
import { getAnimeImage } from 'wimages-lib';

const waifuImageCommand = {
    name: 'waifuinfo',
    alias: ['wiinfo', 'winfo'],
    category: 'gacha',
    desc: 'Busca imágenes e info de personajes en WimagesLib.',
    noPrefix: true,

    run: async (conn, m, args, usedPrefix, commandName, text) => {
        try {
            const query = text || args.join(' ');
            if (!query) {
                return m.reply(`*${config.visuals.emoji2}* Ingrese el nombre del personaje.\n\nEjemplo: ${usedPrefix}${commandName} Yotsuba`);
            }

            await conn.sendMessage(m.chat, { react: { text: '⌛', key: m.key } });

            const character = await getAnimeImage(query);

            if (!character || (Array.isArray(character) && character.length === 0)) {
                await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
                return m.reply(`*${config.visuals.emoji2}* No encontré a "${query}" en mi base de datos.`);
            }

            const data = Array.isArray(character) ? character[0] : character;

            let txt = `*${config.visuals.emoji3} INFO - CHARACTER*\n\n`;
            txt += `*Nombre:* ${data.name || 'Desconocido'}\n`;
            txt += `*Anime:* ${data.source || 'No especificado'}\n`;
            txt += `*Rareza:* ${data.rarity || 'Común'}\n\n`;
            txt += `*Descripción:* ${data.description || 'Sin descripción'}\n\n`;
            txt += `> © Developed by Félix`;

            if (data.imageUrl) {
                await conn.sendMessage(m.chat, { 
                    image: { url: data.imageUrl }, 
                    caption: txt 
                }, { quoted: m });

                await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });
            } else {
                throw new Error('No image URL found');
            }

        } catch (e) {
            console.error('Error en waifuinfo:', e);
            await conn.sendMessage(m.chat, { react: { text: '✖️', key: m.key } });
            m.reply(`*${config.visuals.emoji2}* Error al consultar WimagesLib o personaje no válido.`);
        }
    }
};

export default waifuImageCommand;