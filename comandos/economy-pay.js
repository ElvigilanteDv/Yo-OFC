import { config } from '../config.js';
import fs from 'fs';
import path from 'path';

const dbPath = path.resolve('./config/database/economy/economy.json');

const payCommand = {
    name: 'pay',
    alias: ['pagar', 'transferir', 'dar'],
    category: 'economy',
    desc: 'Transfiere una cantidad de dinero de tu banco al banco de otro usuario mediante una respuesta.',
    noPrefix: true,

    run: async (conn, m, args) => {
        try {
            const group = m.chat;
            const sender = m.sender.split('@')[0].split(':')[0];
            let quotedJid = m.quoted ? m.quoted.key.participant || m.quoted.key.remoteJid : null;

            if (!quotedJid) {
                return m.reply(`*${config.visuals.emoji2}* \`Error de Uso\`\n\nDebes responder al mensaje de alguien.\n\n> Ejemplo: #pay 5000`);
            }

            const receiver = quotedJid.split('@')[0].split(':')[0];
            const cleanTargetJid = receiver + '@s.whatsapp.net';

            if (sender === receiver) {
                return m.reply(`*${config.visuals.emoji2}* No puedes enviarte dinero a ti mismo.`);
            }

            let amount = parseInt(args[0]?.replace(/[^0-9]/g, ''));
            if (isNaN(amount) || amount <= 0) {
                return m.reply(`*${config.visuals.emoji2}* Indica una cifra válida.`);
            }

            if (amount < 1000) {
                return m.reply(`*${config.visuals.emoji2}* El mínimo es ¥1,000.`);
            }

            if (!fs.existsSync(dbPath)) return m.reply('Error: DB no encontrada.');
            let db = JSON.parse(fs.readFileSync(dbPath, 'utf-8'));

            if (!db[group]) db[group] = {};
            if (!db[group][sender]) db[group][sender] = { wallet: 0, bank: 0 };
            
            let senderBank = Number(db[group][sender].bank || 0);

            if (senderBank < amount) {
                return m.reply(`*${config.visuals.emoji2}* \`Fondos Insuficientes\`\n\nTienes ¥${senderBank.toLocaleString()} en tu banco.`);
            }

            if (!db[group][receiver]) {
                db[group][receiver] = { wallet: 0, bank: 0, daily: { lastClaim: 0, streak: 0 }, crime: { lastUsed: 0 } };
            }

            db[group][sender].bank = senderBank - amount;
            db[group][receiver].bank = Number(db[group][receiver].bank || 0) + amount;

            fs.writeFileSync(dbPath, JSON.stringify(db, null, 2), 'utf-8');

            await conn.sendMessage(m.chat, { 
                text: `*${config.visuals.emoji3}* \`TRANSFERENCIA EXITOSA\`\n\n*De:* @${sender}\n*Para:* @${receiver}\n*Monto:* ¥${amount.toLocaleString()}\n\n> ¡Dinero enviado correctamente!`,
                mentions: [m.sender, cleanTargetJid]
            }, { quoted: m });

        } catch (e) {
            m.reply(`*${config.visuals.emoji2}* Error en el sistema.`);
        }
    }
};

export default payCommand;
