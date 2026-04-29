import { config } from '../config.js';
import fs from 'fs';
import path from 'path';

const dbPath = path.resolve('./config/database/economy/economy.json');

const balanceCommand = {
    name: 'balance',
    alias: ['bal', 'cartera', 'billetera', 'banco'],
    category: 'economy',
    desc: 'Consulta tu balance financiero local (cartera, banco y total) en este grupo específico.',
    isOwner: false,
    noPrefix: true,
    isAdmin: false,
    isGroup: true, // Cambiado a true porque ahora depende del grupo

    run: async (conn, m) => {
        try {
            const group = m.chat;
            let targetJid = m.sender;

            if (m.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0]) {
                targetJid = m.message.extendedTextMessage.contextInfo.mentionedJid[0];
            } else if (m.quoted) {
                targetJid = m.quoted.key.participant || m.quoted.key.remoteJid;
            }

            const user = targetJid.split('@')[0].split(':')[0];

            if (!fs.existsSync(dbPath)) {
                return m.reply(`*${config.visuals.emoji2}* Error: Base de datos no encontrada.`);
            }

            let db = JSON.parse(fs.readFileSync(dbPath, 'utf-8'));

            // Inicializar estructura de grupo si no existe
            if (!db[group]) {
                db[group] = {};
            }

            // Inicializar datos del usuario dentro del grupo
            if (!db[group][user]) {
                db[group][user] = { 
                    wallet: 0, 
                    bank: 0, 
                    daily: { lastClaim: 0, streak: 0 }, 
                    crime: { lastUsed: 0 } 
                };
            }

            const userData = db[group][user];
            const total = (userData.wallet || 0) + (userData.bank || 0);

            const texto = `*${config.visuals.emoji3}* \`BALANCE LOCAL\` *${config.visuals.emoji3}*\n\n` +
                          `*${config.visuals.emoji} Cartera:* ¥${(userData.wallet || 0).toLocaleString()}\n` +
                          `*${config.visuals.emoji4} Banco:* ¥${(userData.bank || 0).toLocaleString()}\n` +
                          `*${config.visuals.emoji2} Total:* ¥${total.toLocaleString()}\n\n` +
                          `> *Usuario:* @${user}\n` +
                          `> *Ámbito:* Este grupo`;

            await conn.sendMessage(m.chat, { 
                text: texto, 
                mentions: [`${user}@s.whatsapp.net`] 
            }, { quoted: m });

        } catch (e) {
            console.error(e);
            m.reply(`*${config.visuals.emoji2}* Error al consultar el balance.`);
        }
    }
};

export default balanceCommand;
