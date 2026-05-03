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
                return m.reply(`Ingrese el texto de búsqueda.\n\nEjemplo: ${usedPrefix}${commandName} Yotsuba Nakano`);
            }

            const apiKey = 'kzm-71kPY-SJoqbOKj';
            const apiUrl = `https://api.kazuma.giize.com/api/search/pinterest?query=${encodeURIComponent(text)}&apikey=${apiKey}`;

            const response = await axios.get(apiUrl);
            const res = response.data;

            if (!res.status || !res.data || res.data.length === 0) {
                return m.reply('No se encontraron resultados.');
            }

            m.reply(`He encontrado resultados para: ${text}`);

            for (let item of res.data) {
                if (item.image_url) {
                    await conn.sendMessage(m.chat, { 
                        image: { url: item.image_url }
                    }, { quoted: m });
                }
            }

        } catch (e) {
            m.reply('Error en la API.');
        }
    }
};

export default pinterestCommand;