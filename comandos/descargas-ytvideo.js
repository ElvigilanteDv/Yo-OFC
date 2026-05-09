import { config } from '../config.js';
import axios from 'axios';

const youtubeVideo = {
    name: 'video',
    alias: ['ytv', 'playvid'],
    category: 'descargas',
    desc: 'Busca, muestra info y descarga el video de YouTube.',
    noPrefix: true,

    run: async (conn, m, args, usedPrefix, commandName, text) => {
        if (!text) return m.reply(`*${config.visuals.emoji2}* Por favor, ingresa el nombre del video o el enlace.`);

        await conn.sendMessage(m.chat, { react: { text: '🔍', key: m.key } });

        try {
            const { data: searchRes } = await axios.get(`https://${config.kzmUrl}/api/search/youtube?apiKey=${config.apiKzm}&q=${encodeURIComponent(text)}`);

            if (!searchRes.status || !searchRes.result || searchRes.result.length === 0) {
                await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
                return m.reply('No se encontraron resultados.');
            }

            const firstResult = searchRes.result[0];
            const videoUrl = firstResult.url;
            const durationStr = firstResult.duration;

            const parts = durationStr.split(':').map(Number);
            let totalMinutes = 0;

            if (parts.length === 3) {
                totalMinutes = (parts[0] * 60) + parts[1];
            } else if (parts.length === 2) {
                totalMinutes = parts[0];
            }

            if (totalMinutes >= 35) {
                await conn.sendMessage(m.chat, { react: { text: '⚠️', key: m.key } });
                return m.reply(`*${config.visuals.emoji2}* El video es demasiado largo. El límite permitido es de 35 minutos.`);
            }

            const infoText = `*${config.visuals.emoji3} YouTube Video ${config.visuals.emoji3}*\n\n` +
                             `*= Título* »\n> ${firstResult.title}\n` +
                             `*= Canal* »\n> ${firstResult.channel}\n` +
                             `*= Publicado* »\n> ${firstResult.publishedAt}\n` +
                             `*= Duración* »\n> ${firstResult.duration}\n` +
                             `*= Vistas* »\n> ${firstResult.views}\n` +
                             `*= Enlace* »\n> ${videoUrl}\n\n` +
                             `_Enviando video, espera un momento..._`;

            await conn.sendMessage(m.chat, { 
                image: { url: firstResult.thumbnail }, 
                caption: infoText 
            }, { quoted: m });

            const { data: videoRes } = await axios.get(`https://${config.kzmUrl}/api/download/ytvideo?url=${videoUrl}&apiKey=${config.apiKzm}`);

            if (!videoRes.status || !videoRes.result) {
                await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
                return m.reply('Error al obtener el video del servidor.');
            }

            const videoData = videoRes.result;

            await conn.sendMessage(m.chat, { 
                video: { url: videoData.download_url }, 
                caption: `*${config.visuals.emoji3} ${videoData.title}*`,
                mimetype: 'video/mp4'
            }, { quoted: m });

            await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });

        } catch (e) {
            await conn.sendMessage(m.chat, { react: { text: '✖️', key: m.key } });
            m.reply(`*${config.visuals.emoji2}* Error: ${e.response?.data?.error || e.message}`);
        }
    }
};

export default youtubeVideo;