import { config } from '../config.js';
import { crimeFrases, failFrases } from './frases/crimen.js';

const crimeCommand = {
    name: 'crime',
    alias: ['crimen', 'asaltar'],
    category: 'economy',
    desc: 'Arriésgate a cometer actos ilícitos para obtener dinero.',
    noPrefix: true,
    isGroup: true,

    run: async (conn, m) => {
        try {
            const user = m.sender.replace(/:.*@/g, '@');
            const ahora = Date.now();
            const cooldown = 20 * 60 * 1000;

            if (!global.db.data.users[user]) global.db.data.users[user] = {};
            const userDb = global.db.data.users[user];

            const tiempoPasado = ahora - (userDb.lastCrime || 0);

            if (tiempoPasado < cooldown) {
                const restante = cooldown - tiempoPasado;
                const minutos = Math.floor(restante / 60000);
                const segundos = Math.floor((restante % 60000) / 1000);
                return m.reply(`*${config.visuals.emoji2}* \`BAJO VIGILANCIA\`\n\n> Debes esperar **${minutos}m ${segundos}s** para volver a intentarlo.`);
            }

            const exito = Math.random() > 0.3;
            userDb.lastCrime = ahora;

            if (exito) {
                const fr = crimeFrases[Math.floor(Math.random() * crimeFrases.length)];
                const recompensa = Math.floor(Math.random() * (fr.max - fr.min + 1)) + fr.min;

                userDb.wallet = (userDb.wallet || 0) + recompensa;

                let texto = `*${config.visuals.emoji3}* \`CRIMEN EXITOSO\` *${config.visuals.emoji3}*\n\n`;
                texto += `${fr.text}\n`;
                texto += `*${config.visuals.emoji} Ganaste:* ¥${recompensa.toLocaleString()}\n\n`;
                texto += `> *Cartera:* ¥${userDb.wallet.toLocaleString()}`;

                await conn.sendMessage(m.chat, { text: texto }, { quoted: m });
            } else {
                const fail = failFrases[Math.floor(Math.random() * failFrases.length)];
                m.reply(`*${config.visuals.emoji2}* \`OPERACIÓN FALLIDA\`\n\n${fail}`);
            }

        } catch (e) {
            console.error(e);
            m.reply(`*${config.visuals.emoji2}* Error en la misión.`);
        }
    }
};

export default crimeCommand;