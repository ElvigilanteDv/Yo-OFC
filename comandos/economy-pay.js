import { config } from '../config.js';
import { database } from '../database.js';

const payCommand = {
    name: 'pay',
    alias: ['pagar', 'transferir'],
    category: 'economy',
    desc: 'Transfiere dinero de tu banco al banco de otro usuario.',
    noPrefix: true,

    run: async (conn, m, { args }) => {
        try {
            const senderJid = m.sender;
            let targetJid = m.quoted ? m.quoted.sender || m.quoted.key.participant : m.mentionedJid?.[0];

            if (!targetJid) return m.reply(`*${config.visuals.emoji2}* Responde al mensaje de alguien o menciónalo.`);
            if (senderJid === targetJid) return m.reply(`*${config.visuals.emoji2}* No puedes enviarte dinero a ti mismo.`);

            let amount = parseInt(args[0]?.replace(/[^0-9]/g, ''));
            if (isNaN(amount) || amount < 1000) return m.reply(`*${config.visuals.emoji2}* La cantidad mínima es ¥1,000.`);

            let senderDb = await database.getUser(senderJid);
            let receiverDb = await database.getUser(targetJid);

            if (!senderDb || Number(senderDb.bank || 0) < amount) {
                return m.reply(`*${config.visuals.emoji2}* No tienes suficiente dinero en tu banco.`);
            }

            if (!receiverDb) {
                receiverDb = { wallet: 0, bank: 0, genre: 'No definido', marry: null, last_claim: new Date(0).toISOString() };
            }

            senderDb.bank = Number(senderDb.bank) - amount;
            receiverDb.bank = Number(receiverDb.bank || 0) + amount;

            await database.saveUser(senderJid, senderDb);
            await database.saveUser(targetJid, receiverDb);

            const senderId = senderJid.split('@')[0].split(':')[0];
            const receiverId = targetJid.split('@')[0].split(':')[0];

            let texto = `*${config.visuals.emoji3}* \`TRANSFERENCIA BANCARIA\` *${config.visuals.emoji3}*\n\n`;
            texto += `*De:* @${senderId}\n`;
            texto += `*Para:* @${receiverId}\n`;
            texto += `*Monto:* ¥${amount.toLocaleString()}\n\n`;
            texto += `> ¡El pago se ha procesado con éxito!`;

            await conn.sendMessage(m.chat, { text: texto, mentions: [senderJid, targetJid] }, { quoted: m });

        } catch (e) {
            console.error(e);
            m.reply(`*${config.visuals.emoji2}* Error en la transferencia.`);
        }
    }
};

export default payCommand;