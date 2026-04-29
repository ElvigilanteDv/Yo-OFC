import { config } from '../config.js';
import fs from 'fs';
import path from 'path';
import { workFrases } from './frases/work.js';

const dbPath = path.resolve('./config/database/economy/economy.json');

const workCommand = {
    name: 'work',
    alias: ['chamba', 'trabajar', 'w'],
    category: 'economy',
    desc: 'Realiza trabajos honrados para ganar coins y aumentar tu capital en el grupo.',
    noPrefix: true,
    isGroup: true,

    run: async (conn, m) => {
        try {
            const group = m.chat;
            const user = m.sender.split('@')[0].split(':')[0];
            const now = Date.now();
            const cooldown = 5 * 60 * 1000;

            let db = JSON.parse(fs.readFileSync(dbPath, 'utf-8'));

            if (!db[group]) db[group] = {};
            if (!db[group][user]) {
                db[group][user] = { wallet: 0, bank: 0, work: { lastUsed: 0 } };
            }
            if (!db[group][user].work) db[group][user].work = { lastUsed: 0 };

            const userData = db[group][user];
            const timePassed = now - userData.work.lastUsed;

            if (timePassed < cooldown) {
                const rem = cooldown - timePassed;
                return m.reply(`*${config.visuals.emoji2}* \`Descanso\`\n\nDebes esperar ${Math.floor(rem / 1000)}s para volver a chambear.`);
            }

            const reward = Math.floor(Math.random() * (5000 - 2000 + 1)) + 2000;
            const frase = workFrases[Math.floor(Math.random() * workFrases.length)];

            userData.wallet += reward;
            userData.work.lastUsed = now; 
            
            db[group][user] = userData;
            fs.writeFileSync(dbPath, JSON.stringify(db, null, 2), 'utf-8');

            await conn.sendMessage(m.chat, { 
                text: `*${config.visuals.emoji3}* \`CHAMBA EXITOSA\`\n\n${frase}\n*Ganaste:* ¥${reward.toLocaleString()}`
            }, { quoted: m });

        } catch (e) {
            m.reply(`*${config.visuals.emoji2}* Error al procesar la chamba.`);
        }
    }
};

export default workCommand;