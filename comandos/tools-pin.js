import { config } from '../config.js';
import axios from 'axios';

const pinterestCommand = {
    name: 'pinterest',
    alias: ['pin', 'pinter'],
    category: 'search',
    desc: 'Busca imágenes en Pinterest usando la API de Kazuma.',
    isGroup: false,
    noPrefix: true,

    run: async (conn, m, args, usedPrefix, commandName, text) => {
        try {
            if (!text) {
                return m.reply(`*${config.visuals.emoji2}* Ingrese el texto de búsqueda.\n\nEjemplo: ${usedPrefix}${commandName} Yotsuba Nakano`);
            }

            if (m.react) m.react('⌛');

            const apiKey = 'kzm-71kPY-SJoqbOKj';
            const apiUrl = `https://api.kazuma.giize.com/api/search/pinterest?query=${encodeURIComponent(text)}&apikey=${apiKey}`;

            const response = await axios.get(apiUrl);
            const res = response.data;

            if (!res.status || !res.data || res.data.length === 0) {
                if (m.react) m.react('❌');
                return m.reply(`*${config.visuals.emoji2}* No encontré resultados.`);
            }

            m.reply(`*${config.visuals.emoji3}* Buscando resultados en la API para: ${text}...`);

            const images = res.data.slice(0, 17);

            for (let item of images) {
                if (item.image_url) {
                    await conn.sendMessage(m.chat, { 
                        image: { url: item.image_url }
                    }, { quoted: m });
                }
            }

            if (m.react) m.react('✅');

        } catch (e) {
            if (m.react) m.react('✖️');
            m.reply(`*${config.visuals.emoji2}* Error en la API de Kazuma.`);
        }
    }
};

export default pinterestCommand;