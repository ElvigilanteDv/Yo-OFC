import { config } from '../config.js';
import { database } from '../database.js';
import { winFrases, loseFrases } from './frases/slut.js';

const slutCommand = {
    name: 'slut',
    alias: ['prostituirse', 'escenario'],
    category: 'economy',
    desc: 'Trabaja en el escenario para ganar coins.',
    noPrefix: true,

    run: async (conn, m) => {
        try {
            const userJid = m.sender;
            const ahora = Date.now();
            const cooldown = 10 * 60 * 1000;

            let userDb = await database.getUser(userJid);
            if (!userDb) userDb = { wallet: 0, bank: 0, lastSlut: 0 };

            const tiempoPasado = ahora - (Number(userDb.lastSlut) || 0);

            if (tiempoPasado < cooldown) {
                const restante = Math.floor((cooldown - tiempoPasado) / 60000);
                const segundos = Math.floor(((cooldown - tiempoPasado) % 60000) / 1000);
                return m.reply(`*${config.visuals.emoji2}* \`AGOTAMIENTO\`\n\n> Necesitas descansar. Vuelve en **${restante}m ${segundos}s**.`);
            }

            const esPerdida = Math.random() < 0.03;
            const monto = Math.floor(Math.random() * (8000 - 3000 + 1)) + 3000;
            const currentWallet = Number(userDb.wallet || 0);

            if (esPerdida) {
                const frase = loseFrases[Math.floor(Math.random() * loseFrases.length)];
                userDb.wallet = Math.max(0, currentWallet - monto);

                let msg = `*${config.visuals.emoji2}* \`MALA NOCHE\`\n\n`;
                msg += `${frase}\n`;
                msg += `*Perdiste:* ¥${monto.toLocaleString()}\n\n`;
                msg += `> *Cartera:* ¥${userDb.wallet.toLocaleString()}`;
                await m.reply(msg);
            } else {
                const frase = winFrases[Math.floor(Math.random() * winFrases.length)];
                userDb.wallet = currentWallet + monto;

                let msg = `*${config.visuals.emoji3}* \`NOCHE DE ÉXITO\` *${config.visuals.emoji3}*\n\n`;
                msg += `${frase}\n`;
                msg += `*Ganaste:* ¥${monto.toLocaleString()}\n\n`;
                msg += `> *Cartera:* ¥${userDb.wallet.toLocaleString()}`;
                await m.reply(msg);
            }

            userDb.lastSlut = ahora;
            await database.saveUser(userJid, userDb);

        } catch (e) {
            console.error(e);
            m.reply(`*${config.visuals.emoji2}* Error en la función.`);
        }
    }
};

export default slutCommand;
