import { config } from '../config.js';
import { frasesParejas } from './frases/fun/parejas.js';

const formarpareja = {
    name: 'formarpareja',
    alias: ['formar1'],
    category: 'fun',
    desc: 'Forma una pareja al azar en el grupo.',
    noPrefix: true,

    run: async (conn, m) => {
        const groupMetadata = await conn.groupMetadata(m.chat);
        const participants = groupMetadata.participants.map(p => p.id);
        
        if (participants.length < 2) return m.reply('Necesito al menos 2 personas.');

        const shuffle = participants.sort(() => 0.5 - Math.random());
        const u1 = shuffle[0];
        const u2 = shuffle[1];

        const frase = frasesParejas[Math.floor(Math.random() * frasesParejas.length)];
        const caption = `*${config.visuals.emoji3} PAREJA FORMADA *\n\n@${u1.split('@')[0]} ❤️ @${u2.split('@')[0]}\n\n> ${frase}`;

        await conn.sendMessage(m.chat, { 
            text: caption, 
            mentions: [u1, u2] 
        }, { quoted: m });
    }
};

export default formarpareja;