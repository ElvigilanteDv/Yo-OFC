import { config } from '../config.js';
import { database } from '../database.js';

const giftCommand = {
    name: 'gift',
    alias: ['regalar', 'dar'],
    category: 'economy',
    desc: 'Regala dinero de tu cartera a otro usuario.',
    noPrefix: true,

    run: async (conn, m, { args }) => {
        try {
            const senderJid = m.sender;
            let targetJid = m.quoted ? m.quoted.sender || m.quoted.key.participant : m.mentionedJid?.[0];

            if (!targetJid) return m.reply(`*${config.visuals.emoji2}* Responde a alguien para darle un regalo.`);
            if (senderJid === targetJid) return m.reply(`*${config.visuals.emoji2}* Quédate con tu dinero, no te lo puedes regalar a ti mismo.`);

            let amount = parseInt(args[0]?.replace(/[^0-9]/g, ''));
            if (isNaN(amount) || amount <= 0) return m.reply(`*${config.visuals.emoji2}* Indica una cantidad válida.`);

            let senderDb = await database.getUser(senderJid);
            let receiverDb = await database.getUser(targetJid);

            if (!senderDb || Number(senderDb.wallet || 0) < amount) {
                return m.reply(`*${config.visuals.emoji2}* No tienes tanto dinero en tu cartera.`);
            }

            if (!receiverDb) {
                receiverDb = { wallet: 0, bank: 0, genre: 'No definido', marry: null, last_claim: new Date(0).toISOString() };
            }

            senderDb.wallet = Number(senderDb.wallet) - amount;
            receiverDb.wallet = Number(receiverDb.wallet || 0) + amount;

            await database.saveUser(senderJid, senderDb);
            await database.saveUser(targetJid, receiverDb);

            const receiverId = targetJid.split('@')[0].split(':')[0];

            let texto = `*${config.visuals.emoji}* \`REGALO ENVIADO\` *${config.visuals.emoji}*\n\n`;
            texto += `Has enviado ¥${amount.toLocaleString()} de tu cartera a @${receiverId}.\n\n`;
            texto += `> *Tu Cartera:* ¥${senderDb.wallet.toLocaleString()}`;

            await conn.sendMessage(m.chat, { text: texto, mentions: [targetJid] }, { quoted: m });

        } catch (e) {
            console.error(e);
            m.reply(`*${config.visuals.emoji2}* Error al enviar el regalo.`);
        }
    }
};

export default giftCommand;