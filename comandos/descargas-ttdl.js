import { config } from '../config.js';
import axios from 'axios';

const tiktokDownload = {
    name: 'tiktok',
    alias: ['tt', 'ttdl'],
    category: 'descargas',
    desc: 'Descarga videos de TikTok por enlace.',
    noPrefix: true,

    run: async (conn, m, args, usedPrefix, commandName, text) => {
        if (!text) return m.reply(`*${config.visuals.emoji2}* Ingrese el enlace.`);
        
        await conn.sendMessage(m.chat, { react: { text: '⌛', key: m.key } });

        try {
            const apiKey = 'kzm-71kPY-SJoqbOKj';
            // Se envía el texto directo sin encodeURIComponent
            const fullUrl = `https://api.kazuma.giize.com/api/download/tiktok?url=${text}&apikey=${apiKey}`;

            const { data: res } = await axios.get(fullUrl);

            if (!res.status || !res.data) {
                await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
                return m.reply('La API no encontró el video.');
            }

            const { title, author, media } = res.data;
            let txt = `*${config.visuals.emoji3} TikTok Descargado*\n\n`;
            txt += `📝 *Título:* ${title}\n`;
            txt += `👤 *Autor:* ${author.nickname}\n`;
            txt += `📦 *Tamaño:* ${media.size}`;

            await conn.sendMessage(m.chat, { 
                video: { url: media.no_watermark }, 
                caption: txt 
            }, { quoted: m });
            
            await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });
        } catch (e) {
            await conn.sendMessage(m.chat, { react: { text: '✖️', key: m.key } });
            m.reply(`*${config.visuals.emoji2}* Error: ${e.response?.data?.message || e.message}`);
        }
    }
};

export default tiktokDownload;