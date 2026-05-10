import { config } from '../config.js';
import fs from 'fs';
import path from 'path';

const dbPath = path.resolve('./config/database/pokemon/pokemon.json');
const groupDbPath = path.resolve('./jsons/grupos.json');

const pvpCommand = {
    name: 'duelo',
    alias: ['battle', 'pvp', 'pelear'],
    category: 'pokemon',
    desc: 'Reta a otro usuario a una batalla pokémon.',
    isGroup: true,
    noPrefix: true,

    run: async (conn, m, args) => {
        try {
            const from = m.chat;
            const sender = m.sender.split('@')[0].split(':')[0];

            let groupDb = JSON.parse(fs.readFileSync(groupDbPath, 'utf-8'));
            if (!groupDb[from]?.pokemon) {
                return m.reply(`*${config.visuals.emoji2}* \`SISTEMA DESACTIVADO\`\n\nEl juego de Pokémon está desactivado en este grupo.`);
            }

            let target = m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0] : m.quoted ? m.quoted.sender : null;
            if (!target) return m.reply(`*${config.visuals.emoji2}* Menciona a alguien para pelear.`);
            
            const receiver = target.split('@')[0].split(':')[0];
            if (sender === receiver) return m.reply(`*${config.visuals.emoji2}* No puedes pelear contra ti mismo.`);

            let db = JSON.parse(fs.readFileSync(dbPath, 'utf-8'));
            let p1 = db[from]?.users[sender];
            let p2 = db[from]?.users[receiver];

            if (!p1 || p1.pc.length === 0) return m.reply(`*${config.visuals.emoji2}* No tienes pokémon.`);
            if (!p2 || p2.pc.length === 0) return m.reply(`*${config.visuals.emoji2}* El oponente no tiene pokémon.`);

            let now = Date.now();
            if (now - (p1.cooldowns?.pvp || 0) < 300000) {
                let rest = Math.ceil((300000 - (now - p1.cooldowns.pvp)) / 60000);
                return m.reply(`*${config.visuals.emoji2}* Tus pokémon están cansados. Espera ${rest} min.`);
            }

            let pk1 = p1.pc[0];
            let pk2 = p2.pc[0];

            let hp1 = Math.floor(20 + (pk1.lvl * 2.5));
            let hp2 = Math.floor(20 + (pk2.lvl * 2.5));
            let atk1 = Math.floor(10 + (pk1.lvl * 1.5));
            let atk2 = Math.floor(10 + (pk2.lvl * 1.5));

            let log = `*⚔️ ARENA POKÉMON ⚔️*\n\n`;
            log += `*@${sender}* vs *@${receiver}*\n`;
            log += `[ID ${pk1.id} Lvl ${pk1.lvl}] VS [ID ${pk2.id} Lvl ${pk2.lvl}]\n\n`;

            while (hp1 > 0 && hp2 > 0) {
                hp2 -= Math.max(1, atk1 - (pk2.lvl / 2));
                if (hp2 <= 0) break;
                hp1 -= Math.max(1, atk2 - (pk1.lvl / 2));
            }

            if (hp1 > 0) {
                pk1.xp += 100;
                log += `*¡GANADOR:* @${sender}*\n*Premio:* 100 XP`;
            } else {
                pk2.xp += 100;
                log += `*¡GANADOR:* @${receiver}*\n*Premio:* 100 XP`;
            }

            p1.cooldowns = p1.cooldowns || {};
            p1.cooldowns.pvp = now;
            fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));

            await conn.sendMessage(from, { text: log, mentions: [m.sender, target] }, { quoted: m });
        } catch (e) {
            m.reply(`*${config.visuals.emoji2}* Error en la batalla.`);
        }
    }
};

export default pvpCommand;