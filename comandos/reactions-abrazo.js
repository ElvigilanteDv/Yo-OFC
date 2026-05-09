import { config } from '../config.js';

const hugAction = {
    name: 'abrazar',
    alias: ['hug', 'abrazo'],
    category: 'reactions',
    desc: 'Envía un abrazo a un usuario.',
    noPrefix: true,

    run: async (conn, m, args, usedPrefix, commandName, text) => {
        const who = m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0] : m.quoted ? m.quoted.sender : null;

        if (!who) return m.reply(`*${config.visuals.emoji2}* Etiqueta a alguien o responde a su mensaje para darle un abrazo.`);

        const videos = [
            'https://upload.yotsuba.giize.com/u/C8RnTJNA.mp4'
        ];

        const randomVideo = videos[Math.floor(Math.random() * videos.length)];
        
        const mentionUser = m.sender.split('@')[0];
        const targetUser = who.split('@')[0];
        
        const caption = `*${config.visuals.emoji3}* @${mentionUser} está abrazando a @${targetUser}`;

        await conn.sendMessage(m.chat, { 
            video: { url: randomVideo }, 
            caption: caption,
            mentions: [m.sender, who]
        }, { quoted: m });
    }
};

export default hugAction;