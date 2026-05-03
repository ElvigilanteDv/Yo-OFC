import { config } from '../config.js';
import axios from 'axios';

const tiktokSearch = {
    name: 'ttsearch',
    alias: ['tiktoksearch', 'tiktoks'],
    category: 'descargas',
    desc: 'Busca videos en TikTok.',
    noPrefix: true,

    run: async (conn, m, { usedPrefix, commandName, text }) => {
        if (!text) return m.reply(`*${config.visuals.emoji2}* Ingrese el texto de búsqueda.\n\nEjemplo: ${usedPrefix}${commandName} RDjavi clips`);
        
        await conn.sendMessage(m.chat, { react: { text: '⌛', key: m.key } });

        try {
            const { data: res } = await axios.get(`https://api.kazuma.giize.com/api/search/tiktok?query=${encodeURIComponent(text)}&apikey=kzm-71kPY-SJoqbOKj`);

            if (!res.status || !res.data?.length) {
                await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
                return m.reply(`*${config.visuals.emoji2}* Sin resultados.`);
            }

            let txt = `*${config.visuals.emoji3} Resultados para:* ${text}\n\n`;
            res.data.slice(0, 10).forEach((v, i) => {
                txt += `*${i + 1}.* ${v.title || 'TikTok'}\n`;
                txt += `   👤 *Autor:* ${v.author.nickname}\n`;
                txt += `   📥 *Link:* ${v.play}\n\n`;
            });

            await conn.sendMessage(m.chat, { image: { url: res.data[0].cover }, caption: txt.trim() }, { quoted: m });
            await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });

        } catch {
            await conn.sendMessage(m.chat, { react: { text: '✖️', key: m.key } });
            m.reply(`*${config.visuals.emoji2}* Error en la API.`);
        }
    }
};

export default tiktokSearch;