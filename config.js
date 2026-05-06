import fs from 'fs';
import path from 'path';

export const config = {
    botName: 'Kazuma',
    owner: [
        '573508941325@s.whatsapp.net', 
        '125860308893859@lid'
    ], 
    support: '50557888080',
    prefix: '#',
    allPrefixes: ['#', '!', '.'],

    getBotType: (conn) => {
        const userNumber = conn.user.id.split(':')[0];
        const subBotPath = path.resolve(`./sesiones_subbots/${userNumber}`);
        const moodsPath = path.resolve(`./sesiones_moods/${userNumber}`);
        
        if (fs.existsSync(subBotPath)) return '*Sub-Bot*';
        if (fs.existsSync(moodsPath)) return '*Mood*';
        return '*Mood*';
    },

    visuals: {
        line: '━',
        color: 'magenta',
        emoji: '✰',
        emoji2: '❁',
        emoji3: '✿',
        emoji4: '❀',
        img1: 'https://files.catbox.moe/9ssbf9.jpg'
    },

    apiKzm: 'kzm-AkpQk-lKhaizmu'
};