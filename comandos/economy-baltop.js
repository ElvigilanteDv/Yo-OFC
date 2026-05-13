import { config } from '../config.js';

const baltopCommand = {
    name: 'baltop',
    alias: ['topbank', 'topmoney'],
    category: 'economy',
    desc: 'Visualiza el ranking de los usuarios más ricos.',
    noPrefix: true,

    run: async (conn, m, args) => {
        try {
            const usersData = global.db.data.users;
            if (!usersData || Object.keys(usersData).length === 0) {
                return m.reply(`*${config.visuals.emoji2}* No hay registros disponibles.`);
            }

            let page = args[0] ? parseInt(args[0]) : 1;
            if (isNaN(page) || page < 1) page = 1;

            const uniqueUsers = {};
            
            Object.keys(usersData).forEach(jid => {
                const cleanJid = jid.replace(/:.*@/g, '@');
                const user = usersData[jid];
                const total = (user.wallet || 0) + (user.bank || 0);

                if (!uniqueUsers[cleanJid] || total > uniqueUsers[cleanJid].total) {
                    uniqueUsers[cleanJid] = {
                        jid: cleanJid,
                        id: cleanJid.split('@')[0],
                        total: total,
                        bank: user.bank || 0
                    };
                }
            });

            const users = Object.values(uniqueUsers)
                .filter(u => u.total > 0)
                .sort((a, b) => b.total - a.total);

            const pageSize = 10;
            const start = (page - 1) * pageSize;
            const end = start + pageSize;
            const topUsers = users.slice(start, end);

            if (topUsers.length === 0) {
                return m.reply(`*${config.visuals.emoji2}* No hay más usuarios.`);
            }

            let list = `*${config.visuals.emoji3} BALANCE TOP - PÁGINA ${page} ${config.visuals.emoji3}*\n\n`;

            topUsers.forEach((user, index) => {
                list += `*${start + index + 1}.* @${user.id}\n`;
                list += `» *Total:* ¥${user.total.toLocaleString()}\n`;
                list += `» *Banco:* ¥${user.bank.toLocaleString()}\n\n`;
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