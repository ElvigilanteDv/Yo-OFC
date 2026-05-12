import { config } from '../config.js';
import axios from 'axios';

const youtubeSearch = {
    name: 'ytsearch',
    alias: ['yts', 'searchy'],
    category: 'tools',
    desc: 'Busca y muestra información de los 5 primeros resultados de YouTube.',
    noPrefix: false,

    run: async (conn, m, args, usedPrefix, commandName, text) => {
        const query = text || (m.quoted && m.quoted.text);
        
        if (!query) return m.reply(`*${config.visuals.emoji2}* Por favor, ingresa el texto de búsqueda o responde a un mensaje.`);

        await conn.sendMessage(m.chat, { react: { text: '🔍', key: m.key } });

        const apiUrl = 'https://rest.kazuma.giize.com';
        const apiKey = 'kzm-OAiJOEWc-dRXYVXtW';

        try {
            const { data: searchRes } = await axios.get(`${apiUrl}/api/search/youtube?apiKey=${apiKey}&q=${encodeURIComponent(query)}`);

            if (!searchRes.status || !searchRes.result || searchRes.result.length === 0) {
                await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
                return m.reply('No se encontraron resultados.');
            }

            const results = searchRes.result.slice(0, 5);
            let responseText = `*${config.visuals.emoji3} YouTube Results ${config.visuals.emoji3}*\n\n`;

            results.forEach((res, index) => {
                responseText += `*${index + 1}. ${res.title}*\n`;
                responseText += `*= Canal* » ${res.channel}\n`;
                responseText += `*= Publicado* » ${res.publishedAt}\n`;
                responseText += `*= Duración* » ${res.duration}\n`;
                responseText += `*= Vistas* » ${res.views}\n`;
                responseText += `*= Enlace* » ${res.url}\n\n`;
            });

            await conn.sendMessage(m.chat, { 
                image: { url: results[0].thumbnail }, 
                caption: responseText.trim() 
            }, { quoted: m });

            await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });

        } catch (e) {
            await conn.sendMessage(m.chat, { react: { text: '✖️', key: m.key } });
            m.reply(`*${config.visuals.emoji2}* Error al procesar la búsqueda.`);
        }
    }
};

export default youtubeSearch;