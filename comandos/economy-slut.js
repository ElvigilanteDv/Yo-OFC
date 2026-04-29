import { config } from '../config.js';
import fs from 'fs';
import path from 'path';
import { winFrases, loseFrases } from './frases/slut.js';

const dbPath = path.resolve('./config/database/economy/economy.json');

const slutCommand = {
    name: 'slut',
    alias: ['prostituirse', 'escenario'],
    category: 'economy',
    desc: 'Trabaja en el escenario para ganar coins, con un pequeño riesgo de tener una mala noche.',
    noPrefix: true,

    run: async (conn, m) => {
        try {
            const group = m.chat;
            const user = m.sender.split('@')[0].split(':')[0];
            const now = Date.now();
            const cooldown = 10 * 60 * 1000;

            let db = JSON.parse(fs.readFileSync(dbPath, 'utf-8'));

            if (!db[group]) db[group] = {};
            if (!db[group][user]) {
                db[group][user] = { wallet: 0, bank: 0, daily: { lastClaim: 0, streak: 0 }, crime: { lastUsed: 0 }, slut: { lastUsed: 0 } };
            }
            if (!db[group][user].slut) db[group][user].slut = { lastUsed: 0 };

            const userData = db[group][user];
            const timePassed = now - userData.slut.lastUsed;

            if (timePassed < cooldown) {
                const rem = cooldown - timePassed;
                return m.reply(`*${config.visuals.emoji2}* Espera ${Math.floor(rem / 60000)}m.`);
            }

            const isLoss = Math.random() < 0.03;
            const amount = Math.floor(Math.random() * (8000 - 3000 + 1)) + 3000;

            if (isLoss) {
                const frase = loseFrases[Math.floor(Math.random() * loseFrases.length)];
                userData.wallet = Math.max(0, (userData.wallet || 0) - amount);
                await m.reply(`*${config.visuals.emoji2}* \`MALA NOCHE\`\n\n${frase}\n*Perdiste:* ¥${amount.toLocaleString()}`);
            } else {
                const frase = winFrases[Math.floor(Math.random() * winFrases.length)];
                userData.wallet = (userData.wallet || 0) + amount;
                await m.reply(`*${config.visuals.emoji3}* \`NOCHE DE ÉXITO\`\n\n${frase}\n*Ganaste:* ¥${amount.toLocaleString()}`);
            }

            userData.slut.lastUsed = now; 
            db[group][user] = userData;
            fs.writeFileSync(dbPath, JSON.stringify(db, null, 2), 'utf-8');

        } catch (e) {
            m.reply(`*${config.visuals.emoji2}* Error en la discoteca.`);
        }
    }
};

export default slutCommand;