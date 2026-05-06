import { config } from '../config.js';
import axios from 'axios';

const tiktokSearch = {
    name: 'ttsearch',
    alias: ['tiktoksearch', 'tiktoks'],
    category: 'descargas',
    desc: 'Busca videos en TikTok con todo y enlace de descarga.',
    noPrefix: true,

    run: async (conn, m, args, usedPrefix, commandName, text) => {
        if (!text) return m.reply(`*${config.visuals.emoji2}* Ingrese búsqueda.\nEj: #ttsearch RDjavi`);
        
        await conn.sendMessage(m.chat, { react: { text: '⌛', key: m.key } });

        try {
            const { data: res } = await axios.get(`https://rest.kazuma.giize.com/api/search/tiktok?query=${encodeURIComponent(text)}&apiKey=${config.apiKzm}`);

            if (!res.status || !res.data?.length) {
                await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
                return m.reply('Sin resultados.');
            }

            let txt = `*${config.visuals.emoji3} Resultados:* ${text}\n\n`;
            res.data.slice(0, 10).forEach((v, i) => {
                txt += `*${i + 1}.* ${v.title || 'TikTok'}\n`;
                txt += `   👤 *Autor:* ${v.author.nickname}\n`;
                txt += `   📥 *Enlace de descarga »* ${v.play}\n\n`;
            });

            await conn.sendMessage(m.chat, { image: { url: res.data[0].cover }, caption: txt.trim() }, { quoted: m });
            await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });
        } catch {
            await conn.sendMessage(m.chat, { react: { text: '✖️', key: m.key } });
            m.reply('Error en API.');
        }
    }
};

export default tiktokSearch;
