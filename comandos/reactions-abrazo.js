import { config } from '../config.js';

const hugAction = {
    name: 'abrazar',
    alias: ['hug', 'abrazo'],
    category: 'reactions',
    desc: 'Envía un abrazo a un usuario.',
    noPrefix: true,

    run: async (conn, m, args, usedPrefix, commandName, text) => {
        let who = m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0] : m.quoted ? m.quoted.key.participant || m.quoted.key.remoteJid : null;

        if (!who) return m.reply(`*${config.visuals.emoji2}* Etiqueta a alguien o responde a su mensaje para darle un abrazo.`);

        const videos = [
            'https://upload.yotsuba.giize.com/u/C8RnTJNA.mp4'
        ];

        const randomVideo = videos[Math.floor(Math.random() * videos.length)];

        const sender = m.sender.split('@')[0].split(':')[0];
        const receiver = who.split('@')[0].split(':')[0];
        const cleanTargetJid = receiver + '@s.whatsapp.net';

        const caption = `*${config.visuals.emoji3}* @${sender} está abrazando a @${receiver}`;

        await conn.sendMessage(m.chat, { 
            video: { url: randomVideo }, 
            caption: caption,
            mentions: [m.sender, cleanTargetJid]
        }, { quoted: m });
    }
};

export default hugAction;