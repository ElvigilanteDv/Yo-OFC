import { config } from '../config.js';
import { database } from '../database.js';
import { flipFrases } from './frases/flip.js';

const flipCommand = {
    name: 'coinflip',
    alias: ['flip', 'suerte'],
    category: 'economy',
    desc: 'Apuesta ¥1,000 en un cara o cruz para intentar duplicar tu inversión.',
    noPrefix: true,

    run: async (conn, m, { args }) => {
        try {
            const choice = args[0]?.toLowerCase();
            if (!choice || !['cara', 'cruz'].includes(choice)) {
                return m.reply(`*${config.visuals.emoji2}* \`FALTAN DATOS\`\n\nElige una opción: *cara* o *cruz*.\n*Ejemplo:* #flip cara`);
            }

            let userDb = await database.getUser(m.sender);
            if (!userDb) {
                userDb = { wallet: 0, bank: 0, genre: 'No definido', marry: null, last_claim: new Date(0).toISOString() };
            }

            const bet = 1000;
            const wallet = Number(userDb.wallet || 0);
            const bank = Number(userDb.bank || 0);

            if ((wallet + bank) < 5000) {
                return m.reply(`*${config.visuals.emoji2}* \`POCO CAPITAL\`\n\nNecesitas al menos ¥5,000 en total para apostar.`);
            }

            const win = Math.random() < 0.3; 
            const result = win ? choice : (choice === 'cara' ? 'cruz' : 'cara');

            if (win) {
                userDb.wallet = wallet + bet;
                const frase = flipFrases.win[Math.floor(Math.random() * flipFrases.win.length)];
                await m.reply(`*${config.visuals.emoji3}* \`¡GANASTE!\` *${config.visuals.emoji3}*\n\nSalió: *${result.toUpperCase()}*\n${frase}\n\n> *Cartera:* ¥${userDb.wallet.toLocaleString()}`);
            } else {
                if (wallet >= bet) {
                    userDb.wallet = wallet - bet;
                } else {
                    userDb.bank = bank - bet;
                }
                const frase = flipFrases.lose[Math.floor(Math.random() * flipFrases.lose.length)];
                await m.reply(`*${config.visuals.emoji2}* \`PERDISTE\` *${config.visuals.emoji2}*\n\nSalió: *${result.toUpperCase()}*\n${frase}\n\n> *Pérdida:* ¥${bet.toLocaleString()}`);
            }

            await database.saveUser(m.sender, userDb);

        } catch (e) {
            console.error(e);
            m.reply(`*${config.visuals.emoji2}* Error en la apuesta.`);
        }
    }
};

export default flipCommand;