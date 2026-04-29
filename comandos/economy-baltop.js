import { config } from '../config.js';
import fs from 'fs';
import path from 'path';

const dbPath = path.resolve('./config/database/economy/economy.json');

const baltopCommand = {
    name: 'baltop',
    alias: ['topbank', 'topmoney'],
    category: 'economy',
    desc: 'Visualiza el ranking de los usuarios más ricos del grupo actual.',
    noPrefix: true,

    run: async (conn, m, args) => {
        try {
            const group = m.chat;
            if (!fs.existsSync(dbPath)) return m.reply(`*${config.visuals.emoji2}* No hay registros.`);

            let db = JSON.parse(fs.readFileSync(dbPath, 'utf-8'));

            // Verificar si el grupo tiene registros
            if (!db[group] || Object.keys(db[group]).length === 0) {
                return m.reply(`*${config.visuals.emoji2}* No hay registros de economía en este grupo.`);
            }

            let page = args[0] ? parseInt(args[0]) : 1;
            if (isNaN(page) || page < 1) page = 1;

            // Mapeo de usuarios dentro del grupo específico
            const users = Object.keys(db[group])
                .map(id => ({
                    id,
                    total: (Number(db[group][id].wallet) || 0) + (Number(db[group][id].bank) || 0),
                    wallet: Number(db[group][id].wallet) || 0,
                    bank: Number(db[group][id].bank) || 0
                }))
                .filter(user => user.total > 0) 
                .sort((a, b) => b.total - a.total);

            const pageSize = 10;
            const start = (page - 1) * pageSize;
            const end = start + pageSize;
            const topUsers = users.slice(start, end);

            if (topUsers.length === 0) {
                return m.reply(`*${config.visuals.emoji2}* No hay más usuarios para mostrar en esta página.`);
            }

            let list = `*${config.visuals.emoji3}* \`TOP RIQUEZA - PÁGINA ${page}\` *${config.visuals.emoji3}*\n\n`;

            topUsers.forEach((user, index) => {
                list += `*${start + index + 1}.* @${user.id}\n  ᗒ *Total:* ¥${user.total.toLocaleString()}\n  ᗒ *Banco:* ¥${user.bank.toLocaleString()}\n\n`;
            });

            list += `> ¡Sigue trabajando para llegar a la cima!`;

            await conn.sendMessage(m.chat, { 
                text: list,
                mentions: topUsers.map(u => u.id + '@s.whatsapp.net')
            }, { quoted: m });

        } catch (e) {
            console.error(e);
            m.reply(`*${config.visuals.emoji2}* Error al cargar el top.`);
        }
    }
};

export default baltopCommand;