import { config } from '../config.js';

const giftCommand = {
    name: 'gift',
    alias: ['regalar', 'dar'],
    category: 'economy',
    desc: 'Regala dinero de tu cartera a otro usuario.',
    noPrefix: true,

    run: async (conn, m, args) => {
        try {
            const sender = m.sender.replace(/:.*@/g, '@');
            let rawTarget = m.quoted ? m.quoted.key.participant || m.quoted.key.remoteJid : m.mentionedJid?.[0];

            if (!rawTarget) return m.reply(`*${config.visuals.emoji2}* Responde a alguien para darle un regalo.`);
            const targetJid = rawTarget.replace(/:.*@/g, '@');

            if (sender === targetJid) return m.reply(`*${config.visuals.emoji2}* Quédate con tu dinero, no te lo puedes regalar a ti mismo.`);

            let amount = parseInt(args[0]?.replace(/[^0-9]/g, ''));
            if (isNaN(amount) || amount <= 0) return m.reply(`*${config.visuals.emoji2}* Indica una cantidad válida.`);

            if (!global.db.data.users[sender]) global.db.data.users[sender] = { wallet: 0 };
            if (!global.db.data.users[targetJid]) global.db.data.users[targetJid] = { wallet: 0 };

            const senderDb = global.db.data.users[sender];
            const receiverDb = global.db.data.users[targetJid];

            if ((senderDb.wallet || 0) < amount) {
                return m.reply(`*${config.visuals.emoji2}* No tienes tanto dinero en tu cartera.`);
            }

            senderDb.wallet -= amount;
            receiverDb.wallet = (receiverDb.wallet || 0) + amount;

            const receiverId = targetJid.split('@')[0];

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