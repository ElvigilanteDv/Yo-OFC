import { config } from '../config.js';

const balanceCommand = {
    name: 'balance',
    alias: ['bal', 'cartera', 'billetera', 'banco'],
    category: 'economy',
    desc: 'Consulta el estado financiero actual (cartera, banco y total).',
    noPrefix: true,
    isGroup: true,

    run: async (conn, m) => {
        try {
            let rawJid = m.sender;

            if (m.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0]) {
                rawJid = m.message.extendedTextMessage.contextInfo.mentionedJid[0];
            } else if (m.quoted) {
                rawJid = m.quoted.key.participant || m.quoted.key.remoteJid;
            }

            const targetJid = rawJid.replace(/:.*@/g, '@');

            if (!global.db.data.users[targetJid]) {
                global.db.data.users[targetJid] = { wallet: 0, bank: 0 };
            }

            const userDb = global.db.data.users[targetJid];
            const userId = targetJid.split('@')[0];

            const wallet = userDb.wallet || 0;
            const bank = userDb.bank || 0;
            const total = wallet + bank;

            let texto = `*${config.visuals.emoji3} BALANCE DE CUENTA ${config.visuals.emoji3}*\n\n`;
            texto += `» *Cartera:* ¥${wallet.toLocaleString()}\n`;
            texto += `» *Banco:* ¥${bank.toLocaleString()}\n\n`;
            texto += `> *Total:* ¥${total.toLocaleString()}\n`;
            texto += `> *Usuario:* @${userId}`;

            await conn.sendMessage(m.chat, { 
                text: texto, 
                mentions: [targetJid] 
            }, { quoted: m });

        } catch (e) {
            console.error(e);
            m.reply(`*${config.visuals.emoji2}* Error al consultar el balance.`);
        }
    }
};

export default balanceCommand;
