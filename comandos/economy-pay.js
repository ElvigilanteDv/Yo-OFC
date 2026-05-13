import { config } from '../config.js';

const payCommand = {
    name: 'pay',
    alias: ['pagar', 'transferir'],
    category: 'economy',
    desc: 'Transfiere dinero de tu banco al banco de otro usuario.',
    noPrefix: true,

    run: async (conn, m, args) => {
        try {
            const sender = m.sender;
            let targetJid = m.quoted ? m.quoted.key.participant || m.quoted.key.remoteJid : m.mentionedJid?.[0];

            if (!targetJid) return m.reply(`*${config.visuals.emoji2}* Responde al mensaje de alguien o menciónalo.`);
            if (sender === targetJid) return m.reply(`*${config.visuals.emoji2}* No puedes enviarte dinero a ti mismo.`);

            let amount = parseInt(args[0]?.replace(/[^0-9]/g, ''));
            if (isNaN(amount) || amount < 1000) return m.reply(`*${config.visuals.emoji2}* La cantidad mínima es ¥1,000.`);

            if (!global.db.data.users[sender]) global.db.data.users[sender] = { bank: 0 };
            if (!global.db.data.users[targetJid]) global.db.data.users[targetJid] = { bank: 0 };

            const senderDb = global.db.data.users[sender];
            const receiverDb = global.db.data.users[targetJid];

            if ((senderDb.bank || 0) < amount) {
                return m.reply(`*${config.visuals.emoji2}* No tienes suficiente dinero en tu banco (¥${(senderDb.bank || 0).toLocaleString()}).`);
            }

            senderDb.bank -= amount;
            receiverDb.bank = (receiverDb.bank || 0) + amount;

            const senderId = sender.split('@')[0].split(':')[0];
            const receiverId = targetJid.split('@')[0].split(':')[0];

            let texto = `*${config.visuals.emoji3}* \`TRANSFERENCIA BANCARIA\` *${config.visuals.emoji3}*\n\n`;
            texto += `*De:* @${senderId}\n`;
            texto += `*Para:* @${receiverId}\n`;
            texto += `*Monto:* ¥${amount.toLocaleString()}\n\n`;
            texto += `> ¡El pago se ha procesado con éxito!`;

            await conn.sendMessage(m.chat, { text: texto, mentions: [sender, targetJid] }, { quoted: m });

        } catch (e) {
            console.error(e);
            m.reply(`*${config.visuals.emoji2}* Error en la transferencia.`);
        }
    }
};

export default payCommand;