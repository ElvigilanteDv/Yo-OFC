import { config } from '../config.js';
import fs from 'fs';
import path from 'path';

const dbPath = path.resolve('./config/database/economy/economy.json');

const depCommand = {
    name: 'deposit',
    alias: ['dep', 'd', 'depositar'],
    category: 'economy',
    desc: 'Asegura tus coins enviándolas de tu cartera al banco para protegerlas.',
    isOwner: false,
    noPrefix: true,

    run: async (conn, m, args) => {
        try {
            const group = m.chat;
            const user = m.sender.split('@')[0].split(':')[0];
            let db = JSON.parse(fs.readFileSync(dbPath, 'utf-8'));

            if (!db[group]) db[group] = {};
            if (!db[group][user]) {
                db[group][user] = { wallet: 0, bank: 0, daily: { lastClaim: 0, streak: 0 }, crime: { lastUsed: 0 } };
            }

            const userData = db[group][user];

            if (userData.wallet <= 0) {
                return m.reply(`*${config.visuals.emoji2}* \`CARTERA VACÍA\`\n\nNo tienes dinero en tu cartera para depositar.\n\n> ¡Usa los comandos de economía como *#work* o *#crime* para ganar dinero!`);
            }

            let amount = args[0];
            if (!amount) return m.reply(`*${config.visuals.emoji2}* \`FALTAN DATOS\` *${config.visuals.emoji2}*\n\nIngresa una cantidad o usa *all*.\n*Ejemplo:* #dep 5000`);

            if (amount.toLowerCase() === 'all') {
                amount = userData.wallet;
            } else {
                amount = parseInt(amount.replace(/[^0-9]/g, ''));
            }

            if (isNaN(amount) || amount <= 0) return m.reply(`*${config.visuals.emoji2}* Cantidad inválida.`);
            
            if (userData.wallet < amount) {
                return m.reply(`*${config.visuals.emoji2}* No tienes suficiente dinero en cartera para depositar esa cantidad.`);
            }

            userData.wallet -= amount;
            userData.bank += amount;
            db[group][user] = userData;
            fs.writeFileSync(dbPath, JSON.stringify(db, null, 2), 'utf-8');

            await conn.sendMessage(m.chat, { 
                text: `*${config.visuals.emoji3}* \`DEPÓSITO EXITOSO\` *${config.visuals.emoji3}*\n\n*${config.visuals.emoji} Monto:* ¥${amount.toLocaleString()}\n*${config.visuals.emoji} Banco:* ¥${userData.bank.toLocaleString()}\n\n> *Restante en Cartera:* ¥${userData.wallet.toLocaleString()}`
            }, { quoted: m });

        } catch (e) {
            m.reply(`*${config.visuals.emoji2}* Error en el depósito.`);
        }
    }
};

export default depCommand;
