import { config } from '../config.js';
import fs from 'fs';
import path from 'path';

const dbPath = path.resolve('./config/database/economy/economy.json');

const dailyCommand = {
    name: 'daily',
    alias: ['diario', 'recompensa'],
    category: 'economy',
    desc: 'Reclama tu recompensa diaria de coins y mantén tu racha para obtener bonificaciones mayores.',
    noPrefix: true,

    run: async (conn, m) => {
        try {
            const group = m.chat;
            const user = m.sender.split('@')[0].split(':')[0];
            const now = Date.now();
            let db = JSON.parse(fs.readFileSync(dbPath, 'utf-8'));

            if (!db[group]) db[group] = {};
            if (!db[group][user]) {
                db[group][user] = { wallet: 0, bank: 0, daily: { lastClaim: 0, streak: 0 } };
            }
            
            const userData = db[group][user];
            const cooldown = 24 * 60 * 60 * 1000;
            const timePassed = now - (userData.daily?.lastClaim || 0);

            if (timePassed < cooldown) {
                const remaining = cooldown - timePassed;
                const hours = Math.floor(remaining / (1000 * 60 * 60));
                const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
                return m.reply(`*${config.visuals.emoji2}* \`TIEMPO RESTANTE\`\n\nYa reclamaste tu recompensa.\n*Espera:* ${hours}h ${minutes}m`);
            }

            userData.daily.streak = (timePassed < cooldown * 2) ? (userData.daily.streak + 1) : 1;
            const reward = 30000 + (userData.daily.streak * 5000);

            userData.wallet += reward;
            userData.daily.lastClaim = now;
            
            db[group][user] = userData;
            fs.writeFileSync(dbPath, JSON.stringify(db, null, 2), 'utf-8');

            await conn.sendMessage(m.chat, { 
                text: `*${config.visuals.emoji3}* \`RECOMPENSA DIARIA\`\n\n*Ganaste:* ¥${reward.toLocaleString()}\n*Racha:* Día ${userData.daily.streak}\n\n> *Billetera:* ¥${userData.wallet.toLocaleString()}`
            }, { quoted: m });

        } catch (e) {
            m.reply(`*${config.visuals.emoji2}* Error en el proceso.`);
        }
    }
};

export default dailyCommand;