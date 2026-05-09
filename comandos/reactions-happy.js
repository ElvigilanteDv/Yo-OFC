import { config } from '../config.js';

const hugAction = {
    name: 'abrazar',
    alias: ['hug', 'abrazo'],
    category: 'reactions',
    desc: 'Envía un abrazo a un usuario.',
    noPrefix: true,

    run: async (conn, m, args, usedPrefix, commandName, text) => {
        let who = m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0] : m.quoted ? m.quoted.key.participant || m.quoted.key.remoteJid : null;

        const videos = [
            'https://upload.yotsuba.giize.com/u/C8RnTJNA.mp4',
            'https://upload.yotsuba.giize.com/u/krwP-k7h.mp4',
            'https://upload.yotsuba.giize.com/u/G71UkDzC.mp4',
            'https://upload.yotsuba.giize.com/u/6tw0Lt_B.mp4',
            'https://upload.yotsuba.giize.com/u/nr4u2rGw.mp4',
            'https://upload.yotsuba.giize.com/u/vLU4a1Ik.mp4'
        ];

        const randomVideo = videos[Math.floor(Math.random() * videos.length)];

        const sender = m.sender.split('@')[0].split(':')[0];
        let caption = '';
        let mentions = [m.sender];

        if (who) {
            const receiver = who.split('@')[0].split(':')[0];
            const cleanTargetJid = receiver + '@s.whatsapp.net';
            caption = `*${config.visuals.emoji3}* @${sender} está abrazando a @${receiver}`;
            mentions.push(cleanTargetJid);
        } else {
            caption = `*${config.visuals.emoji3}* @${sender} está repartiendo abrazos!`;
        }

        await conn.sendMessage(m.chat, { 
            video: { url: randomVideo }, 
            caption: caption,
            gifPlayback: true,
            mentions: mentions
        }, { quoted: m });
    }
};

export default hugAction;