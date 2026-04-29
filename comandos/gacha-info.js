import { config } from '../config.js';
import fs from 'fs';
import path from 'path';

const dbPath = path.resolve('./config/database/gacha/gacha_list.json');

const waifuInfoCommand = {
    name: 'waifuinfo',
    alias: ['gachainfo', 'pjsinfo', 'wi'],
    category: 'gacha',
    desc: 'Muestra el historial de actividad gacha de un usuario (último roll, claim, voto, etc).',
    noPrefix: true,

    run: async (conn, m, args) => {
        try {
            const group = m.chat;
            let targetJid = m.quoted ? m.quoted.key.participant || m.quoted.key.remoteJid : m.mentionedJid?.[0];
            if (!targetJid) targetJid = m.sender;

            const user = targetJid.split('@')[0].split(':')[0];
            const cleanTargetJid = user + '@s.whatsapp.net';

            if (!fs.existsSync(dbPath)) return m.reply('*⚠️* Error: DB Gacha no encontrada.');
            let db = JSON.parse(fs.readFileSync(dbPath, 'utf-8'));

            if (!db[group] || !db[group][user]) {
                return m.reply(`*${config.visuals.emoji2}* El usuario no tiene registros en el sistema Gacha de este grupo.`);
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

            const lastRw = formatTime(data.gacha?.lastRw);
            const lastClaim = formatTime(data.gacha?.lastClaim);
            const lastVote = formatTime(data.gacha?.lastVote);
            const lastSell = formatTime(data.gacha?.lastSell);
            const lastBuy = formatTime(data.gacha?.lastBuy);

            const totalPjs = (data.harem || []).length;

            let message = `*${config.visuals.emoji3}* \`Gacha de\` *${config.visuals.emoji3}*\n\n`;
            message += `› @${user}\n\n`;
            message += `ⴵ Último Roll » ${lastRw}\n`;
            message += `ⴵ Último Claim » ${lastClaim}\n`;
            message += `ⴵ Último Voto » ${lastVote}\n`;
            message += `ⴵ Última Venta » ${lastSell}\n`;
            message += `ⴵ Última Compra » ${lastBuy}\n\n`;
            message += `*🎴* Personajes totales » *${totalPjs}*`;

            await conn.sendMessage(m.chat, { 
                text: message,
                mentions: [cleanTargetJid]
            }, { quoted: m });

        } catch (e) {
            m.reply('Error al obtener la información gacha.');
        }
    }
};

export default waifuInfoCommand;