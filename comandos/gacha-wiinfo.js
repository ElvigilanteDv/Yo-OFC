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
            // Validación de texto
            const query = text || args.join(' ');
            if (!query) {
                return m.reply(`*${config.visuals.emoji2}* Ingrese el nombre del personaje.\n\nEjemplo: ${usedPrefix}${commandName} Yotsuba`);
            }

            await conn.sendMessage(m.chat, { react: { text: '⌛', key: m.key } });

            // Llamada a tu librería personalizada
            const character = await getAnimeImage(query);

            // Verificación de resultados
            if (!character || (Array.isArray(character) && character.length === 0)) {
                await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
                return m.reply(`*${config.visuals.emoji2}* No encontré a "${query}" en mi base de datos.`);
            }

            // Si es un array sacamos el primero, si es objeto lo usamos directo
            const data = Array.isArray(character) ? character[0] : character;

            let txt = `*${config.visuals.emoji3} INFO - CHARACTER*\n\n`;
            txt += `*Nombre:* ${data.name || 'Desconocido'}\n`;
            txt += `*Anime:* ${data.anime || 'No especificado'}\n`;
            txt += `*Rareza:* ${data.rarity || 'Común'}\n`;
            txt += `*Tags:* ${Array.isArray(data.tags) ? data.tags.join(', ') : 'Sin etiquetas'}\n\n`;
            txt += `> © Developed by Félix`;

            // Enviar imagen con caption
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