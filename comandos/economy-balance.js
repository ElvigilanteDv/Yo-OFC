import { config } from '../config.js';
import { database } from '../database.js';

const balanceCommand = {
    name: 'balance',
    alias: ['bal', 'cartera', 'billetera', 'banco'],
    category: 'economy',
    desc: 'Consulta el estado financiero actual (cartera, banco y total).',
    noPrefix: true,
    isGroup: true,

    run: async (conn, m) => {
        try {
            let targetJid = m.sender;

            if (m.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0]) {
                targetJid = m.message.extendedTextMessage.contextInfo.mentionedJid[0];
            } else if (m.quoted) {
                targetJid = m.quoted.sender || m.quoted.key.participant || m.quoted.key.remoteJid;
            }

            const userDb = await database.getUser(targetJid);

            if (!userDb) {
                return m.reply(`*${config.visuals.emoji2}* El usuario no está registrado en el sistema financiero.`);
            }

            const wallet = Number(userDb.wallet || 0);
            const bank = Number(userDb.bank || 0);
            const total = wallet + bank;
            const displayId = targetJid.split('@')[0].split(':')[0];

            let texto = `*${config.visuals.emoji3} BALANCE DE CUENTA ${config.visuals.emoji3}*\n\n`;
            texto += `» *Cartera:* ¥${wallet.toLocaleString()}\n`;
            texto += `» *Banco:* ¥${bank.toLocaleString()}\n\n`;
            texto += `> *Total:* ¥${total.toLocaleString()}\n`;
            texto += `> *Usuario:* @${displayId}`;

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