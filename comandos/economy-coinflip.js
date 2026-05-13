import { config } from '../config.js';
import { flipFrases } from './frases/flip.js';

const flipCommand = {
    name: 'coinflip',
    alias: ['flip', 'suerte'],
    category: 'economy',
    desc: 'Apuesta ¥1,000 en un cara o cruz para intentar duplicar tu inversión.',
    noPrefix: true,

    run: async (conn, m, args) => {
        try {
            const user = m.sender.replace(/:.*@/g, '@');
            const choice = args[0]?.toLowerCase();

            if (!choice || !['cara', 'cruz'].includes(choice)) {
                return m.reply(`*${config.visuals.emoji2}* \`FALTAN DATOS\`\n\nElige una opción: *cara* o *cruz*.\n*Ejemplo:* #flip cara`);
            }

            if (!global.db.data.users[user]) global.db.data.users[user] = { wallet: 0, bank: 0 };
            const userDb = global.db.data.users[user];

            const wallet = userDb.wallet || 0;
            const bank = userDb.bank || 0;
            const totalMoney = wallet + bank;

            if (totalMoney < 5000) {
                return m.reply(`*${config.visuals.emoji2}* \`POCO CAPITAL\`\n\nNecesitas al menos ¥5,000 en total para apostar.`);
            }

            const bet = 1000;
            const win = Math.random() < 0.3; 
            const result = win ? choice : (choice === 'cara' ? 'cruz' : 'cara');

            if (win) {
                userDb.wallet = (userDb.wallet || 0) + bet;
                const frase = flipFrases.win[Math.floor(Math.random() * flipFrases.win.length)];

                await conn.sendMessage(m.chat, { 
                    text: `*${config.visuals.emoji3}* \`¡GANASTE!\` *${config.visuals.emoji3}*\n\nSalió: *${result.toUpperCase()}*\n${frase}\n\n> *Cartera:* ¥${userDb.wallet.toLocaleString()}`
                }, { quoted: m });
            } else {
                if ((userDb.wallet || 0) >= bet) {
                    userDb.wallet -= bet;
                } else {
                    userDb.bank = (userDb.bank || 0) - bet;
                }

                const frase = flipFrases.lose[Math.floor(Math.random() * flipFrases.lose.length)];

                await conn.sendMessage(m.chat, { 
                    text: `*${config.visuals.emoji2}* \`PERDISTE\` *${config.visuals.emoji2}*\n\nSalió: *${result.toUpperCase()}*\n${frase}\n\n> *Balance actualizado.*`
                }, { quoted: m });
            }

        } catch (e) {
            console.error(e);
            m.reply(`*${config.visuals.emoji2}* Error en la apuesta.`);
        }
    }
};

export default flipCommand;