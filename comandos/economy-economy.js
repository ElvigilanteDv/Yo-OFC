import { config } from '../config.js';
import fs from 'fs';
import path from 'path';

const dbPath = path.resolve('./config/database/economy/economy.json');

const economyInfoCommand = {
    name: 'economy',
    alias: ['ecoinfo', 'einfo'],
    category: 'economy',
    desc: 'Consulta los tiempos de espera y el balance total de un usuario.',
    noPrefix: true,

    run: async (conn, m, args) => {
        try {
            const group = m.chat;
            let targetJid = m.quoted ? m.quoted.key.participant || m.quoted.key.remoteJid : m.mentionedJid?.[0];
            if (!targetJid) targetJid = m.sender;

            const user = targetJid.split('@')[0].split(':')[0];
            const cleanTargetJid = user + '@s.whatsapp.net';

            if (!fs.existsSync(dbPath)) return m.reply('Error: DB no encontrada.');
            let db = JSON.parse(fs.readFileSync(dbPath, 'utf-8'));

            if (!db[group] || !db[group][user]) {
                return m.reply(`*${config.visuals.emoji2}* El usuario no tiene registros económicos en este grupo.`);
            }

            const data = db[group][user];
            const now = Date.now();

            const formatTime = (lastUsed) => {
                if (!lastUsed || lastUsed === 0) return "*nunca*";
                const diff = now - lastUsed;
                const seconds = Math.floor(diff / 1000);
                const minutes = Math.floor(seconds / 60);
                const hours = Math.floor(minutes / 60);
                const days = Math.floor(hours / 24);

                if (days > 0) return `hace *${days}d*`;
                if (hours > 0) return `hace *${hours}h*`;
                if (minutes > 0) return `hace *${minutes}m*`;
                return `hace *${seconds}s*`;
            };

            const dailyTime = formatTime(data.daily?.lastClaim);
            const workTime = formatTime(data.work?.lastUsed);
            const crimeTime = formatTime(data.crime?.lastUsed);
            const slutTime = formatTime(data.slut?.lastUsed);

            const totalCoins = (Number(data.wallet) || 0) + (Number(data.bank) || 0);

            let message = `*${config.visuals.emoji3}* \`Economia de\` *${config.visuals.emoji3}*\n\n`;
            message += `› @${user}\n\n`;
            message += `ⴵ Daily » ${dailyTime}\n`;
            message += `ⴵ Work » ${workTime}\n`;
            message += `ⴵ Crime » ${crimeTime}\n`;
            message += `ⴵ Slut » ${slutTime}\n\n`;
            message += `*⛁* Coins totales » *¥${totalCoins.toLocaleString()}*`;

            await conn.sendMessage(m.chat, { 
                text: message,
                mentions: [cleanTargetJid]
            }, { quoted: m });

        } catch (e) {
            m.reply('Error al obtener la información económica.');
        }
    }
};

export default economyInfoCommand;
