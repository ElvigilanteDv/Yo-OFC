import { config } from '../config.js';
import axios from 'axios';

const tiktokSearch = {
    name: 'ttsearch',
    alias: ['tiktoksearch', 'tiktoks'],
    category: 'descargas',
    desc: 'Busca videos en TikTok con todo y enlace de descarga.',
    noPrefix: true,

    run: async (conn, m, { text }) => {
        if (!text) return m.reply(`*${config.visuals.emoji2}* Ingrese búsqueda.\nEj: #ttsearch RDjavi`);

        await conn.sendMessage(m.chat, { react: { text: '⌛', key: m.key } });

        try {
            const apiUrl = `https://${config.kzmUrl}/api/search/tiktok?apiKey=${config.apiKzm}&query=${encodeURIComponent(text)}`;
            
            const response = await axios.get(apiUrl, {
                timeout: 10000,
                headers: {
                    'Accept': 'application/json'
                }
            });

            const res = response.data;

            if (!res.status || !res.data || res.data.length === 0) {
                await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
                return m.reply('Sin resultados.');
            }

            let txt = `*${config.visuals.emoji3} RESULTADOS DE TIKTOK*\n\n`;
            txt += `🔎 *Búsqueda:* ${text}\n`;
            txt += `👤 *Creador:* ${res.creator}\n`;
            txt += `───────────────────\n\n`;

            res.data.slice(0, 10).forEach((v, i) => {
                txt += `*${i + 1}.* ${v.title || 'TikTok Video'}\n`;
                txt += `   👤 *Autor:* ${v.author.nickname}\n`;
                txt += `   📥 *Descarga:* ${v.play}\n\n`;
            });

            const coverUrl = res.data[0].cover || res.data[0].origin_cover;

            await conn.sendMessage(m.chat, { 
                image: { url: coverUrl }, 
                caption: txt.trim() 
            }, { quoted: m });

            await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });

        } catch (error) {
            await conn.sendMessage(m.chat, { react: { text: '✖️', key: m.key } });
            m.reply('Error al conectar con la API. Verifica que el servidor esté activo.');
        }
    }
};

export default tiktokSearch;