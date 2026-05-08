import { config } from '../config.js';
import axios from 'axios';

const instagramDownload = {
    name: 'instagram',
    alias: ['ig', 'igdl'],
    category: 'descargas',
    desc: 'Descarga videos o fotos de Instagram.',
    noPrefix: true,

    run: async (conn, m, args, usedPrefix, commandName, text) => {
        const urlMatch = text?.match(/https?:\/\/(www\.)?instagram\.com\/[^\s]+/gi);
        const link = urlMatch ? urlMatch[0] : null;

        if (!link) return m.reply(`*${config.visuals.emoji2}* Ingresa un enlace de Instagram para descargar.`);

        await conn.sendMessage(m.chat, { react: { text: '⌛', key: m.key } });

        try {
            const { data: res } = await axios.get(`https://${config.kzmUrl}/api/download/instagram?url=${link}&apiKey=${config.apiKzm}`);

            if (!res.status || !res.data || res.data.length === 0) {
                await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
                return m.reply('Contenido no encontrado o el enlace es privado.');
            }

            const mediaUrl = res.data[0].url;
            const caption = `*${config.visuals.emoji3} Instagram Downloader*`;

            await conn.sendMessage(m.chat, { video: { url: mediaUrl }, caption: caption }, { quoted: m });
            await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });

        } catch (e) {
            await conn.sendMessage(m.chat, { react: { text: '✖️', key: m.key } });
            m.reply(`*${config.visuals.emoji2}* Error: ${e.response?.data?.error || e.message}`);
        }
    }
};

export default instagramDownload;