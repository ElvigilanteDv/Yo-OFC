import { config } from '../config.js';
import axios from 'axios';

const pinterestCommand = {
    name: 'pinterest',
    alias: ['pin', 'pinter'],
    category: 'tools',
    desc: 'Busca imágenes en Pinterest usando la API de Kazuma.',
    noPrefix: true,

    run: async (conn, m, args, usedPrefix, commandName, text) => {
        try {
            if (!text) {
                return m.reply(`*${config.visuals.emoji2}* Ingrese el texto de búsqueda.\n\nEjemplo: ${usedPrefix}${commandName} Yotsuba Nakano`);
            }

            await conn.sendMessage(m.chat, { react: { text: '⌛', key: m.key } });

            const apiUrl = `https://${config.kzmUrl}/api/search/pinterest?query=${encodeURIComponent(text)}&apiKey=${config.apiKzm}`;

            const response = await axios.get(apiUrl);
            const res = response.data;

            if (!res.status || !res.data || res.data.length === 0) {
                await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
                return m.reply(`*${config.visuals.emoji2}* No encontré resultados.`);
            }

            m.reply(`*${config.visuals.emoji3}* Buscando resultados en la API para: ${text}...`);

            const images = res.data.slice(0, 10);

            for (let item of images) {
                if (item.image_url) {
                    await conn.sendMessage(m.chat, { 
                        image: { url: item.image_url }
                    }, { quoted: m });
                }
            }

            await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });

        } catch (e) {
            await conn.sendMessage(m.chat, { react: { text: '✖️', key: m.key } });
            m.reply(`*${config.visuals.emoji2}* Error en la API de Kazuma.`);
        }
    }
};

export default pinterestCommand;