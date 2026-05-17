import { config } from '../config.js';
import { query } from '../database.js';

const baltopCommand = {
    name: 'baltop',
    alias: ['topbank', 'topmoney'],
    category: 'economy',
    desc: 'Visualiza el ranking de los usuarios más ricos.',
    noPrefix: true,

    run: async (conn, m, { args }) => {
        try {
            let page = (args && args[0]) ? parseInt(args[0]) : 1;
            if (isNaN(page) || page < 1) page = 1;

            const pageSize = 10;
            const offset = (page - 1) * pageSize;

            const res = await query(
                `SELECT jid, wallet, bank, (wallet + bank) as total 
                 FROM users 
                 WHERE (wallet + bank) > 0 
                 ORDER BY total DESC 
                 LIMIT ? OFFSET ?`, 
                [pageSize, offset]
            );

            const topUsers = res.rows;

            if (topUsers.length === 0) {
                return m.reply(`*${config.visuals.emoji2}* No hay registros en esta página.`);
            }

            let list = `*${config.visuals.emoji3} BALANCE TOP - PÁGINA ${page} ${config.visuals.emoji3}*\n\n`;

            topUsers.forEach((user, index) => {
                const userId = user.jid.split('@')[0];
                const total = Number(user.total);
                const bank = Number(user.bank);
                list += `*${offset + index + 1}.* @${userId}\n`;
                list += `» *Total:* ¥${total.toLocaleString()}\n`;
                list += `» *Banco:* ¥${bank.toLocaleString()}\n\n`;
            });

            await conn.sendMessage(m.chat, { 
                text: list,
                mentions: topUsers.map(u => u.jid)
            }, { quoted: m });

        } catch (e) {
            console.error(e);
            m.reply(`*${config.visuals.emoji2}* Error al cargar el ranking.`);
        }
    }
};

export default baltopCommand;