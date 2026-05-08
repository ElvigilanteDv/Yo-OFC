import { config } from '../config.js';
import axios from 'axios';

const youtubeAudio = {
    name: 'play',
    alias: ['audio', 'yta'],
    category: 'descargas',
    desc: 'Busca, muestra info y descarga el audio de YouTube.',
    noPrefix: true,

    run: async (conn, m, args, usedPrefix, commandName, text) => {
        if (!text) return m.reply(`*${config.visuals.emoji2}* Por favor, ingresa el nombre de la canción o video.`);

        await conn.sendMessage(m.chat, { react: { text: '🔍', key: m.key } });

        try {
            const { data: searchRes } = await axios.get(`https://${config.kzmUrl}/api/search/youtube?apiKey=${config.apiKzm}&q=${encodeURIComponent(text)}`);

            if (!searchRes.status || !searchRes.result || searchRes.result.length === 0) {
                await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
                return m.reply('No se encontraron resultados.');
            }

            const firstResult = searchRes.result[0];
            const videoUrl = firstResult.url;

            const infoText = `*${config.visuals.emoji3} YouTube Play ${config.visuals.emoji3}*\n\n` +
                             `*${config.visuals.emoji1} Título* »\n> ${firstResult.title}\n\n` +
                             `*${config.visuals.emoji1} Canal* »\n> ${firstResult.channel}\n\n` +
                             `*${config.visuals.emoji1} Publicado* »\n> ${firstResult.publishedAt}\n\n` +
                             `*${config.visuals.emoji1} Duración* »\n> ${firstResult.duration}\n\n` +
                             `*${config.visuals.emoji1} Vistas* »\n> ${firstResult.views}\n\n` +
                             `_Enviando audio, espera un momento..._`;

            await conn.sendMessage(m.chat, { 
                image: { url: firstResult.thumbnail }, 
                caption: infoText 
            }, { quoted: m });

            const { data: audioRes } = await axios.get(`https://${config.kzmUrl}/api/download/ytaudio?url=${videoUrl}&apiKey=${config.apiKzm}`);

            if (!audioRes.status || !audioRes.result) {
                await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
                return m.reply('Error al obtener el audio.');
            }

            const audioData = audioRes.result;

            await conn.sendMessage(m.chat, { 
                audio: { url: audioData.download_url }, 
                mimetype: 'audio/mp4', 
                fileName: `${audioData.title}.mp3` 
            }, { quoted: m });

            await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });

        } catch (e) {
            await conn.sendMessage(m.chat, { react: { text: '✖️', key: m.key } });
            m.reply(`*${config.visuals.emoji2}* Error: ${e.response?.data?.error || e.message}`);
        }
    }
};

export default youtubeAudio;