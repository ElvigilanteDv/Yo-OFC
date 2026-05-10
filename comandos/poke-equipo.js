import { config } from '../../config.js';
import fs from 'fs';
import path from 'path';

const dbPath = path.resolve('./config/database/pokemon/pokemon.json');

const teamCommand = {
    name: 'equipo',
    alias: ['team', 'pc', 'caja'],
    category: 'pokemon',
    desc: 'Muestra tu equipo pokémon actual.',
    isGroup: true,
    noPrefix: true,

    run: async (conn, m) => {
        const from = m.chat;
        const sender = m.sender.split('@')[0].split(':')[0];

        if (!fs.existsSync(dbPath)) return m.reply(`*${config.visuals.emoji2}* No tienes datos registrados.`);
        let db = JSON.parse(fs.readFileSync(dbPath, 'utf-8'));

        if (!db[from]?.users[sender] || db[from].users[sender].pc.length === 0) {
            return m.reply(`*${config.visuals.emoji2}* Aún no tienes pokémon en tu equipo.`);
        }

        let user = db[from].users[sender];
        let txt = `*${config.visuals.emoji3}* \`EQUIPO DE @${sender}\`\n\n`;

        user.pc.slice(0, 6).forEach((pk, i) => {
            let xpNext = Math.pow(pk.lvl + 1, 3);
            txt += `*${i + 1}.* ID: ${pk.id} ${pk.shiny ? '✨' : ''}\n`;
            txt += `   *Nivel:* ${pk.lvl} | *XP:* ${pk.xp}/${xpNext}\n`;
            txt += `   ┈┈┈┈┈┈┈┈┈┈┈┈\n`;
        });

        if (user.pc.length > 6) {
            txt += `\n*📦 Caja:* ${user.pc.length - 6} pokémon extra.`;
        }

        txt += `\n> Usa *#datos [número]* para ver más.`;

        await conn.sendMessage(from, { text: txt, mentions: [m.sender] }, { quoted: m });
    }
};

export default teamCommand;