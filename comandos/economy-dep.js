import { config } from '../config.js';

const depCommand = {
    name: 'deposit',
    alias: ['dep', 'd', 'depositar'],
    category: 'economy',
    desc: 'Asegura tus coins enviándolas de tu cartera al banco.',
    noPrefix: true,

    run: async (conn, m, args) => {
        try {
            const user = m.sender.replace(/:.*@/g, '@');
            
            if (!global.db.data.users[user]) global.db.data.users[user] = { wallet: 0, bank: 0 };
            const userDb = global.db.data.users[user];

            const wallet = userDb.wallet || 0;

            if (wallet <= 0) {
                return m.reply(`*${config.visuals.emoji2}* \`CARTERA VACÍA\`\n\nNo tienes dinero en tu cartera para depositar.`);
            }

            let amount = args[0];
            if (!amount) return m.reply(`*${config.visuals.emoji2}* \`FALTAN DATOS\`\n\nIngresa una cantidad o usa *all*.\n*Ejemplo:* #dep 5000`);

            if (amount.toLowerCase() === 'all') {
                amount = wallet;
            } else {
                amount = parseInt(amount.replace(/[^0-9]/g, ''));
            }

            if (isNaN(amount) || amount <= 0) return m.reply(`*${config.visuals.emoji2}* Cantidad inválida.`);

            if (wallet < amount) {
                return m.reply(`*${config.visuals.emoji2}* No tienes suficiente dinero en cartera.`);
            }

            userDb.wallet = (userDb.wallet || 0) - amount;
            userDb.bank = (userDb.bank || 0) + amount;

            let texto = `*${config.visuals.emoji3}* \`DEPÓSITO EXITOSO\` *${config.visuals.emoji3}*\n\n`;
            texto += `*${config.visuals.emoji} Monto:* ¥${amount.toLocaleString()}\n`;
            texto += `*${config.visuals.emoji4} Banco:* ¥${userDb.bank.toLocaleString()}\n\n`;
            texto += `> *Restante en Cartera:* ¥${userDb.wallet.toLocaleString()}`;

            await conn.sendMessage(m.chat, { text: texto }, { quoted: m });

        } catch (e) {
            console.error(e);
            m.reply(`*${config.visuals.emoji2}* Error en el depósito.`);
        }
    }
};

export default depCommand;