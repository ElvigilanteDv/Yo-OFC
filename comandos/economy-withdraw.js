import { config } from '../config.js';
import { database } from '../database.js';

const withdrawCommand = {
    name: 'withdraw',
    alias: ['ret', 'retirar', 'wd'],
    category: 'economy',
    desc: 'Retira una cantidad de dinero de tu banco para pasarlo a tu cartera.',
    noPrefix: true,
    isGroup: true,

    run: async (conn, m, { args }) => {
        try {
            const userJid = m.sender;
            let userDb = await database.getUser(userJid);

            if (!userDb) return m.reply(`*${config.visuals.emoji2}* No tienes una cuenta activa.`);

            const bank = Number(userDb.bank || 0);
            let amount = args[0];

            if (!amount) return m.reply(`*${config.visuals.emoji2}* \`FALTAN DATOS\`\n\nIngresa una cantidad o usa *all*.`);

            if (amount.toLowerCase() === 'all') {
                amount = bank;
            } else {
                amount = parseInt(amount.replace(/[^0-9]/g, ''));
            }

            if (!amount || amount <= 0) return m.reply(`*${config.visuals.emoji2}* Cantidad inválida.`);
            if (bank < amount) return m.reply(`*${config.visuals.emoji2}* No tienes suficiente dinero en el banco.`);

            userDb.bank = bank - amount;
            userDb.wallet = Number(userDb.wallet || 0) + amount;

            let texto = `*${config.visuals.emoji3}* \`RETIRO EXITOSO\` *${config.visuals.emoji3}*\n\n`;
            texto += `*${config.visuals.emoji4} Retirado:* ¥${amount.toLocaleString()}\n`;
            texto += `*${config.visuals.emoji} Cartera:* ¥${userDb.wallet.toLocaleString()}\n\n`;
            texto += `> *Banco:* ¥${userDb.bank.toLocaleString()}`;

            await database.saveUser(userJid, userDb);
            await conn.sendMessage(m.chat, { text: texto }, { quoted: m });

        } catch (e) {
            console.error(e);
            m.reply(`*${config.visuals.emoji2}* Error en el retiro.`);
        }
    }
};

export default withdrawCommand;