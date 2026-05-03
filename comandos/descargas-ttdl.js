import { config } from '../config.js';
import axios from 'axios';

const tiktokDownload = {
    name: 'tiktok',
    alias: ['tt', 'ttdl'],
    category: 'descargas',
    desc: 'Descarga videos de TikTok por enlace.',
    noPrefix: true,

    run: async (conn, m, args, usedPrefix, commandName, text) => {
        if (!text) return m.reply(`*${config.visuals.emoji2}* Ingrese el enlace.\nEj: #tiktok https://vm.tiktok.com/...`);
        
        await conn.sendMessage(m.chat, { react: { text: '⌛', key: m.key } });

        try {
            const { data: res } = await axios.get(`https://api.kazuma.giize.com/api/download/tiktok?url=${encodeURIComponent(text)}&apikey=kzm-71kPY-SJoqbOKj`);

            if (!res.status || !res.data) {
                await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
                return m.reply('La API no devolvió datos válidos.');
            }

            const { title, author, media, stats } = res.data;
            let txt = `*${config.visuals.emoji3} TikTok Descargado*\n\n`;
            txt += `📝 *Título:* ${title}\n`;
            txt += `👤 *Autor:* ${author.nickname}\n`;
            txt += `📊 *Stats:* ${stats.likes} ❤️ | ${stats.shares} 🚀\n`;
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